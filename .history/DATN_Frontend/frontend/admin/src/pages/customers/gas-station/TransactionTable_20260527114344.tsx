import { SearchOutlined } from '@ant-design/icons';
import { Flex, Form, Input, TableColumnsType, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '../../../components/shared/table/FilterTable';
import { DATE_TIME_FORMAT, findOptionObject, NotAvailable, TransactionPaymentMethodOptions } from '../../../constants/commonConst';
import { BaseListParams } from '@shared/types/GeneralType';
import { getKey } from '@shared/types/I18nKeyType';
import { formatDate } from '@shared/utils/DateUtils';
import { formatNumber } from '@shared/utils/numberUtils';

interface TransactionType {
  id: string;
  code: string;
  amount: number;
  paymentMethod: string;
  gasStation: { label: string; value: string };
  brand: { label: string; value: string };
  time: string;
}

interface TransactionTableProps {
  additionalParams?: Record<string, unknown>;
}

const TransactionTable = ({ additionalParams }: TransactionTableProps) => {
  const { t } = useTranslation();
  const [params, setParams] = useState<BaseListParams>({
    page: 1,
    limit: 10,
    ...additionalParams,
  });

  const columns: TableColumnsType<TransactionType> = useMemo(
    () => [
      {
        title: t(getKey('transaction_id')),
        dataIndex: 'code',
        key: 'id',
        width: 120,
        fixed: 'left' as const,
      },
      {
        title: t(getKey('amount')),
        dataIndex: 'amount',
        key: 'amount',
        render: (value: number) => formatNumber(value),
      },
      {
        title: t(getKey('payment_method')),
        dataIndex: 'paymentMethod',
        key: 'paymentMethod',
        render: (value: string) => {
          const option = findOptionObject(TransactionPaymentMethodOptions(), value);
          return <Tag color={option?.color || 'default'}>{option?.label || NotAvailable}</Tag>;
        },
      },
      {
        title: t(getKey('brand')),
        dataIndex: ['brand', 'label'],
        key: 'brand',
      },
      {
        title: t(getKey('gas_station')),
        dataIndex: ['gasStation', 'label'],
        key: 'gasStation',
      },
      {
        title: t(getKey('time')),
        dataIndex: 'time',
        key: 'time',
        render: (value: string) => formatDate(value, DATE_TIME_FORMAT),
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
    <FilterTable<TransactionType>
      title={t(getKey('transaction_history'))}
      columns={columns}
      filterRender={filterRender}
      paramVariables={params}
      paramsProps={setParams}
      t={t}
    />
  );
};

export default TransactionTable;
