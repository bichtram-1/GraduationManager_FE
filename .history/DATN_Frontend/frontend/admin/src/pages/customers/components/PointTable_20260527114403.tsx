import { SearchOutlined } from '@ant-design/icons';
import { Flex, Form, Input, TableColumnsType, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SearchSelect } from '../../../components/shared/select/SearchSelect';
import FilterTable from '../../../components/shared/table/FilterTable';
import { DATE_TIME_FORMAT, findOptionObject, initSearchParams, NotAvailable, PointActivityOptions, TransactionPaymentMethodOptions } from '../../../constants/commonConst';
import { brandHooks } from '../../../hooks/useBrands';
import { gasStationHooks } from '../../../hooks/useGasStations';
import { BaseListParams } from '@shared/types/GeneralType';
import { getKey } from '@shared/types/I18nKeyType';
import { PointHistoryType } from '../../../type/PointType';
import { formatDate } from '@shared/utils/DateUtils';
import { pointHooks } from '../../../hooks/usePoints';

const PointTable = () => {
    const { t } = useTranslation();
    const { customerId } = useParams<{ customerId: string }>();
    const [params, setParams] = useState<BaseListParams>({
      page: 1,
      limit: 10,
      customerId: customerId || '',
    });
  
    const columns: TableColumnsType<PointHistoryType> = useMemo(
      () => {
        return ([
            {
                title: t(getKey("transaction_id")),
                dataIndex: 'code',
                key: 'id',
                width: 120,
                fixed: 'left',
            },
            {
                title: t(getKey("activity")),
                dataIndex: "activity",
                key: 'activity',
                width: 150,
                render: (value: string) => {
                  const activityOption = findOptionObject(PointActivityOptions(), value);
                  return <Tag color={activityOption?.color || 'default'}>{activityOption?.label || NotAvailable}</Tag>;
                }
            },
            {
                title: t(getKey("point")),
                dataIndex: "point",
                key: 'point',
                width: 100,
                render: (value, record) => {
                    const activityOption = findOptionObject(PointActivityOptions(), record.activity);
                    return <Tag color={activityOption?.color || 'default'}>{value}</Tag>
                }
            },
            {
                title: t(getKey("payment_description")),
                dataIndex: "paymentDescription",
                key: 'paymentDescription',
            },
            {
                title: t(getKey("payment_method")),
                dataIndex: 'paymentMethod',
                key: 'paymentMethod',
                render: (value) => {
                    const paymentOption = findOptionObject(TransactionPaymentMethodOptions(), value);
                    return <Tag color={paymentOption?.color || 'default'}>{paymentOption?.label || NotAvailable}</Tag>;
                }
            },
            {
                title: t(getKey("brand")),
                dataIndex: ["brand", "label"],
                key: 'brand',
            },
            {
                title: t(getKey("gas_station")),
                dataIndex: ["gasStation", "label"],
                key: 'gasStation',
            },
            {
                title: t(getKey("time")),
                dataIndex: 'time',
                key: 'time',
                render: (value) => formatDate(value, DATE_TIME_FORMAT),
            },
        ])
    }, [t]);
  
    const filterRender = useMemo(() => {
      return (
      <Flex gap={16} align="center">
        <Form.Item
          name="keyword"
          className='flex-1'
        >
          <Input
            placeholder={t(getKey("search"))}
            allowClear
            prefix={<SearchOutlined />}
          />
        </Form.Item>
        <Form.Item
          name={"brandId"}
        >
          <SearchSelect
            useQueryHook={brandHooks.useGetBrandList}
            paramsQuery={{ ...initSearchParams, active: true}}
            fieldNames={{ label: "name", value: "id" }}
            placeholder={t(getKey("select_brand"))}
            labelInValue={false}
            className='min-w-[200px]'
          />
        </Form.Item>
        <Form.Item
          name={"gasStationId"}
        >
          <SearchSelect
            useQueryHook={gasStationHooks.useGetGasStationList}
            paramsQuery={{ ...initSearchParams, brandId: params?.brandId, active: true}}
            fieldNames={{ label: "name", value: "id" }}
            placeholder={t(getKey("select_gas_station"))}
            labelInValue={false}
            disabled={!params?.brandId}
            className='min-w-[200px]'
          />
        </Form.Item>
      </Flex>
      );
    }, [t]);
  
    return (
      <FilterTable<PointHistoryType>
        title={t(getKey("point_usage_history"))}
        columns={columns}
        useQueryHook={pointHooks.useGetPointHistory}
        filterRender={filterRender}
        paramVariables={params}
        paramsProps={setParams}
        t={t}
      />
    );
}

export default PointTable