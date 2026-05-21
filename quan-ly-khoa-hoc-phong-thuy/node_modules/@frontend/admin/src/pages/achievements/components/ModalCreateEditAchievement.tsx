import { Form, InputNumber } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn } from '../../../constants/commonConst';
import { IDetailAchievement } from '../../../type/AchievementType';
import CustomInput from '@shared/components/input/CustomInput';

const ModalCreateEditAchievement = ({
  detail,
}: {
  detail?: IDetailAchievement;
}) => {
  const { t } = useTranslation();

  const requiredCourses = Form.useWatch('requiredCourses');
  const isEditMode = !!detail?.id;

  return (
    <div>
      <h2
        className={cn(
          'm-0 text-lg font-semibold leading-[18px] tracking-[-0.45px] text-[var(--color-near-black)]'
        )}
      >
        {isEditMode
          ? t(getKey('edit_achievement_title'))
          : t(getKey('add_achievement_title'))}
      </h2>
      <p
        className={cn(
          'mb-4 mt-1.5 text-sm font-normal leading-5 text-[var(--color-gray-medium)]'
        )}
      >
        {t(getKey('achievement_form_desc'))}
      </p>

      <Form.Item
        label={t(getKey('achievement_name'))}
        name="name"
        rules={[
          { required: true, message: t(getKey('achievement_name_required')) },
        ]}
        className={cn('mb-4')}
      >
        <CustomInput placeholder={t(getKey('achievement_name_placeholder'))} />
      </Form.Item>

      <Form.Item
        label={t(getKey('required_courses'))}
        name="requiredCourses"
        rules={[
          { required: true, message: t(getKey('required_courses_required')) },
        ]}
        className={cn('!mb-0')}
        extra={
          <span
            className={cn('text-xs leading-4 text-[var(--color-gray-dark)]')}
          >
            {t(getKey('required_courses_hint'), {
              count: requiredCourses ?? '...',
            })}
          </span>
        }
      >
        <InputNumber
          min={1}
          precision={0}
          placeholder={t(getKey('required_courses'))}
          className={cn('w-full')}
          size="large"
        />
      </Form.Item>
    </div>
  );
};

export default ModalCreateEditAchievement;
