import { TeamOutlined, SearchOutlined, DownloadOutlined, SendOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, Modal, Pagination, Radio, Select, Space, Tag, Tabs, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import AssignmentModal from './components/AssignmentModal';
import AssignmentForm from './components/AssignmentForm';
import FilterTable from '../../components/shared/table/FilterTable';
import { assignmentHooks } from '../../hooks/useAssignments';
import { useTranslation } from 'react-i18next';
import { cn, STATUS_CODE } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import type { AssignmentRow as AssignmentRowType } from '../../type/AssignmentType';
import { formatNumber } from '@shared/utils/numberUtils';

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
  const assignedCount = rows.filter((r) => r.status === STATUS_CODE.ASSIGNED).length;

  const filtered = useMemo(
    () => rows.filter((r) => r.status === STATUS_CODE.UNASSIGNED),
    [rows],
  );

  const filteredAssignedRows = useMemo(
    () => rows
      .filter((r) => r.status === STATUS_CODE.ASSIGNED),
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
        message.success(t(getKey('update_assignment_success')));
      } else {
        await createAssignmentMutation.mutateAsync({
          body: values,
          params: { page: 1, limit: 1000 },
        });
        message.success(t(getKey('create_assignment_success')));
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
    if (studentIds.length === 0) return message.warning(t(getKey('please_select_student')));
    if (!selectedTeacher) return message.warning(t(getKey('please_select_teacher')));
    const teacher = teachers.find((teacherItem) => teacherItem.id === selectedTeacher)!;
    Modal.confirm({
      title: t(getKey('confirm_assignment_title')),
      content: t(getKey('confirm_assignment_content'), { count: formatNumber(studentIds.length), teacher: teacher.name }),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: () => {
        const now = new Date().toLocaleDateString('vi-VN');
        Promise.all(
          studentIds.map((studentId) =>
            updateAssignmentMutation.mutateAsync({
              id: studentId,
              body: { supervisor: teacher.name, status: STATUS_CODE.ASSIGNED, assignedAt: now },
              index: 0,
              params: { page: 1, limit: 1000 },
            })
          )
        ).then(() => {
          message.success(t(getKey('assign_teacher_success_msg'), { teacher: teacher.name, count: formatNumber(studentIds.length) }));
        });
        setSelectedStudents({});
        setSelectedTeacher(null);
      },
      centered: true,
    });
  };

  const unassign = (studentId: string) => {
    Modal.confirm({
      title: t(getKey('unassign_confirm_title')),
      content: t(getKey('unassign_confirm_content')),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => {
        updateAssignmentMutation.mutate(
          {
            id: studentId,
            body: { supervisor: null, status: STATUS_CODE.UNASSIGNED, assignedAt: null },
            index: 0,
            params: { page: 1, limit: 1000 },
          },
          {
            onSuccess: () => message.success(t(getKey('unassign_success_msg'))),
          }
        );
      },
      centered: true,
    });
  };

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-light)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]')}>
          <TeamOutlined />
          {t(getKey('assignment_management'))}
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">{t(getKey('assignment_management'))}</Typography.Title>
            <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>{t(getKey('assignment_management_desc'))}</p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <Tabs activeKey={modeTab} onChange={(k) => setModeTab(k as 'manual' | 'list')} items={[{ key: 'manual', label: t(getKey('manual_assignment')) }, { key: 'list', label: `${t(getKey('assigned_list'))} (${formatNumber(assignedCount)})` }]} />

      {modeTab === 'manual' ? (
        <div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3"><div className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-medium">1</div><div className="text-sm font-medium">{t(getKey('step_select_student'))}</div></div>
            <div className="h-[1px] w-40 bg-slate-200" />
            <div className="flex items-center gap-3"><div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-medium">2</div><div className="text-sm text-slate-500">{t(getKey('step_select_teacher'))}</div></div>
            <div className="h-[1px] w-40 bg-slate-200" />
            <div className="flex items-center gap-3"><div className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 font-medium">3</div><div className="text-sm text-slate-500">{t(getKey('step_confirm'))}</div></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 px-4 pb-4">
          <div className="col-span-2">
            <Card className="rounded-[12px]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold">{t(getKey('step1_select_student_desc'))}</div>
                  <div className="text-xs text-slate-500">{t(getKey('step1_sub_desc'))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="rounded-full m-0">{t(getKey('selected_count_label'), { count: formatNumber(Object.values(selectedStudents).filter(Boolean).length) })}</Tag>
                  <Select defaultValue="all" className="w-[140px]">
                    <Select.Option value="all">{t(getKey('all'))}</Select.Option>
                    <Select.Option value="k2020">{t(getKey('course_class'))} 2020</Select.Option>
                    <Select.Option value="ktpm">KTPM</Select.Option>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left"><Checkbox onChange={(e) => selectAllOnPage(e.target.checked)} /></th>
                      <th className="px-4 py-3 text-left">{t(getKey('student_id'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('student_name'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('class_name'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('course_class'))}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.studentId} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3"><Checkbox checked={!!selectedStudents[r.studentId]} onChange={(e) => toggleSelectStudent(r.studentId, e.target.checked)} /></td>
                        <td className="px-4 py-3 text-[var(--color-primary)] font-medium">{r.studentId}</td>
                        <td className="px-4 py-3">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.className}</td>
                        <td className="px-4 py-3">K2020</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">{t(getKey('showing_students_count'), { count: formatNumber(filtered.length) })}</div>
            </Card>
          </div>

          <div className="col-span-1">
            <Card className="rounded-[12px]">
              <div className="mb-3">
                <div className="text-sm font-semibold">{t(getKey('step2_select_teacher_desc'))}</div>
                <div className="text-xs text-slate-500">{t(getKey('step2_sub_desc'))}</div>
              </div>
                <div className="mb-3 space-y-2">
                  <Input
                    allowClear
                    value={teacherQuery}
                    onChange={(e) => setTeacherQuery(e.target.value)}
                    prefix={<SearchOutlined />}
                    placeholder={t(getKey('search_teacher_placeholder'))}
                  />
                  <div className="flex items-center gap-2">
                    <Select
                      value={teacherStatusFilter}
                      onChange={(value) => setTeacherStatusFilter(value)}
                      className="flex-1"
                      options={[
                        { value: 'all', label: t(getKey('all')) },
                        { value: STATUS_CODE.AVAILABLE, label: t(getKey('available_slots')) },
                        { value: STATUS_CODE.FULL, label: t(getKey('full_slots')) },
                      ]}
                    />
                    <Tag className="rounded-full m-0">{formatNumber(filteredTeachers.length)} GV</Tag>
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
                        <Tag className={cn(
                          "rounded-full px-[10px] py-0 border-none m-0",
                          teacher.status === STATUS_CODE.AVAILABLE
                            ? "bg-[var(--color-green-light)] text-[var(--color-green-medium)]"
                            : "bg-[var(--color-red-light)] text-[var(--color-red-medium)]"
                        )}>
                          {teacher.status === STATUS_CODE.AVAILABLE ? t(getKey('available_slots')) : t(getKey('full_slots'))}
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </Radio.Group>

              <div className="mt-4 flex flex-col gap-2">
                <Button type="primary" onClick={confirmAssignSelected}>{t(getKey('assign_teacher_btn'))}</Button>
                <Button onClick={() => setSelectedStudents({})}>{t(getKey('cancel_select_btn'))}</Button>
              </div>
            </Card>
          </div>
        </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <FilterTable
            title={`${t(getKey('assigned_list'))} (${formatNumber(assignedCount)})`}
            columns={[
              { title: t(getKey('student_id')), dataIndex: 'studentId', key: 'studentId', render: (v: string) => <span className="text-[var(--color-primary)] font-medium">{v}</span> },
              { title: t(getKey('student_name')), dataIndex: 'name', key: 'name', ellipsis: true },
              { title: t(getKey('class_name')), dataIndex: 'className', key: 'className' },
              { title: t(getKey('mentor')), dataIndex: 'supervisor', key: 'supervisor', ellipsis: true },
              { title: t(getKey('assigned_date_label')), dataIndex: 'assignedAt', key: 'assignedAt' },
            ]}
            useQueryHook={(params: any) => {
              const typed = params as import('../..//api/assignmentApi').IAssignmentListParams;
              const query = assignmentHooks.useFetchListAssignments(typed);
              const keyword = (typed.keyword ?? '').trim().toLowerCase();
              const classFilter = typed.className || 'all';
              const teacherFilter = typed.supervisor || 'all';
              const source = query.data?.rows ?? [];
              const filteredRows = source
                .filter((r: any) => r.status === STATUS_CODE.ASSIGNED)
                .filter((r: any) => {
                  const byKeyword = !keyword || [r.studentId, r.name, r.className, r.topic, r.supervisor || ''].join(' ').toLowerCase().includes(keyword);
                  const byClass = classFilter === 'all' || r.className === classFilter;
                  const byTeacher = teacherFilter === 'all' || (r.supervisor || '') === teacherFilter;
                  return byKeyword && byClass && byTeacher;
                });
              const data = { rows: filteredRows, total: filteredRows.length };
              return {
                ...(query as unknown as import('@tanstack/react-query').UseQueryResult<any, Error>),
                data,
              } as import('@tanstack/react-query').UseQueryResult<import('../../type/AssignmentType').IListAssignment extends infer T ? import('@shared/types/GeneralType').ListResponseTypeObject<T> : never, Error>;
            }}
            paramVariables={{ page: 1, limit: 10 }}
            filterRender={() => (
              <div className="mb-4 flex flex-wrap gap-3 items-center">
                <Form.Item name="className" className="m-0">
                  <Select allowClear className="min-w-[180px]" options={[{ value: 'all', label: t(getKey('all_classes')) }, { value: 'KTPM2020', label: 'KTPM2020' }, { value: 'CNPM2020', label: 'CNPM2020' }]} />
                </Form.Item>
                <Form.Item name="supervisor" className="m-0">
                  <Select allowClear className="min-w-[180px]" options={[{ value: 'all', label: t(getKey('all_teachers')) }, ...teachers.map((t) => ({ value: t.name, label: t.name }))]} />
                </Form.Item>
                <Form.Item name="keyword" className="m-0">
                  <Input allowClear placeholder={t(getKey('search_student_placeholder'))} className="min-w-[200px]" />
                </Form.Item>
                <div className="ml-auto flex gap-2">
                  <Button icon={<DownloadOutlined />}>{t(getKey('export_to_excel'))}</Button>
                  <Button type="primary" icon={<SendOutlined />}>{t(getKey('publish_assignment_btn'))}</Button>
                </div>
              </div>
            )}
            updateInfo={{ type: 'modal', modalInfo: { modalContent: <AssignmentForm />, modalProps: { centered: true, width: 760, title: t(getKey('edit_assignment_title')) }, modalFunc: updateAssignmentMutation } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <AssignmentForm disabled />, modalProps: { centered: true, width: 760, title: t(getKey('detail_assignment_title')), footer: null }, modalFunc: assignmentHooks.useFetchDetailAssignment } }}
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
