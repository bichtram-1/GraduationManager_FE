import { SearchOutlined } from '@ant-design/icons';
import { Flex, Form, Input, TableColumnsType, Tag } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { SearchSelect } from '../../../components/shared/select/SearchSelect';
import FilterTable from '../../../components/shared/table/FilterTable';
import { CouponStatusOptions, CouponTypeOptions, DATE_TIME_FORMAT, findOptionObject, initSearchParams, NotAvailable } from '../../../constants/commonConst';
import { brandHooks } from '../../../hooks/useBrands';
import { couponHooks } from '../../../hooks/useCoupons';
import { gasStationHooks } from '../../../hooks/useGasStations';
import { DetailCouponProps } from '../../../type/CouponType';
import { BaseListParams } from '@shared/types/GeneralType';
import { getKey } from '@shared/types/I18nKeyType';
import { formatDate } from '@shared/utils/DateUtils';

const CouponTable = () => {
  const { t } = useTranslation();
  const { customerId } = useParams<{ customerId: string }>();
  const [params, setParams] = useState<BaseListParams>({
    page: 1,
    limit: 10,
    customerId: customerId || '',
  });

  const columns: TableColumnsType<DetailCouponProps> = useMemo(
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
              title: t(getKey("coupon_id")),
              dataIndex: "id",
              key: 'couponId',
          },
          {
              title: t(getKey("coupon_name")),
              dataIndex: "name",
              key: 'couponName',
          },
          {
              title: t(getKey("code")),
              dataIndex: "code",
              key: 'code',
          },
          {
              title: t(getKey("coupon_type")),
              dataIndex: 'couponType',
              key: 'couponType',
              render: (value) => {
                  const couponTypeOption = findOptionObject(CouponTypeOptions(), value);
                  return <Tag color={couponTypeOption?.color || 'default'}>{couponTypeOption?.label || NotAvailable}</Tag>;
              }
          },
          {
              title: t(getKey("status")),
              dataIndex: "status",
              key: 'status',
              render: (value) => {
                  const couponTypeOption = findOptionObject(CouponStatusOptions(), value);
                  return <Tag color={couponTypeOption?.color || 'default'}>{couponTypeOption?.label || NotAvailable}</Tag>;
              }
          },
          {
              title: t(getKey("used_date")),
              dataIndex: "createdAt",
              key: 'usedDate',
              render: (value) => value ? formatDate(value, DATE_TIME_FORMAT) : NotAvailable,
          },
      ])
  }, [t]);

  const filterRender = useCallback(() => {
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
    <FilterTable<DetailCouponProps>
      title={t(getKey("coupon_usage_history"))}
      columns={columns}
      useQueryHook={couponHooks.useGetListCoupons}
      filterRender={filterRender}
      paramVariables={params}
      paramsProps={setParams}
      t={t}
    />
  );
}

export default CouponTable