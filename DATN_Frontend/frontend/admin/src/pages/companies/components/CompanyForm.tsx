import { Form, Input, Select, message } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { I18nKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE } from '../../../constants/commonConst';
import { companyApi } from '../../../api/companyApi';

type Props = {
  disabled?: boolean;
};

// Danh sách lĩnh vực đồng bộ với DEFAULT_FIELDS ở website/app/student/internship/page.tsx —
// công ty có thể có nhiều lĩnh vực, backend lưu qua bảng congtylinhvuc và trả về dạng
// chuỗi nối bằng ", " (xem CongTyService::transformCompany). Select dùng mode="tags" nên
// vẫn cho nhập lĩnh vực mới ngoài danh sách gợi ý, giống cơ chế bên student.
const companyFieldOptions = [
  'Phần mềm',
  'Mạng máy tính',
  'An toàn thông tin',
  'Hệ thống thông tin',
  'Trí tuệ nhân tạo',
  'Thiết kế đồ họa / UI-UX',
  'Thương mại điện tử',
  'Phần cứng & Nhúng',
  'Fintech',
  'Internet',
  'Viễn thông',
  'Khác',
].map((value) => ({ value, label: value }));

const companyStatusOptions: { value: string; label: keyof I18nKey }[] = [
  { value: STATUS_CODE.ACTIVE, label: 'company_active' },
  { value: STATUS_CODE.PENDING, label: 'company_pending' },
  { value: STATUS_CODE.PAUSED, label: 'company_paused' },
];


const CompanyForm: React.FC<Props> = ({ disabled = false }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const [lookingUpTax, setLookingUpTax] = React.useState(false);

  const handleLookupTax = async (value: string) => {
    const taxId = value.trim().replace(/-/g, '');
    if (!/^[0-9]{10}([0-9]{3})?$/.test(taxId)) {
      message.error('Mã số thuế phải gồm 10 hoặc 13 chữ số để tra cứu!');
      return;
    }
    setLookingUpTax(true);
    try {
      const result = await companyApi.lookupCompanyByTaxId(taxId);
      if (result) {
        form.setFieldsValue({
          name: result.name || undefined,
        });
        message.success('Đã tự động điền tên công ty từ mã số thuế!');
      }
    } catch (err) {
      message.error((err as Error).message || 'Tra cứu mã số thuế thất bại, vui lòng nhập thủ công.');
    } finally {
      setLookingUpTax(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
      <Form.Item label={t(getKey('company_name'))} name="name" rules={[{ required: true, message: t(getKey('please_enter_company_name')) }]}>
          <Input disabled={disabled} placeholder="VD: FPT Software" />
      </Form.Item>
      <Form.Item
        label={t(getKey('company_tax_id'))}
        name="taxId"
        rules={[{ pattern: /^\d{10}(\d{3})?$/, message: 'Mã số thuế phải gồm 10 hoặc 13 chữ số' }]}
      >
          <Input.Search
            disabled={disabled}
            placeholder="VD: 0101243150"
            enterButton="Tra cứu"
            loading={lookingUpTax}
            onSearch={handleLookupTax}
          />
      </Form.Item>
      <Form.Item
        label={t(getKey('company_field'))}
        name="field"
        rules={[{ required: true, message: t(getKey('please_select_field')) }]}
        getValueProps={(value?: string) => ({
          value: value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [],
        })}
        normalize={(value: string[]) => (Array.isArray(value) ? value.join(', ') : value)}
      >
          <Select mode="tags" disabled={disabled} options={companyFieldOptions} placeholder="Chọn hoặc nhập lĩnh vực hoạt động" />
      </Form.Item>
      <Form.Item label={t(getKey('company_status'))} name="status" initialValue={STATUS_CODE.PENDING} rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
          <Select
            disabled={disabled}
            options={companyStatusOptions.map((option) => ({
              value: option.value,
              label: t(getKey(option.label)),
            }))}
          />
      </Form.Item>
      <Form.Item label={t(getKey('company_contact'))} name="contact">
          <Input disabled={disabled} placeholder="VD: Nguyễn Văn Hùng" />
      </Form.Item>
      <Form.Item
        label={t(getKey('phone_number'))}
        name="phone"
        rules={[{ pattern: /^0\d{9}$/, message: 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0' }]}
      >
          <Input disabled={disabled} placeholder="0901234567" />
      </Form.Item>
      <Form.Item label={t(getKey('email'))} name="email" rules={[{ type: 'email', message: t(getKey('email_invalid')) }]}>
          <Input disabled={disabled} placeholder="contact@company.com" />
      </Form.Item>
    </div>
  );
};

export default CompanyForm;