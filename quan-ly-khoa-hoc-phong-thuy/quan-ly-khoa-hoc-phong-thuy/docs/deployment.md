# Deployment — KHPT

CI/CD layout: 1 server, 2 envs (staging from `dev` branch, prod from `main` branch).

## Server folder layout

```
/opt/khpt-infra/                     # owned by ops, shared
├── docker-compose.infra.yml         # postgres + nginx (one of each)
├── .env.infra                       # postgres bootstrap creds
├── postgres/init/01-create-dbs.sql  # auto-creates khpt_staging + khpt_prod DBs
└── nginx/
    ├── nginx.conf                   # global (1GB body, rate-limit zones)
    ├── staging/conf.d/*.conf        # 4 server blocks, scp'd by CI
    └── prod/conf.d/*.conf           # 4 server blocks, scp'd by CI

/opt/khpt-staging/                   # CI scp's here from `dev` branch
├── docker-compose.staging.yml
└── .env.staging

/opt/khpt-prod/                      # CI scp's here from `main` branch
├── docker-compose.prod.yml
└── .env.prod
```

## GitLab CI/CD variables (Settings → CI/CD)

| Variable | Type | Value |
|---|---|---|
| `DOCKER_USERNAME` | Variable | `hitekhub` |
| `DOCKER_PASSWORD` | Masked | *(Docker Hub PAT — generate at hub.docker.com → Account Settings → Security)* |
| `SERVER_HOST` | Variable | `103.153.73.250` |
| `SERVER_USER` | Variable | `root` *(or actual ssh user)* |
| `SERVER_PEM_FILE` | File | *(upload existing PEM, same as current dev pipeline)* |
| `VITE_API_URL_STAGING` | Variable | `https://cms-api-staging.fengshuimasteracademy.com/api/admin` |
| `VITE_API_URL_PROD` | Variable | `https://cms-api.fengshuimasteracademy.com/api/admin` |
| `VITE_COOKIE_KEY_SECRET_STAGING` | Masked | *(32+ random chars, e.g. `openssl rand -base64 32`)* |
| `VITE_COOKIE_KEY_SECRET_PROD` | Masked | *(32+ random chars, **DIFFERENT** from staging)* |
| `VITE_GOOGLE_MAP_API_KEY_STAGING` | Masked | *(Google Cloud Console → Maps JavaScript API key, restrict to `*-staging.fengshuimasteracademy.com`)* |
| `VITE_GOOGLE_MAP_API_KEY_PROD` | Masked | *(Google Cloud Console key, restrict to `*.fengshuimasteracademy.com`)* |
| `VITE_SUPPORT_LANGUAGE_STAGING` | Variable | `true` |
| `VITE_SUPPORT_LANGUAGE_PROD` | Variable | `true` |
| `NEXT_PUBLIC_API_URL_STAGING` | Variable | `https://app-api-staging.fengshuimasteracademy.com/api` |
| `NEXT_PUBLIC_API_URL_PROD` | Variable | `https://app-api.fengshuimasteracademy.com/api` |
| `NEXT_PUBLIC_IS_SUPPORT_LANGUAGE_STAGING` | Variable | `true` |
| `NEXT_PUBLIC_IS_SUPPORT_LANGUAGE_PROD` | Variable | `true` |

> **Migration note**: GitLab hiện đã có `VITE_API_URL`, `VITE_COOKIE_KEY_SECRET`, `VITE_SUPPORT_LANGUAGE`, `VITE_GOOGLE_MAP_API_KEY`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_IS_SUPPORT_LANGUAGE` (without `_STAGING/_PROD` suffix). Sau khi pipeline mới active, rename existing → `_STAGING` (vì branch `dev` hiện đang dùng), rồi thêm `_PROD` mới với prod URLs/keys. Existing un-suffixed vars có thể xóa sau khi verify.

## One-time server prep

```bash
# 1. Create folders
sudo mkdir -p /opt/khpt-infra/{nginx/{staging,prod}/conf.d,postgres/init}
sudo mkdir -p /opt/khpt-staging /opt/khpt-prod
sudo chown -R $USER:$USER /opt/khpt-*

# 2. Copy infra files from repo (manually, one time)
#    docker-compose.infra.yml → /opt/khpt-infra/
#    nginx/nginx.conf         → /opt/khpt-infra/nginx/
#    postgres/init/*.sql      → /opt/khpt-infra/postgres/init/
#    .env.infra.example       → /opt/khpt-infra/.env.infra (fill creds)

# 3. Issue SSL certs (8 domains, separate certs)
sudo certbot certonly --nginx -d cms.fengshuimasteracademy.com
sudo certbot certonly --nginx -d cms-api.fengshuimasteracademy.com
sudo certbot certonly --nginx -d app-api.fengshuimasteracademy.com
sudo certbot certonly --nginx -d fengshuimasteracademy.com -d www.fengshuimasteracademy.com
sudo certbot certonly --nginx -d cms-staging.fengshuimasteracademy.com
sudo certbot certonly --nginx -d cms-api-staging.fengshuimasteracademy.com
sudo certbot certonly --nginx -d app-api-staging.fengshuimasteracademy.com
sudo certbot certonly --nginx -d staging.fengshuimasteracademy.com

# 4. Start infra (creates networks too)
cd /opt/khpt-infra
docker network create khpt-staging-net  # external networks
docker network create khpt-prod-net
docker compose -f docker-compose.infra.yml up -d

# 5. Verify postgres seeded both DBs
docker exec -it khpt-postgres psql -U khpt -c '\l'
# Should see: khpt_staging, khpt_prod
```

## DNS A records (point all 8 to server IP)

| Domain | Type | Value |
|---|---|---|
| `fengshuimasteracademy.com` | A | server IP |
| `www.fengshuimasteracademy.com` | A | server IP |
| `cms.fengshuimasteracademy.com` | A | server IP |
| `cms-api.fengshuimasteracademy.com` | A | server IP |
| `app-api.fengshuimasteracademy.com` | A | server IP |
| `staging.fengshuimasteracademy.com` | A | server IP |
| `cms-staging.fengshuimasteracademy.com` | A | server IP |
| `cms-api-staging.fengshuimasteracademy.com` | A | server IP |
| `app-api-staging.fengshuimasteracademy.com` | A | server IP |

## First production deploy (cutover from dev-as-prod)

> Current state: `dev` branch is serving prod domains. Production has never been
> a separate environment. This runbook cuts over without downtime.

1. **Prep**: complete one-time server prep above. Verify infra healthy.
2. **Push code to `main`**: `git checkout main && git merge dev && git push`
3. **Wait for CI**: pipeline auto-builds `prod-` images and runs deploy jobs.
4. **Verify prod containers up**: `docker ps | grep khpt-prod-`
5. **Smoke test prod via direct container** (bypassing nginx):
   ```bash
   docker exec khpt-nginx curl -H "Host: cms-api.fengshuimasteracademy.com" http://khpt-prod-be-admin:4001/api/admin/v1/health
   ```
6. **Cut DNS / nginx**: nginx now has both staging + prod blocks. Once prod
   containers respond, prod domains route to prod containers automatically.
7. **Verify external**: `curl https://cms-api.fengshuimasteracademy.com/api/admin/v1/health`
8. **Tear down old**: stop old `/home/khpt/docker-compose.prod.yml` deployment
   if it still exists (`docker compose -f /home/khpt/docker-compose.prod.yml down`).

## Rollback

Re-deploy previous SHA:
```bash
# On server
cd /opt/khpt-prod
docker pull hitekhub/khpt-be-admin:prod-<previous-sha>
# Edit docker-compose.prod.yml temporarily to pin SHA, then:
docker compose -f docker-compose.prod.yml up -d be-admin
```

Or revert the offending commit on `main` and let CI re-deploy.

## Operational notes

- **Migrations**: BE entrypoint runs `yarn migration:run` on container start
  (both staging + prod). Test all migrations on staging first.
- **Logs**: `docker logs -f khpt-prod-be-admin`
- **Nginx reload after conf change**: CI does this automatically via
  `docker exec khpt-nginx nginx -s reload`
- **Rate limits**: 20 r/s general API, 5 r/min auth endpoints. Tune in
  `nginx/nginx.conf`.
- **Body size**: 1GB max upload (set in `nginx/nginx.conf`).
- **Postgres backup**: `docker exec khpt-postgres pg_dump -U khpt khpt_prod > backup.sql`
  (set up cron separately).
