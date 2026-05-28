import {
  Flex,
  Form,
  Input,
  Select,
  TableColumnsType,
  Tag
} from 'antd';
import FilterTable from '../../components/shared/table/FilterTable';
import { DetailCustomerProps } from '../../type/CustomerType';

import {
  SearchOutlined
} from '@ant-design/icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import {
  findOptionObject,
  getSelectGradeOptions,
  NotAvailable
} from '../../constants/commonConst';
import { ROUTES } from '../../constants/routers';
import { customerHooks } from '../../hooks/useCustomers';
import { getKey } from '@shared/types/I18nKeyType';

const CustomersPage = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const gradeOptions = useMemo(() => getSelectGradeOptions(), [t]);

  const columns: TableColumnsType<DetailCustomerProps> = useMemo(
    () => [
      {
        title: t(getKey("customer_id")),
        dataIndex: 'code',
        key: 'code',
        width: 100,
        fixed: 'left',
      },
      {
        title: t(getKey("customer_name")),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
      },
      {
        title: t(getKey("customer_grade")),
        dataIndex: 'grade',
        key: 'grade',
        width: 150,
        render: (grade) => {
          const gradeObj = findOptionObject(gradeOptions, grade);
          return <Tag color={gradeObj?.color ?? "default"}>{gradeObj?.label ?? NotAvailable}</Tag>;
        },
      },
      {
        title: t(getKey("phone_number")),
        dataIndex: 'phone',
        key: 'phone',
      },
      {
        title: t(getKey("email")),
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: t(getKey("point")),
        dataIndex: 'currentPoints',
        key: 'currentPoints',
        width: 100,
      },
    ],
    [t],
  );

  const filterRender = () => (
    <Flex gap={8} align="center">
      <Form.Item name="keyword" className='flex-1'>
        <Input
          placeholder={t(getKey("search_by_customer_name"))}
          prefix={<SearchOutlined />}
          allowClear
        />
      </Form.Item>

      <Form.Item name="grade">
        <Select
          placeholder={t(getKey("grade"))}
          options={gradeOptions}
          className='min-w-[200px]'
          allowClear
        />
      </Form.Item>
    </Flex>
  );

  const tableInfo = {
        actions: [
          {
            type: 'detail',
            link: ROUTES.CUSTOMERS_DETAIL
          },
          {
            type: "export",
            func: customerHooks.useExportCustomerList(),
          },
          {
            type: "sync",
          }
        ],
  }

  const handleDetailNavigate = (id: string) => {
      navigate(ROUTES.CUSTOMERS_DETAIL.replace(':id', id));
  };

  return (
    <FilterTable<DetailCustomerProps>
      title={t(getKey("customer_management"))}
      columns={columns}
      useQueryHook={customerHooks.useFetchListCustomers}
      filterRender={filterRender}
      tableInfo={tableInfo}
      detailNavigationType="navigate"
      onDetailNavigate={handleDetailNavigate}
      t={t}
    />
  );
};

export default CustomersPage;
