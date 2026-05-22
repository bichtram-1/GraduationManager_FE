import { useState } from "react";
import { Badge, Button, Card, PageHeader, Pagination, TableToolbar, inputCls } from "./common";
import { CheckCircle2, Megaphone } from "lucide-react";

const students = [
  { id: "20520001", name: "Nguyễn Văn A", class: "KTPM2020", score: 8.5, status: "Chưa xét", reason: "" },
  { id: "20520002", name: "Trần Thị B", class: "KTPM2020", score: 7.2, status: "Đủ ĐK", reason: "" },
  { id: "20520003", name: "Lê Văn C", class: "CNPM2020", score: 4.8, status: "Không đủ ĐK", reason: "Điểm TTTN < 5.0 (Trượt TTTN)" },
  { id: "20520004", name: "Phạm Thị D", class: "KTPM2020", score: 9.0, status: "Đủ ĐK", reason: "" },
  { id: "20520005", name: "Hoàng Văn E", class: "CNPM2020", score: 6.5, status: "Chưa xét", reason: "" },
  { id: "20520006", name: "Vũ Thị F", class: "KTPM2020", score: 8.0, status: "Chưa xét", reason: "" },
  { id: "20520007", name: "Đỗ Văn G", class: "CNPM2020", score: 7.5, status: "Chưa xét", reason: "" },
];

const statusMap: Record<string, "disabled" | "success" | "danger"> = {
  "Chưa xét": "disabled",
  "Đủ ĐK": "success",
  "Không đủ ĐK": "danger",
};

export function AdminEligibility() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [published, setPublished] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };
  const checkedIds = Object.keys(checked).filter((k) => checked[k]);
  const allChecked = students.length > 0 && students.every((s) => checked[s.id]);

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const toggleAll = () => {
    if (allChecked) setChecked({});
    else setChecked(Object.fromEntries(students.map((s) => [s.id, true])));
  };

  return (
    <div>
      <PageHeader
        title="Xét điều kiện ĐATN"
        description="Duyệt hàng loạt sinh viên đủ điều kiện làm Đồ án tốt nghiệp"
        actions={
          published ? (
            <div className="flex items-center gap-2">
              <Badge type="success">Đã công bố • {published}</Badge>
              <Button
                variant="danger"
                onClick={() => { setPublished(null); notify("Đã hủy công bố danh sách đủ điều kiện"); }}
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
                notify("Đã công bố danh sách đủ điều kiện");
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

      <Card>
        <TableToolbar placeholder="Tìm MSSV, họ tên...">
          <select className={`${inputCls} w-48`}>
            <option>Đợt TTTN HK2/2025-2026</option>
            <option>Đợt TTTN HK1/2025-2026</option>
          </select>
          <select className={`${inputCls} w-40`}>
            <option>Tất cả trạng thái</option>
            <option>Chưa xét</option>
            <option>Đã xét</option>
          </select>
        </TableToolbar>

        {checkedIds.length > 0 && (
          <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <div className="text-sm text-[#2196F3]">Đã chọn {checkedIds.length} sinh viên</div>
            <Button variant="primary">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Xác nhận đủ điều kiện hàng loạt
              </span>
            </Button>
          </div>
        )}

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="accent-[#2196F3]" />
              </th>
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Lớp</th>
              <th className="text-left px-4 py-3">Điểm TTTN</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-left px-4 py-3">Lý do / Minh chứng</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const isIneligible = s.status === "Không đủ ĐK";
              return (
                <tr
                  key={s.id}
                  className={`border-t border-gray-100 ${
                    isIneligible
                      ? "bg-red-50 hover:bg-red-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={!!checked[s.id]} onChange={() => toggle(s.id)} className="accent-[#2196F3]" />
                  </td>
                  <td className="px-4 py-3 text-[#2196F3]">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.class}</td>
                  <td className={`px-4 py-3 ${s.score >= 5 ? "text-[#4CAF50]" : "text-[#F44336]"}`}>{s.score.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <Badge type={statusMap[s.status]}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {isIneligible ? (
                      <span className="text-xs text-[#F44336] font-medium">{s.reason}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={1} total={4} />
      </Card>
    </div>
  );
}
