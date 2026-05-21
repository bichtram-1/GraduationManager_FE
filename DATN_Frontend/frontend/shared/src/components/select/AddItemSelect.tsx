import { Select } from 'antd';

interface OptionItem {
  value: string;
  label: string;
}
interface AddItemSelectProps {
  placeholder?: string;
  fieldNames?: OptionItem;
  multiple?: 'multiple' | 'tags' | undefined;
  options: OptionItem[];
  value?: unknown;
  onChange?: (value: unknown) => void;
  style?: unknown;
  size?: 'small' | 'middle' | 'large';
}

export const AddItemSelect: React.FC<AddItemSelectProps> = ({
  placeholder = 'Search and Select',
  fieldNames,
  multiple = 'tags',
  options,
  value,
  onChange,
  style,
  size = 'middle',
}) => {
  const transformValue = value
    ? value.map((val: Record<string, string>) => {
        const option = options.find((opt) => opt.value === val.value);
        return option ? { label: option.label, value: option.value } : val;
      })
    : undefined;

  return (
    <Select
      optionLabelProp="label"
      labelInValue={true}
      className="custom-select-tags"
      popupClassName="custom-dropdown"
      placeholder={placeholder}
      mode={multiple}
      fieldNames={fieldNames}
      size={size}
      style={style}
      value={transformValue}
      onChange={onChange}
      dropdownRender={(menu) => <>{menu}</>}
      maxTagCount="responsive"
      options={options}
    />
  );
};
