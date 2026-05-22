import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Pagination, TableToolbar, inputCls } from "./common";
import { Plus, Upload, Pencil, Trash2, Check, X, Megaphone } from "lucide-react";

const companies = [
  { code: "C001", name: "FPT Software", address: "Quận 9, TP.HCM", field: "Phần mềm", contact: "Nguyễn A", phone: "0901234567", slots: 15, status: "Đã duyệt" },
  { code: "C002", name: "VNG Corp", address: "Quận 7, TP.HCM", field: "Internet", contact: "Trần B", phone: "0909111222", slots: 8, status: "Đã duyệt" },
  { code: "C003", name: "TMA Solutions", address: "Quận 12, TP.HCM", field: "Outsourcing", contact: "Lê C", phone: "0933444555", slots: 10, status: "Đã duyệt" },
  { code: "C004", name: "KMS Technology", address: "Quận 1, TP.HCM", field: "Phần mềm", contact: "Phạm D", phone: "0911222333", slots: 6, status: "Chờ duyệt" },
  { code: "C005", name: "Shopee VN", address: "Quận 4, TP.HCM", field: "E-commerce", contact: "Võ E", phone: "0977888999", slots: 12, status: "Chờ duyệt" },
  { code: "C006", name: "MoMo", address: "Quận 3, TP.HCM", field: "Fintech", contact: "Hoàng F", phone: "0988777666", slots: 5, status: "Đã duyệt" },
  { code: "C007", name: "Tiki", address: "Quận 4, TP.HCM", field: "E-commerce", contact: "Bùi G", phone: "0922333444", slots: 4, status: "Từ chối" },
];

const statusMap: any = { "Đã duyệt": "success", "Chờ duyệt": "warning", "Từ chối": "danger" };

export function AdminCompanies() {
  const [openAdd, setOpenAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [published, setPublished] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Quản lý công ty"
        description="Danh sách công ty đối tác tiếp nhận sinh viên thực tập"
        actions={
          <>
            {published ? (
              <>
                <Badge type="success">Đã công bố • {published}</Badge>
                <Button
                  variant="danger"
                  onClick={() => { setPublished(null); notify("Đã hủy công bố danh sách công ty"); }}
                >
                  Hủy công bố
                </Button>
              </>
            ) : (
              <Button
                variant="success"
                onClick={() => {
                  const now = new Date().toLocaleDateString("vi-VN");
                  setPublished(now);
                  notify("Đã công bố danh sách công ty cho sinh viên");
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Megaphone className="w-4 h-4" />
                  Công bố danh sách
                </span>
              </Button>
            )}
            <Button variant="primary" onClick={() => setOpenAdd(true)}>
              <span className="inline-flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Thêm công ty
              </span>
            </Button>
          </>
        }
      />

      <Card>
        <TableToolbar placeholder="Tìm theo tên công ty, lĩnh vực...">
          <select className={`${inputCls} w-40`}>
            <option>Tất cả trạng thái</option>
            <option>Đã duyệt</option>
            <option>Chờ duyệt</option>
            <option>Từ chối</option>
          </select>
          <select className={`${inputCls} w-40`}>
            <option>Tất cả lĩnh vực</option>
            <option>Phần mềm</option>
            <option>E-commerce</option>
            <option>Fintech</option>
          </select>
        </TableToolbar>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Mã</th>
              <th className="text-left px-4 py-3">Tên công ty</th>
              <th className="text-left px-4 py-3">Địa chỉ</th>
              <th className="text-left px-4 py-3">Lĩnh vực</th>
              <th className="text-left px-4 py-3">Liên hệ</th>
              <th className="text-left px-4 py-3">Slot</th>
              <th className="text-left px-4 py-3">Trạng thái</th>
              <th className="text-right px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.code} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-[#2196F3]">{c.code}</td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.address}</td>
                <td className="px-4 py-3 text-gray-600">{c.field}</td>
                <td className="px-4 py-3 text-gray-600">{c.contact} • {c.phone}</td>
                <td className="px-4 py-3">{c.slots}</td>
                <td className="px-4 py-3"><Badge type={statusMap[c.status]}>{c.status}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {c.status === "Chờ duyệt" && (
                      <>
                        <button className="p-1.5 rounded hover:bg-green-50 text-[#4CAF50]"><Check className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"><X className="w-4 h-4" /></button>
                      </>
                    )}
                    <button className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"><Pencil className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={1} total={3} />
      </Card>

      <Modal
        open={openAdd}
        title="Thêm công ty mới"
        onClose={() => setOpenAdd(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenAdd(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setOpenAdd(false); notify("Đã thêm công ty mới"); }}>Lưu</Button>
          </>
        }
      >
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-[#2196F3] flex items-center justify-between">
          <span>Hoặc import danh sách công ty từ file Excel</span>
          <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-white border border-[#2196F3] rounded-md hover:bg-blue-50">
            <Upload className="w-4 h-4" />
            Chọn file .xlsx
            <input type="file" accept=".xlsx,.xls" className="hidden" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-x-5">
          <Field label="Tên công ty" required><input className={inputCls} /></Field>
          <Field label="Lĩnh vực"><input className={inputCls} /></Field>
          <div className="col-span-2"><Field label="Địa chỉ"><input className={inputCls} /></Field></div>
          <Field label="Người liên hệ"><input className={inputCls} /></Field>
          <Field label="Số điện thoại"><input className={inputCls} /></Field>
          <Field label="Email"><input className={inputCls} /></Field>
          <Field label="Mã số thuế"><input className={inputCls} placeholder="VD: 0123456789" /></Field>
        </div>
      </Modal>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
