import { LayoutDashboard, Users, CalendarRange, BookOpen, UserCheck, Bell, ShieldCheck, Award, ClipboardList, FolderKanban, Building2, Home, FileText, LogOut, GraduationCap, Gavel, Lock, Briefcase, Mail, Phone, Hash, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type Role = "admin" | "teacher" | "student";

const menus: Record<Role, { key: string; label: string; icon: any; badge?: number; locked?: boolean }[]> = {
  admin: [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "users", label: "Quản lý người dùng", icon: Users },
    { key: "batches", label: "Quản lý đợt", icon: CalendarRange },
    { key: "companies", label: "Quản lý công ty", icon: Building2, badge: 4 },
    { key: "internship-students", label: "Quản lý SV TTTN", icon: Briefcase, badge: 7 },
    { key: "topics", label: "Quản lý đề tài", icon: BookOpen, badge: 3 },
    { key: "assign", label: "Phân công hướng dẫn", icon: UserCheck },
    { key: "councils", label: "Phân công hội đồng", icon: Gavel },
    { key: "eligibility", label: "Xét điều kiện ĐATN", icon: ShieldCheck, badge: 12 },
  ],
  teacher: [
    { key: "home", label: "Trang chủ", icon: Home },
    { key: "students-tttn", label: "Hướng dẫn SV Thực tập", icon: Briefcase, badge: 3 },
    { key: "students-datn", label: "Hướng dẫn SV Đồ án", icon: GraduationCap, badge: 2 },
    { key: "grading-tttn", label: "Chấm điểm TTTN", icon: Award },
    { key: "grading-datn", label: "Chấm điểm Hội đồng ĐATN", icon: Users },
  ],
  student: [
    { key: "home", label: "Trang chủ", icon: Home },
    { key: "internship", label: "Đăng ký thực tập", icon: ClipboardList },
    { key: "thesis", label: "Đề tài ĐATN", icon: FolderKanban, locked: true },
    { key: "reports-tttn", label: "Báo cáo TTTN", icon: FileText },
    { key: "reports-datn", label: "Báo cáo ĐATN", icon: GraduationCap, locked: true },
    { key: "results", label: "Kết quả", icon: Award },
    { key: "notifications", label: "Thông báo", icon: Bell, badge: 1 },
  ],
};

const roleLabels: Record<Role, string> = {
  admin: "Quản trị viên",
  teacher: "Giảng viên",
  student: "Sinh viên",
};

const profileData: Record<Role, { name: string; email: string; phone: string; extra: string }> = {
  admin: { name: "Trần Thị B", email: "admin@uit.edu.vn", phone: "0901 111 222", extra: "Phòng Đào tạo — Trường CĐ Kỹ thuật Cao Thắng" },
  teacher: { name: "TS. Nguyễn Văn X", email: "teacher@uit.edu.vn", phone: "0901 234 567", extra: "Khoa Công nghệ thông tin" },
  student: { name: "Nguyễn Văn A", email: "20520001@gm.uit.edu.vn", phone: "0912 345 678", extra: "MSSV: 20520001 — Lớp KTPM2020" },
};

const avatarLabel: Record<Role, string> = { admin: "AD", teacher: "GV", student: "SV" };

export function Sidebar({ role, active, onNavigate, onLogout }: { role: Role; active: string; onNavigate: (k: string) => void; onLogout: () => void }) {
  const items = menus[role];
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

  const profile = profileData[role];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="px-5 py-4 border-b border-gray-200 bg-[#2196F3] text-white">
        <div className="font-semibold">TTTN & ĐATN</div>
        <div className="text-xs opacity-90 mt-0.5">{roleLabels[role]}</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          const isLocked = item.locked;
          return (
            <button
              key={item.key}
              onClick={() => !isLocked && onNavigate(item.key)}
              disabled={isLocked}
              title={isLocked ? "Khóa cho đến khi đạt TTTN" : undefined}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition relative ${
                isLocked
                  ? "opacity-50 cursor-not-allowed text-gray-400"
                  : isActive
                    ? "bg-blue-50 text-[#2196F3] border-r-2 border-[#2196F3]"
                    : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4 text-gray-400" /> : <Icon className="w-4 h-4" />}
              <span className="flex-1 text-left">{item.label}</span>
              {isLocked && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-gray-200 text-gray-600">
                  Khóa
                </span>
              )}
              {item.badge && !isLocked && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#F44336] text-white text-[10px]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-2" ref={profileRef}>
          <div className="relative">
            <button
              onClick={() => setShowProfile((v) => !v)}
              title="Thông tin cá nhân"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2196F3] to-blue-400 text-white flex items-center justify-center text-xs hover:ring-2 hover:ring-[#2196F3]/40 transition"
            >
              {avatarLabel[role]}
            </button>
            {showProfile && (
              <div className="absolute bottom-10 left-0 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1976D2] to-[#2196F3] px-4 py-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center flex-shrink-0">
                    {avatarLabel[role]}
                  </div>
                  <div className="text-white min-w-0 flex-1">
                    <div className="font-medium leading-tight text-sm">{profile.name}</div>
                    <div className="text-xs opacity-90 mt-0.5">{roleLabels[role]}</div>
                  </div>
                  <button onClick={() => setShowProfile(false)} className="p-1 rounded hover:bg-white/20 text-white flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="px-4 py-3 space-y-2.5 text-sm">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Hash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{profile.extra}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{profile.name}</div>
            <div className="text-xs text-gray-500 truncate">{profile.email}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
