import React from 'react';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { formatNumber } from '@shared/utils/numberUtils';

type Props = {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  count?: number;
  showing?: number;
  approved?: number;
};

const RemindModal: React.FC<Props> = ({ open, onCancel, onOk, count = 0, showing = 0, approved = 0 }) => {
  const { t } = useTranslation();

  return (
    <Modal
      centered
      open={!!open}
      title={t(getKey('remind_modal_title'))}
      onCancel={onCancel}
      destroyOnClose
      okText={t(getKey('send_remind_btn'))}
      onOk={onOk}
    >
      <div className="space-y-3 text-sm text-slate-600">
        <p className="m-0">{t(getKey('remind_modal_content'))}</p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-2xl font-bold text-primary">{formatNumber(count)}</div>
              <div className="text-xs text-slate-500">{t(getKey('need_remind'))}</div>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-2xl font-bold text-[var(--color-gold-medium)]">{formatNumber(showing)}</div>
              <div className="text-xs text-slate-500">{t(getKey('currently_showing'))}</div>
            </div>
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <div className="text-2xl font-bold text-[var(--color-green-medium)]">{formatNumber(approved)}</div>
              <div className="text-xs text-slate-500">{t(getKey('approved_count'))}</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default RemindModal;
