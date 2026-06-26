import React from 'react';
import { Modal, Select } from 'antd';
import type { IListGroup } from '../../../type/GroupType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';

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
  const { t } = useTranslation();
  const right = groups.find((g) => g.id === mergeRight);
  const [selected, setSelected] = React.useState<string[] | undefined>(undefined);

  React.useEffect(() => {
    setSelected(undefined);
  }, [mergeRight]);

  const rightMembers = right?.members ?? [];

  return (
    <Modal title={t(getKey('merge_groups'))} open={!!open} onCancel={onCancel} onOk={() => onOk(selected)} okText={t(getKey('confirm_btn'))}>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-600">{t(getKey('main_group'))}</div>
          {mergeLeft ? (
            <div className="p-2 border rounded text-sm">{`${groups.find((g) => g.id === mergeLeft)?.code || ''} — ${groups.find((g) => g.id === mergeLeft)?.title || ''}`}</div>
          ) : (
            <Select className="w-full" value={mergeLeft || undefined} onChange={(v) => setMergeLeft(v)}>
              {groups.filter((g) => g.status !== STATUS_CODE.DISSOLVED).map((g) => <Select.Option key={g.id} value={g.id}>{g.code} — {g.title}</Select.Option>)}
            </Select>
          )}
        </div>
        <div>
          <div className="text-sm text-gray-600">{t(getKey('sub_group'))}</div>
          <Select className="w-full" value={mergeRight || undefined} onChange={(v) => setMergeRight(v)}>
            {groups.filter((g) => g.status !== STATUS_CODE.DISSOLVED).map((g) => <Select.Option key={g.id} value={g.id}>{g.code} — {g.title}</Select.Option>)}
          </Select>
        </div>
        <div>
          <div className="text-sm text-gray-600">{t(getKey('preview'))}</div>
          <div className="p-3 border rounded">
            {mergeLeft && mergeRight ? t(getKey('members_count_label'), { count: formatNumber(groups.find((g) => g.id === mergeLeft)!.members.length + groups.find((g) => g.id === mergeRight)!.members.length) }) : t(getKey('select_groups_for_preview'))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-sm text-gray-600 mb-2">{t(getKey('select_members_to_transfer'))}</div>
        {rightMembers.length === 0 ? <div className="text-sm text-gray-500">{t(getKey('no_sub_group_or_no_members'))}</div> : (
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
