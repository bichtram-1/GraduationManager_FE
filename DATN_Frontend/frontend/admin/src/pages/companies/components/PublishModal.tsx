import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { formatNumber } from '@shared/utils/numberUtils';

type Props = {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  confirmLoading?: boolean;
  companyStats: { total: number };
  reviewStats: { approved: number; pending: number };
  unpublishedCount: number;
};

const PublishModal: React.FC<Props> = ({ open, onCancel, onOk, confirmLoading, companyStats, reviewStats, unpublishedCount }) => {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      open={!!open}
      title={t(getKey('publish_companies_title'))}
      onCancel={onCancel}
      destroyOnHidden
      width={560}
      okText={t(getKey('publish_btn'))}
      cancelText={t(getKey('cancel_btn'))}
      confirmLoading={confirmLoading}
      okButtonProps={{ className: '!h-10 !rounded-lg !font-medium', disabled: unpublishedCount === 0 }}
      cancelButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
      onOk={onOk}
    >
      <div className="space-y-3 text-sm text-slate-600">
        <p className="m-0">{t(getKey('publish_companies_desc'))}</p>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
          <div className="text-3xl font-bold text-[var(--color-blue-md)]">{formatNumber(unpublishedCount)}</div>
          <div className="text-xs text-slate-600">công ty mới sẽ được công bố cho sinh viên</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 font-medium text-slate-900">{t(getKey('current_summary'))}</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-2xl font-bold text-[var(--color-blue-md)]">{formatNumber(companyStats?.total ?? 0)}</div>
              <div className="text-xs text-slate-500">{t(getKey('total_companies'))}</div>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-2xl font-bold text-[var(--color-green-medium)]">{formatNumber(reviewStats?.approved ?? 0)}</div>
              <div className="text-xs text-slate-500">{t(getKey('approved_status'))}</div>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-2xl font-bold text-[var(--color-gold-medium)]">{formatNumber(reviewStats?.pending ?? 0)}</div>
              <div className="text-xs text-slate-500">{t(getKey('pending_status'))}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PublishModal;
