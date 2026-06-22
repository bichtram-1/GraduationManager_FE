import { SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { Form, Input, Select, Tag, Typography, Card, Empty } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '../../components/shared/table/FilterTable';
import { assignmentHooks } from '../../hooks/useAssignments';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import type { AssignmentRow } from '../../type/AssignmentType';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import type { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import type { UseQueryResult } from '@tanstack/react-query';

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

  const columns = useMemo(
    () => [
      {
        title: t(getKey('stt')),
        key: 'index',
        width: 70,
        render: (_: unknown, __: AssignmentRow, index: number) => formatNumber(index + 1),
      },
      {
        title: t(getKey('student_id')),
        dataIndex: 'studentId',
        key: 'studentId',
        width: 140,
        render: (id: string) => <span className="font-semibold text-primary">{id}</span>,
      },
      {
        title: t(getKey('student_name')),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
      },
      {
        title: t(getKey('class_name')),
        dataIndex: 'className',
        key: 'className',
        width: 150,
      },
      {
        title: t(getKey('thesis_topics')) || 'Đề tài ĐATN',
        dataIndex: 'topic',
        key: 'topic',
        ellipsis: true,
        render: (value: string) => value || '—',
      },
      {
        title: t(getKey('mentor')) || 'Giáo viên hướng dẫn',
        dataIndex: 'supervisor',
        key: 'supervisor',
        render: (value: string) => value ? <Tag color="blue">{value}</Tag> : <span className="text-slate-400">Chưa phân công</span>,
      },
      {
        title: t(getKey('status')),
        dataIndex: 'status',
        key: 'status',
        width: 150,
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
    [t]
  );

  const useFilteredStudentsQuery = (params: BaseListParams) => {
    const query = assignmentHooks.useFetchListAssignments({ 
      page: 1, 
      limit: 1000, 
      periodId: isDatnPeriod ? selectedPeriod?.id : 'none' 
    });
    const typedParams = params as BaseListParams & { keyword?: string; status?: string; className?: string };
    const searchVal = (typedParams.keyword ?? '').trim().toLowerCase();
    const statusVal = typedParams.status ?? 'all';
    const classNameVal = typedParams.className ?? 'all';

    const sourceRows = (query.data?.rows ?? rows) as AssignmentRow[];
    const filteredRows = sourceRows
      .filter((r) => {
        if (!searchVal) return true;
        return [r.studentId, r.name, r.className, r.topic || '', r.supervisor || ''].join(' ').toLowerCase().includes(searchVal);
      })
      .filter((r) => {
        if (statusVal === 'all') return true;
        return r.status === statusVal;
      })
      .filter((r) => {
        if (classNameVal === 'all') return true;
        return r.className === classNameVal;
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
          actions={{
            isDetail: false,
            isEdit: false,
            isDelete: false,
          }}
          filterRender={() => (
            <div className={cn('grid grid-cols-1 gap-3 xl:grid-cols-12')}>
              <Form.Item name="keyword" className={cn('xl:col-span-5 !mb-0')}>
                <Input
                  allowClear
                  prefix={<SearchOutlined className={cn('text-slate-400')} />}
                  placeholder="Tìm kiếm theo MSSV, Tên, Lớp, Đề tài, GVHD..."
                  className={cn('!h-11 !rounded-[12px] !border-slate-300')}
                />
              </Form.Item>
              <Form.Item name="className" className={cn('xl:col-span-3 !mb-0')} initialValue="all">
                <Select allowClear placeholder={t(getKey('all_classes'))} className={cn('!h-11 !w-full')} options={[{ value: 'all', label: t(getKey('all_classes')) }, ...classOptions.map((c) => ({ value: c, label: c }))]} />
              </Form.Item>
              <Form.Item name="status" className={cn('xl:col-span-4 !mb-0')} initialValue="all">
                <Select className={cn('!h-11 !w-full')}>
                  <Select.Option value="all">Tất cả trạng thái phân công</Select.Option>
                  <Select.Option value="assigned">Đã phân công GVHD</Select.Option>
                  <Select.Option value="unassigned">Chưa phân công GVHD</Select.Option>
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
    </div>
  );
};

export default ThesisStudentsPage;
