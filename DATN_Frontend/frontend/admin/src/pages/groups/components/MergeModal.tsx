import React from 'react';
import { Modal, Select } from 'antd';
import type { IListGroup } from '../../../type/GroupType';

type Props = {
  open: boolean;
  onCancel: () => void;
  onOk: (moveMemberIds?: string[] | undefined) => void;
  mergeLeft: string | null;
  mergeRight: string | null;
  setMergeLeft: (v: string | null) => void;
  setMergeRight: (v: string | null) => void;
  groups: IListGroup[];
};

const MergeModal: React.FC<Props> = ({ open, onCancel, onOk, mergeLeft, mergeRight, setMergeLeft, setMergeRight, groups }) => {
  const right = groups.find((g) => g.id === mergeRight);
  const [selected, setSelected] = React.useState<string[] | undefined>(undefined);

  React.useEffect(() => {
    // reset selection when right changes
    setSelected(undefined);
  }, [mergeRight]);

  const rightMembers = right?.members ?? [];

  return (
    <Modal title="Ghép nhóm" open={!!open} onCancel={onCancel} onOk={() => onOk(selected)} okText="Xác nhận">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-600">Nhóm chính</div>
          {mergeLeft ? (
            <div className="p-2 border rounded text-sm">{`${groups.find((g) => g.id === mergeLeft)?.code || ''} — ${groups.find((g) => g.id === mergeLeft)?.title || ''}`}</div>
          ) : (
            <Select style={{ width: '100%' }} value={mergeLeft || undefined} onChange={(v) => setMergeLeft(v)}>
              {groups.filter((g) => g.status !== 'DISSOLVED').map((g) => <Select.Option key={g.id} value={g.id}>{g.code} — {g.title}</Select.Option>)}
            </Select>
          )}
        </div>
        <div>
          <div className="text-sm text-gray-600">Nhóm phụ</div>
          <Select style={{ width: '100%' }} value={mergeRight || undefined} onChange={(v) => setMergeRight(v)}>
            {groups.filter((g) => g.status !== 'DISSOLVED').map((g) => <Select.Option key={g.id} value={g.id}>{g.code} — {g.title}</Select.Option>)}
          </Select>
        </div>
        <div>
          <div className="text-sm text-gray-600">Preview</div>
          <div className="p-3 border rounded">
            {mergeLeft && mergeRight ? `${groups.find((g) => g.id === mergeLeft)!.members.length + groups.find((g) => g.id === mergeRight)!.members.length} thành viên` : 'Chọn 2 nhóm để xem preview'}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">Chọn thành viên từ nhóm phụ để chuyển (mặc định chọn tất cả)</div>
        {rightMembers.length === 0 ? <div className="text-sm text-gray-500">Chưa chọn nhóm phụ hoặc nhóm phụ không có thành viên</div> : (
          <div className="grid gap-2">
            {rightMembers.map((m) => (
              <label key={m.id} className="inline-flex items-center gap-2">
                <input type="checkbox" checked={selected ? selected.includes(m.id) : true} onChange={(e) => {
                  const checked = e.target.checked;
                  setSelected((prev) => {
                    const base = prev ?? rightMembers.map((rm) => rm.id);
                    if (checked) return Array.from(new Set([...(base || []), m.id]));
                    return (base || []).filter((id) => id !== m.id);
                  });
                }} />
                <span>{m.code} — {m.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MergeModal;
