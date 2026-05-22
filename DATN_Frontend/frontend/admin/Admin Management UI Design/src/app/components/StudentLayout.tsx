import { Home, ClipboardList, FolderKanban, FileText, Award, LogOut, GraduationCap, Menu, X, Mail, Phone, BookOpen, Hash } from "lucide-react";
import { ReactNode, useState, useRef, useEffect } from "react";

const items = [
  { key: "home", label: "Trang chủ", icon: Home },
  { key: "internship", label: "Đăng ký thực tập", icon: ClipboardList },
  { key: "thesis", label: "Đề tài ĐATN", icon: FolderKanban },
  { key: "reports-tttn", label: "Báo cáo TTTN", icon: FileText },
  { key: "reports-datn", label: "Báo cáo ĐATN", icon: GraduationCap },
  { key: "results", label: "Kết quả", icon: Award },
];

export function StudentLayout({
  active,
  onNavigate,
  onLogout,
  children,
}: {
  active: string;
  onNavigate: (k: string) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    if (showProfile) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfile]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-b from-blue-50 to-gray-50 text-gray-900 overflow-hidden">
      <header className="bg-gradient-to-r from-[#1976D2] via-[#2196F3] to-[#42A5F5] text-white shadow-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-base leading-tight">Cổng sinh viên</div>
              <div className="text-xs opacity-90">TTTN & ĐATN • UIT</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm leading-tight">Nguyễn Văn A</div>
              <div className="text-xs opacity-90">20520001 • KTPM2020</div>
            </div>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile((v) => !v)}
                title="Thông tin cá nhân"
                className="w-10 h-10 rounded-full bg-white text-[#2196F3] flex items-center justify-center hover:ring-2 hover:ring-white/60 transition"
              >
                SV
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden text-gray-900">
                  <div className="bg-gradient-to-r from-[#1976D2] to-[#42A5F5] px-5 py-4 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white text-[#2196F3] flex items-center justify-center flex-shrink-0">
                      SV
                    </div>
                    <div className="text-white min-w-0">
                      <div className="font-medium leading-tight">Nguyễn Văn A</div>
                      <div className="text-xs opacity-90 mt-0.5">Sinh viên</div>
                    </div>
                    <button onClick={() => setShowProfile(false)} className="ml-auto p-1 rounded hover:bg-white/20 text-white flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-5 py-4 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>MSSV: 20520001</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Lớp: KTPM2020 — Kỹ thuật phần mềm</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>20520001@gm.uit.edu.vn</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>0912 345 678</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="p-2 rounded-full hover:bg-white/20"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded hover:bg-white/20"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 hidden md:flex items-center gap-2 overflow-x-auto">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.key;
            return (
              <button
                key={it.key}
                onClick={() => onNavigate(it.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm rounded-t-lg transition whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 text-[#1976D2] border-b-2 border-[#2196F3]"
                    : "text-gray-600 hover:bg-gray-50 border-b-2 border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {it.label}
                {it.badge && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#F44336] text-white text-[10px]">
                    {it.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {open && (
          <div className="md:hidden flex flex-col">
            {items.map((it) => {
              const Icon = it.icon;
              const isActive = active === it.key;
              return (
                <button
                  key={it.key}
                  onClick={() => { onNavigate(it.key); setOpen(false); }}
                  className={`flex items-center gap-2 px-6 py-3 text-sm border-b border-gray-100 ${
                    isActive ? "bg-blue-50 text-[#1976D2]" : "text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {it.label}
                </button>
              );
            })}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-3 text-sm text-[#F44336] border-b border-gray-100"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
