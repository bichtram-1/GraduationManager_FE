import React from 'react';
import { Modal, Input, Button, message } from 'antd';
import type { IGroupMember, IListGroup } from '../../../type/GroupType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';

type Props = {
  open: boolean;
  onCancel: () => void;
  group: IListGroup | null;
  sampleStudents: IGroupMember[];
  onAdd: (groupId: string, student: IGroupMember, force?: boolean) => void;
};

const AddMemberModal: React.FC<Props> = ({ open, onCancel, group, sampleStudents, onAdd }) => {
  const { t } = useTranslation();

  return (
    <Modal title={t(getKey('add_member'))} open={!!open} onCancel={onCancel} footer={null}>
      <div className="space-y-3">
        <Input.Search placeholder={t(getKey('search_placeholder_code_name'))} onSearch={(v) => {
          const found = sampleStudents.filter((s) => `${s.name} ${s.code}`.toLowerCase().includes(v.toLowerCase()));
          if (found.length === 0) return message.info(t(getKey('not_found_mock')));
          Modal.info({ title: t(getKey('search_result_mock')), content: (
            <div>
              {found.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2">
                  <div>{f.name} — {f.code} {f.eligible ? null : <span className="text-red-600">({f.reason})</span>}</div>
                  <div>
                    <Button onClick={() => onAdd(group!.id, f)} size="small">{t(getKey('add_new_btn'))}</Button>
                    {!f.eligible && <Button danger size="small" onClick={() => onAdd(group!.id, f, true)} className="ml-2">{t(getKey('bypass_and_add'))}</Button>}
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
