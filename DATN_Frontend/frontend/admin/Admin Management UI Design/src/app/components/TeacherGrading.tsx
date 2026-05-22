import { useState } from "react";
import { Badge, Button, Card, PageHeader, Pagination, TableToolbar, inputCls } from "./common";
import { Save } from "lucide-react";

type Row = { id: string; name: string; company: string; totalScore: string };

const initial: Row[] = [
  { id: "20520001", name: "Nguyễn Văn A", company: "FPT Software", totalScore: "8.8" },
  { id: "20520002", name: "Trần Thị B", company: "VNG Corp", totalScore: "7.8" },
  { id: "20520004", name: "Phạm Thị D", company: "Tiki", totalScore: "" },
  { id: "20520006", name: "Vũ Thị F", company: "MoMo", totalScore: "9.2" },
  { id: "20520007", name: "Đỗ Văn G", company: "Shopee", totalScore: "" },
];

export function TeacherGrading() {
  const [rows, setRows] = useState(initial);
  const [toast, setToast] = useState<string | null>(null);

  const update = (i: number, v: string) => {
    if (v !== "" && !/^\d*\.?\d*$/.test(v)) return;
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, totalScore: v } : row)));
  };

  const isValid = (v: string) => {
    if (v === "") return false;
    const n = parseFloat(v);
    return !isNaN(n) && n >= 0 && n <= 10;
  };

  const anyValid = rows.some((r) => isValid(r.totalScore));

  const save = () => {
    setToast("Lưu điểm thành công");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Chấm điểm TTTN"
        description="Nhập điểm tổng trực tiếp trên bảng (thang điểm 0-10)"
        actions={
          <Button variant="primary" disabled={!anyValid} onClick={save}>
            <span className="inline-flex items-center gap-2">
              <Save className="w-4 h-4" />
              Lưu điểm
            </span>
          </Button>
        }
      />

      <Card>
        <TableToolbar placeholder="Tìm MSSV, họ tên...">
          <select className={`${inputCls} w-48`}>
            <option>Đợt TTTN HK2/2025-2026</option>
          </select>
          <Badge type="info">Đang chấm điểm</Badge>
        </TableToolbar>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">MSSV</th>
              <th className="text-left px-4 py-3">Họ tên</th>
              <th className="text-left px-4 py-3">Công ty</th>
              <th className="text-left px-4 py-3 w-44">Điểm tổng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const scoreOk = r.totalScore === "" || isValid(r.totalScore);
              return (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[#2196F3]">{r.id}</td>
                  <td className="px-4 py-3">{r.name}</td>
                  <td className="px-4 py-3 text-gray-600">{r.company}</td>
                  <td className="px-4 py-3">
                    <input
                      value={r.totalScore}
                      onChange={(e) => update(i, e.target.value)}
                      placeholder="0.0 - 10.0"
                      className={`${inputCls} w-28 ${!scoreOk ? "border-[#F44336]" : ""}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={1} total={1} />
      </Card>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm animate-in slide-in-from-top-2">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
