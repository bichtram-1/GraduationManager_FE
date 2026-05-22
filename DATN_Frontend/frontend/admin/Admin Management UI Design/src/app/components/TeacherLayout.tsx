import { Home, BookOpen, Users, GraduationCap, Award, LogOut, Briefcase, Mail, Phone, Building2, BookOpenCheck, X } from "lucide-react";
import { ReactNode, useState, useRef, useEffect } from "react";

const items = [
  { key: "home", label: "Trang chủ", icon: Home },
  { key: "topics", label: "Đề tài của tôi", icon: BookOpen },
  { key: "students-tttn", label: "Hướng dẫn SV Thực tập", icon: Briefcase, badge: 3 },
  { key: "students-datn", label: "Quản lý SV đồ án", icon: GraduationCap, badge: 4 },
  { key: "grading-tttn", label: "Chấm điểm TTTN", icon: Award },
  { key: "grading-datn", label: "Chấm điểm Hội đồng ĐATN", icon: Users },
];

export function TeacherLayout({
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
    <div className="h-screen w-screen flex flex-col bg-gray-50 text-gray-900 overflow-hidden">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2196F3] to-blue-600 text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[15px] leading-tight">Cổng giảng viên</div>
              <div className="text-xs text-gray-500">Hệ thống TTTN & ĐATN</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm leading-tight">TS. Nguyễn Văn X</div>
              <div className="text-xs text-gray-500">teacher@uit.edu.vn</div>
            </div>
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile((v) => !v)}
                title="Thông tin cá nhân"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2196F3] to-blue-400 text-white flex items-center justify-center text-xs hover:ring-2 hover:ring-[#2196F3]/40 transition"
              >
                GV
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1976D2] to-[#2196F3] px-5 py-4 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center text-lg flex-shrink-0">
                      GV
                    </div>
                    <div className="text-white min-w-0">
                      <div className="font-medium leading-tight">TS. Nguyễn Văn X</div>
                      <div className="text-xs opacity-90 mt-0.5">Giảng viên hướng dẫn</div>
                    </div>
                    <button onClick={() => setShowProfile(false)} className="ml-auto p-1 rounded hover:bg-white/20 text-white flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="px-5 py-4 space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>teacher@uit.edu.vn</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>0901 234 567</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Khoa Công nghệ thông tin</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <BookOpenCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Chuyên ngành: Kỹ thuật phần mềm</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <nav className="px-8 flex items-center gap-1 flex-wrap">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = active === it.key;
            return (
              <button
                key={it.key}
                onClick={() => onNavigate(it.key)}
                className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition whitespace-nowrap ${ isActive ? "border-[#2196F3] text-[#2196F3]" : "border-transparent text-gray-600 hover:text-gray-900" } text-[14px]`}
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
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
