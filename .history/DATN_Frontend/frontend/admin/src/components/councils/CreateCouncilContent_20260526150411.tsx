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

type DefenseGroup = {
  groupCode: string;
  topicName: string;
  members: string[];
  advisorId: string;
  order: number;
  reviewerId?: string | null;
  graders?: string[];
};

const CreateCouncilContent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', batch: 'Đợt ĐATN Học kỳ 2 - 2026', room: '', date: '', time: '', chair: '', secretary: '', reviewers: [] as string[], members: [] as string[] });
  const sampleGroups: DefenseGroup[] = [
    { groupCode: 'G01', topicName: 'Hệ thống IoT giám sát nông nghiệp', members: ['20520001 - Nguyễn A', '20520002 - Trần B'], advisorId: 'GV01', order: 1 },
    { groupCode: 'G02', topicName: 'Ứng dụng AI nhận diện hình ảnh', members: ['20520003 - Phạm D'], advisorId: 'GV02', order: 2 },
    { groupCode: 'G03', topicName: 'Nền tảng e-commerce', members: ['20520004 - Lê C', '20520005 - Hoàng E'], advisorId: 'GV03', order: 3 },
  ];

  const [groups, setGroups] = useState<DefenseGroup[]>([]);
  const [editingGradersIndex, setEditingGradersIndex] = useState<number | null>(null);
  const [tempGraders, setTempGraders] = useState<string[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const toggleMember = (id: string) => setForm((f) => ({ ...f, members: f.members.includes(id) ? f.members.filter((m) => m !== id) : [...f.members, id] }));
  const toggleReviewer = (id: string) => setForm((f) => ({ ...f, reviewers: f.reviewers.includes(id) ? f.reviewers.filter((r) => r !== id) : [...f.reviewers, id] }));

  const handleSave = () => {
    if (!form.name || !form.room || !form.date || !form.time) return message.error('Vui lòng điền đầy đủ thông tin hội đồng');
    if (groups.length > 0) {
      for (const g of groups) {
        if (!g.reviewerId) return message.error(`Đề tài ${g.groupCode} chưa chọn GVPB`);
        if (![form.chair, form.secretary, ...form.reviewers].includes(g.reviewerId)) return message.error(`GVPB của ${g.groupCode} phải là thành viên hội đồng`);
      }
    }
    message.success('Đã tạo hội đồng');
    navigate('/councils');
  };

  const collectTopics = () => {
    const memberIds = [...form.reviewers];
    if (form.chair) memberIds.push(form.chair);
    if (form.secretary) memberIds.push(form.secretary);
    const collected = sampleGroups.filter((g) => memberIds.includes(g.advisorId)).map((g, i) => ({ ...g, order: i + 1, reviewerId: null, graders: [g.advisorId] }));
    setGroups(collected);
    message.success(`Đã gom ${collected.length} đề tài từ giảng viên hội đồng`);
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
        <button onClick={() => navigate('/councils')} className="rounded-md p-2 hover:bg-gray-100">
          <ArrowLeftOutlined />
        </button>
        <div>
          <h1 className="text-2xl font-medium">Thêm mới hội đồng bảo vệ</h1>
          <p className="mt-0.5 text-sm text-gray-600">Tạo hội đồng và phân công nhóm bảo vệ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">PHẦN 1: Thông tin chung</div>
            <div className="space-y-4 p-5">
              <div>
                <div className="mb-1 text-xs text-gray-600">Tên hội đồng</div>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Hội đồng số 1" />
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">Chọn đợt</div>
                <Select value={form.batch} onChange={(val) => setForm({ ...form, batch: val })} style={{ width: '100%' }}>
                  <Select.Option value="Đợt ĐATN Học kỳ 2 - 2026">Đợt ĐATN Học kỳ 2 - 2026</Select.Option>
                </Select>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">Phòng bảo vệ</div>
                <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="VD: A1.401" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">Ngày bảo vệ</div>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">Giờ bắt đầu</div>
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">Giảng viên phản biện</div>
                <div className="mb-2 text-xs text-gray-500">(Chọn nhiều giảng viên để thêm vào hội đồng)</div>
                <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-gray-300 p-3">
                  {TEACHERS.map((t) => (
                    <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox checked={form.reviewers.includes(t.id)} onChange={() => toggleReviewer(t.id)} />
                      {t.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">Thành viên hội đồng khác</div>
                <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-gray-300 p-3">
                  {TEACHERS.map((t) => (
                    <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm">
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
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
              <div>PHẦN 2: Danh sách nhóm bảo vệ</div>
              <div>
                <Button type="default" onClick={collectTopics} disabled={form.reviewers.length === 0 && !form.chair && !form.secretary}>
                  Gom đề tài từ giảng viên hội đồng
                </Button>
              </div>
            </div>
            {groups.length === 0 ? (
              <div className="px-5 py-16 text-center text-gray-500">Chưa có nhóm nào. Nhấn "Gom đề tài" để thu đề tài từ giảng viên hội đồng</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left"></th>
                      <th className="w-24 px-4 py-3 text-left">STT HĐ</th>
                      <th className="w-32 px-4 py-3 text-left">Mã nhóm</th>
                      <th className="px-4 py-3 text-left">Tên đề tài</th>
                      <th className="px-4 py-3 text-left">Sinh viên thực hiện</th>
                      <th className="px-4 py-3 text-left">GVHD</th>
                      <th className="px-4 py-3 text-left">GV phản biện</th>
                      <th className="px-4 py-3 text-left">Người chấm</th>
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
                        className={`cursor-move border-t border-gray-100 hover:bg-gray-50 ${draggedIndex === index ? 'opacity-50' : ''}`}
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
                            className="w-16 rounded border px-2 py-1 text-center"
                            min={1}
                          />
                        </td>
                        <td className="px-4 py-3 text-[#2196F3]">{g.groupCode}</td>
                        <td className="px-4 py-3">{g.topicName}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{g.members.join(', ')}</td>
                        <td className="px-4 py-3 text-gray-600">{TEACHERS.find((t) => t.id === g.advisorId)?.name}</td>
                        <td className="px-4 py-3">
                          <select
                            value={g.reviewerId || ''}
                            onChange={(e) => {
                              const v = e.target.value || null;
                              const newGroups = [...groups];
                              newGroups[index].reviewerId = v;
                              newGroups[index].graders = Array.from(new Set([...(newGroups[index].graders || []), ...(v ? [v] : [])]));
                              setGroups(newGroups);
                            }}
                            className="w-64 rounded border px-2 py-1"
                          >
                            <option value="">— Chọn —</option>
                            {[form.chair, form.secretary, ...form.reviewers].filter(Boolean).map((m) => (
                              <option key={m} value={m}>
                                {TEACHERS.find((t) => t.id === m)?.name || m}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 text-sm">{(g.graders || []).map((id) => TEACHERS.find((t) => t.id === id)?.name || id).join(', ')}</div>
                            <button className="text-xs text-[#2563EB] hover:underline" onClick={() => { setEditingGradersIndex(index); setTempGraders(g.graders || [g.advisorId]); }}>
                              Sửa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {editingGradersIndex !== null && (
              <div className="mt-3 rounded-md border border-dashed border-gray-200 bg-white p-4">
                <div className="mb-2 text-sm font-medium">Chỉnh sửa danh sách người chấm</div>
                <div className="mb-3 text-xs text-gray-600">Chọn người chấm cụ thể cho đề tài. GVHD và GVPB sẽ luôn được thêm tự động.</div>
                <div className="mb-3 grid max-h-40 grid-cols-2 gap-2 overflow-y-auto">
                  {TEACHERS.map((t) => (
                    <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={tempGraders.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) setTempGraders((p) => Array.from(new Set([...p, t.id])));
                          else setTempGraders((p) => p.filter((x) => x !== t.id));
                        }}
                      />
                      {t.name}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button onClick={() => setEditingGradersIndex(null)}>Hủy</Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      if (editingGradersIndex === null) return;
                      const newGroups = [...groups];
                      const g = newGroups[editingGradersIndex];
                      const ensured = Array.from(new Set([...(tempGraders || []), g.advisorId, ...(g.reviewerId ? [g.reviewerId] : [])]));
                      g.graders = ensured;
                      newGroups[editingGradersIndex] = g;
                      setGroups(newGroups);
                      setEditingGradersIndex(null);
                      message.success('Cập nhật danh sách người chấm');
                    }}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button onClick={() => navigate('/councils')}>Hủy bỏ</Button>
        <Button type="primary" onClick={handleSave} disabled={!form.name || !form.room || !form.date || !form.time || !form.reviewer}>
          Lưu và Công bố
        </Button>
      </div>
    </div>
  );
};

export default CreateCouncilContent;