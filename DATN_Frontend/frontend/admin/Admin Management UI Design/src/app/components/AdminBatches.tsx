import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Pagination, TableToolbar, inputCls } from "./common";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

export type BatchRow = {
  id: string;
  name: string;
  type: "TTTN" | "ĐATN";
  start: string;
  end: string;
  regOpen: string;
  regClose: string;
  teachers: number;
  students: number;
  status: "Đang mở" | "Sắp mở" | "Hoàn thành";
};

export const BATCHES: BatchRow[] = [
  { id: "B001", name: "TTTN HK2/2025-2026", type: "TTTN", start: "01/05/2026", end: "30/07/2026", regOpen: "10/04/2026", regClose: "25/04/2026", teachers: 12, students: 124, status: "Đang mở" },
  { id: "B002", name: "ĐATN HK2/2025-2026", type: "ĐATN", start: "01/08/2026", end: "30/12/2026", regOpen: "15/07/2026", regClose: "30/07/2026", teachers: 18, students: 86, status: "Sắp mở" },
  { id: "B003", name: "TTTN HK1/2025-2026", type: "TTTN", start: "01/09/2025", end: "30/12/2025", regOpen: "10/08/2025", regClose: "25/08/2025", teachers: 10, students: 102, status: "Hoàn thành" },
];

const statusMap: any = { "Đang mở": "success", "Sắp mở": "warning", "Hoàn thành": "disabled" };

export function AdminBatches({ onView }: { onView?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"TTTN" | "ĐATN">("TTTN");
  // weights state
  const [w, setW] = useState({ company: 60, advisor: 40, datnAdvisor: 40, review: 30, council: 30 });
  const [requireTTTN, setRequireTTTN] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const tttnTotal = w.company + w.advisor;
  const datnTotal = w.datnAdvisor + w.review + w.council;
  const tttnInvalid = tttnTotal !== 100;
  const datnInvalid = datnTotal !== 100;

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
      <Card>
        <TableToolbar>
          <select className={`${inputCls} w-32`}>
            <option>Tất cả</option>
            <option>TTTN</option>
            <option>ĐATN</option>
          </select>
        </TableToolbar>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Tên đợt</th>
              <th className="text-left px-4 py-3">Loại</th>
              <th className="text-left px-4 py-3">Bắt đầu</th>
              <th className="text-left px-4 py-3">Kết thúc</th>
              <th className="text-left px-4 py-3">Hạn ĐK</th>
              <th className="text-left px-4 py-3">Số GV</th>
              <th className="text-left px-4 py-3">Số SV</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-right px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {BATCHES.map((b) => (
              <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{b.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${
                      b.type === "TTTN" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#D1FAE5] text-[#065F46]"
                    }`}
                  >
                    {b.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{b.start}</td>
                <td className="px-4 py-3 text-gray-600">{b.end}</td>
                <td className="px-4 py-3 text-gray-600">{b.regClose}</td>
                <td className="px-4 py-3">{b.teachers}</td>
                <td className="px-4 py-3">{b.students}</td>
                <td className="px-4 py-3"><Badge type={statusMap[b.status]}>{b.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onView?.(b.id)}
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
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={1} />
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
              disabled={type === "TTTN" ? tttnInvalid : datnInvalid}
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

        {/* Trường riêng theo loại đợt */}
        <div className="mt-4">
          <div className="text-sm text-gray-700 mb-3">Cấu hình riêng cho đợt {type}</div>
          {type === "TTTN" ? (
            <div className="bg-blue-50/40 border border-blue-200 rounded-md p-4 space-y-4">
              <div className="grid grid-cols-2 gap-x-5">
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
                <Field label="Số SV tối đa một nhóm" required>
                  <select className={inputCls} defaultValue="3">
                    <option value="1">1 sinh viên</option>
                    <option value="2">2 sinh viên</option>
                    <option value="3">3 sinh viên</option>
                  </select>
                </Field>
                <Field label="Hạn phân công phản biện" required>
                  <input type="date" className={inputCls} />
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

        <div className="mt-2 mb-1 text-sm text-gray-700">Cấu hình điểm</div>
        {type === "TTTN" ? (
          <div className="bg-blue-50/40 border border-blue-100 rounded-md p-4">
            <div className="grid grid-cols-2 gap-x-5">
              <Field label="% Điểm doanh nghiệp">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={w.company}
                  onChange={(e) => setW({ ...w, company: Number(e.target.value) })}
                  className={`${inputCls} ${tttnInvalid ? "border-red-400 focus:border-red-500" : ""}`}
                />
              </Field>
              <Field label="% Điểm GVHD">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={w.advisor}
                  onChange={(e) => setW({ ...w, advisor: Number(e.target.value) })}
                  className={`${inputCls} ${tttnInvalid ? "border-red-400 focus:border-red-500" : ""}`}
                />
              </Field>
            </div>
            <div className={`text-xs mt-1 ${tttnInvalid ? "text-[#F44336]" : "text-gray-500"}`}>
              Tổng: {tttnTotal}% {tttnInvalid && "— Tổng phải bằng 100%"}
            </div>
          </div>
        ) : (
          <div className="bg-green-50/40 border border-green-100 rounded-md p-4">
            <div className="grid grid-cols-3 gap-x-4">
              <Field label="% GVHD">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={w.datnAdvisor}
                  onChange={(e) => setW({ ...w, datnAdvisor: Number(e.target.value) })}
                  className={`${inputCls} ${datnInvalid ? "border-red-400" : ""}`}
                />
              </Field>
              <Field label="% Phản biện">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={w.review}
                  onChange={(e) => setW({ ...w, review: Number(e.target.value) })}
                  className={`${inputCls} ${datnInvalid ? "border-red-400" : ""}`}
                />
              </Field>
              <Field label="% Hội đồng">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={w.council}
                  onChange={(e) => setW({ ...w, council: Number(e.target.value) })}
                  className={`${inputCls} ${datnInvalid ? "border-red-400" : ""}`}
                />
              </Field>
            </div>
            <div className={`text-xs mt-1 ${datnInvalid ? "text-[#F44336]" : "text-gray-500"}`}>
              Tổng: {datnTotal}% {datnInvalid && "— Tổng phải bằng 100%"}
            </div>
          </div>
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
