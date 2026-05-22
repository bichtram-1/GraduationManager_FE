import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Pagination, TableToolbar, inputCls } from "./common";
import { Plus, FileText, Download, Eye, Check, X, Upload, Paperclip, CalendarDays, BookOpen, GraduationCap, TrendingUp, Megaphone, Search, Bell, AlertTriangle } from "lucide-react";
import { thesisStore, useThesisStore, TOPICS, CURRENT_TEACHER } from "./thesisStore";
import { BatchDocsSection } from "./BatchDocsSection";

export function AdminUsers() {
  const users = [
    { id: "GV001", name: "TS. Nguyễn Văn X", role: "Giảng viên", email: "xnv@uit.edu.vn", status: "Hoạt động" },
    { id: "20520001", name: "Nguyễn Văn A", role: "Sinh viên", email: "anv@gm.uit.edu.vn", status: "Hoạt động" },
    { id: "20520002", name: "Trần Thị B", role: "Sinh viên", email: "btt@gm.uit.edu.vn", status: "Khóa" },
  ];
  return (
    <div>
      <PageHeader title="Quản lý người dùng" description="Quản lý tài khoản GV và SV" actions={<Button variant="primary"><span className="inline-flex items-center gap-2"><Plus className="w-4 h-4" />Thêm người dùng</span></Button>} />
      <Card>
        <TableToolbar>
          <select className={`${inputCls} w-36`}><option>Tất cả vai trò</option><option>Giảng viên</option><option>Sinh viên</option></select>
        </TableToolbar>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr><th className="text-left px-4 py-3">Mã</th><th className="text-left px-4 py-3">Họ tên</th><th className="text-left px-4 py-3">Vai trò</th><th className="text-left px-4 py-3">Email</th><th className="text-left px-4 py-3">Trạng thái</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#2196F3]">{u.id}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3"><Badge type={u.status === "Hoạt động" ? "success" : "danger"}>{u.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={2} />
      </Card>
    </div>
  );
}

const eligibleStudents = [
  { id: "20520001", name: "Nguyễn Văn A", class: "KTPM2020", score: 8.5 },
  { id: "20520002", name: "Trần Thị B", class: "KTPM2020", score: 7.2 },
  { id: "20520004", name: "Phạm Thị D", class: "KTPM2020", score: 9.0 },
  { id: "20520006", name: "Vũ Thị F", class: "KTPM2020", score: 8.0 },
  { id: "20520007", name: "Đỗ Văn G", class: "CNPM2020", score: 7.5 },
  { id: "20520010", name: "Lý Văn H", class: "KTPM2020", score: 8.2 },
  { id: "20520020", name: "Mai Thị K", class: "KTPM2020", score: 7.8 },
];

export function AdminTopics() {
  const topics = [
    { code: "DA001", name: "Hệ thống IoT giám sát nông nghiệp", teacher: "TS. Nguyễn Văn X", slots: "3/4", status: "Chờ duyệt", rejectReason: "" },
    { code: "DA002", name: "Ứng dụng AI nhận diện hình ảnh", teacher: "TS. Trần Văn Y", slots: "2/3", status: "Đã duyệt", rejectReason: "" },
    { code: "DA003", name: "Nền tảng e-commerce micro-service", teacher: "ThS. Lê Thị Z", slots: "0/4", status: "Từ chối", rejectReason: "Chủ đề trùng lặp với đề tài DA005" },
    { code: "DA004", name: "Chatbot hỗ trợ khách hàng", teacher: "TS. Phạm Văn K", slots: "1/3", status: "Đã duyệt", rejectReason: "" },
  ];
  const map: any = { "Chờ duyệt": "warning", "Đã duyệt": "success", "Từ chối": "danger" };

  useThesisStore();
  const unassigned = eligibleStudents.filter((s) => !thesisStore.getByStudent(s.id));
  const [uq, setUq] = useState("");
  const [published, setPublished] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  const filteredUnassigned = unassigned.filter(
    (s) =>
      !uq ||
      s.id.toLowerCase().includes(uq.toLowerCase()) ||
      s.name.toLowerCase().includes(uq.toLowerCase()) ||
      s.class.toLowerCase().includes(uq.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Quản lý đề tài"
        description="Duyệt đề tài ĐATN do GV tạo"
        actions={
          published ? (
            <div className="flex items-center gap-2">
              <Badge type="success">Đã công bố • {published}</Badge>
              <Button
                variant="danger"
                onClick={() => { setPublished(null); notify("Đã hủy công bố danh sách đề tài"); }}
              >
                Hủy công bố
              </Button>
            </div>
          ) : (
            <Button
              variant="success"
              onClick={() => {
                const now = new Date().toLocaleDateString("vi-VN");
                setPublished(now);
                notify("Đã công bố danh sách đề tài");
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Công bố danh sách
              </span>
            </Button>
          )
        }
      />

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}

      <Card className="mb-5">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600"><tr><th className="text-left px-4 py-3">Mã</th><th className="text-left px-4 py-3">Tên đề tài</th><th className="text-left px-4 py-3">GV đề xuất</th><th className="text-left px-4 py-3">Slot</th><th className="text-left px-4 py-3">Trạng thái</th><th className="text-left px-4 py-3">Lý do từ chối</th><th className="text-right px-4 py-3">Hành động</th></tr></thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.code} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#2196F3]">{t.code}</td>
                <td className="px-4 py-3">{t.name}</td>
                <td className="px-4 py-3 text-gray-600">{t.teacher}</td>
                <td className="px-4 py-3">{t.slots}</td>
                <td className="px-4 py-3"><Badge type={map[t.status]}>{t.status}</Badge></td>
                <td className="px-4 py-3 text-gray-600 text-xs">{t.rejectReason || "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button className="p-1.5 rounded hover:bg-green-50 text-[#4CAF50]"><Check className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"><X className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"><Eye className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={1} />
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-base">Sinh viên chưa có đề tài ĐATN</div>
            <div className="text-xs text-gray-500 mt-0.5">
              SV đủ điều kiện nhưng chưa đăng ký vào đề tài nào — cần nhắc nhở hoặc phân công
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge type={unassigned.length === 0 ? "success" : "warning"}>
              {unassigned.length} sinh viên
            </Badge>
            {unassigned.length > 0 && <Button variant="secondary">Gửi nhắc nhở</Button>}
          </div>
        </div>

        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={uq}
              onChange={(e) => setUq(e.target.value)}
              placeholder="Tìm MSSV, họ tên, lớp..."
              className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 bg-white text-sm outline-none focus:border-[#2196F3]"
            />
          </div>
        </div>

        {filteredUnassigned.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            {unassigned.length === 0 ? "Tất cả SV đủ điều kiện đã có đề tài." : "Không tìm thấy sinh viên phù hợp"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">MSSV</th>
                <th className="text-left px-4 py-3">Họ tên</th>
                <th className="text-left px-4 py-3">Lớp</th>
                <th className="text-left px-4 py-3">Điểm TTTN</th>
                <th className="text-right px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUnassigned.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[#2196F3]">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.class}</td>
                  <td className="px-4 py-3 text-[#4CAF50]">{s.score.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-[#2196F3] hover:underline">Phân công đề tài</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export function TeacherTopics() {
  const [openCreate, setOpenCreate] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const topics = [
    { code: "DA001", name: "Hệ thống IoT giám sát nông nghiệp", slots: "3/4", groups: 2, status: "Đã duyệt" },
    { code: "DA007", name: "Blockchain cho quản lý chuỗi cung ứng", slots: "0/3", groups: 0, status: "Chờ duyệt" },
    { code: "DA012", name: "Ứng dụng ML dự đoán giá chứng khoán", slots: "0/4", groups: 0, status: "Chờ duyệt" },
    { code: "DA015", name: "Hệ thống chấm điểm tự động", slots: "0/3", groups: 0, status: "Từ chối" },
  ];
  const map: any = { "Chờ duyệt": "warning", "Đã duyệt": "success", "Từ chối": "danger" };

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Đề tài của tôi"
        description="Tạo đề tài ĐATN và chờ Admin phê duyệt"
        actions={
          <>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) notify(`Đã import ${f.name}, chờ Admin duyệt`);
                }}
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 text-sm">
                <Upload className="w-4 h-4" />
                Import file đề tài
              </span>
            </label>
            <Button variant="primary" onClick={() => setOpenCreate(true)}>
              <span className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tạo đề tài mới
              </span>
            </Button>
          </>
        }
      />

      <Card className="p-4 mb-4 bg-blue-50 border-blue-100 text-sm text-[#2196F3]">
        ℹ️ Đề tài bạn tạo sẽ ở trạng thái <b>Chờ duyệt</b>. Sau khi Admin phê duyệt, sinh viên mới có thể đăng ký vào đề tài.
      </Card>

      <Card>
        <TableToolbar>
          <select className={`${inputCls} w-40`}>
            <option>Tất cả trạng thái</option>
            <option>Chờ duyệt</option>
            <option>Đã duyệt</option>
            <option>Từ chối</option>
          </select>
        </TableToolbar>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600"><tr><th className="text-left px-4 py-3">Mã</th><th className="text-left px-4 py-3">Tên đề tài</th><th className="text-left px-4 py-3">Slot</th><th className="text-left px-4 py-3">Nhóm ĐK</th><th className="text-left px-4 py-3">Trạng thái</th></tr></thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.code} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#2196F3]">{t.code}</td>
                <td className="px-4 py-3">{t.name}</td>
                <td className="px-4 py-3">{t.slots}</td>
                <td className="px-4 py-3">{t.groups}</td>
                <td className="px-4 py-3"><Badge type={map[t.status]}>{t.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={1} />
      </Card>

      <Modal
        open={openCreate}
        title="Tạo đề tài ĐATN mới"
        onClose={() => setOpenCreate(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenCreate(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setOpenCreate(false); notify("Đã tạo đề tài, chờ Admin duyệt"); }}>
              Gửi yêu cầu duyệt
            </Button>
          </>
        }
      >
        <Field label="Tên đề tài" required><input className={inputCls} placeholder="VD: Hệ thống chatbot hỗ trợ tuyển sinh" /></Field>
        <Field label="Mô tả / Mục tiêu" required><textarea className={`${inputCls} min-h-28`} /></Field>
        <div className="grid grid-cols-2 gap-x-5">
          <Field label="Số slot tối đa" required><input className={inputCls} type="number" defaultValue={4} /></Field>
          <Field label="Công nghệ yêu cầu"><input className={inputCls} placeholder="VD: Python, React, PostgreSQL" /></Field>
        </div>
        <Field label="Tài liệu tham khảo (tùy chọn)">
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
            <Paperclip className="w-4 h-4" />
            Chọn file đính kèm...
            <input type="file" className="hidden" />
          </label>
        </Field>
      </Modal>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

type StudentRow = {
  id: string; name: string; type: string; target: string; week: string; last: string;
  reports: { w: number; title: string; file: string; submitted: string; status: string; content: string }[];
};

const studentsData: StudentRow[] = [
  {
    id: "20520001", name: "Nguyễn Văn A", type: "TTTN", target: "FPT Software", week: "W6/10", last: "20/04/2026",
    reports: [
      { w: 6, title: "Phát triển module authentication", file: "week6.pdf", submitted: "20/04/2026", status: "Chờ nhận xét",
        content: "Trong tuần 6, em đã hoàn thành các công việc sau:\n\n1. Thiết kế và triển khai module đăng nhập JWT\n2. Tích hợp OAuth2 với Google và Facebook\n3. Viết unit test cho các endpoint /auth/login và /auth/refresh (coverage 85%)\n4. Fix 3 bug liên quan đến session timeout\n\nKhó khăn: Việc xử lý refresh token khi concurrent request còn chưa tối ưu.\nKế hoạch tuần 7: Hoàn thiện module phân quyền RBAC và bắt đầu làm tài liệu API." },
      { w: 5, title: "Thiết kế database", file: "week5.pdf", submitted: "13/04/2026", status: "Đã nhận xét",
        content: "Tuần 5 em tập trung vào schema database, đã định nghĩa 12 bảng và migration script. Đã review với team lead." },
    ],
  },
  {
    id: "20520010", name: "Lý Văn H", type: "ĐATN", target: "DA001 - IoT Nông nghiệp", week: "W4/15", last: "19/04/2026",
    reports: [
      { w: 4, title: "Tích hợp cảm biến độ ẩm đất", file: "week4-datn.pdf", submitted: "19/04/2026", status: "Chờ nhận xét",
        content: "Nhóm em đã tích hợp thành công cảm biến DHT22 và cảm biến độ ẩm đất capacitive v2. Dữ liệu được đẩy lên MQTT broker mỗi 30 giây.\n\nKết quả đo:\n- Độ chính xác nhiệt độ: ±0.5°C\n- Độ chính xác độ ẩm: ±3%\n\nVấn đề: Nhiễu tín hiệu khi cáp dài > 5m. Cần thêm tụ lọc hoặc dùng RS485." },
    ],
  },
  {
    id: "20520002", name: "Trần Thị B", type: "TTTN", target: "VNG Corp", week: "W5/10", last: "15/04/2026",
    reports: [
      { w: 5, title: "Refactor module billing", file: "week5.pdf", submitted: "15/04/2026", status: "Đã nhận xét",
        content: "Đã refactor module billing sang kiến trúc hexagonal. Giảm 30% code trùng lặp." },
    ],
  },
  {
    id: "20520020", name: "Mai Thị K", type: "ĐATN", target: "DA001 - IoT Nông nghiệp", week: "W4/15", last: "18/04/2026",
    reports: [
      { w: 4, title: "Xây dựng dashboard giám sát", file: "week4.pdf", submitted: "18/04/2026", status: "Chờ nhận xét",
        content: "Em đã xây dựng dashboard Grafana kết nối với InfluxDB, hiển thị real-time nhiệt độ, độ ẩm, ánh sáng của 4 khu vườn thí điểm. Cảnh báo qua Telegram đã hoạt động." },
    ],
  },
];

const statusMapReport: any = { "Chờ nhận xét": "warning", "Đã nhận xét": "success", "Từ chối": "danger" };

export function TeacherStudents({ type, hideHeader }: { type: "TTTN" | "ĐATN"; hideHeader?: boolean }) {
  useThesisStore();
  const baseRows = studentsData.filter((s) => s.type === type);

  const extraDatn: StudentRow[] =
    type === "ĐATN"
      ? thesisStore
          .getByTeacher(CURRENT_TEACHER)
          .filter((r) => !baseRows.some((b) => b.id === r.studentId))
          .map((r) => ({
            id: r.studentId,
            name: r.studentName,
            type: "ĐATN",
            target: `${r.topicCode} - ${r.topicName}`,
            week: "W1/15",
            last: r.registeredAt,
            reports: [],
          }))
      : [];

  const rows = [...baseRows, ...extraDatn];
  const [selected, setSelected] = useState<StudentRow | null>(null);
  const [viewing, setViewing] = useState<StudentRow["reports"][number] | null>(null);
  const [feedback, setFeedback] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      {!hideHeader && (
        <PageHeader
          title={type === "TTTN" ? "Quản lý sinh viên thực tập" : "Quản lý sinh viên đồ án"}
          description={
            type === "TTTN"
              ? "Theo dõi tiến độ báo cáo hàng tuần của SV TTTN bạn hướng dẫn"
              : "Theo dõi tiến độ nhóm SV làm ĐATN dưới đề tài của bạn"
          }
        />
      )}
      <Card>
        <TableToolbar />
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Sinh viên</th>
              <th className="text-left px-4 py-3">{type === "TTTN" ? "Công ty" : "Đề tài"}</th>
              <th className="text-left px-4 py-3">Tuần</th>
              <th className="text-left px-4 py-3">Báo cáo mới</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Chưa có sinh viên</td></tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[#2196F3]">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.target}</td>
                  <td className="px-4 py-3">{s.week}</td>
                  <td className="px-4 py-3 text-gray-600">{s.last}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setSelected(s)} className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]" title="Xem báo cáo">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={1} total={1} />
      </Card>

      <Modal
        open={!!selected && !viewing}
        title={selected ? `Báo cáo của ${selected.name} (${selected.id})` : ""}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Badge type={selected.type === "TTTN" ? "info" : "success"}>{selected.type}</Badge>
              </span>
              <span className="mx-2">•</span>
              {selected.target}
            </div>
            <div className="space-y-2">
              {selected.reports.map((r) => (
                <div key={r.w} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-blue-50 text-[#2196F3] flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm">Tuần {r.w}: {r.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {r.file} • Nộp ngày {r.submitted}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge type={statusMapReport[r.status]}>{r.status}</Badge>
                    <Button variant="secondary" onClick={() => { setViewing(r); setFeedback(""); }}>
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        Xem
                      </span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Modal>

      <Modal
        open={!!viewing}
        title={viewing ? `Tuần ${viewing.w}: ${viewing.title}` : ""}
        onClose={() => setViewing(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewing(null)}>Đóng</Button>
            <Button variant="primary" onClick={() => { setViewing(null); notify("Đã lưu nhận xét"); }}>
              Lưu nhận xét
            </Button>
          </>
        }
      >
        {viewing && (
          <>
            <div className="mb-4 flex items-center gap-3 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{viewing.file}</span>
              <span>•</span>
              <span>Nộp ngày {viewing.submitted}</span>
              <Badge type={statusMapReport[viewing.status]}>{viewing.status}</Badge>
            </div>

            <div className="text-xs uppercase text-gray-500 mb-2">Nội dung báo cáo</div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4 text-sm whitespace-pre-wrap text-gray-700 max-h-64 overflow-y-auto">
              {viewing.content}
            </div>

            <div className="text-xs uppercase text-gray-500 mb-2">Xem trước file ({viewing.file})</div>
            <div className="bg-white border border-gray-200 rounded-md p-5 mb-4 max-h-80 overflow-y-auto">
              <div className="text-center text-xs text-gray-500 border-b border-gray-200 pb-2 mb-3">
                — Trang 1/3 —
              </div>
              <div className="text-sm leading-relaxed text-gray-700 space-y-3">
                <div className="text-center">
                  <div>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN</div>
                  <div className="text-xs text-gray-500">Khoa Công nghệ Phần mềm</div>
                </div>
                <div className="text-center">
                  <div>BÁO CÁO TIẾN ĐỘ TUẦN {viewing.w}</div>
                  <div className="text-xs text-gray-500">{viewing.title}</div>
                </div>
                <div className="whitespace-pre-wrap">{viewing.content}</div>
              </div>
            </div>

            <Field label="Nhận xét của GV">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className={`${inputCls} min-h-24`}
                placeholder="Nhập nhận xét cho sinh viên..."
              />
            </Field>
          </>
        )}
      </Modal>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

export function TeacherHome() {
  const stats = [
    { icon: BookOpen, label: "Đề tài đang mở", value: "2", color: "bg-[#4CAF50]" },
    { icon: GraduationCap, label: "SV đang hướng dẫn", value: "12", color: "bg-[#2196F3]" },
    { icon: FileText, label: "Báo cáo chờ nhận xét", value: "5", color: "bg-[#FFC107]" },
    { icon: TrendingUp, label: "Đã chấm điểm", value: "12/20", color: "bg-[#4CAF50]" },
  ];

  const schedule = [
    { label: "Hạn duyệt nhóm đăng ký đề tài", date: "28/04/2026", done: false },
    { label: "Hạn nhận xét báo cáo tuần 6", date: "02/05/2026", done: false },
    { label: "Hạn nộp điểm TTTN", date: "05/08/2026", done: false },
    { label: "Chấm bảo vệ ĐATN", date: "20/12/2026", done: false },
  ];

  return (
    <div>
      <PageHeader title="Trang chủ" description="Chào mừng bạn quay trở lại!" />

      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm opacity-90">Xin chào,</div>
            <div className="text-2xl mt-1">TS. Nguyễn Văn X</div>
            <div className="text-sm opacity-90 mt-1">Khoa Công nghệ Phần mềm • Mã GV: GV001</div>
          </div>
          <div className="flex gap-2">
            <Badge type="info">TTTN HK2/2025-2026</Badge>
            <Badge type="success">2 đề tài ĐATN đang mở</Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</div>
                  <div className="text-2xl mt-2">{s.value}</div>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="text-base mb-4">Công việc cần xử lý</div>
          <div className="space-y-3">
            {[
              { t: "SV Nguyễn Văn A nộp báo cáo tuần 6 — chờ nhận xét", time: "10 phút trước", type: "warning" as const },
              { t: "Nhóm 3 SV đăng ký vào đề tài DA001 — chờ phê duyệt", time: "1 giờ trước", type: "warning" as const },
              { t: "Đề tài DA007 đã được Admin phê duyệt", time: "Hôm qua", type: "success" as const },
              { t: "Thông báo: Lịch họp khoa vào 14h thứ 6", time: "2 ngày trước", type: "info" as const },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="text-sm">{a.t}</div>
                <div className="flex items-center gap-2">
                  <Badge type={a.type}>{a.type === "info" ? "Thông tin" : a.type === "success" ? "Hoàn thành" : "Cần xử lý"}</Badge>
                  <span className="text-xs text-gray-500 w-24 text-right">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-base mb-4">Mốc thời gian</div>
          <div className="relative">
            <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-gray-200" />
            <div className="space-y-3">
              {schedule.map((m, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 z-10 ${m.done ? "bg-[#4CAF50] ring-4 ring-green-100" : "bg-gray-300 ring-4 ring-gray-100"}`} />
                  <div className="flex-1 pb-1">
                    <div className={`text-sm ${m.done ? "" : "text-gray-600"}`}>{m.label}</div>
                    <div className="text-xs text-gray-500">{m.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function TeacherPostInfo({ asAdmin = false }: { asAdmin?: boolean } = {}) {
  const posts = asAdmin
    ? [
        { title: "Thông báo lịch nghỉ lễ 30/4 - 1/5", level: "Thông tin", date: "22/04/2026", views: 420 },
        { title: "Cập nhật quy chế chấm điểm TTTN 2026", level: "Quan trọng", date: "18/04/2026", views: 312 },
        { title: "Lịch bảo vệ ĐATN đợt 1", level: "Nhắc nhở", date: "12/04/2026", views: 256 },
      ]
    : [
        { title: "Thông tin tuyển nhóm đề tài IoT Nông nghiệp", level: "Thông tin", date: "21/04/2026", views: 124 },
        { title: "Buổi gặp mặt SV hướng dẫn lúc 14h thứ 6", level: "Nhắc nhở", date: "18/04/2026", views: 56 },
      ];
  const map: any = { "Thông tin": "info", "Nhắc nhở": "warning", "Quan trọng": "danger" };

  const audiences = asAdmin
    ? ["Tất cả người dùng", "Chỉ Giảng viên", "Chỉ Sinh viên", "Theo đợt TTTN/ĐATN"]
    : ["Tất cả SV tôi hướng dẫn", "Chỉ SV TTTN", "Chỉ SV ĐATN", "Nhóm đề tài cụ thể..."];

  return (
    <div>
      <PageHeader
        title="Đăng thông tin"
        description={asAdmin ? "Gửi thông báo toàn trường đến GV và SV" : "Gửi thông báo đến sinh viên bạn hướng dẫn"}
      />

      <Card className="p-6 mb-5">
        <div className="text-base mb-4">Tạo bài đăng mới</div>
        <Field label="Tiêu đề" required><input className={inputCls} placeholder="Nhập tiêu đề..." /></Field>
        <Field label="Nội dung" required><textarea className={`${inputCls} min-h-28`} placeholder="Nội dung bạn muốn gửi..." /></Field>
        <div className="grid grid-cols-2 gap-x-5">
          <Field label="Đối tượng">
            <select className={inputCls}>
              {audiences.map((a) => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Mức độ">
            <select className={inputCls}>
              <option>Thông tin</option>
              <option>Nhắc nhở</option>
              <option>Quan trọng</option>
            </select>
          </Field>
        </div>
        <Field label="Tệp đính kèm">
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
            <Paperclip className="w-4 h-4" />
            Chọn file đính kèm...
            <input type="file" className="hidden" />
          </label>
        </Field>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary">Lưu nháp</Button>
          <Button variant="primary">Đăng thông tin</Button>
        </div>
      </Card>

      <Card>
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-sm">Bài đăng gần đây</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600"><tr><th className="text-left px-4 py-3">Tiêu đề</th><th className="text-left px-4 py-3">Mức độ</th><th className="text-left px-4 py-3">Ngày đăng</th><th className="text-left px-4 py-3">Lượt xem</th></tr></thead>
          <tbody>
            {posts.map((p, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{p.title}</td>
                <td className="px-4 py-3"><Badge type={map[p.level]}>{p.level}</Badge></td>
                <td className="px-4 py-3 text-gray-600">{p.date}</td>
                <td className="px-4 py-3 text-gray-600">{p.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function StudentHome() {
  const milestones = [
    { label: "Đăng ký công ty thực tập", date: "01/05/2026", done: true },
    { label: "Duyệt thông tin thực tập", date: "10/05/2026", done: true },
    { label: "Bắt đầu thực tập", date: "15/05/2026", done: true },
    { label: "Kết thúc thực tập", date: "30/07/2026", done: false },
    { label: "Nộp báo cáo thực tập", date: "05/08/2026", done: false },
    { label: "Bắt đầu làm Đồ án tốt nghiệp", date: "15/08/2026", done: false },
    { label: "Kết thúc Đồ án tốt nghiệp", date: "15/12/2026", done: false },
    { label: "Chấm báo cáo tốt nghiệp", date: "25/12/2026", done: false },
  ];

  const stats = [
    { icon: BookOpen, label: "Trạng thái TTTN", value: "Đã duyệt", color: "bg-[#4CAF50]" },
    { icon: FileText, label: "Báo cáo đã nộp", value: "6/10", color: "bg-[#2196F3]" },
    { icon: CalendarDays, label: "Tuần hiện tại", value: "W6", color: "bg-[#FFC107]" },
    { icon: TrendingUp, label: "Điểm trung bình", value: "8.2", color: "bg-[#4CAF50]" },
  ];

  return (
    <div>
      <PageHeader title="Trang chủ" description="Chào mừng bạn quay trở lại!" />

      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-sm opacity-90">Xin chào,</div>
            <div className="text-2xl mt-1">Nguyễn Văn A — 20520001</div>
            <div className="text-sm opacity-90 mt-1">Lớp KTPM2020 • GVHD: TS. Nguyễn Văn X</div>
          </div>
          <div className="flex gap-2">
            <Badge type="info">TTTN — Tuần 6/10</Badge>
            <Badge type="success">Đủ điều kiện ĐATN</Badge>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Card key={i} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</div>
                  <div className="text-2xl mt-2">{s.value}</div>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="text-base mb-4">Thông tin quan trọng</div>

          <div className="mb-3 p-4 border border-blue-200 bg-blue-50/60 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-[#2196F3] text-white flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">Đã công bố Danh sách Giảng viên hướng dẫn</span>
                  <Badge type="success">Mới</Badge>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Khoa đã phân công GVHD cho sinh viên đợt TTTN HK2/2025-2026.
                  GVHD của bạn: <b>TS. Nguyễn Văn X</b>. Tải file danh sách đầy đủ bên dưới.
                </div>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-white border border-[#2196F3] text-[#2196F3] rounded-md text-xs hover:bg-blue-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải danh sách GVHD (.XLSX)
                </a>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">Hôm nay</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { t: "Nhắc nhở: Nộp báo cáo tuần 7 trước 23h chủ nhật", time: "Hôm nay", type: "warning" as const },
              { t: "GVHD đã nhận xét báo cáo tuần 5 của bạn", time: "Hôm qua", type: "info" as const },
              { t: "Bạn đã đủ điều kiện đăng ký đề tài ĐATN", time: "3 ngày trước", type: "success" as const },
              { t: "Đợt ĐATN HK2 sẽ mở đăng ký từ 01/08/2026", time: "1 tuần trước", type: "info" as const },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="text-sm">{a.t}</div>
                <div className="flex items-center gap-2">
                  <Badge type={a.type}>{a.type === "info" ? "Thông tin" : a.type === "success" ? "Hoàn thành" : "Nhắc nhở"}</Badge>
                  <span className="text-xs text-gray-500 w-24 text-right">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-base mb-4">Mốc thời gian</div>
          <div className="relative">
            <div className="absolute left-[5px] top-1 bottom-1 w-0.5 bg-gray-200" />
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-start gap-3 relative">
                  <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 z-10 ${m.done ? "bg-[#4CAF50] ring-4 ring-green-100" : "bg-gray-300 ring-4 ring-gray-100"}`} />
                  <div className="flex-1 pb-1">
                    <div className={`text-sm ${m.done ? "" : "text-gray-600"}`}>{m.label}</div>
                    <div className="text-xs text-gray-500">{m.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

const CURRENT_STUDENT = { id: "20520001", name: "Nguyễn Văn A", class: "KTPM2020" };

export function StudentThesis() {
  useThesisStore();
  const myReg = thesisStore.getByStudent(CURRENT_STUDENT.id);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  };

  const register = (topic: typeof TOPICS[number]) => {
    thesisStore.register({
      studentId: CURRENT_STUDENT.id,
      studentName: CURRENT_STUDENT.name,
      studentClass: CURRENT_STUDENT.class,
      topicCode: topic.code,
      topicName: topic.name,
      teacher: topic.teacher,
      registeredAt: new Date().toLocaleDateString("vi-VN"),
    });
    notify(`Đã đăng ký đề tài ${topic.code}. GVHD: ${topic.teacher}`);
  };

  const cancel = () => {
    thesisStore.cancel(CURRENT_STUDENT.id);
    notify("Đã hủy đăng ký đề tài");
  };

  return (
    <div>
      <PageHeader title="Đề tài ĐATN" description="Chọn đề tài và lập nhóm làm đồ án tốt nghiệp" />

      {myReg ? (
        <Card className="p-5 mb-5 bg-green-50 border-green-200">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge type="success">Đã đăng ký</Badge>
                <span className="text-[#2196F3] text-sm">{myReg.topicCode}</span>
              </div>
              <div className="text-base">{myReg.topicName}</div>
              <div className="text-sm text-gray-600 mt-1">
                GVHD: <b>{myReg.teacher}</b> • Đăng ký ngày {myReg.registeredAt}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                GV đã tự động nhận bạn vào danh sách quản lý SV đồ án.
              </div>
            </div>
            <Button variant="secondary" onClick={cancel}>Hủy đăng ký</Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5 mb-5 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <Badge type="success">Đủ điều kiện</Badge>
            <div className="text-sm">Bạn đã đủ điều kiện đăng ký đề tài ĐATN (Điểm TTTN: 8.5)</div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOPICS.map((t) => {
          const used = thesisStore.slotsUsed(t.code);
          const full = used >= t.maxSlots;
          const isMine = myReg?.topicCode === t.code;
          return (
            <Card key={t.code} className={`p-5 hover:shadow-md transition ${isMine ? "ring-2 ring-[#4CAF50]" : ""}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="text-[#2196F3] text-sm">{t.code}</div>
                {isMine ? (
                  <Badge type="success">Đề tài của bạn</Badge>
                ) : (
                  <Badge type={full ? "danger" : "success"}>{full ? "Hết slot" : "Còn slot"}</Badge>
                )}
              </div>
              <div className="text-base mb-2">{t.name}</div>
              <div className="text-xs text-gray-500 mb-4">GV: {t.teacher} • Slot: {used}/{t.maxSlots}</div>
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1">Xem chi tiết</Button>
                {isMine ? (
                  <Button variant="danger" className="flex-1" onClick={cancel}>Hủy đăng ký</Button>
                ) : (
                  <Button
                    variant="primary"
                    className="flex-1"
                    disabled={full || !!myReg}
                    onClick={() => register(t)}
                  >
                    {myReg ? "Đã đăng ký đề tài khác" : "Đăng ký"}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

export function StudentReports() {
  const weeks = [
    { w: 1, title: "Làm quen môi trường, tìm hiểu dự án", file: "week1.pdf", status: "Đã duyệt", feedback: "Tốt, tiếp tục phát huy" },
    { w: 2, title: "Thiết kế database", file: "week2.pdf", status: "Đã duyệt", feedback: "OK" },
    { w: 3, title: "Phát triển API backend", file: "week3.pdf", status: "Đang chấm điểm", feedback: "—" },
    { w: 4, title: "Tích hợp frontend", file: "week4.pdf", status: "Đã duyệt", feedback: "Cần chi tiết hơn" },
    { w: 5, title: "Viết unit test", file: "—", status: "Nháp", feedback: "—" },
  ];
  const map: any = { "Đã duyệt": "success", "Đang chấm điểm": "warning", "Nháp": "disabled", "Từ chối": "danger" };

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setFile(null);
  };

  const submit = () => {
    close();
    setToast("Đã nộp báo cáo tuần mới");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Báo cáo tiến độ"
        description="Nộp báo cáo hàng tuần về tiến độ TTTN / ĐATN"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <span className="inline-flex items-center gap-2"><Plus className="w-4 h-4" />Nộp báo cáo tuần mới</span>
          </Button>
        }
      />
      <Card>
        <TableToolbar />
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600"><tr><th className="text-left px-4 py-3 w-16">Tuần</th><th className="text-left px-4 py-3">Nội dung</th><th className="text-left px-4 py-3">File</th><th className="text-left px-4 py-3">Trạng thái</th><th className="text-left px-4 py-3">Nhận xét GV</th></tr></thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.w} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">W{w.w}</td>
                <td className="px-4 py-3">{w.title}</td>
                <td className="px-4 py-3 text-[#2196F3]"><span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{w.file}</span></td>
                <td className="px-4 py-3"><Badge type={map[w.status]}>{w.status}</Badge></td>
                <td className="px-4 py-3 text-gray-600">{w.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={1} />
      </Card>

      <Modal
        open={open}
        title="Nộp báo cáo tuần mới"
        onClose={close}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Hủy</Button>
            <Button variant="primary" onClick={submit}>Nộp báo cáo</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-x-5">
          <Field label="Tuần báo cáo" required>
            <select className={inputCls} defaultValue="6">
              {Array.from({ length: 10 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>Tuần {i + 1}</option>
              ))}
            </select>
          </Field>
          <Field label="Ngày nộp">
            <input className={inputCls} type="date" defaultValue="2026-04-23" />
          </Field>
        </div>

        <Field label="Tiêu đề" required>
          <input className={inputCls} placeholder="VD: Phát triển module authentication" />
        </Field>

        <Field label="Nội dung thực hiện" required hint="Mô tả những công việc bạn đã thực hiện trong tuần">
          <textarea
            className={`${inputCls} min-h-36`}
            placeholder={"- Công việc 1...\n- Công việc 2...\n- Khó khăn gặp phải...\n- Kế hoạch tuần tới..."}
          />
        </Field>

        <label className="block text-sm mb-1.5 text-gray-700">
          Import file báo cáo <span className="text-[#F44336]">*</span>
        </label>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            dragOver ? "border-[#2196F3] bg-blue-50" : "border-gray-300 hover:border-[#2196F3] hover:bg-blue-50/40"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFile(f);
            }}
          />
          {file ? (
            <div className="flex items-center justify-center gap-2 text-[#4CAF50] text-sm">
              <FileText className="w-5 h-5" />
              <span>{file.name}</span>
              <span className="text-gray-500 text-xs">({(file.size / 1024).toFixed(0)} KB)</span>
            </div>
          ) : (
            <>
              <Upload className="w-7 h-7 text-gray-400 mx-auto mb-1" />
              <div className="text-sm text-gray-700">Kéo thả file báo cáo vào đây hoặc bấm để chọn</div>
              <div className="text-xs text-gray-500 mt-1">PDF / DOC / DOCX, tối đa 10MB</div>
            </>
          )}
        </label>
      </Modal>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

export function StudentResults() {
  return (
    <div>
      <PageHeader title="Kết quả" description="Tra cứu điểm sau khi Admin công bố" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base">Thực tập tốt nghiệp</div>
            <Badge type="success">Hoàn thành</Badge>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Điểm báo cáo (50%)</span><span>8.5</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Điểm đánh giá DN (50%)</span><span>9.0</span></div>
            <div className="flex justify-between py-3 bg-green-50 px-3 rounded-md"><span>Điểm tổng</span><span className="text-[#4CAF50] text-lg">8.75</span></div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base">Đồ án tốt nghiệp</div>
            <Badge type="warning">Đang chấm điểm</Badge>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Đề tài</span><span>DA001</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-600">Điểm báo cáo đồ án (100%)</span><span className="text-gray-400">—</span></div>
            <div className="flex justify-between py-3 bg-gray-50 px-3 rounded-md"><span>Điểm tổng</span><span className="text-gray-400 text-lg">—</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

type NotifKind = "system" | "faculty" | "important";
type NotifItem = {
  kind: NotifKind;
  title: string;
  body?: string;
  link?: string;
  date: string;
  unread: boolean;
  isNew?: boolean;
};

export function NotificationsList({ role = "teacher" }: { role?: "teacher" | "student" }) {
  const samples: Record<"teacher" | "student", NotifItem> = {
    teacher: {
      kind: "system",
      title: "Phân công hướng dẫn mới",
      body: "Bạn được phân công hướng dẫn 5 sinh viên — Đợt TTTN HK2/2025-2026. Xem danh sách và tải tài liệu hướng dẫn.",
      link: "Xem danh sách sinh viên →",
      date: "Hôm nay",
      unread: true,
      isNew: true,
    },
    student: {
      kind: "system",
      title: "Đã có Giảng viên hướng dẫn",
      body: "GVHD của bạn là TS. Nguyễn Văn X — Đợt TTTN HK2/2025-2026. Tải tài liệu hướng dẫn tại trang Đăng ký thực tập.",
      link: "Xem tài liệu đợt →",
      date: "Hôm nay",
      unread: true,
      isNew: true,
    },
  };

  const initial: NotifItem[] = [
    samples[role],
    { kind: "faculty", title: "Thông báo gia hạn đăng ký TTTN đến 05/05", body: "Khoa thông báo gia hạn đăng ký TTTN đợt HK2/2025-2026.", date: "20/04/2026", unread: true },
    { kind: "system", title: "Lịch bảo vệ ĐATN đợt 1", body: "Lịch bảo vệ chi tiết đã được cập nhật trên hệ thống.", date: "15/04/2026", unread: false },
    { kind: "faculty", title: "Danh sách công ty đối tác mới", body: "Đã bổ sung 4 công ty đối tác cho đợt thực tập.", date: "10/04/2026", unread: false },
    { kind: "important", title: "Cảnh báo: chưa nộp báo cáo tuần", body: "Vui lòng nộp trước 23:59 Chủ nhật để tránh bị trừ điểm.", date: "08/04/2026", unread: false },
  ];

  const [items, setItems] = useState<NotifItem[]>(initial);
  const [filter, setFilter] = useState<"all" | "system" | "faculty">("all");

  const counts = {
    all: items.length,
    system: items.filter((i) => i.kind === "system" || i.kind === "important").length,
    faculty: items.filter((i) => i.kind === "faculty").length,
  };
  const visible = items.filter((n) =>
    filter === "all" ? true : filter === "system" ? n.kind === "system" || n.kind === "important" : n.kind === "faculty"
  );

  const markAll = () => setItems((arr) => arr.map((x) => ({ ...x, unread: false })));

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <PageHeader title="Thông báo" description="Các thông báo từ Khoa" />
        <button onClick={markAll} className="text-[13px] text-[#2563EB] hover:underline mt-1">
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="flex items-center gap-1.5 mb-4 text-xs">
        {[
          { k: "all", l: `Tất cả ${counts.all}` },
          { k: "system", l: `Hệ thống ${counts.system}` },
          { k: "faculty", l: `Từ Khoa ${counts.faculty}` },
        ].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k as any)}
            className={`px-3 py-1.5 rounded-full transition ${
              filter === f.k ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#64748B] hover:bg-gray-200"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      <Card className="divide-y divide-gray-100">
        {visible.map((n, i) => (
          <NotifRow key={i} item={n} />
        ))}
        {visible.length === 0 && (
          <div className="p-12 text-center text-sm text-gray-500">Không có thông báo nào</div>
        )}
      </Card>
    </div>
  );
}

function NotifRow({ item }: { item: NotifItem }) {
  const cfg = {
    system: { bg: "bg-[#DBEAFE]", color: "text-[#2563EB]" },
    faculty: { bg: "bg-[#FEF3C7]", color: "text-[#D97706]" },
    important: { bg: "bg-[#FEE2E2]", color: "text-[#DC2626]" },
  }[item.kind];
  const Icon = item.kind === "system" ? Bell : item.kind === "faculty" ? Megaphone : AlertTriangle;
  return (
    <div className={`p-4 flex items-start gap-3 ${item.unread ? "bg-[#F8FAFC]" : ""}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${cfg.bg}`}>
        <Icon className={`w-4 h-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <div className="text-sm">{item.title}</div>
          {item.isNew && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#2563EB] text-white text-[10px]">
              Mới
            </span>
          )}
        </div>
        {item.body && <div className="text-xs text-gray-600 leading-relaxed">{item.body}</div>}
        {item.link && (
          <button className="mt-1 text-xs text-[#2563EB] hover:underline">{item.link}</button>
        )}
      </div>
      <div className="text-xs text-gray-500 whitespace-nowrap">{item.date}</div>
      {item.unread && <span className="w-2 h-2 rounded-full bg-[#EF4444] mt-2 flex-shrink-0" />}
    </div>
  );
}
