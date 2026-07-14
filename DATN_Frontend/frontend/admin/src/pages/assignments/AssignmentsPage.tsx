import { TeamOutlined, SearchOutlined, DownloadOutlined, SendOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Form, Input, Modal, Pagination, Radio, Select, Tag, Tabs, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import AssignmentModal from './components/AssignmentModal';
import AssignmentForm from './components/AssignmentForm';
import FilterTable from '../../components/shared/table/FilterTable';
import { assignmentHooks } from '../../hooks/useAssignments';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { useTranslation } from 'react-i18next';
import { cn, STATUS_CODE } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import type {
  AssignmentRow as AssignmentRowType,
  IDetailAssignment,
  ICreateAssignment,
  IUpdateAssignment,
} from '../../type/AssignmentType';
import type { IAssignmentListParams } from '../../api/assignmentApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import { formatNumber } from '@shared/utils/numberUtils';

type AssignmentModalMode = 'create' | 'edit' | 'detail';

type AssignmentRow = AssignmentRowType;

const AssignmentsPage = () => {
  const { t } = useTranslation();
  const [modeTab, setModeTab] = useState<'manual' | 'list'>('manual');
  const [teacherQuery, setTeacherQuery] = useState('');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<'all' | 'available' | 'full'>('all');
  const [selectedStudents, setSelectedStudents] = useState<Record<string, boolean>>({});
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentModalMode] = useState<AssignmentModalMode>('create');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null);
  const [manualClassFilter, setManualClassFilter] = useState('all');
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(10);
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherPageSize, setTeacherPageSize] = useState(10);
  const [form] = Form.useForm();
  const { selectedPeriod } = useGlobalVariable();

  const assignmentListParams = useMemo(() => ({
    page: 1,
    limit: 1000,
    periodId: selectedPeriod?.id || '',
  }), [selectedPeriod?.id]);

  const filterTableParams = useMemo(() => ({
    page: 1,
    limit: 10,
    periodId: selectedPeriod?.id || '',
  }), [selectedPeriod?.id]);

  const { data: assignmentList } = assignmentHooks.useFetchListAssignments(assignmentListParams);
  const { data: teachers = [] } = assignmentHooks.useFetchTeachers(selectedPeriod?.id);
  const createAssignmentMutation = assignmentHooks.useCreateAssignment();
  const updateAssignmentMutation = assignmentHooks.useUpdateAssignment();
  const deleteAssignmentMutation = assignmentHooks.useDeleteAssignment();
  const publishAssignmentsMutation = assignmentHooks.usePublishAssignments();

  const rows = assignmentList?.rows ?? [];
  const isPeriodClosed = selectedPeriod?.status === STATUS_CODE.CLOSED;
  const classOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.className))),
    [rows]
  );
  const assignedCount = rows.filter((r) => r.status === STATUS_CODE.ASSIGNED).length;

  const filtered = useMemo(
    () => rows
      .filter((r) => r.status === STATUS_CODE.UNASSIGNED)
      .filter((r) => manualClassFilter === 'all' || r.className === manualClassFilter),
    [rows, manualClassFilter],
  );

  const paginatedStudents = useMemo(
    () => filtered.slice((studentPage - 1) * studentPageSize, studentPage * studentPageSize),
    [filtered, studentPage, studentPageSize],
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

  const paginatedTeachers = useMemo(
    () => filteredTeachers.slice((teacherPage - 1) * teacherPageSize, teacherPage * teacherPageSize),
    [filteredTeachers, teacherPage, teacherPageSize],
  );

  useEffect(() => {
    setStudentPage(1);
  }, [manualClassFilter, rows.length]);

  useEffect(() => {
    setTeacherPage(1);
  }, [teacherQuery, teacherStatusFilter]);

  const submitAssignment = async () => {
    try {
      const values = await form.validateFields();
      if (assignmentModalMode === 'edit' && selectedAssignment) {
        await updateAssignmentMutation.mutateAsync({
          id: selectedAssignment.studentId,
          body: values,
          index: 0,
          params: { page: 1, limit: 1000, periodId: selectedPeriod?.id || '' } as IAssignmentListParams,
        });
        message.success(t(getKey('update_assignment_success')));
      } else {
        await createAssignmentMutation.mutateAsync({
          body: values,
          params: { page: 1, limit: 1000, periodId: selectedPeriod?.id || '' } as IAssignmentListParams,
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
    setSelectedStudents((prev) => {
      const newMap = { ...prev };
      paginatedStudents.forEach((r) => {
        if (checked) newMap[r.studentId] = true;
        else delete newMap[r.studentId];
      });
      return newMap;
    });
  };

  const toggleSelectStudent = (id: string, checked: boolean) => setSelectedStudents((p) => ({ ...p, [id]: checked }));

  const confirmAssignSelected = () => {
    if (isPeriodClosed) return;
    const studentIds = Object.keys(selectedStudents).filter((k) => selectedStudents[k]);
    if (studentIds.length === 0) return message.warning(t(getKey('please_select_student')));
    if (!selectedTeacher) return message.warning(t(getKey('please_select_teacher')));
    const teacher = teachers.find((teacherItem) => teacherItem.id === selectedTeacher)!;
    Modal.confirm({
      title: t(getKey('confirm_assignment_title')),
      content: (t(getKey('confirm_assignment_content'), { count: studentIds.length, teacher: teacher.name }) as string),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: async () => {
        // Gửi tuần tự (không dùng Promise.all) để backend kiểm tra đúng giới hạn số SV/GV
        // cho từng request một, tránh race condition khi chọn nhiều SV cùng lúc.
        let successCount = 0;
        let lastError: string | null = null;
        for (const studentId of studentIds) {
          try {
            await updateAssignmentMutation.mutateAsync({
              id: studentId,
              body: { supervisor: teacher.name, status: STATUS_CODE.ASSIGNED },
              index: 0,
              params: { page: 1, limit: 1000, periodId: selectedPeriod?.id || '' } as IAssignmentListParams,
            });
            successCount += 1;
          } catch (err) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            lastError = axiosErr?.response?.data?.message || 'Có lỗi xảy ra khi phân công!';
            break;
          }
        }
        if (successCount > 0) {
          message.success(t(getKey('assign_teacher_success_msg'), { teacher: teacher.name, count: successCount }) as string);
        }
        if (lastError) {
          message.error(lastError);
        }
        setSelectedStudents({});
        setSelectedTeacher(null);
      },
      centered: true,
    });
  };

  const unassign = (studentId: string) => {
    if (isPeriodClosed) return;
    Modal.confirm({
      title: t(getKey('unassign_confirm_title')),
      content: t(getKey('unassign_confirm_content')),
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => {
        deleteAssignmentMutation.mutate(
          {
            id: studentId,
            params: { page: 1, limit: 1000, periodId: selectedPeriod?.id || '' } as IAssignmentListParams,
          },
          {
            onSuccess: () => message.success(t(getKey('unassign_success_msg'))),
          }
        );
      },
      centered: true,
    });
  };

  const handlePublishAssignments = () => {
    if (isPeriodClosed) return;
    const unpublishedCount = filteredAssignedRows.filter((r) => !r.published).length;
    Modal.confirm({
      title: t(getKey('publish_assignment_btn')),
      content: unpublishedCount > 0
        ? `Công bố ${unpublishedCount} phân công mới cho sinh viên và giảng viên. Bạn có chắc chắn?`
        : 'Không có phân công mới nào cần công bố. Vẫn tiếp tục?',
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: () => {
        publishAssignmentsMutation.mutate(selectedPeriod?.id, {
          onSuccess: (data) => message.success(data?.message || 'Công bố phân công thành công!'),
          onError: () => message.error('Có lỗi xảy ra khi công bố phân công!'),
        });
      },
      centered: true,
    });
  };

  const handleExportExcel = () => {
    if (filteredAssignedRows.length === 0) {
      message.warning('Không có dữ liệu để xuất!');
      return;
    }
    const data = filteredAssignedRows.map((r, index) => ({
      'STT': index + 1,
      'MSSV': r.studentId,
      'Họ tên': r.name,
      'Lớp': r.className,
      'GVHD': r.supervisor || '',
      'Ngày phân': r.assignedAt || '',
      'Đã công bố': r.published ? 'Có' : 'Chưa',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Phan cong GVHD');
    XLSX.writeFile(workbook, `phan-cong-huong-dan-tttn-${selectedPeriod?.name || 'export'}.xlsx`);
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

      {selectedPeriod && (
        <div className={cn('mb-5 p-4 rounded-[18px] border flex items-center justify-between shadow-[0_12px_28px_rgba(15,23,42,0.02)]',
          isPeriodClosed ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700'
        )}>
          <div>
            {t(getKey('showing'))} {t(getKey('assignment_management'))} {t(getKey('of'))}: <strong className="underline">{selectedPeriod.name}</strong>
            {isPeriodClosed && ` (${t(getKey('read_only_data_locked'))})`}
          </div>
          {isPeriodClosed && <Tag color="error">{t(getKey('read_only_tag'))}</Tag>}
        </div>
      )}

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
                  <Tag className="rounded-full m-0">{(t(getKey('selected_count_label'), { count: Object.values(selectedStudents).filter(Boolean).length }) as string)}</Tag>
                  <Select
                    value={manualClassFilter}
                    onChange={(value) => setManualClassFilter(value)}
                    className="w-[180px]"
                    options={[
                      { value: 'all', label: t(getKey('all_classes')) },
                      ...classOptions.map((c) => ({ value: c, label: c }))
                    ]}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={paginatedStudents.length > 0 && paginatedStudents.every((r) => selectedStudents[r.studentId])}
                          indeterminate={paginatedStudents.some((r) => selectedStudents[r.studentId]) && !paginatedStudents.every((r) => selectedStudents[r.studentId])}
                          onChange={(e) => selectAllOnPage(e.target.checked)}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">{t(getKey('student_id'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('student_name'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('class_name'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('course_class'))}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((r) => (
                      <tr key={r.studentId} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3"><Checkbox checked={!!selectedStudents[r.studentId]} onChange={(e) => toggleSelectStudent(r.studentId, e.target.checked)} /></td>
                        <td className="px-4 py-3 text-[var(--color-primary)] font-medium">{r.studentId}</td>
                        <td className="px-4 py-3">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.className}</td>
                        <td className="px-4 py-3">{r.course || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filtered.length > 0 && (
                <div className="flex justify-end border-t border-slate-100 px-1 py-3">
                  <Pagination
                    size="small"
                    current={studentPage}
                    pageSize={studentPageSize}
                    total={filtered.length}
                    onChange={(page, pageSize) => {
                      setStudentPage(page);
                      setStudentPageSize(pageSize);
                    }}
                    showSizeChanger
                  />
                </div>
              )}

              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-600">{(t(getKey('showing_students_count'), { count: filtered.length }) as string)}</div>
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
                  {paginatedTeachers.map((teacher) => (
                    <div key={teacher.id} className={cn(
                      "flex items-center justify-between gap-3 border border-slate-100 p-3 rounded-md",
                      teacher.status !== STATUS_CODE.AVAILABLE && "opacity-60"
                    )}>
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <Radio value={teacher.id} disabled={teacher.status !== STATUS_CODE.AVAILABLE} />
                        <div className="min-w-0 flex-1">
                          <div className="block text-sm font-semibold leading-5 text-slate-900">
                            {teacher.name}{teacher.major ? ` • ${teacher.major}` : ''}
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
                          {teacher.assignedCount ?? 0}/{teacher.maxSlots ?? '—'} sinh viên
                        </Tag>
                      </div>
                    </div>
                  ))}
                </div>
              </Radio.Group>

              {filteredTeachers.length > 0 && (
                <div className="mt-3 flex justify-center">
                  <Pagination
                    size="small"
                    current={teacherPage}
                    pageSize={teacherPageSize}
                    total={filteredTeachers.length}
                    onChange={(page, pageSize) => {
                      setTeacherPage(page);
                      setTeacherPageSize(pageSize);
                    }}
                    showSizeChanger
                  />
                </div>
              )}

              <div className="mt-4 flex flex-col gap-2">
                <Button type="primary" disabled={isPeriodClosed} onClick={confirmAssignSelected}>{t(getKey('assign_teacher_btn'))}</Button>
                <Button onClick={() => setSelectedStudents({})}>{t(getKey('cancel_select_btn'))}</Button>
              </div>
            </Card>
          </div>
        </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <FilterTable<AssignmentRow, IDetailAssignment, ICreateAssignment, IUpdateAssignment>
            title={`${t(getKey('assigned_list'))} (${formatNumber(assignedCount)})`}
            columns={[
              { title: t(getKey('student_id')), dataIndex: 'studentId', key: 'studentId', render: (v: string) => <span className="text-[var(--color-primary)] font-medium">{v}</span> },
              { title: t(getKey('student_name')), dataIndex: 'name', key: 'name', ellipsis: true },
              { title: t(getKey('class_name')), dataIndex: 'className', key: 'className' },
              { title: t(getKey('mentor')), dataIndex: 'supervisor', key: 'supervisor', ellipsis: true },
              { title: t(getKey('assigned_date_label')), dataIndex: 'assignedAt', key: 'assignedAt' },
              {
                title: 'Trạng thái',
                key: 'published',
                render: (_: unknown, record: AssignmentRow) => (
                  <Tag className={cn(
                    'rounded-full px-[10px] py-0 border-none m-0',
                    record.published
                      ? 'bg-[var(--color-green-light)] text-[var(--color-green-medium)]'
                      : 'bg-[var(--color-gold-light)] text-[var(--color-gold-medium)]'
                  )}>
                    {record.published ? 'Đã công bố' : 'Chưa công bố'}
                  </Tag>
                ),
              },
            ]}
            useQueryHook={(params: BaseListParams) => {
              const typed = params as IAssignmentListParams;
              const query = assignmentHooks.useFetchListAssignments(typed);
              const keyword = (typed.keyword ?? '').trim().toLowerCase();
              const classFilter = typed.className || 'all';
              const teacherFilter = typed.supervisor || 'all';
              const source = query.data?.rows ?? [];
              const filteredRows = source
                .filter((r) => r.status === STATUS_CODE.ASSIGNED)
                .filter((r) => {
                  const byKeyword = !keyword || [r.studentId, r.name, r.className, r.topic, r.supervisor || ''].join(' ').toLowerCase().includes(keyword);
                  const byClass = classFilter === 'all' || r.className === classFilter;
                  const byTeacher = teacherFilter === 'all' || (r.supervisor || '') === teacherFilter;
                  return byKeyword && byClass && byTeacher;
                });
              const data = { rows: filteredRows, total: filteredRows.length };
              return { ...query, data } as import('@tanstack/react-query').UseQueryResult<
                import('@shared/types/GeneralType').ListResponseTypeObject<AssignmentRow>,
                Error
              >;
            }}
            paramVariables={filterTableParams}
            filterRender={() => (
              <div className="mb-4 flex flex-wrap gap-3 items-center">
                <Form.Item name="className" className="m-0">
                  <Select allowClear className="min-w-[180px]" options={[{ value: 'all', label: t(getKey('all_classes')) }, ...classOptions.map((c) => ({ value: c, label: c }))]} />
                </Form.Item>
                <Form.Item name="supervisor" className="m-0">
                  <Select allowClear className="min-w-[180px]" options={[{ value: 'all', label: t(getKey('all_teachers')) }, ...teachers.map((teacherObj) => ({ value: teacherObj.name, label: teacherObj.name }))]} />
                </Form.Item>
                <Form.Item name="keyword" className="m-0">
                  <Input allowClear placeholder={t(getKey('search_student_placeholder'))} className="min-w-[200px]" />
                </Form.Item>
                <div className="ml-auto flex gap-2">
                  <Button icon={<DownloadOutlined />} onClick={handleExportExcel}>{t(getKey('export_to_excel'))}</Button>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    loading={publishAssignmentsMutation.isPending}
                    disabled={isPeriodClosed}
                    onClick={handlePublishAssignments}
                  >
                    {t(getKey('publish_assignment_btn'))}
                  </Button>
                </div>
              </div>
            )}
            actions={{
              isEdit: !isPeriodClosed,
              isDetail: true,
              customAction: isPeriodClosed ? undefined : (record) => {
                const r = record as AssignmentRow;
                return (
                  <div className="pointer-events-auto">
                    <Button
                      type="text"
                      size="small"
                      danger
                      className="!px-2 pointer-events-auto"
                      onClick={() => unassign(r.studentId)}
                      title="Xóa phân công"
                    >
                      <DeleteOutlined />
                    </Button>
                  </div>
                );
              },
            }}
            updateInfo={isPeriodClosed ? undefined : { type: 'modal', modalInfo: { modalContent: <AssignmentForm mode="edit" />, modalProps: { centered: true, width: 760, title: t(getKey('edit_assignment_title')) }, modalFunc: updateAssignmentMutation } }}
            detailInfo={{ type: 'modal', modalInfo: { modalContent: <AssignmentForm mode="detail" />, modalProps: { centered: true, width: 760, title: t(getKey('detail_assignment_title')), footer: null }, modalFunc: assignmentHooks.useFetchDetailAssignment as unknown as (id: string, enable: boolean) => import('@tanstack/react-query').UseQueryResult<IDetailAssignment, Error> } }}
            formatInitialValues={(d) => ({ ...d })}
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
