import React from 'react';
import { Modal } from 'antd';

type Props = {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  companyStats: { total: number };
  reviewStats: { approved: number; pending: number };
};

const PublishModal: React.FC<Props> = ({ open, onCancel, onOk, companyStats, reviewStats }) => (
  <Modal
    centered
    open={!!open}
    title="Công bố danh sách công ty"
    onCancel={onCancel}
    destroyOnHidden
    width={560}
    okText="Công bố"
    cancelText="Hủy"
    okButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
    cancelButtonProps={{ className: '!h-10 !rounded-lg !font-medium' }}
    onOk={onOk}
  >
    <div className="space-y-3 text-sm text-slate-600">
      <p className="m-0">Chỉ các công ty đã được duyệt sẽ xuất hiện trong danh sách công bố.</p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 font-medium text-slate-900">Tóm tắt hiện tại</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-2xl font-bold text-[#2196F3]">{companyStats?.total ?? 0}</div>
            <div className="text-xs text-slate-500">Tổng công ty</div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-2xl font-bold text-[#00A65A]">{reviewStats?.approved ?? 0}</div>
            <div className="text-xs text-slate-500">Đã duyệt</div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-2xl font-bold text-[#D08A00]">{reviewStats?.pending ?? 0}</div>
            <div className="text-xs text-slate-500">Chờ duyệt</div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
);

export default PublishModal;
