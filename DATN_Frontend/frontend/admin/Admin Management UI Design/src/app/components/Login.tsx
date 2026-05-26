import { useState } from "react";
import { GraduationCap, User, Lock, LogIn, Users, BookOpen, FolderKanban } from "lucide-react";
import { Role } from "./Sidebar";

export function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const [role, setRole] = useState<Role>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role);
  };

  const roleOpts: { v: Role; l: string; hint: string }[] = [
    { v: "admin", l: "Quản trị viên", hint: "admin@caothang.edu.vn" },
    { v: "teacher", l: "Giảng viên", hint: "gv@caothang.edu.vn" },
    { v: "student", l: "Sinh viên", hint: "MSSV@caothang.edu.vn" },
  ];

  const stats = [
    { n: "524", l: "Sinh viên", icon: Users },
    { n: "48", l: "Giảng viên", icon: BookOpen },
    { n: "76", l: "Đề tài", icon: FolderKanban },
  ];

  return (
    <div className="h-screen w-screen flex bg-gray-100">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-[#1565C0] via-[#1976D2] to-[#42A5F5] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] rounded-full bg-cyan-300 blur-3xl" />
        </div>

        <div className="relative z-10 px-12 max-w-lg text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-6 mx-auto">
            <GraduationCap className="w-9 h-9" />
          </div>
          <div className="text-4xl leading-tight mb-3">
            Hệ thống quản lý
            <br />
            <span className="text-cyan-200">TTTN &amp; ĐATN</span>
          </div>
          <div className="text-white/85 text-sm leading-relaxed mb-10">
            Nền tảng quản lý toàn diện quá trình Thực tập tốt nghiệp và Đồ án tốt nghiệp dành cho Quản trị viên, Giảng viên và Sinh viên.
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.l}
                  className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/15"
                >
                  <Icon className="w-5 h-5 mx-auto mb-2 opacity-90" />
                  <div className="text-2xl">{s.n}</div>
                  <div className="text-xs text-white/80 mt-0.5">{s.l}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right login card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 mb-3 flex items-center justify-center">
                <img src="/images/image-3.png" alt="Trường Cao đẳng Kỹ thuật Cao Thắng" className="w-full h-full object-contain" />
              </div>
            <div className="text-2xl text-gray-900">Đăng nhập</div>
            <div className="text-xs text-gray-500 mt-1">Chọn vai trò và nhập tài khoản đã được cấp</div>
          </div>

          <form onSubmit={submit}>
            <div className="grid grid-cols-3 gap-2 mb-5 p-1 bg-gray-100 rounded-lg">
              {roleOpts.map((r) => (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setRole(r.v)}
                  className={`py-2 rounded-md text-xs transition ${
                    role === r.v
                      ? "bg-[#2196F3] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {r.l}
                </button>
              ))}
            </div>

            <label className="block text-sm mb-1.5 text-gray-700">Tài khoản</label>
            <div className="relative mb-4">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={roleOpts.find((r) => r.v === role)?.hint}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-[#2196F3]/20 transition"
              />
            </div>

            <label className="block text-sm mb-1.5 text-gray-700">Mật khẩu</label>
            <div className="relative mb-3">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#2196F3] focus:ring-2 focus:ring-[#2196F3]/20 transition"
              />
            </div>

            <div className="flex items-center justify-between mb-5 text-sm">
              <label className="inline-flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="accent-[#2196F3]" />
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#1976D2] to-[#2196F3] text-white text-sm hover:opacity-95 transition inline-flex items-center justify-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập bằng Google
            </button>
          </form>

          <div className="text-xs text-gray-500 text-center mt-6 pt-4 border-t border-gray-100">
            © 2026 Trường Cao đẳng Kỹ thuật Cao Thắng
          </div>
        </div>
      </div>
    </div>
  );
}
