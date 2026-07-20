import React, { useMemo, useState } from 'react';
import { Modal, Form, Select, message, Alert } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import type { IGroupMember } from '../../../type/GroupType';
import type { AssignmentRow } from '../../../type/AssignmentType';

interface SwapMemberModalProps {
  open: boolean;
  onCancel: () => void;
  currentGroupMembers: IGroupMember[];
  otherGroupStudents: AssignmentRow[];
  /** Chỉ ghi nhận lựa chọn hoán đổi vào form để xem trước - CHƯA gọi API, chỉ thật sự lưu khi bấm "Cập nhật" ở form nhóm. */
  onStageSwap?: (studentA: IGroupMember, studentB: AssignmentRow) => void;
}

const SwapMemberModal: React.FC<SwapMemberModalProps> = ({
  open,
  onCancel,
  currentGroupMembers,
  otherGroupStudents,
  onStageSwap,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Gom sinh viên theo đúng nhóm thật (groupId) và đặt tên nhóm bằng tên các thành viên
  // trong đó - tránh dùng mã/số thứ tự nhóm vì số đó tính luôn cả các nhóm đã xóa/hủy nên
  // không liên tục, dễ gây hiểu nhầm; tên thành viên thì trực quan và dễ hiểu hơn hẳn.
  const groupedOptions = useMemo(() => {
    const byGroup = new Map<string, AssignmentRow[]>();
    otherGroupStudents.forEach((s) => {
      const key = s.groupId || `_${s.studentId}`;
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key)!.push(s);
    });

    return Array.from(byGroup.values()).map((members) => {
      const names = members.map((m) => m.name);
      const fullLabel = names.join(', ');
      const shortLabel = names.length > 2 ? `${names.slice(0, 1).join(', ')} +${names.length - 1}` : fullLabel;
      return {
        label: `👥 ${shortLabel}`,
        title: `Nhóm của: ${fullLabel}`,
        options: members.map((s) => ({
          value: s.studentId,
          label: `${s.name} (${s.studentId}) [Đề tài: ${s.topic || 'Chưa đăng ký'}] | Lớp: ${s.className || '—'}`,
        })),
      };
    });
  }, [otherGroupStudents]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const studentA = currentGroupMembers.find((m) => m.code === values.studentIdA);
      const studentB = otherGroupStudents.find((s) => s.studentId === values.studentIdB);
      if (!studentA || !studentB) {
        message.error('Không tìm thấy sinh viên đã chọn!');
        return;
      }

      onStageSwap?.(studentA, studentB);
      message.info('Đã ghi nhận hoán đổi trong form, bấm "Cập nhật" để lưu chính thức!');
      form.resetFields();
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <SwapOutlined className="text-blue-500" />
          Hoán đổi thành viên nhóm
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      centered
      width={560}
      okText="Xác nhận hoán đổi"
      cancelText="Hủy bỏ"
    >
      <div className="py-2 space-y-4">
        <Alert
          message="Hoán đổi thành viên là thao tác đổi chéo 2 sinh viên ở 2 nhóm khác nhau. Sinh viên nhóm này sẽ chuyển sang nhóm kia và ngược lại."
          type="info"
          showIcon
          className="rounded-lg"
        />

        <Form form={form} layout="vertical">
          <Form.Item
            name="studentIdA"
            label="Thành viên nhóm hiện tại"
            rules={[{ required: true, message: 'Vui lòng chọn thành viên nhóm này!' }]}
          >
            <Select
              placeholder="Chọn sinh viên nhóm này..."
              className="w-full"
              allowClear
            >
              {currentGroupMembers.map((m) => (
                <Select.Option key={m.code} value={m.code}>
                  {m.name} ({m.code}) — {m.class || 'Chưa rõ lớp'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="studentIdB"
            label="Thành viên nhóm khác để hoán đổi"
            rules={[{ required: true, message: 'Vui lòng chọn sinh viên cần hoán đổi!' }]}
            extra="Danh sách chỉ bao gồm những sinh viên đủ điều kiện làm đồ án (Đạt) và đã có nhóm."
          >
            <Select
              showSearch
              placeholder="Chọn hoặc tìm kiếm sinh viên nhóm khác..."
              optionFilterProp="children"
              className="w-full"
              allowClear
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={groupedOptions}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default SwapMemberModal;
