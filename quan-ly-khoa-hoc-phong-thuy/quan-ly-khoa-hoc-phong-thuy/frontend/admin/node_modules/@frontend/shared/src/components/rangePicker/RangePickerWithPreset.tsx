import { DatePicker, Form } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs, { Dayjs } from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { useTranslation } from 'react-i18next';
import { getKey } from '../../types/I18nKeyType';

dayjs.extend(quarterOfYear);
const { RangePicker } = DatePicker;

type Props = Omit<RangePickerProps, 'value'> & {
  /** Tên field trong Form để lưu start/end (mặc định 'start' & 'end') */
  formKey?: [string, string];
  onChange?: (dates: RangePickerProps['value']) => void;
};

const RangePickerWithPreset: React.FC<Props> = ({
  formKey = ['start', 'end'],
  allowClear = false,
  allowEmpty = [true, true],
    onChange,
  ...rest
}) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();   
  const [startKey, endKey] = formKey;

  // Watch 2 field để “đồng bộ” hiển thị của picker
  const startISO = Form.useWatch(startKey, form);
  const endISO   = Form.useWatch(endKey, form);

  // Convert ISO -> Dayjs (hỗ trợ cả khoảng mở nếu bạn bật allowEmpty)
  const value: [Dayjs | null, Dayjs | null] | null =
    startISO || endISO
      ? [startISO ? dayjs(startISO) : null, endISO ? dayjs(endISO) : null]
      : [dayjs().startOf('year'), dayjs().endOf('day')]; // Mặc định từ đầu năm đến hôm nay

  const presets: RangePickerProps['presets'] = [
    { label: t(getKey('today')),        value: [dayjs().startOf('day'),     dayjs().endOf('day')] },
    { label: t(getKey('this_week')),    value: [dayjs().startOf('week'),    dayjs().endOf('week')] },
    { label: t(getKey('this_month')),   value: [dayjs().startOf('month'),   dayjs().endOf('month')] },
    { label: t(getKey('this_quarter')), value: [dayjs().startOf('quarter'), dayjs().endOf('quarter')] },
  ];

  const handleChange: RangePickerProps['onChange'] = (dates) => {
    // Clear ⇒ xóa 2 field (để params chỉ còn id)
    if (!dates) {
        // clear value
        form.setFieldsValue({ [startKey]: undefined, [endKey]: undefined });
        onChange?.(null);
        return;
    }
    // Ghi từng đầu mút (cho phép khoảng mở nếu bạn muốn)
    form.setFieldsValue({
      [startKey]: dates[0] ? dates[0].startOf('day').toISOString() : undefined,
      [endKey]:   dates[1] ? dates[1].endOf('day').toISOString()   : undefined,
    });
    onChange?.(dates);
  };

  return (
    <RangePicker
      {...rest}
      value={value}
      onChange={handleChange}
      presets={presets}
      allowClear={allowClear}
      allowEmpty={allowEmpty}
    />
  );
};

export default RangePickerWithPreset;
