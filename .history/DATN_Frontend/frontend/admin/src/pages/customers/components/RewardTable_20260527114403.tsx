import { SearchOutlined } from "@ant-design/icons";
import { TableColumnsType, Flex, Form, Input } from "antd";
import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SearchSelect } from '../../../components/shared/select/SearchSelect';
import FilterTable from '../../../components/shared/table/FilterTable';
import { DATE_TIME_FORMAT, initSearchParams } from "../../../constants/commonConst";
import { brandHooks } from "../../../hooks/useBrands";
import { couponHooks } from "../../../hooks/useCoupons";
import { gasStationHooks } from "../../../hooks/useGasStations";
import { BaseListParams } from "@shared/types/GeneralType";
import { getKey } from "@shared/types/I18nKeyType";
import { formatDate } from "@shared/utils/DateUtils";
import { DetailRewardProps } from "../../../type/RewardType";

const RewardTable = () => {
  const { t } = useTranslation();
  const { customerId } = useParams<{ customerId: string }>();
  const [params, setParams] = useState<BaseListParams>({
    page: 1,
    limit: 10,
    customerId: customerId || '',
  });

  const columns: TableColumnsType<DetailRewardProps> = useMemo(
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
              title: t(getKey("reward_id")),
              dataIndex: "id",
              key: 'rewardId',
          },
          {
              title: t(getKey("reward_name")),
              dataIndex: "name",
              key: 'rewardName',
          },
          {
              title: t(getKey("reward_type")),
              dataIndex: "type",
              key: 'rewardType',
          },
          {
              title: t(getKey("points_redeemed")),
              dataIndex: 'pointRedeemed',
              key: 'pointRedeemed',
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
              title: t(getKey("redeemed_date")),
              dataIndex: 'redeemedDate',
              key: 'redeemedDate',
              render: (value) => formatDate(value, DATE_TIME_FORMAT),
          }
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
    <FilterTable<DetailRewardProps>
      title={t(getKey("reward_history"))}
      columns={columns}
      useQueryHook={couponHooks.useGetListCoupons}
      filterRender={filterRender}
      paramVariables={params}
      paramsProps={setParams}
      t={t}
    />
  );
}

export default RewardTable