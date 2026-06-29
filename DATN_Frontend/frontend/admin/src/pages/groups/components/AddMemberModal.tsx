import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Alert } from 'antd';
import type { IGroupMember, IListGroup } from '../../../type/GroupType';
import { useTranslation } from 'react-i18next';

type Props = {
  open: boolean;
  onCancel: () => void;
  group: IListGroup | null;
  sampleStudents: IGroupMember[];
  groups: IListGroup[];
  currentGroupMembers: IGroupMember[];
  onAdd: (student: IGroupMember) => void;
};

const AddMemberModal: React.FC<Props> = ({ open, onCancel, group, sampleStudents, groups, currentGroupMembers, onAdd }) => {
  const { t } = useTranslation();
  const [searchVal, setSearchVal] = useState('');
  const [foundStudent, setFoundStudent] = useState<IGroupMember | null>(null);
  const [searchStatus, setSearchStatus] = useState<'idle' | 'found' | 'not_found'>('idle');

  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      setSearchVal('');
      setFoundStudent(null);
      setSearchStatus('idle');
    }
  }, [open]);

  const handleSearch = (value: string) => {
    const code = value.trim();
    if (!code) {
      message.warning('Vui lòng nhập mã số sinh viên!');
      return;
    }
    setSearchVal(code);

    // Search in the list of students in the current period
    const student = sampleStudents.find((s) => s.code.toLowerCase() === code.toLowerCase());
    if (student) {
      setFoundStudent(student);
      setSearchStatus('found');
    } else {
      setFoundStudent(null);
      setSearchStatus('not_found');
      message.error('Không tồn tại sinh viên này trong đợt!');
    }
  };

  const handleAdd = () => {
    if (!foundStudent) return;

    // Rule 1: check max members is 2
    if (currentGroupMembers.length >= 2) {
      message.error('Nhóm đã đủ thành viên!');
      return;
    }

    // Rule 2: check if student already exists in this group
    const alreadyInGroup = currentGroupMembers.some((m) => m.code === foundStudent.code);
    if (alreadyInGroup) {
      message.error('Sinh viên này đã có trong danh sách thành viên của nhóm hiện tại!');
      return;
    }

    // Rule 3: check if student exists in another group in the same period
    const otherGroup = groups.find((g) => 
      g.id !== group?.id && 
      g.members.some((m) => m.code === foundStudent.code)
    );
    if (otherGroup) {
      message.error(`Sinh viên ${foundStudent.name} đang là thành viên nhóm thực hiện đề tài "${otherGroup.title || 'Chưa có đề tài'}"!`);
      return;
    }

    // Rule 4: check if student is eligible
    if (foundStudent.eligible === false) {
      message.error(`Sinh viên ${foundStudent.name} có điều kiện làm đồ án là CHƯA ĐẠT, không thể thêm vào nhóm!`);
      return;
    }

    // All rules pass, add student to the group
    onAdd(foundStudent);
    message.success(`Đã thêm sinh viên ${foundStudent.name} vào danh sách thành viên!`);
    onCancel(); // Close modal
  };

  return (
    <Modal 
      title="Thêm thành viên nhóm" 
      open={!!open} 
      onCancel={onCancel} 
      footer={null}
      centered
    >
      <div className="space-y-4 pt-2">
        <Input.Search 
          placeholder="Nhập mã số sinh viên (MSSV) để tìm..." 
          enterButton="Tìm kiếm"
          onSearch={handleSearch}
          allowClear
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
        />

        {searchStatus === 'found' && foundStudent && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">Thông tin sinh viên tìm thấy</div>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
              <div className="font-semibold">MSSV:</div>
              <div>{foundStudent.code}</div>
              <div className="font-semibold">Họ và tên:</div>
              <div>{foundStudent.name}</div>
              <div className="font-semibold">Lớp:</div>
              <div>{foundStudent.class || '—'}</div>
              <div className="font-semibold">Điều kiện làm đồ án:</div>
              <div>
                {foundStudent.eligible !== false ? (
                  <span className="text-emerald-600 font-semibold">ĐẠT</span>
                ) : (
                  <span className="text-rose-600 font-semibold">CHƯA ĐẠT ({foundStudent.reason || 'Nợ môn/Tín chỉ'})</span>
                )}
              </div>
            </div>
            
            <div className="pt-2 flex justify-end">
              <Button type="primary" onClick={handleAdd}>
                Thêm vào nhóm
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddMemberModal;
