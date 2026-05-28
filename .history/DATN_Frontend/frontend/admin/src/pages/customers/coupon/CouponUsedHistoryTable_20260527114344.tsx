import { SearchOutlined } from '@ant-design/icons';
import { Flex, Form, Input, TableColumnsType, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '../../../components/shared/table/FilterTable';
import { CouponStatusOptions, CouponTypeOptions, DATE_TIME_FORMAT, findOptionObject, NotAvailable } from '../../../constants/commonConst';
import { BaseListParams } from '@shared/types/GeneralType';
import { getKey } from '@shared/types/I18nKeyType';
import { formatDate } from '@shared/utils/DateUtils';
import { CouponRuleUsedHistoryType } from '../../../type/CouponType';

interface CouponUsedHistoryTableProps {
  useQueryHook: (params: BaseListParams) => { data?: unknown; isLoading: boolean };
  customerId?: string;
}

const CouponUsedHistoryTable = ({ useQueryHook, customerId }: CouponUsedHistoryTableProps) => {
  const { t } = useTranslation();
  const [params, setParams] = useState<BaseListParams>({
    page: 1,
    limit: 10,
    id: customerId || '',
  });

  const columns: TableColumnsType<CouponRuleUsedHistoryType> = useMemo(
    () => [
      {
        title: t(getKey('coupon_id')),
        dataIndex: 'id',
        key: 'id',
        width: 120,
        fixed: 'left' as const,
      },
      {
        title: t(getKey('coupon_name')),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: t(getKey('coupon_type')),
        dataIndex: 'couponType',
        key: 'couponType',
        render: (value: string) => {
          const option = findOptionObject(CouponTypeOptions(), value);
          return <Tag color={option?.color || 'default'}>{option?.label || NotAvailable}</Tag>;
        },
      },
      {
        title: t(getKey('status')),
        dataIndex: 'status',
        key: 'status',
        render: (value: string) => {
          const option = findOptionObject(CouponStatusOptions(), value);
          return <Tag color={option?.color || 'default'}>{option?.label || NotAvailable}</Tag>;
        },
      },
      {
        title: t(getKey('used_date')),
        dataIndex: 'createdAt',
        key: 'usedDate',
        render: (value: string) => (value ? formatDate(value, DATE_TIME_FORMAT) : NotAvailable),
      },
    ],
    [t],
  );

  const filterRender = useMemo(
    () => (
      <Flex gap={16} align="center">
        <Form.Item name="keyword" className="flex-1">
          <Input placeholder={t(getKey('search'))} allowClear prefix={<SearchOutlined />} />
        </Form.Item>
      </Flex>
    ),
    [t],
  );

  return (
    <FilterTable<CouponRuleUsedHistoryType>
      title={t(getKey('coupon_usage_history'))}
      columns={columns}
      useQueryHook={useQueryHook}
      filterRender={filterRender}
      paramVariables={params}
      paramsProps={setParams}
      t={t}
    />
  );
};

export default CouponUsedHistoryTable;
