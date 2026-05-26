import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { Table, Button, Drawer, Modal, Tooltip, Avatar, Tag, Input, Select, Space, message } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, EditOutlined, PlusOutlined, SwapOutlined, DeleteOutlined, LockOutlined } from '@ant-design/icons';

type Student = { id: string; name: string; code: string; eligible: boolean; reason?: string };
type Group = {
  id: string;
  code: string;
  title: string;
  supervisor: string;
  members: Student[];
  maxMembers: number;
  status: 'PENDING' | 'APPROVED' | 'MISSING' | 'LOCKED' | 'DISSOLVED' | 'WARNING';
  registrationBatch: string;
};

const sampleStudents: Student[] = [
  { id: 's1', name: 'Nguyễn Văn A', code: 'SV001', eligible: true },
  { id: 's2', name: 'Trần Thị B', code: 'SV002', eligible: true },
  { id: 's3', name: 'Lê Văn C', code: 'SV003', eligible: false, reason: 'Nợ môn' },
  { id: 's4', name: 'Phạm Thị D', code: 'SV004', eligible: false, reason: 'Chưa đủ tín chỉ' },
  { id: 's5', name: 'Hoàng Văn E', code: 'SV005', eligible: true },
];

const initialGroups: Group[] = [
  {
    id: 'g01',
    code: 'NH01',
    title: 'Hệ thống phân tích dữ liệu',
    supervisor: 'TS. Nguyễn Văn A',
    members: [sampleStudents[0], sampleStudents[2]],
    maxMembers: 4,
    status: 'WARNING',
    registrationBatch: 'HK1/2024',
  },
  {
    id: 'g02',
    code: 'NH02',
    title: 'Ứng dụng web cho doanh nghiệp',
    supervisor: 'PGS. Mai Thị H',
    members: [sampleStudents[1], sampleStudents[4]],
    maxMembers: 3,
    status: 'APPROVED',
    registrationBatch: 'HK1/2024',
  },
];

const STATUS_META: Record<Group['status'], { label: string; color: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'default' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  WARNING: { label: 'Có cảnh báo', color: 'orange' },
  MISSING: { label: 'Thiếu thành viên', color: 'blue' },
  LOCKED: { label: 'Bị khóa', color: 'red' },
  DISSOLVED: { label: 'Đã giải thể', color: 'default' },
};

const GroupsAdminPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [batchFilter, setBatchFilter] = useState<string | null>(null);
  const [supervisorFilter, setSupervisorFilter] = useState<string | null>(null);
  const [drawerGroup, setDrawerGroup] = useState<Group | null>(null);
  const [addModalGroup, setAddModalGroup] = useState<Group | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeLeft, setMergeLeft] = useState<string | null>(null);
  const [mergeRight, setMergeRight] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
  const supervisors = useMemo(() => Array.from(new Set(groups.map((g) => g.supervisor))), [groups]);

  const total = groups.length;
  const enough = groups.filter((g) => g.status === 'APPROVED').length;
  const withWarnings = groups.filter((g) => g.status === 'WARNING').length;
  const missing = groups.filter((g) => g.status === 'MISSING').length;

  const filtered = groups.filter((g) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const inGroup = [g.code, g.title, g.supervisor, g.registrationBatch].join(' ').toLowerCase().includes(q);
      const inMembers = g.members.some((m) => `${m.name} ${m.code}`.toLowerCase().includes(q));
      if (!inGroup && !inMembers) return false;
    }
    if (statusFilter && g.status !== statusFilter) return false;
    if (batchFilter && g.registrationBatch !== batchFilter) return false;
    if (supervisorFilter && g.supervisor !== supervisorFilter) return false;
    return true;
  });

  function openDrawer(g: Group) {
    setDrawerGroup(g);
  }

  function saveGroup(updated: Group) {
    setGroups((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setDrawerGroup(null);
    message.success('Đã lưu thay đổi');
  }

  function openAddMember(g: Group) {
    setAddModalGroup(g);
  }

  function addMemberToGroup(groupId: string, student: Student, force = false) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const already = g.members.find((m) => m.id === student.id);
        if (already) return g;
        const newMembers = [...g.members, student];
        const newStatus = newMembers.length < 2 ? 'MISSING' : g.status === 'LOCKED' ? 'LOCKED' : g.status;
        return { ...g, members: newMembers, status: newStatus };
      })
    );
    setAddModalGroup(null);
    message.success('Đã thêm thành viên (mô phỏng)');
  }

  function removeMember(groupId: string, studentId: string) {
    Modal.confirm({
      title: 'Xác nhận loại sinh viên',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc muốn xóa sinh viên này khỏi nhóm? Hành động này sẽ ghi nhận là "bị loại"',
      onOk() {
        setGroups((prev) =>
          prev.map((g) => {
            if (g.id !== groupId) return g;
            const left = g.members.filter((m) => m.id !== studentId);
            const newStatus = left.length < 2 ? 'MISSING' : g.status;
            return { ...g, members: left, status: newStatus };
          })
        );
        message.success('Đã loại sinh viên (mô phỏng)');
      },
    });
  }

  function promptDelete(group: Group) {
    setDeleteTarget(group);
    Modal.confirm({
      title: 'Xóa nhóm — xác nhận',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <div>Ghi lý do xóa:</div>
          <Input.TextArea id="delete-reason" rows={3} />
        </div>
      ),
      onOk() {
        // perform delete
        setGroups((prev) => prev.filter((p) => p.id !== group.id));
        message.success('Đã xóa nhóm (mô phỏng)');
      },
    });
  }

  function doMerge() {
    if (!mergeLeft || !mergeRight) return message.error('Chọn cả nhóm chính và nhóm phụ');
    if (mergeLeft === mergeRight) return message.error('Không thể chọn cùng nhóm');
    const left = groups.find((g) => g.id === mergeLeft)!;
    const right = groups.find((g) => g.id === mergeRight)!;
    const totalMembers = left.members.length + right.members.length;
    if (totalMembers > left.maxMembers) return message.error('Vượt quá số lượng tối đa của nhóm chính');
    Modal.confirm({
      title: 'Xác nhận ghép nhóm',
      content: `${left.code} ← ${right.code}\nSau ghép: ${totalMembers} thành viên.`,
      onOk() {
        setGroups((prev) =>
          prev
            .map((g) => {
              if (g.id === left.id) return { ...g, members: [...g.members, ...right.members] };
              if (g.id === right.id) return { ...g, status: 'DISSOLVED' };
              return g;
            })
            .filter(Boolean)
        );
        setMergeMode(false);
        setMergeLeft(null);
        setMergeRight(null);
        message.success('Ghép nhóm thành công (mô phỏng)');
      },
    });
  }

  const columns = [
    { title: 'Mã nhóm', dataIndex: 'code', key: 'code', width: 100 },
    { title: 'Tên đề tài', dataIndex: 'title', key: 'title', render: (t: string) => <div className="font-medium">{t}</div> },
    { title: 'Giảng viên hướng dẫn', dataIndex: 'supervisor', key: 'supervisor' },
    {
      title: 'Thành viên',
      key: 'members',
      render: (_: any, record: Group) => (
        <Space>
          {record.members.map((m) => (
            <Tooltip key={m.id} title={m.eligible ? m.name : `${m.name} — ${m.reason}`}>
              <span className={`px-2 py-1 rounded-full text-sm ${m.eligible ? 'bg-gray-100' : 'bg-red-100 text-red-700'}`}>
                {m.name.split(' ').slice(-1)}{m.eligible ? '' : ' ⚠'}
              </span>
            </Tooltip>
          ))}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, r: Group) => {
        const meta = STATUS_META[r.status];
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    { title: 'Số thành viên', key: 'count', render: (_: any, r: Group) => `${r.members.length}/${r.maxMembers}` },
    {
      title: t ? t(getKey('action')) : 'Hành động',
      key: 'action',
      render: (_: any, r: Group) => (
        <Space>
          <Tooltip title="Xem / Sửa">
            <Button size="small" onClick={() => openDrawer(r)} icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Thêm thành viên">
            <Button size="small" onClick={() => openAddMember(r)} icon={<PlusOutlined />} />
          </Tooltip>
          <Tooltip title="Ghép nhóm">
            <Button size="small" onClick={() => { setMergeMode(true); setMergeLeft(r.id); }} icon={<SwapOutlined />} />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button size="small" danger onClick={() => promptDelete(r)} icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Nhóm Đồ án</h2>
          <div className="text-sm text-gray-500">Quản lý nhóm sinh viên, trạng thái và hành động</div>
        </div>
        <div className="flex gap-2">
          <Input.Search placeholder="Tìm nhóm, mã, đề tài, sinh viên, giảng viên" onSearch={(v) => setSearch(v)} style={{ width: 420 }} />
          <Button type="primary" onClick={() => message.info('Xuất Excel (mô phỏng)')}>Xuất</Button>
        </div>
      </div>

      <div className="flex gap-4 items-center mb-4">
        <Select placeholder="Trạng thái" allowClear style={{ width: 180 }} onChange={(v) => setStatusFilter(v)}>
          {Object.keys(STATUS_META).map((k) => <Select.Option key={k} value={k}>{STATUS_META[k as Group['status']].label}</Select.Option>)}
        </Select>
        <Select placeholder="Đợt đăng ký" allowClear style={{ width: 160 }} onChange={(v) => setBatchFilter(v)}>
          <Select.Option value="HK1/2024">HK1/2024</Select.Option>
          <Select.Option value="HK2/2024">HK2/2024</Select.Option>
        </Select>
        <Select placeholder="Giảng viên" allowClear style={{ width: 220 }} onChange={(v) => setSupervisorFilter(v)}>
          {supervisors.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
        </Select>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow-sm">Tổng: <div className="text-2xl font-bold">{total}</div></div>
        <div className="bg-white p-4 rounded shadow-sm">Đủ điều kiện: <div className="text-2xl font-bold">{enough}</div></div>
        <div className="bg-white p-4 rounded shadow-sm">Cảnh báo: <div className="text-2xl font-bold">{withWarnings}</div></div>
        <div className="bg-white p-4 rounded shadow-sm">Thiếu: <div className="text-2xl font-bold">{missing}</div></div>
      </div>

      <div className="bg-white p-4 rounded">
        <Table rowKey="id" dataSource={filtered} columns={columns} pagination={{ pageSize: 8 }} />
      </div>

      <Drawer width={640} placement="right" onClose={() => setDrawerGroup(null)} visible={!!drawerGroup} title={drawerGroup?.code + ' — ' + drawerGroup?.title}>
        {drawerGroup && (
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Tên đề tài</div>
              <Input defaultValue={drawerGroup.title} onChange={(e) => setDrawerGroup({ ...drawerGroup, title: e.target.value })} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Số thành viên tối đa</div>
              <Input type="number" defaultValue={drawerGroup.maxMembers} onChange={(e) => setDrawerGroup({ ...drawerGroup, maxMembers: Number(e.target.value) })} />
            </div>
            <div>
              <div className="text-sm text-gray-600">Giảng viên hướng dẫn</div>
              <Select value={drawerGroup.supervisor} style={{ width: '100%' }} onChange={(v) => setDrawerGroup({ ...drawerGroup, supervisor: v })}>
                {supervisors.map((s) => <Select.Option key={s} value={s}>{s}</Select.Option>)}
              </Select>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">Thành viên</div>
              <div className="flex flex-col gap-2">
                {drawerGroup.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>{m.name.split(' ').slice(-1)}</Avatar>
                      <div>
                        <div className="font-medium">{m.name} <span className="text-xs text-gray-500">{m.code}</span></div>
                        {!m.eligible && <div className="text-red-600 text-sm">{m.reason}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!m.eligible && <Button danger size="small" onClick={() => removeMember(drawerGroup.id, m.id)} icon={<DeleteOutlined />} />}
                      {!m.eligible && <Button size="small" onClick={() => { setGroups((prev) => prev.map((g) => g.id === drawerGroup.id ? { ...g, status: 'LOCKED' } : g)); message.info('Đã khóa nhóm (mô phỏng)'); }} icon={<LockOutlined />}>Khóa</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setDrawerGroup(null)}>Hủy</Button>
              <Button type="primary" onClick={() => saveGroup(drawerGroup)}>Lưu</Button>
            </div>
          </div>
        )}
      </Drawer>

      <Modal title="Thêm thành viên" visible={!!addModalGroup} onCancel={() => setAddModalGroup(null)} footer={null}>
        <div className="space-y-3">
          <Input.Search placeholder="Tìm theo mã hoặc tên" onSearch={(v) => {
            const found = sampleStudents.filter((s) => `${s.name} ${s.code}`.toLowerCase().includes(v.toLowerCase()));
            if (found.length === 0) return message.info('Không tìm thấy (mô phỏng)');
            Modal.info({ title: 'Kết quả tìm kiếm (mô phỏng)', content: (
              <div>
                {found.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-2">
                    <div>{f.name} — {f.code} {f.eligible ? null : <span className="text-red-600">({f.reason})</span>}</div>
                    <div>
                      <Button onClick={() => addMemberToGroup(addModalGroup!.id, f)} size="small">Thêm</Button>
                      {!f.eligible && <Button danger size="small" onClick={() => addMemberToGroup(addModalGroup!.id, f, true)} style={{ marginLeft: 8 }}>Bỏ qua và thêm</Button>}
                    </div>
                  </div>
                ))}
              </div>
            )});
          }} />
        </div>
      </Modal>

      <Modal title="Ghép nhóm" visible={mergeMode} onCancel={() => setMergeMode(false)} onOk={doMerge} okText="Xác nhận">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Nhóm chính</div>
            <Select style={{ width: '100%' }} value={mergeLeft || undefined} onChange={(v) => setMergeLeft(v)}>
              {groups.filter((g) => g.status !== 'DISSOLVED').map((g) => <Select.Option key={g.id} value={g.id}>{g.code} — {g.title}</Select.Option>)}
            </Select>
          </div>
          <div>
            <div className="text-sm text-gray-600">Nhóm phụ</div>
            <Select style={{ width: '100%' }} value={mergeRight || undefined} onChange={(v) => setMergeRight(v)}>
              {groups.filter((g) => g.status !== 'DISSOLVED').map((g) => <Select.Option key={g.id} value={g.id}>{g.code} — {g.title}</Select.Option>)}
            </Select>
          </div>
          <div>
            <div className="text-sm text-gray-600">Preview</div>
            <div className="p-3 border rounded">{mergeLeft && mergeRight ? `${groups.find((g) => g.id === mergeLeft)!.members.length + groups.find((g) => g.id === mergeRight)!.members.length} thành viên` : 'Chọn 2 nhóm để xem preview'}</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupsAdminPage;
