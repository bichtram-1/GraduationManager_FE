import React from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { DATE_DISPLAY_FORMAT } from '../../../constants/commonConst';

dayjs.extend(customParseFormat);

type Props = {
  value?: string;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  format?: string;
  disabledDate?: (current: dayjs.Dayjs) => boolean;
};

/**
 * Form.Item-compatible date input: stores/emits a plain string (format below),
 * same wire format every date field in the app already used as an Input placeholder,
 * so it drops in without touching any submit/API code.
 */
const CustomDatePicker: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  placeholder,
  className,
  format = DATE_DISPLAY_FORMAT,
  disabledDate,
}) => {
  const parsed = value ? dayjs(value, format, true) : null;

  return (
    <DatePicker
      value={parsed && parsed.isValid() ? parsed : null}
      onChange={(date) => onChange?.(date ? date.format(format) : undefined)}
      format={format}
      disabled={disabled}
      placeholder={placeholder || format}
      className={className}
      style={{ width: '100%' }}
      disabledDate={disabledDate}
      inputReadOnly
    />
  );
};

export default CustomDatePicker;
