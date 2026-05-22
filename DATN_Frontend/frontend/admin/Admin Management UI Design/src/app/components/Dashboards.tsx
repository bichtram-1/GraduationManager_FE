import { Badge, Card, PageHeader } from "./common";
import { Users, FileText, Award, TrendingUp, Building2, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { Role } from "./Sidebar";

function Stat({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
          <div className="text-2xl mt-2">{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </Card>
  );
}

export function Dashboard({ role }: { role: Role }) {
  const stats: Record<Role, any[]> = {
    admin: [
      { icon: Users, label: "Tổng sinh viên", value: "524", color: "bg-[#2196F3]" },
      { icon: Building2, label: "Doanh nghiệp chờ duyệt", value: "18", color: "bg-[#FFC107]" },
      { icon: BookOpen, label: "Đề tài ĐATN", value: "76", color: "bg-[#4CAF50]" },
      { icon: CheckCircle2, label: "Đủ điều kiện ĐATN", value: "312", color: "bg-[#2196F3]" },
    ],
    teacher: [
      { icon: Users, label: "SV hướng dẫn TTTN", value: "8", color: "bg-[#2196F3]" },
      { icon: BookOpen, label: "Đề tài ĐATN", value: "4", color: "bg-[#4CAF50]" },
      { icon: FileText, label: "Báo cáo chờ duyệt", value: "5", color: "bg-[#FFC107]" },
      { icon: Award, label: "Đã chấm điểm", value: "12/20", color: "bg-[#2196F3]" },
    ],
    student: [
      { icon: Building2, label: "Trạng thái TTTN", value: "Đã duyệt", color: "bg-[#4CAF50]" },
      { icon: FileText, label: "Báo cáo đã nộp", value: "6/10", color: "bg-[#2196F3]" },
      { icon: Clock, label: "Tuần hiện tại", value: "W6", color: "bg-[#FFC107]" },
      { icon: TrendingUp, label: "Điểm TB dự kiến", value: "8.2", color: "bg-[#4CAF50]" },
    ],
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          role === "admin"
            ? "Tổng quan hệ thống TTTN & ĐATN"
            : role === "teacher"
            ? "Tổng quan công tác hướng dẫn"
            : "Tổng quan quá trình học tập của bạn"
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats[role].map((s, i) => (
          <Stat key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="text-base mb-4">Hoạt động gần đây</div>
          <div className="space-y-3">
            {[
              { t: "Nguyễn Văn A nộp báo cáo tuần 6", time: "10 phút trước", type: "info" as const },
              { t: "Đề tài 'Hệ thống IoT' được phê duyệt", time: "1 giờ trước", type: "success" as const },
              { t: "5 công ty chờ duyệt thông tin", time: "2 giờ trước", type: "warning" as const },
              { t: "Đợt TTTN HK2/2025-2026 sắp đóng đăng ký", time: "Hôm qua", type: "danger" as const },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="text-sm">{a.t}</div>
                <div className="flex items-center gap-2">
                  <Badge type={a.type}>{a.type === "info" ? "Thông tin" : a.type === "success" ? "Hoàn thành" : a.type === "warning" ? "Nhắc nhở" : "Quan trọng"}</Badge>
                  <span className="text-xs text-gray-500 w-24 text-right">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-base mb-4">Mốc thời gian đợt</div>
          <div className="space-y-3">
            {[
              { label: "Đăng ký công ty", date: "01/05/2026", done: true },
              { label: "Duyệt thông tin", date: "10/05/2026", done: true },
              { label: "Bắt đầu thực tập", date: "15/05/2026", done: false },
              { label: "Nộp báo cáo cuối kỳ", date: "30/07/2026", done: false },
            ].map((m, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${m.done ? "bg-[#4CAF50]" : "bg-gray-300"}`} />
                <div className="flex-1">
                  <div className="text-sm">{m.label}</div>
                  <div className="text-xs text-gray-500">{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
