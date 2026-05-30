import React from 'react';
import { Modal, Input, Button, message } from 'antd';
import type { IGroupMember, IListGroup } from '../../../type/GroupType';

type Props = {
  open: boolean;
  onCancel: () => void;
  group: IListGroup | null;
  sampleStudents: IGroupMember[];
  onAdd: (groupId: string, student: IGroupMember, force?: boolean) => void;
};

const AddMemberModal: React.FC<Props> = ({ open, onCancel, group, sampleStudents, onAdd }) => {
  return (
    <Modal title="Thêm thành viên" open={!!open} onCancel={onCancel} footer={null}>
      <div className="space-y-3">
        <Input.Search placeholder="Tìm theo mã hoặc tên" onSearch={(v) => {
          const found = sampleStudents.filter((s) => `${s.name} ${s.code}`.toLowerCase().includes(v.toLowerCase()));
          if (found.length === 0) return message.info('Không tìm thấy (mô phỏng)');
          Modal.info({ title: 'Kết quả tìm kiếm (mô phỏng)', content: (
            <div>
              {found.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2">
                  <div>{f.name} — {f.code} {f.eligible ? null : <span className="text-red-600">({f.reason})</span>}</div>
                  <div>
                    <Button onClick={() => onAdd(group!.id, f)} size="small">Thêm</Button>
                    {!f.eligible && <Button danger size="small" onClick={() => onAdd(group!.id, f, true)} style={{ marginLeft: 8 }}>Bỏ qua và thêm</Button>}
                  </div>
                </div>
              ))}
            </div>
          )});
        }} />
      </div>
    </Modal>
  );
};

export default AddMemberModal;
