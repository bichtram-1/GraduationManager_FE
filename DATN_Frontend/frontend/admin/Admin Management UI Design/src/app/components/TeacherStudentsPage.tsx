import { useState } from "react";
import { TeacherStudents } from "./GenericPages";
import { Briefcase, GraduationCap } from "lucide-react";

export function TeacherStudentsPage() {
  const [tab, setTab] = useState<"TTTN" | "ĐATN">("TTTN");

  const segs: { key: "TTTN" | "ĐATN"; label: string; icon: any; badge: number }[] = [
    { key: "TTTN", label: "SV thực tập", icon: Briefcase, badge: 3 },
    { key: "ĐATN", label: "SV đồ án", icon: GraduationCap, badge: 2 },
  ];

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-xl">Quản lý sinh viên</div>
          <div className="text-sm text-gray-500 mt-1">
            Theo dõi sinh viên thực tập (TTTN) và sinh viên đồ án (ĐATN)
          </div>
        </div>
        <div className="inline-flex p-1 bg-gray-100 rounded-lg">
          {segs.map((s) => {
            const Icon = s.icon;
            const active = tab === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setTab(s.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition ${
                  active ? "bg-white text-[#2196F3] shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {s.label}
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] ${
                    active ? "bg-[#2196F3] text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <TeacherStudents type={tab} hideHeader />
    </div>
  );
}
