import { useState } from "react";
import { Card, Badge, Button } from "./common";
import { Briefcase, GraduationCap, Eye, Github, Phone, Mail, Building2, Users } from "lucide-react";

type TabType = "TTTN" | "ĐATN";

// Mock data TTTN
const tttnStudents = [
  {
    id: "20520001",
    name: "Nguyễn Văn A",
    company: "FPT Software",
    mentorName: "Nguyễn Văn X",
    mentorPhone: "0901234567",
    mentorEmail: "xnv@fpt.com",
    latestReport: "Tuần 3",
    reportStatus: "Đã nộp",
    reportDate: "15/05/2026"
  },
  {
    id: "20520002",
    name: "Trần Thị B",
    company: "VNG Corp",
    mentorName: "Lê Thị Y",
    mentorPhone: "0909111222",
    mentorEmail: "ylt@vng.com",
    latestReport: "Tuần 2",
    reportStatus: "Trễ hạn",
    reportDate: "08/05/2026"
  },
  {
    id: "20520003",
    name: "Phạm Văn C",
    company: "TMA Solutions",
    mentorName: "Trần Văn Z",
    mentorPhone: "0933444555",
    mentorEmail: "ztv@tma.com",
    latestReport: "Tuần 3",
    reportStatus: "Đã nộp",
    reportDate: "16/05/2026"
  },
];

// Mock data DATN - groups
const datnGroups = [
  {
    groupCode: "G01",
    topicCode: "DT001",
    topicName: "Xây dựng hệ thống quản lý thư viện điện tử",
    members: [
      { id: "20520004", name: "Nguyễn Văn D" },
      { id: "20520005", name: "Trần Thị E" },
    ],
    latestReport: "Bản thảo Chương 2",
    reportStatus: "Đã nộp",
    reportDate: "12/05/2026",
    githubRepo: "https://github.com/user/library-system"
  },
  {
    groupCode: "G02",
    topicCode: "DT002",
    topicName: "Ứng dụng AI nhận diện hình ảnh",
    members: [
      { id: "20520006", name: "Lê Văn F" },
      { id: "20520007", name: "Phạm Thị G" },
      { id: "20520008", name: "Hoàng Văn H" },
    ],
    latestReport: "Bản thảo Chương 1",
    reportStatus: "Đang chấm điểm",
    reportDate: "10/05/2026",
    githubRepo: "https://github.com/user/ai-image-recognition"
  },
];

export function TeacherStudentsPageNew() {
  const [tab, setTab] = useState<TabType>("TTTN");

  const segs: { key: TabType; label: string; icon: any; badge: number }[] = [
    { key: "TTTN", label: "Hướng dẫn Thực tập (TTTN)", icon: Briefcase, badge: tttnStudents.length },
    { key: "ĐATN", label: "Hướng dẫn Đồ án (DATN)", icon: GraduationCap, badge: datnGroups.length },
  ];

  const statusMap: any = {
    "Đã nộp": "success",
    "Trễ hạn": "danger",
    "Đang chấm điểm": "warning"
  };

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="text-xl">Hướng dẫn sinh viên</div>
          <div className="text-sm text-gray-500 mt-1">
            Theo dõi sinh viên thực tập (TTTN) và sinh viên đồ án (ĐATN)
          </div>
        </div>
      </div>

      {/* Bộ lọc Tab tổng cục */}
      <div className="mb-5 flex gap-2 border-b border-gray-200">
        {segs.map((s) => {
          const Icon = s.icon;
          const active = tab === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                active
                  ? "border-[#2196F3] text-[#2196F3]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
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

      {tab === "TTTN" ? (
        <Card>
          <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-medium">Danh sách sinh viên thực tập</div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Mã SV</th>
                <th className="text-left px-4 py-3">Họ tên</th>
                <th className="text-left px-4 py-3">Công ty thực tập</th>
                <th className="text-left px-4 py-3">Liên hệ Mentor</th>
                <th className="text-left px-4 py-3">Báo cáo tuần mới nhất</th>
                <th className="text-right px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {tttnStudents.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[#2196F3]">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{s.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs space-y-1">
                      <div className="font-medium text-gray-900">{s.mentorName}</div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3" />
                        {s.mentorPhone}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Mail className="w-3 h-3" />
                        {s.mentorEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">{s.latestReport}</div>
                      <Badge type={statusMap[s.reportStatus]}>{s.reportStatus}</Badge>
                      <div className="text-xs text-gray-500">{s.reportDate}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <Button variant="secondary" className="text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          Xem nhật ký
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {datnGroups.map((group) => (
            <Card key={group.groupCode} className="p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge type="info">{group.groupCode}</Badge>
                    <span className="text-xs text-gray-500">Mã nhóm</span>
                  </div>
                  <div className="text-base mb-2">
                    <span className="text-[#2196F3] font-medium">{group.topicCode}</span>
                    {" - "}
                    {group.topicName}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">Thành viên ({group.members.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-6">
                      {group.members.map((member) => (
                        <div key={member.id} className="text-xs bg-gray-50 px-2 py-1 rounded">
                          {member.id} - {member.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Báo cáo giai đoạn: </span>
                      <span className="font-medium">{group.latestReport}</span>
                    </div>
                    <Badge type={statusMap[group.reportStatus]}>{group.reportStatus}</Badge>
                    <span className="text-gray-500">{group.reportDate}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {group.githubRepo && (
                    <a
                      href={group.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition text-xs"
                      title="Xem kho mã nguồn"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  <Button variant="secondary" className="text-xs">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      Xem báo cáo
                    </span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
