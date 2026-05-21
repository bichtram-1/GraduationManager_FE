import { Button, Flex, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn, initSearchParams } from '../../../constants/commonConst';
import { SearchSelect } from '@shared/components/select/SearchSelect';
import { courseHooks } from '../../../hooks/useCourses';
import { userHooks } from '../../../hooks/useUsers';
import CustomInput from '@shared/components/input/CustomInput';

const ModalCreateCode = () => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();

  const handleAutoGenerate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form?.setFieldValue('code', code);
  };

  return (
    <>
      {/* Header */}
      <h3 className={cn('mb-1 text-lg font-semibold')}>
        {t(getKey('create_code_title'))}
      </h3>
      <p className={cn('mb-6 text-sm text-grayMedium')}>
        {t(getKey('create_code_desc'))}
      </p>

      {/*
        Mã code + Auto generate.
        Wrap the button in a sibling Form.Item with an invisible label so it
        shares the same label row + input row + error row layout as the input.
        This keeps the button top-aligned with the input even when a validation
        error expands the input row height.
      */}
      <Flex gap={16} align="flex-start">
        <Form.Item
          label={t(getKey('code'))}
          name="code"
          rules={[{ required: true, message: t(getKey('code_required')) }]}
          className={cn('flex-1')}
        >
          <CustomInput placeholder={t(getKey('code_placeholder'))} />
        </Form.Item>

        <Form.Item label=" " colon={false}>
          <Button
            size="large"
            color="primary"
            onClick={handleAutoGenerate}
          >
            {t(getKey('auto_generate'))}
          </Button>
        </Form.Item>
      </Flex>

      {/* Gán cho User — emit `{ value, label }` to match backend DTO */}
      <Form.Item
        label={t(getKey('assign_to_user'))}
        name="userInfo"
        rules={[{ required: true, message: t(getKey('select_user')) }]}
      >
        <SearchSelect
          placeholder={t(getKey('select_user'))}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          useQueryHook={userHooks.useFetchListUsers as any}
          paramsQuery={initSearchParams}
          fieldNames={{ label: 'name', value: 'id' }}
          labelInValue
          className="!h-10 !rounded-lg"
        />
      </Form.Item>

      {/* Chọn khóa học — multi-select emits `{ value, label }[]` */}
      <Form.Item
        label={t(getKey('select_course'))}
        name="coursesInfo"
        initialValue={[]}
      >
        <SearchSelect
          placeholder={t(getKey('select_course'))}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          useQueryHook={courseHooks.useFetchListCourses as any}
          paramsQuery={initSearchParams}
          fieldNames={{ label: 'name', value: 'id' }}
          labelInValue
          multiple="multiple"
          className="!rounded-lg"
        />
      </Form.Item>
    </>
  );
};

export default ModalCreateCode;
