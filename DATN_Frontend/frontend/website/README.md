# Init Next.js Project

Dự án này là bộ khởi tạo (boilerplate) cho ứng dụng Next.js, tích hợp sẵn các thư viện phổ biến và cấu trúc thư mục rõ ràng, dễ mở rộng.

## 🚀 Bắt đầu

### 1. Cài đặt

```sh
git clone <repo-url>
cd init
npm install
```

### 2. Chạy dự án

```sh
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Cấu trúc thư mục

- `app/` - Routing theo cấu trúc Next.js 13+ (App Router)
- `components/` - Các component dùng chung
- `features/` - Chia nhỏ theo tính năng (auth, users, ...)
- `constants/` - Các hằng số
- `lib/` - Cấu hình thư viện (axios, ...)
- `utils/` - Các hàm tiện ích
- `public/` - Tài nguyên tĩnh
- `middleware.ts` - Middleware kiểm tra authentication

---

## 🛠️ Các thư viện chính

- **Next.js**: React framework cho SSR/SSG.
- **MUI**: UI component library.
- **SWR**: Data fetching, caching.
- **Axios**: HTTP client.
- **TailwindCSS**: Utility-first CSS framework.
- **crypto-js**: Mã hóa dữ liệu cookie.

---

## 🔐 Authentication

- Sử dụng cookie để lưu access token (mã hóa).
- Middleware kiểm tra token, tự động redirect nếu chưa đăng nhập.
- Đăng nhập/đăng xuất qua form tại `/login` và `/signup`.

---

## ⚙️ Cấu hình môi trường

Tạo file `.env` với các biến sau:

```
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_KEY_SECRET=your_secret_key
NEXT_PUBLIC_APP_NAME=Init Nextjs
```

---

## 📚 Một số route chính

- `/login`, `/signup`: Trang xác thực.
- `/`: Trang dashboard (yêu cầu đăng nhập).
- `/users/`: Danh sách user (yêu cầu đăng nhập).
- `/settings`: Hướng dẫn cài đặt bảo mật.

---

## 🧑‍💻 Lint & Build

```sh
npm run lint
npm run build
npm start
```

---

## 💡 Mở rộng

- Thêm tính năng mới vào thư mục `features/`.
- Thêm API mới vào `lib/axios/axios-config.ts` và các file trong `features/.../api/`.
- Sửa UI tại các component trong `components/` hoặc `features/.../components/`.

---

## License

MIT