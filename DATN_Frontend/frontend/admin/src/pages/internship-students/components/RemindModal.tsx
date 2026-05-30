import React from 'react';
import { Modal } from 'antd';

type Props = {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  count?: number;
  showing?: number;
  approved?: number;
};

const RemindModal: React.FC<Props> = ({ open, onCancel, onOk, count = 0, showing = 0, approved = 0 }) => (
  <Modal centered open={!!open} title="Nhắc nhở sinh viên chưa có công ty" onCancel={onCancel} destroyOnClose okText="Gửi nhắc nhở" onOk={onOk}>
    <div className="space-y-3 text-sm text-slate-600">
      <p className="m-0">Hệ thống sẽ gửi thông báo nhắc nhở đến toàn bộ sinh viên đang chưa có công ty thực tập.</p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-2xl font-bold text-[#2196F3]">{count}</div>
            <div className="text-xs text-slate-500">Cần nhắc nhở</div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-2xl font-bold text-[#D08A00]">{showing}</div>
            <div className="text-xs text-slate-500">Đang hiển thị</div>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <div className="text-2xl font-bold text-[#00A65A]">{approved}</div>
            <div className="text-xs text-slate-500">Đã cấp giấy</div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
);

export default RemindModal;
