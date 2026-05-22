import { useState } from "react";
import { Badge, Button, Card, PageHeader, inputCls, Field } from "./common";
import { Megaphone, Search, AlertCircle, CheckCircle, X } from "lucide-react";

const studentsWithoutCompany = [
  { id: "20520010", name: "Đinh Thị H", class: "KTPM2020", phone: "0912000111", status: "Chưa đăng ký" },
  { id: "20520011", name: "Phan Văn I", class: "CNPM2020", phone: "0912000222", status: "Đang tìm" },
  { id: "20520012", name: "Trương Thị J", class: "KTPM2020", phone: "0912000333", status: "Chưa đăng ký" },
  { id: "20520013", name: "Ngô Văn K", class: "HTTT2020", phone: "0912000444", status: "Đang tìm" },
  { id: "20520014", name: "Đặng Thị L", class: "CNPM2020", phone: "0912000555", status: "Chưa đăng ký" },
  { id: "20520015", name: "Võ Văn M", class: "KTPM2020", phone: "0912000666", status: "Đang tìm" },
  { id: "20520016", name: "Hoàng Thị N", class: "HTTT2020", phone: "0912000777", status: "Chưa đăng ký" },
];

type ConfirmationRequest = {
  id: string;
  studentId: string;
  studentName: string;
  companyName: string;
  taxId: string;
  address: string;
  mentor: string;
  regDate: string;
  status: "Chờ cấp" | "Đã cấp" | "Bị từ chối";
};

const confirmationRequests: ConfirmationRequest[] = [
  { id: "CR001", studentId: "20520001", studentName: "Nguyễn Văn A", companyName: "FPT Software", taxId: "0123456789", address: "Quận 9, TP.HCM", mentor: "Trần Văn Mentor", regDate: "15/04/2026", status: "Chờ cấp" },
  { id: "CR002", studentId: "20520002", studentName: "Trần Thị B", companyName: "VNG Corp", taxId: "0987654321", address: "Quận 7, TP.HCM", mentor: "Nguyễn Thị Guide", regDate: "16/04/2026", status: "Đã cấp" },
  { id: "CR003", studentId: "20520003", studentName: "Lê Văn C", companyName: "TMA Solutions", taxId: "0112233445", address: "Quận 12, TP.HCM", mentor: "Phạm Văn Hướng", regDate: "17/04/2026", status: "Chờ cấp" },
  { id: "CR004", studentId: "20520004", studentName: "Phạm Thị D", companyName: "Shopee VN", taxId: "0556677889", address: "Quận 4, TP.HCM", mentor: "Võ Thị Lead", regDate: "18/04/2026", status: "Bị từ chối" },
];

export function AdminInternshipStudents() {
  const [mode, setMode] = useState<"confirmations" | "no-company">("confirmations");
  const [sq, setSq] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const filteredStudents = studentsWithoutCompany.filter(
    (s) =>
      !sq ||
      s.id.toLowerCase().includes(sq.toLowerCase()) ||
      s.name.toLowerCase().includes(sq.toLowerCase()) ||
      s.class.toLowerCase().includes(sq.toLowerCase())
  );

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const statusMap: any = {
    "Chờ cấp": "warning",
    "Đã cấp": "success",
    "Bị từ chối": "danger",
  };

  return (
    <div>
      <PageHeader
        title="Quản lý SV TTTN"
        description="Theo dõi sinh viên đăng ký giấy xác nhận và sinh viên chưa có công ty"
      />

      <Card className="mb-6">
        <div className="px-5 py-4">
          <Field label="Chọn nghiệp vụ quản lý">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as "confirmations" | "no-company")}
              className={`${inputCls} w-96`}
            >
              <option value="confirmations">Quản lý sinh viên đăng ký giấy xác nhận thực tập</option>
              <option value="no-company">Quản lý sinh viên chưa có công ty</option>
            </select>
          </Field>
        </div>
      </Card>

      {mode === "confirmations" ? (

        <Card>
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="text-sm font-medium">Danh sách đăng ký giấy xác nhận thực tập</div>
            <div className="text-xs text-gray-600 mt-1">
              Xem xét và cấp giấy xác nhận cho sinh viên đăng ký
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 w-16">STT</th>
                <th className="text-left px-4 py-3">Thông tin Sinh viên</th>
                <th className="text-left px-4 py-3">Thông tin Công ty</th>
                <th className="text-left px-4 py-3 w-32">Ngày đăng ký</th>
                <th className="text-left px-4 py-3 w-32">Trạng thái cấp</th>
                <th className="text-right px-4 py-3 w-48">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {confirmationRequests.map((req, i) => (
                <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="text-[#2196F3]">{req.studentId}</div>
                    <div>{req.studentName}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-gray-900">{req.companyName}</div>
                    <div className="text-gray-600">MST: {req.taxId}</div>
                    <div className="text-gray-600">{req.address}</div>
                    <div className="text-gray-600">Mentor: {req.mentor}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{req.regDate}</td>
                  <td className="px-4 py-3">
                    <Badge type={statusMap[req.status]}>{req.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {req.status === "Chờ cấp" && (
                        <>
                          <Button
                            variant="success"
                            className="text-xs"
                            onClick={() => notify(`Đã cấp giấy xác nhận cho ${req.studentName}`)}
                          >
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Cấp giấy
                            </span>
                          </Button>
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => notify(`Đã từ chối đăng ký của ${req.studentName}`)}
                          >
                            <span className="inline-flex items-center gap-1">
                              <X className="w-3.5 h-3.5" />
                              Từ chối
                            </span>
                          </Button>
                        </>
                      )}
                      {req.status === "Đã cấp" && (
                        <span className="text-xs text-gray-500">Đã xử lý</span>
                      )}
                      {req.status === "Bị từ chối" && (
                        <span className="text-xs text-[#F44336]">Đã từ chối</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
            Hiển thị {confirmationRequests.length} đăng ký
          </div>
        </Card>
      ) : (
        <Card>
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-orange-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FFC107]" />
              <div className="text-sm">Sinh viên chưa có công ty thực tập</div>
              <Badge type="warning">{filteredStudents.length}</Badge>
            </div>
            <Button
              variant="primary"
              onClick={() => notify("Đã gửi nhắc nhở cho tất cả sinh viên chưa đăng ký công ty")}
            >
              <span className="inline-flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Nhắc nhở tất cả
              </span>
            </Button>
          </div>

        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={sq}
              onChange={(e) => setSq(e.target.value)}
              placeholder="Tìm theo MSSV, tên, lớp..."
              className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 bg-white text-sm outline-none focus:border-[#2196F3]"
            />
          </div>
          <select className={`${inputCls} w-48`}>
            <option>Tất cả trạng thái</option>
            <option>Chưa đăng ký</option>
            <option>Đang tìm</option>
          </select>
          <select className={`${inputCls} w-40`}>
            <option>Tất cả lớp</option>
            <option>KTPM2020</option>
            <option>CNPM2020</option>
            <option>HTTT2020</option>
          </select>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">STT</th>
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Lớp</th>
              <th className="text-left px-4 py-3">SĐT</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Không có sinh viên nào phù hợp
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, i) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 text-[#2196F3]">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.class}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                  <td className="px-4 py-3">
                    <Badge type={s.status === "Đang tìm" ? "info" : "warning"}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => notify(`Đã gửi nhắc nhở cho ${s.name}`)}
                      className="text-sm text-[#2196F3] hover:underline"
                    >
                      Gửi nhắc nhở
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
            Hiển thị {filteredStudents.length} sinh viên
          </div>
        </Card>
      )}

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
