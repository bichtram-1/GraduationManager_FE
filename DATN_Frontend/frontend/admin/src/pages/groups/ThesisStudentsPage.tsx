import { SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { Form, Input, Select, Tag, Typography, Card, Empty, Modal, message, Button, Radio } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '../../components/shared/table/FilterTable';
import { assignmentHooks } from '../../hooks/useAssignments';
import { cn, STATUS_CODE } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import type { AssignmentRow } from '../../type/AssignmentType';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import type { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKey } from '../../constants/queryKey';
import { topicHooks } from '../../hooks/useTopics';
import { groupHooks } from '../../hooks/useGroups';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routers';
import type { IListTopic } from '../../type/TopicType';
import type { IListGroup, IGroupMember, IUpdateGroup, ICreateGroup } from '../../type/GroupType';

const ThesisStudentsPage = () => {
  const { t } = useTranslation();
  const { selectedPeriod } = useGlobalVariable();

  const isDatnPeriod = selectedPeriod?.type === 'datn';

  const { data: assignmentList } = assignmentHooks.useFetchListAssignments({ 
    page: 1, 
    limit: 1000, 
    periodId: isDatnPeriod ? selectedPeriod?.id : 'none' 
  });
  const rows = (assignmentList?.rows ?? []) as AssignmentRow[];
  const classOptions = useMemo(() => Array.from(new Set(rows.map((item) => item.className))), [rows]);

  const queryClient = useQueryClient();
  const { data: topicList } = topicHooks.useFetchListTopics({ 
    page: 1, 
    limit: 1000,
    periodId: isDatnPeriod ? selectedPeriod?.id : 'none'
  });
  const topics = useMemo(() => {
    const rawList: IListTopic[] = topicList?.rows ?? [];
    return rawList.filter((t) => {
      if (!t.slots) return true;
      const parts = t.slots.split('/');
      if (parts.length === 2) {
        const occupied = parseInt(parts[0], 10);
        const max = parseInt(parts[1], 10);
        return occupied < max;
      }
      return true;
    });
  }, [topicList]);
  const updateGroup = groupHooks.useUpdateGroup();
  const createGroup = groupHooks.useCreateGroup();
  const { data: groupList } = groupHooks.useFetchListGroups();
  const groups = useMemo(() => (groupList?.rows ?? []) as IListGroup[], [groupList]);

  const [allocationStudent, setAllocationStudent] = useState<AssignmentRow | null>(null);
  const [allocationType, setAllocationType] = useState<'existing' | 'new'>('existing');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedPartnerStudentId, setSelectedPartnerStudentId] = useState<string>('');
  const [selectedAllocationTopicId, setSelectedAllocationTopicId] = useState<string>('');
  const [submittingAllocation, setSubmittingAllocation] = useState<boolean>(false);

  const warningGroups = useMemo(() => {
    return groups.filter((g) => {
      const isSamePeriod = g.registrationBatch === selectedPeriod?.name;
      const isWarning = g.status === STATUS_CODE.WARNING;
      return isSamePeriod && isWarning;
    });
  }, [groups, selectedPeriod]);

  const unassignedStudents = useMemo(() => {
    if (!allocationStudent) return [];
    return rows.filter((r) => r.groupStatus === 'no_group' && r.studentId !== allocationStudent.studentId);
  }, [rows, allocationStudent]);

  const handleAllocationSubmit = async () => {
    if (!allocationStudent) return;
    
    if (allocationType === 'existing') {
      if (!selectedGroupId) {
        message.error('Vui lòng chọn nhóm cần ghép!');
        return;
      }
      
      const targetGroup = groups.find((g) => g.id === selectedGroupId);
      if (!targetGroup) return;

      const eligibleMembers = targetGroup.members.filter((m) => m.eligible !== false);
      const newMembers = [
        ...eligibleMembers.slice(0, 1).map((m) => m.id),
        allocationStudent.studentId
      ];

      setSubmittingAllocation(true);
      try {
        await updateGroup.mutateAsync({
          id: selectedGroupId,
          body: { members: newMembers } as unknown as IUpdateGroup,
          index: 0,
          params: { page: 1, limit: 10 },
        });
        message.success('Ghép vào nhóm thành công!');
        queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
        setAllocationStudent(null);
        setSelectedGroupId('');
        setSelectedPartnerStudentId('');
        setSelectedAllocationTopicId('');
      } catch {
        message.error('Có lỗi xảy ra khi ghép nhóm!');
      } finally {
        setSubmittingAllocation(false);
      }

    } else {
      if (!selectedPartnerStudentId) {
        message.error('Vui lòng chọn 1 sinh viên khác để ghép nhóm!');
        return;
      }

      const newMembers = [
        allocationStudent.studentId,
        selectedPartnerStudentId
      ];

      setSubmittingAllocation(true);
      try {
        await createGroup.mutateAsync({
          body: {
            members: newMembers,
            dot_id: selectedPeriod?.id,
            de_tai_id: selectedAllocationTopicId || null
          } as unknown as ICreateGroup,
          params: { page: 1, limit: 10 },
        });
        message.success('Tạo nhóm mới thành công!');
        queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
        queryClient.invalidateQueries({ queryKey: [QueryKey.groups.list] });
        setAllocationStudent(null);
        setSelectedGroupId('');
        setSelectedPartnerStudentId('');
        setSelectedAllocationTopicId('');
      } catch {
        message.error('Có lỗi xảy ra khi tạo nhóm!');
      } finally {
        setSubmittingAllocation(false);
      }
    }
  };

  const handleAssignTopic = (groupId: string | null | undefined, groupCode: string | null | undefined) => {
    if (!groupId) return;
    let selectedTopicId = '';
    Modal.confirm({
      title: `Gán đề tài cho nhóm ${groupCode || `#${groupId}`}`,
      content: (
        <div className="flex flex-col gap-2 pt-2">
          <p className="m-0 text-slate-500 text-xs">Vui lòng chọn đề tài từ danh sách dưới đây:</p>
          <Select
            showSearch
            className="w-full mt-1"
            placeholder="Chọn đề tài..."
            optionFilterProp="children"
            onChange={(v) => {
              selectedTopicId = v;
            }}
            options={topics.map((t) => ({
              value: t.id,
              label: `${t.name} (${t.teacher})`
            }))}
          />
        </div>
      ),
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      async onOk() {
        if (!selectedTopicId) {
          message.error('Vui lòng chọn đề tài!');
          return Promise.reject();
        }
        try {
          await updateGroup.mutateAsync({
            id: groupId,
            body: { de_tai_id: selectedTopicId } as unknown as IUpdateGroup,
            index: 0,
            params: { page: 1, limit: 10 },
          });
          message.success('Gán đề tài thành công!');
          queryClient.invalidateQueries({ queryKey: [QueryKey.assignments.list] });
        } catch {
          message.error('Có lỗi xảy ra khi gán đề tài!');
        }
      }
    });
  };

  const columns = useMemo(
    () => [
      {
        title: t(getKey('stt')),
        key: 'index',
        width: 50,
        align: 'center' as const,
        fixed: 'left' as const,
        render: (_: unknown, __: AssignmentRow, index: number) => formatNumber(index + 1),
      },
      {
        title: t(getKey('student_id')),
        dataIndex: 'studentId',
        key: 'studentId',
        width: 100,
        fixed: 'left' as const,
        render: (id: string) => <span className="font-semibold text-primary">{id}</span>,
      },
      {
        title: t(getKey('student_name')),
        dataIndex: 'name',
        key: 'name',
        width: 180,
        fixed: 'left' as const,
        ellipsis: true,
      },
      {
        title: t(getKey('class_name')),
        dataIndex: 'className',
        key: 'className',
        width: 100,
      },
      {
        title: t(getKey('thesis_topics')) || 'Đề tài ĐATN',
        dataIndex: 'topic',
        key: 'topic',
        width: 250,
        ellipsis: true,
        render: (value: string) => value || '—',
      },
      {
        title: 'Tình trạng nhóm',
        key: 'groupStatus',
        width: 140,
        render: (_: unknown, r: AssignmentRow) => {
          const status = r.groupStatus || 'no_group';
          
          if (status === 'valid') {
            return <Tag color="green" className="m-0 rounded-full w-fit px-2.5 py-[2px] font-medium">Đầy đủ & Hợp lệ</Tag>;
          }
          if (status === 'no_group') {
            return <Tag color="default" className="m-0 rounded-full w-fit px-2.5 py-[2px] font-medium text-slate-500 bg-slate-100 border-slate-200">Chưa có nhóm</Tag>;
          }
          if (status === 'ineligible_member') {
            return <Tag color="red" className="m-0 rounded-full w-fit px-2.5 py-[2px] font-medium">Thành viên chưa đạt</Tag>;
          }
          if (status === 'no_topic') {
            return <Tag color="warning" className="m-0 rounded-full w-fit px-2.5 py-[2px] font-medium">Chưa có đề tài</Tag>;
          }
          if (status === 'topic_rejected') {
            return <Tag color="error" className="m-0 rounded-full w-fit px-2.5 py-[2px] font-medium">Đề tài bị từ chối</Tag>;
          }
          if (status === 'topic_pending') {
            return <Tag color="blue" className="m-0 rounded-full w-fit px-2.5 py-[2px] font-medium">Chờ duyệt đề tài</Tag>;
          }
          return <span className="text-slate-400">—</span>;
        }
      },
      {
        title: 'Hành động',
        key: 'allocation',
        width: 140,
        render: (_: unknown, r: AssignmentRow) => {
          const status = r.groupStatus || 'no_group';
          
          if (status === 'no_group') {
            return (
              <Button 
                type="link" 
                onClick={() => {
                  setAllocationStudent(r);
                  setAllocationType('existing');
                  setSelectedGroupId('');
                  setSelectedPartnerStudentId('');
                  setSelectedAllocationTopicId('');
                }}
                className="p-0 text-blue-600 hover:text-blue-800 font-semibold text-xs h-auto leading-none"
              >
                Phân vào nhóm
              </Button>
            );
          }
          if (status === 'ineligible_member') {
            return (
              <Link to={`/admin${ROUTES.GROUPS}`} className="text-amber-600 hover:text-amber-800 font-semibold text-xs">
                Ghép/Điều chỉnh nhóm
              </Link>
            );
          }
          if (status === 'no_topic' || status === 'topic_rejected') {
            return (
              <Button 
                type="link" 
                onClick={() => handleAssignTopic(r.groupId, r.groupCode)} 
                className="p-0 text-blue-600 hover:text-blue-800 font-semibold text-xs h-auto leading-none"
              >
                Gán đề tài
              </Button>
            );
          }
          if (status === 'topic_pending') {
            return (
              <Link to={`/admin${ROUTES.GROUPS_REVIEW}`} className="text-blue-600 hover:text-blue-800 font-semibold text-xs">
                Đi duyệt đề tài
              </Link>
            );
          }
          return <span className="text-emerald-600 font-medium text-xs">Đã hoàn tất</span>;
        }
      },
      {
        title: t(getKey('mentor')) || 'Giáo viên hướng dẫn',
        dataIndex: 'supervisor',
        key: 'supervisor',
        width: 150,
        ellipsis: true,
        render: (value: string) => value ? <Tag color="blue">{value}</Tag> : <span className="text-slate-400">Chưa phân công</span>,
      },
      {
        title: t(getKey('status')),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (status: string) => {
          if (status === 'assigned') {
            return (
              <Tag color="green" className="m-0 rounded-full px-2.5">
                Đã phân công
              </Tag>
            );
          }
          return (
            <Tag color="gold" className="m-0 rounded-full px-2.5">
              Chưa phân công
            </Tag>
          );
        },
      },
    ],
    [t, handleAssignTopic]
  );

  const useFilteredStudentsQuery = (params: BaseListParams) => {
    const query = assignmentHooks.useFetchListAssignments({ 
      page: 1, 
      limit: 1000, 
      periodId: isDatnPeriod ? selectedPeriod?.id : 'none' 
    });
    const typedParams = params as BaseListParams & { keyword?: string; status?: string; className?: string; groupStatus?: string };
    const searchVal = (typedParams.keyword ?? '').trim().toLowerCase();
    const statusVal = typedParams.status ?? 'all';
    const classNameVal = typedParams.className ?? 'all';
    const groupStatusVal = typedParams.groupStatus ?? 'all';

    const sourceRows = (query.data?.rows ?? rows) as AssignmentRow[];
    const filteredRows = sourceRows
      .filter((r) => {
        if (!searchVal) return true;
        return [
          r.studentId, 
          r.name, 
          r.className, 
          r.topic || '', 
          r.supervisor || '', 
          r.groupCode || ''
        ].join(' ').toLowerCase().includes(searchVal);
      })
      .filter((r) => {
        if (statusVal === 'all') return true;
        return r.status === statusVal;
      })
      .filter((r) => {
        if (classNameVal === 'all') return true;
        return r.className === classNameVal;
      })
      .filter((r) => {
        if (groupStatusVal === 'all') return true;
        return r.groupStatus === groupStatusVal;
      });

    return {
      ...query,
      data: {
        rows: filteredRows,
        total: filteredRows.length,
      },
    } as unknown as UseQueryResult<ListResponseTypeObject<AssignmentRow>, Error>;
  };

  const listParams = {
    page: 1,
    limit: 10,
  };

  return (
    <div className={cn('pb-4')}>
      <div className={cn('mb-5 rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)]')}>
          <TeamOutlined /> Danh sách sinh viên ĐATN
        </div>
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between')}>
          <div>
            <Typography.Title level={1} className="!m-0 !text-[34px] !font-bold !leading-[40px] !text-navyDark">
              Danh sách sinh viên ĐATN
            </Typography.Title>
            <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>
              Quản lý danh sách sinh viên tham gia đợt đồ án tốt nghiệp, xem thông tin nhóm, đề tài và giảng viên hướng dẫn.
            </p>
          </div>
        </div>
      </div>

      {selectedPeriod && (
        <div className={cn(
          "mb-5 p-4 rounded-[18px] border flex items-center justify-between shadow-[0_12px_28px_rgba(15,23,42,0.02)]",
          isDatnPeriod
            ? "bg-[var(--color-blue-light)] border-[var(--color-blue-medium)] text-[var(--color-primary)]"
            : "bg-[var(--color-red-light)] border-[var(--color-red-medium)] text-[var(--color-red-medium)]"
        )}>
          <div>
            {isDatnPeriod ? (
              <span>Đang xem danh sách của đợt: <strong className="underline">{selectedPeriod.name}</strong></span>
            ) : (
              <span>Đợt đang chọn (<strong className="underline">{selectedPeriod.name}</strong>) là đợt <strong>Thực tập tốt nghiệp (TTTN)</strong>. Vui lòng chuyển sang một đợt <strong>Đồ án tốt nghiệp (ĐATN)</strong> ở bộ lọc trên Header để xem danh sách.</span>
            )}
          </div>
        </div>
      )}

      {isDatnPeriod ? (
        <FilterTable<AssignmentRow, unknown, unknown, unknown>
          title="Danh sách sinh viên ĐATN"
          columns={columns}
          useQueryHook={useFilteredStudentsQuery}
          paramVariables={listParams}
          showSizeChanger={false}
          actions={{
            isDetail: false,
            isEdit: false,
            isDelete: false,
          }}
          filterRender={() => (
            <div className={cn('grid grid-cols-1 gap-3 xl:grid-cols-12')}>
              <Form.Item name="keyword" className={cn('xl:col-span-4 !mb-0')}>
                <Input
                  allowClear
                  prefix={<SearchOutlined className={cn('text-slate-400')} />}
                  placeholder="Tìm theo MSSV, Tên, Lớp, Đề tài, GVHD..."
                  className={cn('!h-11 !rounded-[12px] !border-slate-300')}
                />
              </Form.Item>
              <Form.Item name="className" className={cn('xl:col-span-2 !mb-0')} initialValue="all">
                <Select allowClear placeholder={t(getKey('all_classes'))} className={cn('!h-11 !w-full')} options={[{ value: 'all', label: t(getKey('all_classes')) }, ...classOptions.map((c) => ({ value: c, label: c }))]} />
              </Form.Item>
              <Form.Item name="status" className={cn('xl:col-span-3 !mb-0')} initialValue="all">
                <Select className={cn('!h-11 !w-full')}>
                  <Select.Option value="all">Tất cả phân công GVHD</Select.Option>
                  <Select.Option value="assigned">Đã phân công GVHD</Select.Option>
                  <Select.Option value="unassigned">Chưa phân công GVHD</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="groupStatus" className={cn('xl:col-span-3 !mb-0')} initialValue="all">
                <Select className={cn('!h-11 !w-full')}>
                  <Select.Option value="all">Tất cả tình trạng nhóm & Đề tài</Select.Option>
                  <Select.Option value="no_group">Chưa có nhóm</Select.Option>
                  <Select.Option value="ineligible_member">Thành viên chưa đạt</Select.Option>
                  <Select.Option value="no_topic">Chưa có đề tài</Select.Option>
                  <Select.Option value="topic_rejected">Đề tài bị từ chối</Select.Option>
                  <Select.Option value="topic_pending">Chờ duyệt đề tài</Select.Option>
                  <Select.Option value="valid">Đầy đủ & Hợp lệ</Select.Option>
                </Select>
              </Form.Item>
            </div>
          )}
        />
      ) : (
        <Card className="rounded-[22px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.03)] text-center py-12">
          <Empty
            description={
              <span className="text-slate-500 text-sm">
                Không thể hiển thị sinh viên ĐATN ở đợt Thực tập tốt nghiệp (TTTN).
              </span>
            }
          />
        </Card>
      )}

      <Modal
        title={`Phân bổ nhóm cho sinh viên: ${allocationStudent?.name || ''}`}
        open={!!allocationStudent}
        onOk={handleAllocationSubmit}
        onCancel={() => {
          setAllocationStudent(null);
          setSelectedGroupId('');
          setSelectedPartnerStudentId('');
          setSelectedAllocationTopicId('');
        }}
        confirmLoading={submittingAllocation}
        okText="Xác nhận"
        cancelText="Hủy"
        width={560}
        destroyOnHidden
      >
        <div className="flex flex-col gap-4 py-3">
          <div>
            <span className="text-slate-500 text-xs block mb-2">Phương thức phân bổ:</span>
            <Radio.Group 
              value={allocationType} 
              onChange={(e) => setAllocationType(e.target.value)}
              className="flex flex-col gap-2"
            >
              <Radio value="existing">
                <span className="font-semibold text-slate-700">Ghép vào nhóm có thành viên &quot;Chưa đạt&quot;</span>
                <p className="m-0 text-slate-400 text-xs ml-6">
                  Thay thế hoặc bổ sung sinh viên này vào một nhóm hiện có thành viên không đủ điều kiện làm đồ án.
                </p>
              </Radio>
              <Radio value="new">
                <span className="font-semibold text-slate-700">Tạo nhóm mới cùng 1 sinh viên tự do khác</span>
                <p className="m-0 text-slate-400 text-xs ml-6">
                  Gom nhóm mới gồm sinh viên này và chính xác 1 sinh viên tự do khác.
                </p>
              </Radio>
            </Radio.Group>
          </div>

          {allocationType === 'existing' ? (
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-slate-600 text-xs font-medium">Chọn nhóm để ghép:</span>
              <Select
                showSearch
                placeholder="Chọn nhóm..."
                className="w-full"
                value={selectedGroupId}
                onChange={(v) => setSelectedGroupId(v)}
                options={warningGroups.map((g) => {
                  const ineligibleMemberNames = g.members
                    .filter((m: IGroupMember) => m.eligible === false)
                    .map((m: IGroupMember) => `${m.name} (${m.code})`)
                    .join(', ');
                  return {
                    value: g.id,
                    label: `${g.code ? `${g.code} - ` : `Nhóm #${g.id} - `}${g.title || 'Chưa có đề tài'} (Thành viên chưa đạt: ${ineligibleMemberNames || 'Không rõ'})`
                  };
                })}
                optionFilterProp="label"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-600 text-xs font-medium">Chọn sinh viên chưa có nhóm để ghép cùng (Nhóm tối đa 2 người):</span>
                <Select
                  showSearch
                  placeholder="Chọn sinh viên..."
                  className="w-full"
                  value={selectedPartnerStudentId}
                  onChange={(v) => setSelectedPartnerStudentId(v)}
                  options={unassignedStudents.map((s) => ({
                    value: s.studentId,
                    label: `${s.name} (${s.studentId}) - Lớp ${s.className}`
                  }))}
                  optionFilterProp="label"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-600 text-xs font-medium">Chọn đề tài phân bổ cho nhóm mới (Không bắt buộc):</span>
                <Select
                  showSearch
                  allowClear
                  placeholder="Chọn đề tài phân bổ..."
                  className="w-full"
                  value={selectedAllocationTopicId}
                  onChange={(v) => setSelectedAllocationTopicId(v)}
                  options={topics.map((t) => ({
                    value: t.id,
                    label: `${t.name} (${t.teacher})`
                  }))}
                  optionFilterProp="label"
                />
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ThesisStudentsPage;
