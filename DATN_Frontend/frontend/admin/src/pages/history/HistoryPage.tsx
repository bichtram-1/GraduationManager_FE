import React, { useMemo } from 'react';
import { Form, Input, Select, Tag } from 'antd';
import { ClockCircleOutlined, SearchOutlined } from '@ant-design/icons';
import FilterTable from '../../components/shared/table/FilterTable';
import { historyHooks } from '../../hooks/useHistory';
import { IHistoryLog } from '../../api/historyApi';
import type { BaseListParams } from '@shared/types/GeneralType';
import dayjs from 'dayjs';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';

type HistoryListParams = BaseListParams & {
  keyword?: string;
  actionFilter?: string;
  roleFilter?: string;
  searchGroup?: string;
};

const ACTION_MAP: Record<string, { label: string; color: string }> = {
  DE_XUAT_DE_TAI: { label: 'Đề xuất đề tài', color: 'blue' },
  DUYET_DE_TAI: { label: 'Admin duyệt nhóm', color: 'success' },
  TU_CHOI_DE_TAI: { label: 'Admin từ chối nhóm', color: 'error' },
  TAO_NHOM: { label: 'Tạo nhóm', color: 'purple' },
  GIAI_TAN_NHOM: { label: 'Giải tán nhóm', color: 'red' },
  ROI_NHOM: { label: 'Rời nhóm', color: 'orange' },
  GUI_LOI_MOI: { label: 'Gửi lời mời', color: 'cyan' },
  CHAP_NHAN_LOI_MOI: { label: 'Chấp nhận lời mời', color: 'geekblue' },
  TU_CHOI_LOI_MOI: { label: 'Từ chối lời mời', color: 'volcano' },
  KHAI_BAO_THUC_TAP: { label: 'Khai báo thực tập', color: 'green' },
  CAP_NHAT_NHOM: { label: 'Cập nhật nhóm', color: 'magenta' },
};

const HistoryPage: React.FC = () => {
  const { selectedPeriod } = useGlobalVariable();

  const useFilteredHistoryQuery = (params: BaseListParams) => {
    const typedParams = params as HistoryListParams & { periodId?: string };
    const queryParams = {
      action_type: typedParams.actionFilter === 'all' ? undefined : typedParams.actionFilter,
      role: typedParams.roleFilter === 'all' ? undefined : typedParams.roleFilter,
      keyword: typedParams.keyword?.trim() || undefined,
      nhom_id: typedParams.searchGroup?.trim() || undefined,
      dot_id: typedParams.periodId || undefined,
    };
    return historyHooks.useFetchAdminHistory(queryParams);
  };

  const columns = useMemo(() => [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (val: string) => (
        <span className="text-slate-500 font-medium">
          {dayjs(val).format('DD/MM/YYYY HH:mm:ss')}
        </span>
      ),
    },
    {
      title: 'Loại hành động',
      dataIndex: 'action_type',
      key: 'action_type',
      width: 200,
      render: (val: string) => {
        const meta = ACTION_MAP[val] || { label: val, color: 'default' };
        return <Tag color={meta.color} className="font-semibold rounded-md px-2 py-0.5">{meta.label}</Tag>;
      },
    },
    {
      title: 'Mô tả hoạt động',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (val: string, record: IHistoryLog) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-slate-800">{val}</span>
          {record.details && (
            <span className="text-xs text-slate-400 max-w-lg truncate">{record.details}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 180,
      render: (val: string, record: IHistoryLog) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700">{val}</span>
          <span className="text-[10px] text-slate-400 capitalize">
            {record.role === 'sinh_vien' ? 'Sinh viên' : record.role === 'giang_vien' ? 'Giảng viên' : record.role}
          </span>
        </div>
      ),
    },
    {
      title: 'Nhóm liên quan',
      dataIndex: 'nhom_id',
      key: 'nhom_id',
      width: 130,
      render: (val: number | null) =>
        val ? (
          <Tag color="purple" className="font-semibold rounded-md">
            Nhóm #{val}
          </Tag>
        ) : (
          <span className="text-slate-300">—</span>
        ),
    },
  ], []);

  const filterRender = () => (
    <div className="mb-4 grid grid-cols-1 gap-3 xl:grid-cols-12">
      <Form.Item name="actionFilter" className="xl:col-span-3 !mb-0">
        <Select
          allowClear
          placeholder="Hành động"
          className="!h-11 !w-full"
          options={[
            { value: 'all', label: 'Tất cả hành động' },
            { value: 'DE_XUAT_DE_TAI', label: 'Giảng viên đề xuất đề tài' },
            { value: 'DUYET_DE_TAI', label: 'Phê duyệt đề tài' },
            { value: 'TU_CHOI_DE_TAI', label: 'Từ chối đề tài' },
            { value: 'TAO_NHOM', label: 'Tạo nhóm' },
            { value: 'GIAI_TAN_NHOM', label: 'Giải tán nhóm' },
            { value: 'CAP_NHAT_NHOM', label: 'Cập nhật nhóm' },
            { value: 'KHAI_BAO_THUC_TAP', label: 'Khai báo thực tập' },
          ]}
        />
      </Form.Item>

      <Form.Item name="roleFilter" className="xl:col-span-3 !mb-0">
        <Select
          allowClear
          placeholder="Vai trò"
          className="!h-11 !w-full"
          options={[
            { value: 'all', label: 'Tất cả vai trò' },
            { value: 'admin', label: 'Admin' },
            { value: 'giang_vien', label: 'Giảng viên' },
            { value: 'sinh_vien', label: 'Sinh viên' },
          ]}
        />
      </Form.Item>

      <Form.Item name="keyword" className="xl:col-span-3 !mb-0">
        <Input
          allowClear
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="Người thực hiện / MSSV..."
          className="!h-11 !rounded-[12px] !border-slate-300"
        />
      </Form.Item>

      <Form.Item name="searchGroup" className="xl:col-span-3 !mb-0">
        <Input
          allowClear
          prefix={<SearchOutlined className="text-slate-400" />}
          placeholder="ID nhóm..."
          className="!h-11 !rounded-[12px] !border-slate-300"
        />
      </Form.Item>
    </div>
  );

  return (
    <FilterTable<IHistoryLog>
      title="Lịch sử hoạt động hệ thống"
      pageTitle="Lịch sử hoạt động hệ thống"
      pageSubtitle="Theo dõi nhật ký các hoạt động đăng ký đề tài, duyệt nhóm, phân công và khai báo trên toàn hệ thống."
      columns={columns}
      useQueryHook={useFilteredHistoryQuery}
      paramVariables={useMemo(() => ({ page: 1, limit: 10, periodId: selectedPeriod?.id || '' }), [selectedPeriod?.id])}
      actions={{
        isDetail: false,
        isEdit: false,
        isDelete: false,
      }}
      filterRender={filterRender}
    />
  );
};

export default HistoryPage;
