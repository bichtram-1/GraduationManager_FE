import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Input, Checkbox, Tag, Empty } from 'antd';
import { ArrowRightOutlined, SearchOutlined, UserOutlined, CheckCircleFilled } from '@ant-design/icons';
import type { IListGroup } from '../../../type/GroupType';
import { STATUS_CODE } from '../../../constants/commonConst';

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

const MergeModal: React.FC<Props> = ({ open, onCancel, onOk, mergeLeft, mergeRight, setMergeLeft: _setMergeLeft, setMergeRight, groups }) => {
  const leftGroup = useMemo(() => groups.find((g) => g.id === mergeLeft), [groups, mergeLeft]);
  const rightGroup = useMemo(() => groups.find((g) => g.id === mergeRight), [groups, mergeRight]);
  
  const [searchVal, setSearchVal] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[] | undefined>(undefined);

  // Reset states when right group changes
  useEffect(() => {
    if (rightGroup) {
      // Auto-check only eligible members by default
      setSelectedMembers(rightGroup.members.filter((m) => m.eligible !== false).map((m) => m.id));
    } else {
      setSelectedMembers(undefined);
    }
  }, [rightGroup]);

  // Clean state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSearchVal('');
      setSelectedMembers(undefined);
    }
  }, [open]);

  // Filter the list of OTHER candidate groups that are waiting to be merged
  const candidateGroups = useMemo(() => {
    return groups.filter((g) => {
      // Exclude current group
      if (g.id === mergeLeft) return false;
      // Only include groups with status MISSING or WARNING
      return g.status === STATUS_CODE.MISSING || g.status === STATUS_CODE.WARNING;
    });
  }, [groups, mergeLeft]);

  // Apply search keyword filter on the candidate list
  const filteredCandidates = useMemo(() => {
    const keyword = searchVal.trim().toLowerCase();
    if (!keyword) return candidateGroups;

    return candidateGroups.filter((g) => {
      const matchTitle = (g.title || '').toLowerCase().includes(keyword);
      const matchCode = (g.code || '').toLowerCase().includes(keyword);
      const matchMembers = g.members.some((m) => 
        `${m.name} ${m.code || ''}`.toLowerCase().includes(keyword)
      );
      return matchTitle || matchCode || matchMembers;
    });
  }, [candidateGroups, searchVal]);

  const handleSelectGroup = (groupId: string) => {
    setMergeRight(groupId);
  };

  const handleConfirm = () => {
    onOk(selectedMembers);
  };

  return (
    <Modal 
      title="Thao tác ghép nhóm" 
      open={!!open} 
      onCancel={onCancel} 
      onOk={handleConfirm}
      okText="Xác nhận ghép"
      cancelText="Hủy bỏ"
      width={920}
      centered
      okButtonProps={{ disabled: !mergeRight || (selectedMembers && selectedMembers.length === 0) }}
    >
      <div className="grid grid-cols-12 gap-4 items-center py-4">
        
        {/* Left Column: Current Group (Cố định) */}
        <div className="col-span-5 border border-slate-200 rounded-2xl p-4 bg-slate-50 h-[380px] flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Sinh viên lẻ hiện tại (Nhóm gốc)</div>
            {leftGroup ? (
              <div className="space-y-4">
                <div className="bg-white border border-slate-150 rounded-xl p-3 shadow-sm">
                  <div className="text-sm font-bold text-slate-800 line-clamp-2" title={leftGroup.title}>
                    Đề tài: {leftGroup.title || '—'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1.5">
                    GVHD: <span className="font-semibold text-slate-700">{leftGroup.supervisor || '—'}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500">Thành viên hiện tại:</div>
                  {leftGroup.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-2 bg-white border border-slate-150 rounded-xl p-2.5 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        <UserOutlined />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-500">{m.code} • Lớp: {m.class || '—'}</div>
                      </div>
                      <div>
                        {m.eligible !== false ? (
                          <Tag color="green" className="m-0 text-[10px] py-0 px-1 border-none font-semibold">ĐẠT</Tag>
                        ) : (
                          <Tag color="red" className="m-0 text-[10px] py-0 px-1 border-none font-semibold">CHƯA ĐẠT</Tag>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty description="Chưa chọn nhóm gốc" className="mt-8" />
            )}
          </div>
          <div className="text-[11px] text-slate-400 italic">
            * Sinh viên của nhóm này sẽ đóng vai trò làm nhóm chính.
          </div>
        </div>

        {/* Center Column: Connection Icon */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <div className="bg-blue-50 text-blue-600 rounded-full w-14 h-14 shadow-md border border-blue-100 flex items-center justify-center transition-transform hover:scale-105 duration-200">
            <ArrowRightOutlined style={{ fontSize: 24 }} className="animate-pulse" />
          </div>
          <span className="text-xs text-blue-600 font-bold mt-2.5">Ghép cặp</span>
        </div>

        {/* Right Column: Choices (Lựa chọn) */}
        <div className="col-span-5 border border-slate-200 rounded-2xl p-4 bg-white h-[380px] flex flex-col">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Chọn lựa sinh viên/nhóm lẻ ghép cùng</div>
          
          <Input 
            placeholder="Tìm theo tên, MSSV, tên đề tài..." 
            prefix={<SearchOutlined className="text-slate-400" />}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="mb-3 rounded-lg border-slate-300 h-9"
            allowClear
          />

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredCandidates.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có nhóm lẻ nào đang đợi ghép" className="mt-8" />
            ) : (
              filteredCandidates.map((g) => {
                const isSelected = g.id === mergeRight;
                return (
                  <div 
                    key={g.id} 
                    onClick={() => handleSelectGroup(g.id)}
                    className={`p-3 border rounded-xl cursor-pointer shadow-sm transition-all duration-200 ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' 
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 truncate" title={g.title}>
                          Đề tài: {g.title || '—'}
                        </div>
                      </div>
                      <div className="ml-2 flex items-center shrink-0">
                        {isSelected ? (
                          <CheckCircleFilled className="text-blue-500 text-sm" />
                        ) : (
                          <Tag color={g.status === STATUS_CODE.WARNING ? 'orange' : 'blue'} className="m-0 text-[9px] border-none font-semibold px-1 py-0">
                            {g.status === STATUS_CODE.WARNING ? 'CẢNH BÁO' : 'LẺ'}
                          </Tag>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {g.members.map((m) => (
                        <div key={m.id} className="flex justify-between items-center text-xs">
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="font-semibold text-slate-800">{m.name}</span>
                            <span className="text-slate-500 ml-1.5">({m.code})</span>
                          </div>
                          {m.eligible === false && (
                            <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1 rounded">CHƯA ĐẠT</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Members Transfer selector if selected */}
          {rightGroup && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-500 mb-1.5">Chọn thành viên muốn chuyển:</div>
              <div className="flex flex-wrap gap-2">
                {rightGroup.members.map((m) => {
                  const isChecked = selectedMembers ? selectedMembers.includes(m.id) : false;
                  return (
                    <Checkbox
                      key={m.id}
                      checked={isChecked}
                      disabled={m.eligible === false}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedMembers((prev) => {
                          const base = prev ?? [];
                          if (checked) return Array.from(new Set([...base, m.id]));
                          return base.filter((id) => id !== m.id);
                        });
                      }}
                      className="text-xs font-medium"
                    >
                      {m.name}
                    </Checkbox>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </Modal>
  );
};

export default MergeModal;
