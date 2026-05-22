import { useState } from "react";
import { Button, Card, Field, inputCls } from "./common";
import { ArrowLeft, GripVertical } from "lucide-react";

const teachers = [
  { id: "GV01", name: "TS. Nguyễn Văn X" },
  { id: "GV02", name: "TS. Trần Văn Y" },
  { id: "GV03", name: "ThS. Lê Thị Z" },
  { id: "GV04", name: "TS. Phạm Văn K" },
  { id: "GV05", name: "ThS. Vũ Thị L" },
  { id: "GV06", name: "PGS. Đặng Hữu M" },
];

type DefenseGroup = {
  groupCode: string;
  topicName: string;
  members: string[];
  advisor: string;
  order: number;
};

const sampleGroups: DefenseGroup[] = [
  { groupCode: "G01", topicName: "Hệ thống IoT giám sát nông nghiệp", members: ["20520001 - Nguyễn A", "20520002 - Trần B"], advisor: "TS. Nguyễn Văn X", order: 1 },
  { groupCode: "G02", topicName: "Ứng dụng AI nhận diện hình ảnh", members: ["20520003 - Phạm D"], advisor: "TS. Nguyễn Văn X", order: 2 },
  { groupCode: "G03", topicName: "Nền tảng e-commerce", members: ["20520004 - Lê C", "20520005 - Hoàng E"], advisor: "TS. Nguyễn Văn X", order: 3 },
];

export function AdminCouncilCreate({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState({
    name: "",
    batch: "Đợt ĐATN Học kỳ 2 - 2026",
    room: "",
    date: "",
    time: "",
    reviewer: "",
    members: [] as string[],
  });

  const [groups, setGroups] = useState<DefenseGroup[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 3000); };

  const handleReviewerChange = (reviewerId: string) => {
    setForm({ ...form, reviewer: reviewerId });
    if (reviewerId) {
      setGroups(sampleGroups.map((g, i) => ({ ...g, order: i + 1 })));
    } else {
      setGroups([]);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newGroups = [...groups];
    const draggedItem = newGroups[draggedIndex];
    newGroups.splice(draggedIndex, 1);
    newGroups.splice(index, 0, draggedItem);

    const reordered = newGroups.map((g, i) => ({ ...g, order: i + 1 }));
    setGroups(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    notify("Đã lưu và công bố hội đồng bảo vệ");
    setTimeout(() => onBack(), 1500);
  };

  const toggleMember = (memberId: string) => {
    setForm((f) => ({
      ...f,
      members: f.members.includes(memberId)
        ? f.members.filter((m) => m !== memberId)
        : [...f.members, memberId],
    }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-md hover:bg-gray-100 transition"
          title="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Thêm mới hội đồng bảo vệ</h1>
          <p className="text-sm text-gray-600 mt-0.5">Tạo hội đồng và phân công nhóm bảo vệ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="text-sm font-medium">PHẦN 1: Thông tin chung</div>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Tên hội đồng" required>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Hội đồng số 1"
                  className={inputCls}
                />
              </Field>

              <Field label="Chọn đợt" required>
                <select
                  value={form.batch}
                  onChange={(e) => setForm({ ...form, batch: e.target.value })}
                  className={inputCls}
                >
                  <option>Đợt ĐATN Học kỳ 2 - 2026</option>
                  <option>Đợt ĐATN Học kỳ 1 - 2025</option>
                </select>
              </Field>

              <Field label="Phòng bảo vệ" required>
                <select
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  className={inputCls}
                >
                  <option value="">— Chọn phòng —</option>
                  <option>Phòng A.102</option>
                  <option>Phòng A.103</option>
                  <option>Phòng B.201</option>
                  <option>Phòng B.202</option>
                </select>
              </Field>

              <Field label="Ngày bảo vệ" required>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field label="Giờ bắt đầu" required>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field label="Giảng viên phản biện" required>
                <select
                  value={form.reviewer}
                  onChange={(e) => handleReviewerChange(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Chọn GVPB —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Thành viên hội đồng khác / Ủy viên">
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-1.5">
                  {teachers
                    .filter((t) => t.id !== form.reviewer)
                    .map((t) => (
                      <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.members.includes(t.id)}
                          onChange={() => toggleMember(t.id)}
                          className="accent-[#2196F3]"
                        />
                        {t.name}
                      </label>
                    ))}
                </div>
              </Field>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="text-sm font-medium">PHẦN 2: Danh sách nhóm bảo vệ</div>
              {form.reviewer ? (
                <div className="text-xs text-gray-600 mt-1">
                  Hiển thị các nhóm được GVPB <span className="text-[#2196F3]">{teachers.find(t => t.id === form.reviewer)?.name}</span> đánh giá ĐẠT điều kiện
                </div>
              ) : (
                <div className="text-xs text-yellow-700 mt-1">
                  ⚠ Vui lòng chọn Giảng viên phản biện để load danh sách nhóm
                </div>
              )}
            </div>

            {groups.length === 0 ? (
              <div className="px-5 py-16 text-center text-gray-500">
                <div className="text-sm">Chưa có nhóm nào</div>
                <div className="text-xs mt-1">Chọn GVPB ở bên trái để load danh sách nhóm</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3 w-12"></th>
                      <th className="text-left px-4 py-3 w-24">STT HĐ</th>
                      <th className="text-left px-4 py-3 w-32">Mã nhóm</th>
                      <th className="text-left px-4 py-3">Tên đề tài</th>
                      <th className="text-left px-4 py-3">Sinh viên thực hiện</th>
                      <th className="text-left px-4 py-3">GVHD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map((g, index) => (
                      <tr
                        key={g.groupCode}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`border-t border-gray-100 hover:bg-gray-50 cursor-move ${
                          draggedIndex === index ? "opacity-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={g.order}
                            onChange={(e) => {
                              const newOrder = parseInt(e.target.value) || 1;
                              const newGroups = [...groups];
                              newGroups[index].order = newOrder;
                              setGroups(newGroups);
                            }}
                            className={`${inputCls} w-16 text-center`}
                            min="1"
                          />
                        </td>
                        <td className="px-4 py-3 text-[#2196F3]">{g.groupCode}</td>
                        <td className="px-4 py-3">{g.topicName}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          {g.members.join(", ")}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{g.advisor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onBack}>
          Hủy bỏ
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!form.name || !form.room || !form.date || !form.time || !form.reviewer}
        >
          Lưu và Công bố
        </Button>
      </div>

      {toast && (
        <div className="fixed top-20 right-6 bg-[#4CAF50] text-white px-4 py-3 rounded-md shadow-lg text-sm z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
