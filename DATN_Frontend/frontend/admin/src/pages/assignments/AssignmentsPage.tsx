import { TeamOutlined, SearchOutlined, DownloadOutlined, SendOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, Modal, Pagination, Radio, Select, Space, Tag, Tabs, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import AssignmentModal from './components/AssignmentModal';
import AssignmentForm from './components/AssignmentForm';
import FilterTable from '../../components/shared/table/FilterTable';
import { assignmentHooks } from '../../hooks/useAssignments';
import { useTranslation } from 'react-i18next';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import type { AssignmentRow as AssignmentRowType } from '../../type/AssignmentType';

type AssignmentModalMode = 'create' | 'edit' | 'detail';

type AssignmentRow = AssignmentRowType;

const AssignmentsPage = () => {
  const { t } = useTranslation();
  const [modeTab, setModeTab] = useState<'manual' | 'list'>('manual');
  const [teacherQuery, setTeacherQuery] = useState('');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<'all' | 'available' | 'full'>('all');
  const [listQuery, setListQuery] = useState('');
  const [listClassFilter, setListClassFilter] = useState('all');
  const [listTeacherFilter, setListTeacherFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentModalMode, setAssignmentModalMode] = useState<AssignmentModalMode>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null);
  const [form] = Form.useForm();
  const { data: assignmentList } = assignmentHooks.useFetchListAssignments({ page: 1, limit: 1000 });
  const { data: teachers = [] } = assignmentHooks.useFetchTeachers();
  const createAssignmentMutation = assignmentHooks.useCreateAssignment();
  const updateAssignmentMutation = assignmentHooks.useUpdateAssignment();

  const rows = assignmentList?.rows ?? [];
  const assignedCount = rows.filter((r) => r.status === 'assigned').length;

  const filtered = useMemo(
    () => rows.filter((r) => r.status === 'unassigned'),
    [rows],
  );

  const filteredAssignedRows = useMemo(
    () => rows
      .filter((r) => r.status === 'assigned')
      .filter((r) => true),
    [rows],
  );

  const filteredTeachers = useMemo(
    () => teachers.filter((teacher) => {
      const normalizedKeyword = teacherQuery.trim().toLowerCase();
      const byKeyword =
        !normalizedKeyword ||
        [teacher.name, teacher.degree, teacher.major]
          .join(' ')
          .toLowerCase()
          .includes(normalizedKeyword);
      const byStatus = teacherStatusFilter === 'all' || teacher.status === teacherStatusFilter;
      return byKeyword && byStatus;
    }),
    [teacherQuery, teacherStatusFilter, teachers],
  );

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

  const submitAssignment = async () => {
    try {
      const values = await form.validateFields();
      if (assignmentModalMode === 'edit' && selectedAssignment) {
        await updateAssignmentMutation.mutateAsync({
          id: selectedAssignment.studentId,
          body: values,
          index: 0,
          params: { page: 1, limit: 1000 },
        });
        message.success('Đã cập nhật phân công');
      } else {
        await createAssignmentMutation.mutateAsync({
          body: values,
          params: { page: 1, limit: 1000 },
        });
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
    const teacher = teachers.find((teacherItem) => teacherItem.id === selectedTeacher)!;
    Modal.confirm({
      title: 'Xác nhận phân công',
      content: `Gán ${studentIds.length} sinh viên cho ${teacher.name}?`,
      okText: 'Xác nhận',
      cancelText: t(getKey('cancel_btn')),
      onOk: () => {
        const now = new Date().toLocaleDateString('vi-VN');
        Promise.all(
          studentIds.map((studentId) =>
            updateAssignmentMutation.mutateAsync({
              id: studentId,
              body: { supervisor: teacher.name, status: 'assigned', assignedAt: now },
              index: 0,
              params: { page: 1, limit: 1000 },
            })
          )
        ).then(() => {
          message.success(`Đã phân công ${teacher.name} cho ${studentIds.length} sinh viên`);
        });
        setSelectedStudents({});
        setSelectedTeacher(null);
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
        updateAssignmentMutation.mutate(
          {
            id: studentId,
            body: { supervisor: null, status: 'unassigned', assignedAt: null },
            index: 0,
            params: { page: 1, limit: 1000 },
          },
          {
            onSuccess: () => message.success('Đã hủy phân công'),
          }
        );
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
        <Tabs activeKey={modeTab} onChange={(k) => setModeTab(k as 'manual' | 'list')} items={[{ key: 'manual', label: 'Phân công thủ công' }, { key: 'list', label: `Danh sách đã phân công (${assignedCount})` }]} />

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
                <div className="mb-3 space-y-2">
                  <Input
                    allowClear
                    value={teacherQuery}
                    onChange={(e) => setTeacherQuery(e.target.value)}
                    prefix={<SearchOutlined />}
                    placeholder="Tìm giảng viên..."
                  />
                  <div className="flex items-center gap-2">
                    <Select
                      value={teacherStatusFilter}
                      onChange={(value) => setTeacherStatusFilter(value)}
                      className="flex-1"
                      options={[
                        { value: 'all', label: 'Tất cả' },
                        { value: 'available', label: 'Còn chỗ' },
                        { value: 'full', label: 'Hết chỗ' },
                      ]}
                    />
                    <Tag style={{ borderRadius: 999 }}>{filteredTeachers.length} GV</Tag>
                  </div>
                </div>

              <Radio.Group value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)} className="w-full">
                <div className="space-y-3">
                  {filteredTeachers.map((teacher) => (
                    <div key={teacher.id} className="flex items-center justify-between gap-3 border border-slate-100 p-3 rounded-md">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <Radio value={teacher.id} />
                        <div className="min-w-0 flex-1">
                          <div className="block text-sm font-semibold leading-5 text-slate-900">
                            {teacher.degree} {teacher.name}{teacher.major ? ` • ${teacher.major}` : ''}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Tag style={{ borderRadius: 999, backgroundColor: teacher.status === 'available' ? '#E8F9EE' : '#FFEDED', color: teacher.status === 'available' ? '#00A65A' : '#C53030' }}>{teacher.status === 'available' ? 'Còn chỗ' : 'Đầy'}</Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </Radio.Group>

              <div className="mt-4 flex flex-col gap-2">
                <Button type="primary" onClick={confirmAssignSelected}>Gán giảng viên cho sinh viên đã chọn</Button>
                <Button onClick={() => setSelectedStudents({})}>Hủy chọn</Button>
              </div>
            </Card>
          </div>
        </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <FilterTable
            title={`Danh sách đã phân công (${assignedCount})`}
            columns={[
              { title: 'MSSV', dataIndex: 'studentId', key: 'studentId', render: (v: string) => <span className="text-[#2563eb]">{v}</span> },
              { title: 'Họ tên', dataIndex: 'name', key: 'name' },
              { title: 'Lớp', dataIndex: 'className', key: 'className' },
              { title: 'GVHD', dataIndex: 'supervisor', key: 'supervisor' },
              { title: 'Ngày phân', dataIndex: 'assignedAt', key: 'assignedAt' },
            ]}
            useQueryHook={(params: any) => {
              const typed = params as import('../..//api/assignmentApi').IAssignmentListParams;
              const query = assignmentHooks.useFetchListAssignments(typed);
              const keyword = (typed.keyword ?? '').trim().toLowerCase();
              const classFilter = typed.className || 'all';
              const teacherFilter = typed.supervisor || 'all';
              const source = query.data?.rows ?? [];
              const filteredRows = source
                .filter((r: any) => r.status === 'assigned')
                .filter((r: any) => {
                  const byKeyword = !keyword || [r.studentId, r.name, r.className, r.topic, r.supervisor || ''].join(' ').toLowerCase().includes(keyword);
                  const byClass = classFilter === 'all' || r.className === classFilter;
                  const byTeacher = teacherFilter === 'all' || (r.supervisor || '') === teacherFilter;
                  return byKeyword && byClass && byTeacher;
                });
              const data = { rows: filteredRows, total: filteredRows.length };
              // cast to UseQueryResult to satisfy FilterTable's expected hook signature
              return {
                ...(query as unknown as import('@tanstack/react-query').UseQueryResult<any, Error>),
                data,
              } as import('@tanstack/react-query').UseQueryResult<import('../../type/AssignmentType').IListAssignment extends infer T ? import('@shared/types/GeneralType').ListResponseTypeObject<T> : never, Error>;
            }}
            paramVariables={{ page: 1, limit: 10 }}
            filterRender={() => (
              <div className="mb-4 flex flex-wrap gap-3 items-center">
                <Form.Item name="className" className="m-0">
                  <Select allowClear style={{ minWidth: 180 }} options={[{ value: 'all', label: 'Tất cả lớp' }, { value: 'KTPM2020', label: 'KTPM2020' }, { value: 'CNPM2020', label: 'CNPM2020' }]} />
                </Form.Item>
                <Form.Item name="supervisor" className="m-0">
                  <Select allowClear style={{ minWidth: 180 }} options={[{ value: 'all', label: 'Tất cả GV' }, ...teachers.map((t) => ({ value: t.name, label: t.name }))]} />
                </Form.Item>
                <Form.Item name="keyword" className="m-0">
                  <Input allowClear placeholder="MSSV / tên SV..." style={{ minWidth: 200 }} />
                </Form.Item>
                <div className="ml-auto flex gap-2">
                  <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
                  <Button type="primary" icon={<SendOutlined />}>Công bố phân công</Button>
                </div>
              </div>
            )}
            updateInfo={{ type: 'modal', modalInfo: { modalContent: <AssignmentForm />, modalProps: { centered: true, width: 760, title: 'Chỉnh sửa phân công' }, modalFunc: updateAssignmentMutation } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <AssignmentForm disabled />, modalProps: { centered: true, width: 760, title: 'Chi tiết phân công', footer: null }, modalFunc: assignmentHooks.useFetchDetailAssignment } }}
            formatInitialValues={(d: any) => d || {}}
            formatFormValues={(v: Record<string, unknown>) => v}
          />
        </div>
      )}
      </div>

      

      <AssignmentModal open={assignmentModalOpen} mode={assignmentModalMode} form={form} onCancel={() => { setAssignmentModalOpen(false); setSelectedAssignment(null); form.resetFields(); }} onOk={submitAssignment} />
    </div>
  );
};

export default AssignmentsPage;
