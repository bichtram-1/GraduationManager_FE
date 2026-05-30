import React from 'react';
import { Modal, Select } from 'antd';
import type { IListGroup } from '../../../type/GroupType';

type Props = {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  mergeLeft: string | null;
  mergeRight: string | null;
  setMergeLeft: (v: string | null) => void;
  setMergeRight: (v: string | null) => void;
  groups: IListGroup[];
};

const MergeModal: React.FC<Props> = ({ open, onCancel, onOk, mergeLeft, mergeRight, setMergeLeft, setMergeRight, groups }) => {
  return (
    <Modal title="Ghép nhóm" open={!!open} onCancel={onCancel} onOk={onOk} okText="Xác nhận">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-600">Nhóm chính</div>
          <Select style={{ width: '100%' }} value={mergeLeft || undefined} onChange={(v) => setMergeLeft(v)}>
            {groups.filter((g) => g.status !== 'DISSOLVED').map((g) => <Select.Option key={g.id} value={g.id}>{g.code} — {g.title}</Select.Option>)}
          </Select>
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
    </Modal>
  );
};

export default MergeModal;
