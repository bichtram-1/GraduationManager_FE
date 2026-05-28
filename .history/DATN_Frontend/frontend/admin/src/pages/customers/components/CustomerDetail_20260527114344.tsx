import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Divider, Flex, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import AppliedToPreview from '../../../components/shared/general/AppliedToPreview';
import SegmentedTabs, { ItemSegmentTabs } from '../../../components/shared/tabs/SegmentTabs';
import { findOptionObject, getSelectGradeOptions, NotAvailable } from '../../../constants/commonConst';
import { ROUTES } from '../../../constants/routers';
import { customerHooks } from '../../../hooks/useCustomers';
import { getKey } from '@shared/types/I18nKeyType';
import { formatDate } from '@shared/utils/DateUtils';
import { formatNumber } from '@shared/utils/numberUtils';
import { formatPhone } from '@shared/utils/phoneUtils';
import CouponUsedHistoryTable from '../coupon/CouponUsedHistoryTable';
import TransactionTable from '../gas-station/TransactionTable';
import RewardTable from './RewardTable';

const CustomerDetailModal = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const { data: customerDetail, isLoading: isDetailLoading } =
    customerHooks.useFetchDetailCustomer(id || '');

  const itemsDetailCustomer = [
    { label: t(getKey("customer_id")), children: customerDetail?.code || NotAvailable, span: 1 },
    { label: t(getKey("grade")), 
      children: (
        <Tag color={findOptionObject(getSelectGradeOptions(), customerDetail?.grade)?.color || 'default'}>
          {findOptionObject(getSelectGradeOptions(), customerDetail?.grade)?.label || NotAvailable}
        </Tag>
      ), 
      span: 1 
    },
    { 
      label: t(getKey("customer_name")), children: customerDetail?.name || NotAvailable, span: 1 
    },
    { label: t(getKey("current_point")), children: formatNumber(customerDetail?.currentPoints) ?? NotAvailable, span: 1 },
    { label: t(getKey("email")), children: customerDetail?.email ?? NotAvailable, span: 1 },
    { label: t(getKey("phone_number")), children: formatPhone(customerDetail?.phone) ?? NotAvailable, span: 1 },
    { label: t(getKey("birthday")), children: formatDate(customerDetail?.birthday) ?? NotAvailable, span: 1 },
    { label: t(getKey("wedding_anniversary")), children: formatDate(customerDetail?.weddingAnni) ?? NotAvailable, span: 1 },
    { label: t(getKey("member_since")), children: formatDate(customerDetail?.createdAt) ?? NotAvailable, span: 1 },
    { label: t(getKey("total_spent")), children: formatNumber(customerDetail?.totalSpent) ?? NotAvailable, span: 1 },
    { label: t(getKey("brand")), children: <AppliedToPreview data={customerDetail?.brand} showLabel={false} />, span: 1 },
    { label: t(getKey("points_redeemed")), children: formatNumber(customerDetail?.pointsRedeemed) ?? NotAvailable, span: 1 },
    { label: t(getKey("points_accumulated")), children: formatNumber(customerDetail?.pointsAccumulated) ?? NotAvailable, span: 1 },
    { label: t(getKey("point_expired")), children: formatNumber(customerDetail?.pointsExpired) ?? NotAvailable, span: 1 },
  ]

  const itemTabs: ItemSegmentTabs[] = [
    {
      key: 'point-history',
      label: t(getKey("point_usage_history")),
      children: <TransactionTable additionalParams={{ customerId: id }} />
    },
    {
      key: 'coupon-history',
      label: t(getKey("coupon_usage_history")),
      children: (
        <CouponUsedHistoryTable 
          useQueryHook={customerHooks.useGetListCouponsUsedHistory} 
          customerId={id}
        />
      )
    },
    {
      key: 'reward-history',
      label: t(getKey("reward_history")),
      children: <RewardTable />
    },
  ]

  return (
    <Flex vertical gap={12}>

      {/* Customer Information Section */}
      <Flex align='center' gap={12}>
        <Link
          to={ROUTES.CUSTOMERS}
        >
          <Button
              type="text"
              icon={<ArrowLeftOutlined />}
          />
        </Link>
        <Divider type="vertical" />
        <Typography.Title level={3} className='!mb-0'>
            {t(getKey("detail_information_about"))} {customerDetail?.name}
        </Typography.Title>
      </Flex>

      {/* Thông tin chi tiết trạm xăng */}
      <Card loading={isDetailLoading}>
        <Descriptions
            column={2}
            colon={false}
            layout='vertical'
            size='small'
            items={itemsDetailCustomer}
        />  
      </Card>

      {/* Tabs Section */}
      <SegmentedTabs
        items={itemTabs}
        block
      />
    </Flex>
  );
};

export default CustomerDetailModal;
