import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Pagination, TableToolbar, inputCls } from "./common";
import { Plus, Pencil, EyeOff, Trash2, Paperclip } from "lucide-react";

const rows = [
  { title: "Thông báo gia hạn đăng ký TTTN đến 05/05", target: "Chỉ SV", level: "Quan trọng", date: "20/04/2026" },
  { title: "Hướng dẫn viết báo cáo tuần cho GV", target: "Chỉ GV", level: "Thông tin", date: "18/04/2026" },
  { title: "Lịch bảo vệ ĐATN đợt 1", target: "Tất cả", level: "Nhắc nhở", date: "15/04/2026" },
  { title: "Danh sách công ty đối tác mới", target: "Chỉ SV", level: "Thông tin", date: "10/04/2026" },
  { title: "Cập nhật quy chế chấm điểm TTTN", target: "Chỉ GV", level: "Nhắc nhở", date: "05/04/2026" },
];

const levelMap: any = { "Quan trọng": "danger", "Nhắc nhở": "warning", "Thông tin": "info" };

export function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState("all");

  return (
    <div>
      <PageHeader
        title="Quản lý Thông báo"
        description="Truyền thông một chiều từ Khoa xuống GV / SV"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <span className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo thông báo mới
            </span>
          </Button>
        }
      />

      <Card>
        <TableToolbar placeholder="Tìm theo tiêu đề...">
          <select className={`${inputCls} w-40`}>
            <option>Tất cả đối tượng</option>
            <option>Chỉ GV</option>
            <option>Chỉ SV</option>
            <option>Theo đợt</option>
          </select>
          <select className={`${inputCls} w-36`}>
            <option>Tất cả mức độ</option>
            <option>Thông tin</option>
            <option>Nhắc nhở</option>
            <option>Quan trọng</option>
          </select>
        </TableToolbar>

        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3">Tiêu đề</th>
              <th className="text-left px-4 py-3 w-32">Đối tượng</th>
              <th className="text-left px-4 py-3 w-32">Mức độ</th>
              <th className="text-left px-4 py-3 w-32">Ngày gửi</th>
              <th className="text-right px-4 py-3 w-32">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3 text-gray-600">{r.target}</td>
                <td className="px-4 py-3">
                  <Badge type={levelMap[r.level]}>{r.level}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.date}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"><Pencil className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded hover:bg-yellow-50 text-[#FFC107]"><EyeOff className="w-4 h-4" /></button>
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
        open={open}
        title="Tạo thông báo mới"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>Đăng thông báo</Button>
          </>
        }
      >
        <Field label="Tiêu đề" required>
          <input className={inputCls} placeholder="Nhập tiêu đề thông báo" />
        </Field>
        <Field label="Nội dung" required>
          <textarea className={`${inputCls} min-h-32`} placeholder="Nội dung thông báo..." />
        </Field>
        <Field label="Đối tượng nhận" required>
          <div className="flex flex-wrap gap-4 mt-1">
            {[
              { v: "all", l: "Tất cả" },
              { v: "teacher", l: "Chỉ GV" },
              { v: "student", l: "Chỉ SV" },
              { v: "batch", l: "Theo đợt" },
            ].map((o) => (
              <label key={o.v} className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="target"
                  value={o.v}
                  checked={target === o.v}
                  onChange={() => setTarget(o.v)}
                  className="accent-[#2196F3]"
                />
                {o.l}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Mức độ">
          <select className={inputCls}>
            <option>Thông tin</option>
            <option>Nhắc nhở</option>
            <option>Quan trọng</option>
          </select>
        </Field>
        <Field label="Tệp đính kèm">
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-600 cursor-pointer hover:bg-gray-50">
            <Paperclip className="w-4 h-4" />
            Chọn file đính kèm...
            <input type="file" className="hidden" />
          </label>
        </Field>
      </Modal>
    </div>
  );
}
