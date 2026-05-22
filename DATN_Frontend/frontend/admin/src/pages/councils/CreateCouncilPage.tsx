import React, { useState } from 'react';
import { Button, Card, Input, Select, Checkbox, message } from 'antd';
import { ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../constants/commonConst';

const TEACHERS = [
  { id: 'GV01', name: 'TS. Nguyễn Văn X' },
  { id: 'GV02', name: 'TS. Trần Văn Y' },
  { id: 'GV03', name: 'ThS. Lê Thị Z' },
  { id: 'GV04', name: 'TS. Phạm Văn K' },
];

export default function CreateCouncilPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', batch: 'Đợt ĐATN Học kỳ 2 - 2026', room: '', date: '', time: '', reviewer: '', members: [] as string[] });

  type DefenseGroup = { groupCode: string; topicName: string; members: string[]; advisor: string; order: number };
  const sampleGroups: DefenseGroup[] = [
    { groupCode: 'G01', topicName: 'Hệ thống IoT giám sát nông nghiệp', members: ['20520001 - Nguyễn A', '20520002 - Trần B'], advisor: 'TS. Nguyễn Văn X', order: 1 },
    { groupCode: 'G02', topicName: 'Ứng dụng AI nhận diện hình ảnh', members: ['20520003 - Phạm D'], advisor: 'TS. Nguyễn Văn X', order: 2 },
    { groupCode: 'G03', topicName: 'Nền tảng e-commerce', members: ['20520004 - Lê C', '20520005 - Hoàng E'], advisor: 'TS. Nguyễn Văn X', order: 3 },
  ];

  const [groups, setGroups] = useState<DefenseGroup[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toggleMember = (id: string) => setForm((f) => ({ ...f, members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id] }));

  const handleSave = () => {
    message.success('Đã tạo hội đồng');
    navigate('/councils');
  };

  const handleReviewerChange = (val: string) => {
    setForm((f) => ({ ...f, reviewer: val }));
    if (val) setGroups(sampleGroups.map((g, i) => ({ ...g, order: i + 1 })));
    else setGroups([]);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newGroups = [...groups];
    const dragged = newGroups[draggedIndex];
    newGroups.splice(draggedIndex, 1);
    newGroups.splice(index, 0, dragged);
    setGroups(newGroups.map((g, i) => ({ ...g, order: i + 1 })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-6 flex items-center gap-3')}>
        <button onClick={() => navigate('/councils')} className="p-2 rounded-md hover:bg-gray-100">
          <ArrowLeftOutlined />
        </button>
        <div>
          <h1 className="text-2xl font-medium">Thêm mới hội đồng bảo vệ</h1>
          <p className="text-sm text-gray-600 mt-0.5">Tạo hội đồng và phân công nhóm bảo vệ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">PHẦN 1: Thông tin chung</div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Tên hội đồng</div>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Hội đồng số 1" />
              </div>

              <div>
                <div className="text-xs text-gray-600 mb-1">Chọn đợt</div>
                <Select value={form.batch} onChange={(val) => setForm({ ...form, batch: val })} style={{ width: '100%' }}>
                  <Select.Option value="Đợt ĐATN Học kỳ 2 - 2026">Đợt ĐATN Học kỳ 2 - 2026</Select.Option>
                </Select>
              </div>

              <div>
                <div className="text-xs text-gray-600 mb-1">Phòng bảo vệ</div>
                <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="VD: A1.401" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-600 mb-1">Ngày bảo vệ</div>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-600 mb-1">Giờ bắt đầu</div>
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-600 mb-1">Giảng viên phản biện</div>
                <Select value={form.reviewer} onChange={(val) => handleReviewerChange(val as string)} style={{ width: '100%' }}>
                  <Select.Option value="">— Chọn GVPB —</Select.Option>
                  {TEACHERS.map((t) => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
                </Select>
              </div>

              <div>
                <div className="text-xs text-gray-600 mb-1">Thành viên hội đồng khác</div>
                <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto space-y-1.5">
                  {TEACHERS.filter((t) => t.id !== form.reviewer).map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox checked={form.members.includes(t.id)} onChange={() => toggleMember(t.id)} />
                      {t.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">PHẦN 2: Danh sách nhóm bảo vệ</div>
            {groups.length === 0 ? (
              <div className="px-5 py-16 text-center text-gray-500">Chưa có nhóm nào. Chọn GVPB để load danh sách nhóm</div>
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
                        className={`border-t border-gray-100 hover:bg-gray-50 cursor-move ${draggedIndex === index ? 'opacity-50' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <MenuOutlined className="text-gray-400" />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={g.order}
                            onChange={(e) => {
                              const newOrder = parseInt(e.target.value) || 1;
                              const newGroups = [...groups];
                              newGroups[index].order = newOrder;
                              setGroups(newGroups.sort((a, b) => a.order - b.order).map((gg, i) => ({ ...gg, order: i + 1 })));
                            }}
                            className="w-16 text-center border rounded px-2 py-1"
                            min={1}
                          />
                        </td>
                        <td className="px-4 py-3 text-[#2196F3]">{g.groupCode}</td>
                        <td className="px-4 py-3">{g.topicName}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{g.members.join(', ')}</td>
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
        <Button onClick={() => navigate('/councils')}>Hủy bỏ</Button>
        <Button type="primary" onClick={handleSave} disabled={!form.name || !form.room || !form.date || !form.time || !form.reviewer}>Lưu và Công bố</Button>
      </div>
    </div>
  );
}
