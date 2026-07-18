import React, { useState } from 'react';
import { Modal, Form, Select, message, Alert } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { groupHooks } from '../../../hooks/useGroups';
import type { IGroupMember } from '../../../type/GroupType';
import type { AssignmentRow } from '../../../type/AssignmentType';

interface SwapMemberModalProps {
  open: boolean;
  onCancel: () => void;
  currentGroupMembers: IGroupMember[];
  otherGroupStudents: AssignmentRow[];
  onSwapSuccess?: () => void;
}

const SwapMemberModal: React.FC<SwapMemberModalProps> = ({
  open,
  onCancel,
  currentGroupMembers,
  otherGroupStudents,
  onSwapSuccess,
}) => {
  const [form] = Form.useForm();
  const swapMutation = groupHooks.useSwapMembers();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const res = await swapMutation.mutateAsync({
        studentIdA: values.studentIdA,
        studentIdB: values.studentIdB,
      });

      if (res.success) {
        message.success(res.message || 'Hoán đổi thành viên thành công!');
        form.resetFields();
        onSwapSuccess?.();
        onCancel();
      } else {
        message.error(res.message || 'Hoán đổi thất bại!');
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      message.error(errorMessage || 'Có lỗi xảy ra khi hoán đổi!');
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
              options={otherGroupStudents.map((s) => ({
                value: s.studentId,
                label: `${s.name} (${s.studentId}) [Đề tài: ${s.topic || 'Chưa đăng ký'}] | Lớp: ${s.className || '—'}`,
              }))}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default SwapMemberModal;
