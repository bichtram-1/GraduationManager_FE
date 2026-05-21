interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_COOKIE_KEY_SECRET: string;
  readonly VITE_SUPPORT_LANGUAGE: string;
  readonly VITE_GOOGLE_MAP_API_KEY: string;
  readonly VITE_USE_MOCK_COURSE_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
