import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Pagination, TableToolbar, inputCls } from "./common";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

const students = [
  { id: "20520001", name: "Nguyễn Văn A", email: "20520001@gm.uit.edu.vn", class: "KTPM2020", phone: "0901234567", status: "Đang học" },
  { id: "20520002", name: "Trần Thị B", email: "20520002@gm.uit.edu.vn", class: "CNPM2020", phone: "0909111222", status: "Đang học" },
  { id: "20520003", name: "Lê Văn C", email: "20520003@gm.uit.edu.vn", class: "KTPM2020", phone: "0933444555", status: "Bảo lưu" },
  { id: "20520004", name: "Phạm Thị D", email: "20520004@gm.uit.edu.vn", class: "HTTT2020", phone: "0911222333", status: "Đang học" },
];

const teachers = [
  { id: "GV001", name: "TS. Nguyễn Văn X", email: "nvx@uit.edu.vn", faculty: "Khoa CNPM", phone: "0901111111", position: "Giảng viên" },
  { id: "GV002", name: "PGS. Trần Văn Y", email: "tvy@uit.edu.vn", faculty: "Khoa CNPM", phone: "0902222222", position: "Phó Giáo sư" },
  { id: "GV003", name: "ThS. Lê Thị Z", email: "ltz@uit.edu.vn", faculty: "Khoa HTTT", phone: "0903333333", position: "Thạc sĩ" },
];

export function AdminUsersNew() {
  const [tab, setTab] = useState<"students" | "teachers">("students");
  const [userType, setUserType] = useState<"students" | "teachers">("students");
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const statusMap: any = { "Đang học": "success", "Bảo lưu": "warning", "Thôi học": "danger" };

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        description="Quản lý thông tin sinh viên và giảng viên"
        actions={
          <Button variant="primary" onClick={() => setOpenAdd(true)}>
            <span className="inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Thêm mới
            </span>
          </Button>
        }
      />

      <div className="flex gap-2 mb-5 border-b border-gray-200">
        <button
          onClick={() => setTab("students")}
          className={`px-5 py-3 text-sm border-b-2 transition ${
            tab === "students"
              ? "border-[#2196F3] text-[#2196F3] font-medium"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Quản lý sinh viên
        </button>
        <button
          onClick={() => setTab("teachers")}
          className={`px-5 py-3 text-sm border-b-2 transition ${
            tab === "teachers"
              ? "border-[#2196F3] text-[#2196F3] font-medium"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Quản lý giảng viên
        </button>
      </div>

      {tab === "students" ? (
        <Card>
          <TableToolbar placeholder="Tìm theo MSSV, họ tên, lớp...">
            <select className={`${inputCls} w-40`}>
              <option>Tất cả lớp</option>
              <option>KTPM2020</option>
              <option>CNPM2020</option>
              <option>HTTT2020</option>
            </select>
            <select className={`${inputCls} w-40`}>
              <option>Tất cả trạng thái</option>
              <option>Đang học</option>
              <option>Bảo lưu</option>
              <option>Thôi học</option>
            </select>
          </TableToolbar>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">MSSV</th>
                <th className="text-left px-4 py-3">Họ tên</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Lớp</th>
                <th className="text-left px-4 py-3">SĐT</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="text-right px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[#2196F3]">{s.id}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600">{s.class}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone}</td>
                  <td className="px-4 py-3"><Badge type={statusMap[s.status]}>{s.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setOpenView(true)}
                        className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setOpenEdit(true)}
                        className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(s.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={1} total={3} />
        </Card>
      ) : (
        <Card>
          <TableToolbar placeholder="Tìm theo mã GV, họ tên, khoa...">
            <select className={`${inputCls} w-48`}>
              <option>Tất cả khoa</option>
              <option>Khoa CNPM</option>
              <option>Khoa HTTT</option>
              <option>Khoa KHMT</option>
            </select>
            <select className={`${inputCls} w-40`}>
              <option>Tất cả chức danh</option>
              <option>Giảng viên</option>
              <option>Thạc sĩ</option>
              <option>Tiến sĩ</option>
              <option>Phó Giáo sư</option>
            </select>
          </TableToolbar>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3">Mã GV</th>
                <th className="text-left px-4 py-3">Họ tên</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Khoa</th>
                <th className="text-left px-4 py-3">SĐT</th>
                <th className="text-left px-4 py-3">Chức danh</th>
                <th className="text-right px-4 py-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-[#2196F3]">{t.id}</td>
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600">{t.email}</td>
                  <td className="px-4 py-3 text-gray-600">{t.faculty}</td>
                  <td className="px-4 py-3 text-gray-600">{t.phone}</td>
                  <td className="px-4 py-3">
                    <Badge type="info">{t.position}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setOpenView(true)}
                        className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setOpenEdit(true)}
                        className="p-1.5 rounded hover:bg-blue-50 text-[#2196F3]"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(t.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-[#F44336]"
                        title="Xóa"
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
      )}

      {/* Modal thêm mới */}
      <Modal
        open={openAdd}
        title="Thêm người dùng mới"
        onClose={() => setOpenAdd(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenAdd(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setOpenAdd(false); notify(`Đã thêm ${userType === "students" ? "sinh viên" : "giảng viên"} mới`); }}>Lưu</Button>
          </>
        }
      >
        <Field label="Chọn loại người dùng" required>
          <div className="inline-flex p-1 bg-gray-100 rounded-lg w-full">
            {(["students", "teachers"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setUserType(t)}
                className={`flex-1 px-4 py-2.5 text-sm rounded-md transition ${
                  userType === t
                    ? "bg-white text-[#2196F3] shadow-sm font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {t === "students" ? "○ Sinh viên" : "○ Giảng viên"}
              </button>
            ))}
          </div>
        </Field>

        {userType === "students" ? (
          <div className="grid grid-cols-2 gap-x-5">
            <Field label="MSSV" required><input className={inputCls} placeholder="VD: 20520001" /></Field>
            <Field label="Họ tên" required><input className={inputCls} /></Field>
            <Field label="Email" required><input className={inputCls} type="email" /></Field>
            <Field label="Lớp" required><input className={inputCls} placeholder="VD: KTPM2020" /></Field>
            <Field label="Số điện thoại"><input className={inputCls} /></Field>
            <Field label="Trạng thái">
              <select className={inputCls}>
                <option>Đang học</option>
                <option>Bảo lưu</option>
                <option>Thôi học</option>
              </select>
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5">
            <Field label="Mã giảng viên" required><input className={inputCls} placeholder="VD: GV001" /></Field>
            <Field label="Họ tên" required><input className={inputCls} placeholder="VD: TS. Nguyễn Văn A" /></Field>
            <Field label="Email" required><input className={inputCls} type="email" /></Field>
            <Field label="Khoa" required>
              <select className={inputCls}>
                <option>Khoa CNPM</option>
                <option>Khoa HTTT</option>
                <option>Khoa KHMT</option>
              </select>
            </Field>
            <Field label="Số điện thoại"><input className={inputCls} /></Field>
            <Field label="Chức danh">
              <select className={inputCls}>
                <option>Giảng viên</option>
                <option>Thạc sĩ</option>
                <option>Tiến sĩ</option>
                <option>Phó Giáo sư</option>
              </select>
            </Field>
          </div>
        )}
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        open={openEdit}
        title={`Chỉnh sửa thông tin ${tab === "students" ? "sinh viên" : "giảng viên"}`}
        onClose={() => setOpenEdit(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenEdit(false)}>Hủy</Button>
            <Button variant="primary" onClick={() => { setOpenEdit(false); notify("Đã cập nhật thông tin"); }}>Lưu thay đổi</Button>
          </>
        }
      >
        <div className="text-sm text-gray-600 mb-4">Cập nhật thông tin chi tiết tại đây.</div>
        {tab === "students" ? (
          <div className="grid grid-cols-2 gap-x-5">
            <Field label="MSSV"><input className={inputCls} defaultValue="20520001" disabled /></Field>
            <Field label="Họ tên"><input className={inputCls} defaultValue="Nguyễn Văn A" /></Field>
            <Field label="Email"><input className={inputCls} defaultValue="20520001@gm.uit.edu.vn" /></Field>
            <Field label="Lớp"><input className={inputCls} defaultValue="KTPM2020" /></Field>
            <Field label="Số điện thoại"><input className={inputCls} defaultValue="0901234567" /></Field>
            <Field label="Trạng thái">
              <select className={inputCls} defaultValue="Đang học">
                <option>Đang học</option>
                <option>Bảo lưu</option>
                <option>Thôi học</option>
              </select>
            </Field>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5">
            <Field label="Mã giảng viên"><input className={inputCls} defaultValue="GV001" disabled /></Field>
            <Field label="Họ tên"><input className={inputCls} defaultValue="TS. Nguyễn Văn X" /></Field>
            <Field label="Email"><input className={inputCls} defaultValue="nvx@uit.edu.vn" /></Field>
            <Field label="Khoa">
              <select className={inputCls} defaultValue="Khoa CNPM">
                <option>Khoa CNPM</option>
                <option>Khoa HTTT</option>
                <option>Khoa KHMT</option>
              </select>
            </Field>
            <Field label="Số điện thoại"><input className={inputCls} defaultValue="0901111111" /></Field>
            <Field label="Chức danh">
              <select className={inputCls} defaultValue="Giảng viên">
                <option>Giảng viên</option>
                <option>Thạc sĩ</option>
                <option>Tiến sĩ</option>
                <option>Phó Giáo sư</option>
              </select>
            </Field>
          </div>
        )}
      </Modal>

      {/* Modal xem chi tiết */}
      <Modal
        open={openView}
        title={`Chi tiết ${tab === "students" ? "sinh viên" : "giảng viên"}`}
        onClose={() => setOpenView(false)}
        footer={<Button variant="secondary" onClick={() => setOpenView(false)}>Đóng</Button>}
      >
        <div className="space-y-3 text-sm">
          {tab === "students" ? (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">MSSV:</span>
                <span className="text-[#2196F3]">20520001</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Họ tên:</span>
                <span>Nguyễn Văn A</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Email:</span>
                <span>20520001@gm.uit.edu.vn</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Lớp:</span>
                <span>KTPM2020</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Số điện thoại:</span>
                <span>0901234567</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Trạng thái:</span>
                <Badge type="success">Đang học</Badge>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Mã GV:</span>
                <span className="text-[#2196F3]">GV001</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Họ tên:</span>
                <span>TS. Nguyễn Văn X</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Email:</span>
                <span>nvx@uit.edu.vn</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Khoa:</span>
                <span>Khoa CNPM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Số điện thoại:</span>
                <span>0901111111</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Chức danh:</span>
                <Badge type="info">Giảng viên</Badge>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        open={!!confirmDelete}
        title="Xác nhận xóa"
        onClose={() => setConfirmDelete(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Hủy</Button>
            <Button
              variant="danger"
              onClick={() => {
                notify(`Đã xóa ${tab === "students" ? "sinh viên" : "giảng viên"} ${confirmDelete}`);
                setConfirmDelete(null);
              }}
            >
              Xóa
            </Button>
          </>
        }
      >
        <div className="text-sm text-gray-700">
          Bạn có chắc muốn xóa {tab === "students" ? "sinh viên" : "giảng viên"} <span className="text-[#2196F3]">{confirmDelete}</span>? Hành động này không thể hoàn tác.
        </div>
      </Modal>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
