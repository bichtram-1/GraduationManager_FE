import { useState, useMemo } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Pagination, inputCls } from "./common";
import { CalendarDays, Clock, Search, Building2, MapPin, Phone, FileSignature } from "lucide-react";


const approvedCompanies = [
  { code: "C001", name: "FPT Software", address: "Quận 9, TP.HCM", field: "Phần mềm", contact: "Nguyễn A", phone: "0901234567", slots: 15 },
  { code: "C002", name: "VNG Corp", address: "Quận 7, TP.HCM", field: "Internet", contact: "Trần B", phone: "0909111222", slots: 8 },
  { code: "C003", name: "TMA Solutions", address: "Quận 12, TP.HCM", field: "Outsourcing", contact: "Lê C", phone: "0933444555", slots: 10 },
  { code: "C006", name: "MoMo", address: "Quận 3, TP.HCM", field: "Fintech", contact: "Hoàng F", phone: "0988777666", slots: 5 },
  { code: "C008", name: "Grab Việt Nam", address: "Quận 1, TP.HCM", field: "Công nghệ", contact: "Đinh H", phone: "0944555666", slots: 6 },
  { code: "C009", name: "Zalo", address: "Quận 7, TP.HCM", field: "Internet", contact: "Phan I", phone: "0966777888", slots: 7 },
  { code: "C010", name: "Tiki", address: "Quận 4, TP.HCM", field: "E-commerce", contact: "Bùi J", phone: "0922333444", slots: 4 },
];

export function StudentInternship() {
  const [requestCert, setRequestCert] = useState(false);
  const [q, setQ] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [showKhaiBao, setShowKhaiBao] = useState(false);

  const fields = Array.from(new Set(approvedCompanies.map((c) => c.field)));
  const filtered = useMemo(
    () =>
      approvedCompanies.filter((c) => {
        const matchQ =
          !q ||
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.address.toLowerCase().includes(q.toLowerCase()) ||
          c.field.toLowerCase().includes(q.toLowerCase());
        const matchF = fieldFilter === "all" || c.field === fieldFilter;
        return matchQ && matchF;
      }),
    [q, fieldFilter]
  );

  return (
    <div>
      <PageHeader
        title="Đăng ký Thực tập tốt nghiệp"
        description="Khai báo thông tin nơi thực tập của bạn"
        actions={
          <Button variant="primary" onClick={() => setShowKhaiBao(true)}>
            Khai báo nơi thực tập
          </Button>
        }
      />

      <Card className="p-5 mb-5 bg-gradient-to-r from-blue-50 to-white border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge type="info">Đợt TTTN HK2/2025-2026</Badge>
              <Badge type="warning">Đang mở đăng ký</Badge>
            </div>
            <div className="text-lg mt-2">Thông tin đợt thực tập</div>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#2196F3]" />
              <div>
                <div className="text-xs text-gray-500">Hạn đăng ký</div>
                <div className="text-sm">30/04/2026</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2196F3]" />
              <div>
                <div className="text-xs text-gray-500">Số tuần yêu cầu</div>
                <div className="text-sm">10 tuần</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-5">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-base">Danh sách công ty đối tác</div>
            <div className="text-xs text-gray-500 mt-0.5">
              Các công ty đã được Khoa phê duyệt — bạn có thể liên hệ trực tiếp
            </div>
          </div>
          <Badge type="success">{filtered.length} công ty</Badge>
        </div>

        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên, địa chỉ, lĩnh vực..."
              className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 bg-white text-sm outline-none focus:border-[#2196F3]"
            />
          </div>
          <select
            value={fieldFilter}
            onChange={(e) => setFieldFilter(e.target.value)}
            className={`${inputCls} w-48`}
          >
            <option value="all">Tất cả lĩnh vực</option>
            {fields.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Không tìm thấy công ty phù hợp</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((c) => (
              <div key={c.code} className="px-5 py-3 hover:bg-gray-50 flex items-center gap-4">
                <div className="w-10 h-10 rounded-md bg-blue-50 text-[#2196F3] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm">{c.name}</span>
                    <Badge type="info">{c.field}</Badge>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3 flex-wrap">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}</span>
                    <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{c.contact} • {c.phone}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-gray-500">Slot tiếp nhận</div>
                  <div className="text-sm text-[#4CAF50]">{c.slots}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={1} total={1} />
      </Card>

      <Modal
        open={showKhaiBao}
        title="Khai báo nơi thực tập"
        onClose={() => setShowKhaiBao(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowKhaiBao(false)}>Hủy</Button>
            <Button variant="secondary">Lưu nháp</Button>
            <Button variant="primary">Gửi đăng ký</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
          <Field label="Tên công ty" required>
            <input className={inputCls} placeholder="VD: Công ty TNHH ABC" />
          </Field>
          <Field label="Mã số thuế" required>
            <input className={inputCls} placeholder="VD: 0123456789" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Địa chỉ công ty" required>
              <input className={inputCls} placeholder="VD: 123 Nguyễn Văn Cừ, Q.5, TP.HCM" />
            </Field>
          </div>
          <Field label="Họ tên Người hướng dẫn DN" required>
            <input className={inputCls} placeholder="Nguyễn Văn B" />
          </Field>
          <Field label="Số điện thoại Mentor" required>
            <input className={inputCls} placeholder="09xx xxx xxx" />
          </Field>
          <Field label="Email Mentor" required>
            <input className={inputCls} placeholder="mentor@company.com" />
          </Field>
        </div>

        <div className="mt-2">
          <label className="block text-sm mb-1.5 text-gray-700">
            Giấy xác nhận thực tập <span className="text-gray-400 text-xs">(không bắt buộc)</span>
          </label>
          <label
            className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition ${
              requestCert ? "border-[#2196F3] bg-blue-50" : "border-gray-300 hover:border-[#2196F3] hover:bg-blue-50/40"
            }`}
          >
            <input
              type="checkbox"
              checked={requestCert}
              onChange={(e) => setRequestCert(e.target.checked)}
              className="mt-0.5 accent-[#2196F3]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileSignature className="w-4 h-4 text-[#2196F3]" />
                <span className="text-sm">Đăng ký xin Giấy xác nhận thực tập từ Khoa</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Tick vào nếu bạn cần Khoa cấp giấy giới thiệu / xác nhận gửi doanh nghiệp.
                Bạn sẽ được thông báo khi giấy sẵn sàng để nhận.
              </div>
            </div>
          </label>
        </div>
      </Modal>


    </div>
  );
}
