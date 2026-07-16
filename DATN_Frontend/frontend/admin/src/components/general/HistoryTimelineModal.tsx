import React, { useEffect, useState } from 'react';
import { Modal, Timeline, Spin, Empty, Tag, Card } from 'antd';
import { ClockCircleOutlined, UserOutlined, TeamOutlined, SolutionOutlined } from '@ant-design/icons';
import { historyApi, IHistoryLog } from '../../api/historyApi';
import dayjs from 'dayjs';

interface HistoryTimelineModalProps {
  visible: boolean;
  onCancel: () => void;
  title: string;
  filters: {
    sinh_vien_id?: string;
    ma_so_sinh_vien?: string;
    nhom_id?: string;
    action_type?: string;
    role?: string;
  };
}

const ACTION_COLOR_MAP: Record<string, string> = {
  KHAI_BAO_THUC_TAP: 'green',
  CAP_NHAT_KTTN: 'green',
  TAO_NHOM: 'purple',
  CHAP_NHAN_LOI_MOI: 'cyan',
  TU_CHOI_LOI_MOI: 'red',
  GIAI_TAN_NHOM: 'red',
  ROI_NHOM: 'orange',
  GUI_LOI_MOI: 'blue',
};

export const HistoryTimelineModal: React.FC<HistoryTimelineModalProps> = ({
  visible,
  onCancel,
  title,
  filters,
}) => {
  const [logs, setLogs] = useState<IHistoryLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      historyApi
        .getAdminHistory(filters)
        .then((data) => setLogs(data))
        .catch((err) => console.error('Failed to fetch history:', err))
        .finally(() => setLoading(false));
    } else {
      setLogs([]);
    }
  }, [visible, JSON.stringify(filters)]);

  return (
    <Modal
      title={<div className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <ClockCircleOutlined className="text-blue-500" />
        {title}
      </div>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={680}
      className="history-timeline-modal"
      centered
    >
      <div className="py-4 min-h-[300px] max-h-[500px] overflow-y-auto pr-2">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spin size="large" tip="Đang tải lịch sử..." />
          </div>
        ) : logs.length > 0 ? (
          <Timeline mode="left">
            {logs.map((log) => {
              const tagColor = ACTION_COLOR_MAP[log.action_type] || 'blue';
              return (
                <Timeline.Item
                  key={log.log_id}
                  label={<span className="text-xs text-slate-400 font-medium">{dayjs(log.created_at).format('HH:mm - DD/MM/YYYY')}</span>}
                  dot={log.action_type.includes('NHOM') ? <TeamOutlined className="text-purple-500" /> : <UserOutlined />}
                >
                  <Card className="!bg-slate-50/50 !border-slate-100 hover:!border-slate-200 transition !rounded-xl" size="small">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <Tag color={tagColor} className="font-semibold rounded">
                        {log.action_type}
                      </Tag>
                      {log.nhom_id && (
                        <Tag color="purple" className="rounded font-medium">
                          Nhóm #{log.nhom_id}
                        </Tag>
                      )}
                    </div>
                    <div className="text-sm text-slate-700 font-medium leading-relaxed mb-2">
                      {log.description}
                    </div>
                    {log.details && (
                      <div className="text-[11px] text-slate-500 bg-white/70 border border-slate-100/50 p-2 rounded-lg leading-relaxed mb-2">
                        {log.details}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1.5 border-t border-slate-100/30">
                      <UserOutlined />
                      <span>Thực hiện bởi:</span>
                      <strong className="text-slate-600 font-semibold">{log.user_name}</strong>
                      <span className="text-slate-300">|</span>
                      <span className="capitalize">{log.role === 'sinh_vien' ? 'Sinh viên' : log.role}</span>
                    </div>
                  </Card>
                </Timeline.Item>
              );
            })}
          </Timeline>
        ) : (
          <Empty description="Không tìm thấy lịch sử hoạt động nào cho đối tượng này." />
        )}
      </div>
    </Modal>
  );
};
