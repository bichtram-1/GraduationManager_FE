import React from 'react'
import { DatePicker, DatePickerProps } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import { DATE_FORMAT } from '../../constants/commonConst'

interface CustomDatePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
  value?: string
  onChange?: (value: string | null) => void
  format?: string
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  format = DATE_FORMAT,
  ...rest
}) => {
  // Convert string value to dayjs object
  const dayjsValue = value ? dayjs(value, format) : null

  // Handle date change and convert back to string
  const handleChange = (date: Dayjs | null) => {
    const stringValue = date ? date.format(format) : null
    onChange?.(stringValue)
  }

  return (
    <DatePicker
      {...rest}
      value={dayjsValue}
      onChange={handleChange}
      format={format}
    />
  )
}

export default CustomDatePicker