import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, inputCls } from "./common";
import { Plus, Eye, Pencil, Trash2, Briefcase, GraduationCap } from "lucide-react";

type BatchType = "TTTN" | "ĐATN";
type BatchStatus = "Chờ mở" | "Đang mở" | "Chấm điểm" | "Đã công bố" | "Đã đóng";

type BatchRow = {
  id: string;
  name: string;
  type: BatchType;
  start: string;
  end: string;
  regOpen: string;
  regClose: string;
  teachers: number;
  students: number;
  companies?: number;
  topics?: number;
  councils?: number;
  status: BatchStatus;
};

const BATCHES: BatchRow[] = [
  { id: "B001", name: "TTTN HK2/2025-2026", type: "TTTN", start: "01/05/2026", end: "30/07/2026", regOpen: "10/04/2026", regClose: "25/04/2026", teachers: 12, students: 124, companies: 15, status: "Đang mở" },
  { id: "B002", name: "ĐATN HK2/2025-2026", type: "ĐATN", start: "01/08/2026", end: "30/12/2026", regOpen: "15/07/2026", regClose: "30/07/2026", teachers: 18, students: 86, topics: 28, councils: 8, status: "Chờ mở" },
  { id: "B003", name: "TTTN HK1/2025-2026", type: "TTTN", start: "01/09/2025", end: "30/12/2025", regOpen: "10/08/2025", regClose: "25/08/2025", teachers: 10, students: 102, companies: 12, status: "Đã công bố" },
  { id: "B004", name: "ĐATN HK1/2025-2026", type: "ĐATN", start: "01/01/2026", end: "30/06/2026", regOpen: "10/12/2025", regClose: "25/12/2025", teachers: 15, students: 78, topics: 26, councils: 6, status: "Chấm điểm" },
];

const statusMap: Record<BatchStatus, "disabled" | "success" | "warning" | "info" | "danger"> = {
  "Chờ mở": "disabled",
  "Đang mở": "success",
  "Chấm điểm": "warning",
  "Đã công bố": "info",
  "Đã đóng": "danger",
};

export function AdminBatchesNew() {
  const [tab, setTab] = useState<BatchType>("TTTN");
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<BatchType>("TTTN");
  const [requireTTTN, setRequireTTTN] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const filteredBatches = BATCHES.filter(b => b.type === tab);

  return (
    <div>
      <PageHeader
        title="Quản lý đợt"
        description="Vòng đời các đợt TTTN / ĐATN"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo đợt mới
            </span>
          </Button>
        }
      />

      {/* Tab lọc TTTN / ĐATN */}
      <div className="mb-5 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab("TTTN")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
            tab === "TTTN"
              ? "border-[#2196F3] text-[#2196F3]"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Đợt Thực tập (TTTN)
        </button>
        <button
          onClick={() => setTab("ĐATN")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
            tab === "ĐATN"
              ? "border-[#2196F3] text-[#2196F3]"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Đợt Đồ án (ĐATN)
        </button>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Tên đợt</th>
              <th className="text-left px-4 py-3">Bắt đầu</th>
              <th className="text-left px-4 py-3">Kết thúc</th>
              <th className="text-left px-4 py-3">Hạn ĐK</th>
              {tab === "TTTN" ? (
                <>
                  <th className="text-left px-4 py-3">Số DN</th>
                  <th className="text-left px-4 py-3">Số SV</th>
                </>
              ) : (
                <>
                  <th className="text-left px-4 py-3">Số đề tài</th>
                  <th className="text-left px-4 py-3">Số Hội đồng</th>
                </>
              )}
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-right px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  Chưa có đợt {tab} nào
                </td>
              </tr>
            ) : (
              filteredBatches.map((b) => (
                <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">{b.name}</td>
                  <td className="px-4 py-3 text-gray-600">{b.start}</td>
                  <td className="px-4 py-3 text-gray-600">{b.end}</td>
                  <td className="px-4 py-3 text-gray-600">{b.regClose}</td>
                  {tab === "TTTN" ? (
                    <>
                      <td className="px-4 py-3">{b.companies} DN</td>
                      <td className="px-4 py-3">{b.students}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{b.topics} đề tài</td>
                      <td className="px-4 py-3">{b.councils} hội đồng</td>
                    </>
                  )}
                  <td className="px-4 py-3">
                    <Badge type={statusMap[b.status]}>{b.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => notify("Xem chi tiết đợt")}
                        title="Xem chi tiết"
                        className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => notify("Mở chỉnh sửa đợt")}
                        title="Chỉnh sửa"
                        className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => notify("Đã xóa đợt")}
                        title="Xóa"
                        className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={open}
        title="Tạo đợt mới"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Hủy</Button>
            <Button
              variant="primary"
              onClick={() => { setOpen(false); notify("Đã tạo đợt mới"); }}
            >
              Tạo đợt
            </Button>
          </>
        }
      >
        <Field label="Chọn loại đợt" required>
          <div className="inline-flex p-1 bg-gray-100 rounded-lg w-full">
            {(["TTTN", "ĐATN"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 px-4 py-2.5 text-sm rounded-md transition ${
                  type === t
                    ? "bg-white text-[#2196F3] shadow-sm font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t === "TTTN" ? "○ Đợt Thực tập (TTTN)" : "○ Đợt Đồ án tốt nghiệp (ĐATN)"}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tên đợt" required>
          <input className={inputCls} placeholder="VD: TTTN HK1/2026-2027" />
        </Field>

        <div className="grid grid-cols-2 gap-x-5">
          <Field label="Học kỳ">
            <select className={inputCls}>
              <option>HK1</option>
              <option>HK2</option>
              <option>HK Hè</option>
            </select>
          </Field>
          <Field label="Năm học">
            <select className={inputCls}>
              <option>2025-2026</option>
              <option>2026-2027</option>
            </select>
          </Field>
          <Field label="Bắt đầu đăng ký"><input type="date" className={inputCls} /></Field>
          <Field label="Hạn đăng ký"><input type="date" className={inputCls} /></Field>
          <Field label="Bắt đầu thực hiện"><input type="date" className={inputCls} /></Field>
          <Field label="Kết thúc"><input type="date" className={inputCls} /></Field>
        </div>

        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-3">Cấu hình riêng cho đợt {type}</div>
          {type === "TTTN" ? (
            <div className="bg-blue-50/40 border border-blue-200 rounded-md p-4 space-y-4">
              <div className="grid grid-cols-2 gap-x-5">
                <Field label="Số doanh nghiệp" required>
                  <input type="number" min={0} defaultValue={15} className={inputCls} placeholder="VD: 15" />
                </Field>
                <Field label="Hạn nộp báo cáo TTTN" required>
                  <input type="date" className={inputCls} />
                </Field>
                <Field label="Hạn đăng ký công ty" required>
                  <input type="date" className={inputCls} />
                </Field>
                <Field label="Thời gian cập nhật thông tin Mentor" required>
                  <input type="date" className={inputCls} />
                </Field>
              </div>
              <Field label="Số tín chỉ tối thiểu" required>
                <input
                  type="number"
                  min={0}
                  defaultValue={100}
                  className={inputCls}
                  placeholder="VD: 100"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Sinh viên phải đạt đủ số tín chỉ này để được đăng ký TTTN
                </div>
              </Field>
            </div>
          ) : (
            <div className="bg-green-50/40 border border-green-200 rounded-md p-4 space-y-4">
              <div className="grid grid-cols-2 gap-x-5">
                <Field label="Số nhóm/đề tài" required>
                  <input type="number" min={0} defaultValue={28} className={inputCls} placeholder="VD: 28" />
                </Field>
                <Field label="Số hội đồng" required>
                  <input type="number" min={0} defaultValue={8} className={inputCls} placeholder="VD: 8" />
                </Field>
                <Field label="Hạn nộp báo cáo ĐATN" required>
                  <input type="date" className={inputCls} />
                </Field>
                <Field label="Hạn phân công phản biện" required>
                  <input type="date" className={inputCls} />
                </Field>
                <Field label="Số SV tối đa một nhóm" required>
                  <select className={inputCls} defaultValue="3">
                    <option value="1">1 sinh viên</option>
                    <option value="2">2 sinh viên</option>
                    <option value="3">3 sinh viên</option>
                  </select>
                </Field>
              </div>
              <label className="flex items-start gap-3 p-3 border border-green-300 rounded-md cursor-pointer hover:bg-green-50">
                <input
                  type="checkbox"
                  checked={requireTTTN}
                  onChange={(e) => setRequireTTTN(e.target.checked)}
                  className="mt-0.5 accent-[#2196F3]"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Áp dụng điều kiện Ràng buộc Đã đạt TTTN
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Bắt buộc sinh viên phải hoàn thành TTTN (điểm ≥ 5.0) trước khi được phép đăng ký ĐATN
                  </div>
                </div>
              </label>
            </div>
          )}
        </div>

        <Field label="Trạng thái ban đầu" required>
          <select className={inputCls} defaultValue="Chờ mở">
            <option>Chờ mở</option>
            <option>Đang mở</option>
            <option>Chấm điểm</option>
            <option>Đã công bố</option>
            <option>Đã đóng</option>
          </select>
        </Field>
      </Modal>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
