import { TeamOutlined, SearchOutlined, DownloadOutlined, SendOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, Modal, Pagination, Radio, Select, Space, Tag, Tabs, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';

type AssignmentStatus = 'assigned' | 'unassigned';
type AssignmentModalMode = 'create' | 'edit' | 'detail';

type AssignmentRow = {
  studentId: string;
  name: string;
  className: string;
  topic: string;
  supervisor?: string | null;
  assignedAt?: string | null;
  status: AssignmentStatus;
};

const INITIAL_ASSIGNMENTS: AssignmentRow[] = [
  { studentId: '20520001', name: 'Nguyễn Văn A', className: 'KTPM2020', topic: 'DA001 - IoT giám sát nông nghiệp', supervisor: 'TS. Nguyễn Văn X', assignedAt: '10/04/2026', status: 'assigned' },
  { studentId: '20520002', name: 'Nguyễn Văn B', className: 'KTPM2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520005', name: 'Hoàng Văn E', className: 'CNPM2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520008', name: 'Lê Văn H', className: 'HTTT2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520010', name: 'Lý Văn H', className: 'KTPM2020', topic: 'DA001 - IoT giám sát nông nghiệp', supervisor: 'ThS. Lê Thị Z', assignedAt: '11/04/2026', status: 'assigned' },
  { studentId: '20520012', name: 'Trương Thị J', className: 'KTPM2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520015', name: 'Đỗ Thị M', className: 'CNPM2020', topic: '—', supervisor: null, status: 'unassigned' },
  { studentId: '20520018', name: 'Bùi Văn N', className: 'KTPM2020', topic: '—', supervisor: null, status: 'unassigned' },
];

const TEACHERS = [
  { id: 'T001', name: 'Nguyễn Văn X', degree: 'TS.', major: 'Công nghệ phần mềm', status: 'available' },
  { id: 'T002', name: 'Trần Văn Y', degree: 'TS.', major: 'Trí tuệ nhân tạo', status: 'full' },
  { id: 'T003', name: 'Lê Thị Z', degree: 'ThS.', major: 'Hệ thống thông tin', status: 'available' },
  { id: 'T004', name: 'Phạm Văn K', degree: 'TS.', major: 'An ninh mạng', status: 'available' },
];

const statusMeta: Record<AssignmentStatus, { label: string; color: string; bg: string }> = {
  assigned: { label: 'Đã phân công', color: '#00A65A', bg: '#E8F9EE' },
  unassigned: { label: 'Chưa phân công', color: '#D08A00', bg: '#FFF7E6' },
};

const AssignmentsPage = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<AssignmentRow[]>(INITIAL_ASSIGNMENTS);
  const [modeTab, setModeTab] = useState<'manual' | 'list'>('manual');
  const [query, setQuery] = useState('');
  const [listQuery, setListQuery] = useState('');
  const [listClassFilter, setListClassFilter] = useState('all');
  const [listTeacherFilter, setListTeacherFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentModalMode, setAssignmentModalMode] = useState<AssignmentModalMode>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null);
  const [form] = Form.useForm();

  const total = rows.length;
  const assignedCount = rows.filter((r) => r.status === 'assigned').length;
  const unassignedCount = rows.filter((r) => r.status === 'unassigned').length;

  const filtered = useMemo(() => rows.filter((r) => [r.studentId, r.name, r.className, r.topic, r.supervisor || ''].join(' ').toLowerCase().includes(query.toLowerCase())), [rows, query]);

  const filteredAssignedRows = useMemo(
    () => rows
      .filter((r) => r.status === 'assigned')
      .filter((r) => {
        const normalizedKeyword = listQuery.trim().toLowerCase();
        const byKeyword =
          !normalizedKeyword ||
          [r.studentId, r.name, r.className, r.topic, r.supervisor || '']
            .join(' ')
            .toLowerCase()
            .includes(normalizedKeyword);
        const byClass = listClassFilter === 'all' || r.className === listClassFilter;
        const byTeacher = listTeacherFilter === 'all' || (r.supervisor || '') === listTeacherFilter;
        return byKeyword && byClass && byTeacher;
      }),
    [rows, listQuery, listClassFilter, listTeacherFilter],
  );

  const openCreateAssignment = () => {
    setAssignmentModalMode('create');
    setSelectedAssignment(null);
    form.resetFields();
    form.setFieldsValue({ status: 'unassigned' });
    setAssignmentModalOpen(true);
  };

  const openEditAssignment = (record: AssignmentRow) => {
    setAssignmentModalMode('edit');
    setSelectedAssignment(record);
    form.setFieldsValue(record);
    setAssignmentModalOpen(true);
  };

  const openDetailAssignment = (record: AssignmentRow) => {
    setAssignmentModalMode('detail');
    setSelectedAssignment(record);
    form.setFieldsValue(record);
    setAssignmentModalOpen(true);
  };

  const deleteAssignment = (record: AssignmentRow) => {
    Modal.confirm({
      centered: true,
      title: 'Xóa phân công?',
      content: `Bạn có chắc muốn xóa phân công của ${record.name}?`,
      okText: 'Xóa',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => {
        setRows((prev) => prev.filter((row) => row.studentId !== record.studentId));
        message.success('Đã xóa phân công');
      },
    });
  };

  const submitAssignment = async () => {
    try {
      const values = await form.validateFields();
      if (assignmentModalMode === 'edit' && selectedAssignment) {
        setRows((prev) =>
          prev.map((row) =>
            row.studentId === selectedAssignment.studentId
              ? {
                  ...row,
                  ...values,
                }
              : row
          )
        );
        message.success('Đã cập nhật phân công');
      } else {
        setRows((prev) => [
          {
            studentId: values.studentId,
            name: values.name,
            className: values.className,
            topic: values.topic || '—',
            supervisor: values.supervisor || null,
            assignedAt: values.assignedAt || null,
            status: values.status,
          },
          ...prev,
        ]);
        message.success('Đã thêm phân công mới');
      }

      setAssignmentModalOpen(false);
      setSelectedAssignment(null);
      form.resetFields();
    } catch {
      // noop
    }
  };

  const selectAllOnPage = (checked: boolean) => {
    const newMap: Record<string, boolean> = {};
    filtered.forEach((r) => (newMap[r.studentId] = checked));
    setSelectedStudents(newMap);
  };

  const toggleSelectStudent = (id: string, checked: boolean) => setSelectedStudents((p) => ({ ...p, [id]: checked }));

  const confirmAssignSelected = () => {
    const studentIds = Object.keys(selectedStudents).filter((k) => selectedStudents[k]);
    if (studentIds.length === 0) return message.warning('Vui lòng chọn sinh viên');
    if (!selectedTeacher) return message.warning('Vui lòng chọn giảng viên');
    const teacher = TEACHERS.find((t) => t.id === selectedTeacher)!;
    Modal.confirm({
      title: 'Xác nhận phân công',
      content: `Gán ${studentIds.length} sinh viên cho ${teacher.name}?`,
      okText: 'Xác nhận',
      cancelText: t(getKey('cancel_btn')),
      onOk: () => {
        const now = new Date().toLocaleDateString('vi-VN');
        setRows((prev) => prev.map((r) => (studentIds.includes(r.studentId) ? { ...r, supervisor: teacher.name, status: 'assigned', assignedAt: now } : r)));
        setSelectedStudents({});
        setSelectedTeacher(null);
        message.success(`Đã phân công ${teacher.name} cho ${studentIds.length} sinh viên`);
      },
      centered: true,
    });
  };

  const unassign = (studentId: string) => {
    Modal.confirm({
      title: 'Hủy phân công?',
      content: 'Hành động này sẽ hủy giảng viên hướng dẫn hiện tại cho sinh viên.',
      okText: 'Xác nhận',
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => {
        setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, supervisor: null, status: 'unassigned', assignedAt: null } : r)));
        message.success('Đã hủy phân công');
      },
      centered: true,
    });
  };

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#1976d2]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
          <TeamOutlined />
          Phân công hướng dẫn
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">{t(getKey('assignment_management'))}</Typography.Title>
            <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>{t(getKey('assignment_management_desc'))}</p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs activeKey={modeTab} onChange={(k) => setModeTab(k as any)} items={[{ key: 'manual', label: 'Phân công thủ công' }, { key: 'list', label: `Danh sách đã phân công (${assignedCount})` }]} />

      {modeTab === 'manual' ? (
        <div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3"><div className="h-8 w-8 flex items-center justify-center rounded-full bg-[#2563eb] text-white">1</div><div className="text-sm font-medium">Chọn sinh viên</div></div>
            <div className="h-[1px] w-40 bg-slate-200" />
            <div className="flex items-center gap-3"><div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">2</div><div className="text-sm text-slate-500">Chọn giảng viên</div></div>
            <div className="h-[1px] w-40 bg-slate-200" />
            <div className="flex items-center gap-3"><div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">3</div><div className="text-sm text-slate-500">Xác nhận</div></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 px-4 pb-4">
          <div className="col-span-2">
            <Card className="rounded-[12px]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold">Bước 1: Chọn sinh viên cần phân công</div>
                  <div className="text-xs text-slate-500">SV chưa có GV hướng dẫn sẽ được hiển thị</div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag style={{ borderRadius: 999 }}>{Object.values(selectedStudents).filter(Boolean).length} đã chọn</Tag>
                  <Select defaultValue="all" style={{ width: 140 }}>
                    <Select.Option value="all">Tất cả</Select.Option>
                    <Select.Option value="k2020">Khóa 2020</Select.Option>
                    <Select.Option value="ktpm">KTPM</Select.Option>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left"><Checkbox onChange={(e) => selectAllOnPage(e.target.checked)} /></th>
                      <th className="px-4 py-3 text-left">MSSV</th>
                      <th className="px-4 py-3 text-left">Họ tên</th>
                      <th className="px-4 py-3 text-left">Lớp</th>
                      <th className="px-4 py-3 text-left">Khóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.studentId} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3"><Checkbox checked={!!selectedStudents[r.studentId]} onChange={(e) => toggleSelectStudent(r.studentId, e.target.checked)} /></td>
                        <td className="px-4 py-3 text-[#2563eb] font-medium">{r.studentId}</td>
                        <td className="px-4 py-3">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.className}</td>
                        <td className="px-4 py-3">K2020</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">Hiển thị {filtered.length} sinh viên</div>
            </Card>
          </div>

          <div className="col-span-1">
            <Card className="rounded-[12px]">
              <div className="mb-3">
                <div className="text-sm font-semibold">Bước 2: Chọn giảng viên hướng dẫn</div>
                <div className="text-xs text-slate-500">Tìm và chọn 1 giảng viên để gán</div>
              </div>
                <Input allowClear value={query} onChange={(e) => setQuery(e.target.value)} prefix={<SearchOutlined />} placeholder="Tìm sinh viên..." className="mb-3" />

              <Radio.Group value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="w-full">
                <div className="space-y-3">
                  {TEACHERS.map((t) => (
                    <div key={t.id} className="flex items-center justify-between border border-slate-100 p-3 rounded-md">
                      <div className="flex items-center gap-3">
                        <Radio value={t.id} />
                        <div>
                          <div className="font-medium">{t.name}</div>
                          <div className="text-xs text-slate-500">{t.degree} • {t.major}</div>
                        </div>
                      </div>
                      <div>
                        <Tag style={{ borderRadius: 999, backgroundColor: t.status === 'available' ? '#E8F9EE' : '#FFEDED', color: t.status === 'available' ? '#00A65A' : '#C53030' }}>{t.status === 'available' ? 'Còn chỗ' : 'Đầy'}</Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </Radio.Group>

              <div className="mt-4 flex flex-col gap-2">
                <Button type="primary" onClick={confirmAssignSelected}>Gán giảng viên cho sinh viên đã chọn</Button>
                <Button onClick={openCreateAssignment}>Thêm phân công thủ công</Button>
                <Button onClick={() => setSelectedStudents({})}>Hủy chọn</Button>
              </div>
            </Card>
          </div>
        </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <Card>
            <div className="flex items-start gap-4 justify-between mb-4">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <Select value={listClassFilter} onChange={setListClassFilter} style={{ minWidth: 180, width: 220 }}>
                      <Select.Option value="all">Tất cả lớp</Select.Option>
                      <Select.Option value="KTPM2020">KTPM2020</Select.Option>
                      <Select.Option value="CNPM2020">CNPM2020</Select.Option>
                    </Select>
                    <Select value={listTeacherFilter} onChange={setListTeacherFilter} style={{ minWidth: 180, width: 220 }}>
                      <Select.Option value="all">Tất cả GV</Select.Option>
                      {TEACHERS.map((teacher) => (
                        <Select.Option key={teacher.id} value={teacher.name}>{teacher.name}</Select.Option>
                      ))}
                    </Select>
                    <Input allowClear value={listQuery} onChange={(e) => setListQuery(e.target.value)} placeholder="MSSV / tên SV..." style={{ minWidth: 200, flex: 1, maxWidth: 420 }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="primary" onClick={openCreateAssignment}>Thêm phân công</Button>
                    <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
                    <Button type="primary" icon={<SendOutlined />}>Công bố phân công</Button>
                  </div>
                </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 text-left">MSSV</th>
                    <th className="px-4 py-3 text-left">Họ tên</th>
                    <th className="px-4 py-3 text-left">Lớp</th>
                    <th className="px-4 py-3 text-left">GVHD</th>
                    <th className="px-4 py-3 text-left">Ngày phân</th>
                    <th className="px-4 py-3 text-right">{t(getKey('action'))}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignedRows.map((r) => (
                    <tr key={r.studentId} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 text-[#2563eb] font-medium">{r.studentId}</td>
                      <td className="px-4 py-3">{r.name}</td>
                      <td className="px-4 py-3 text-slate-600">{r.className}</td>
                      <td className="px-4 py-3">{r.supervisor}</td>
                      <td className="px-4 py-3">{r.assignedAt || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Space size={6}>
                          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => openDetailAssignment(r)} />
                          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => openEditAssignment(r)} />
                          <Button type="text" size="small" danger onClick={() => unassign(r.studentId)} icon={<DeleteOutlined />} />
                          <Button type="text" size="small" danger onClick={() => deleteAssignment(r)} icon={<DeleteOutlined />} />
                        </Space>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination current={1} total={1} />
      </div>

      <Modal
        centered
        open={assignmentModalOpen}
        title={
          assignmentModalMode === 'create'
            ? 'Thêm phân công'
            : assignmentModalMode === 'edit'
              ? 'Chỉnh sửa phân công'
              : 'Chi tiết phân công'
        }
        onCancel={() => {
          setAssignmentModalOpen(false);
          setSelectedAssignment(null);
          form.resetFields();
        }}
        okText={assignmentModalMode === 'create' ? 'Thêm mới' : assignmentModalMode === 'edit' ? 'Cập nhật' : undefined}
        cancelText={t(getKey('cancel_btn'))}
        onOk={submitAssignment}
        footer={assignmentModalMode === 'detail' ? null : undefined}
      >
        <Form form={form} layout="vertical" className="pt-2">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Form.Item label="MSSV" name="studentId" rules={[{ required: true, message: 'Vui lòng nhập MSSV' }]}>
              <Input disabled={assignmentModalMode !== 'create'} />
            </Form.Item>
            <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input disabled={assignmentModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Lớp" name="className" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
              <Input disabled={assignmentModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
              <Select
                disabled={assignmentModalMode === 'detail'}
                options={[
                  { value: 'assigned', label: 'Đã phân công' },
                  { value: 'unassigned', label: 'Chưa phân công' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item label="Đề tài" name="topic">
            <Input disabled={assignmentModalMode === 'detail'} />
          </Form.Item>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Form.Item label="Giảng viên hướng dẫn" name="supervisor">
              <Input disabled={assignmentModalMode === 'detail'} />
            </Form.Item>
            <Form.Item label="Ngày phân công" name="assignedAt">
              <Input disabled={assignmentModalMode === 'detail'} placeholder="DD/MM/YYYY" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignmentsPage;
