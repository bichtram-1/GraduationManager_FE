import { UseQueryResult } from '@tanstack/react-query';
import { Empty, Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { initSearchParams } from '@shared/constants/commonConst';
import { ListResponseTypeObject } from '@shared/types/GeneralType';

type OptionRecord = Record<string, unknown>;

interface LabelInValue {
  value: unknown;
  label: unknown;
}

interface ISearchSelect<
  TOption extends OptionRecord = OptionRecord,
  TParams = unknown,
> {
  placeholder?: string;
  fieldNames?: { value: string; label: string };
  multiple?: 'multiple' | 'tags' | undefined;
  useQueryHook: (
    paramsQuery: TParams,
    enabled?: boolean
  ) => UseQueryResult<ListResponseTypeObject<TOption>, Error>;
  paramsQuery?: TParams;
  value?: unknown;
  onChange?: (value: LabelInValue | unknown) => void;
  style?: CSSProperties;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  labelInValue?: boolean;
  disabled?: boolean;
  enabled?: boolean;
}

export const SearchSelect = <
  TOption extends OptionRecord = OptionRecord,
  TParams = unknown,
>({
  placeholder = 'Search and Select',
  fieldNames,
  multiple = undefined,
  useQueryHook,
  paramsQuery = initSearchParams as TParams,
  value,
  onChange,
  style,
  size = 'large',
  labelInValue = true,
  className,
  disabled = false,
  enabled = true,
}: ISearchSelect<TOption, TParams>) => {
  const [params, setParams] = useState<TParams>(paramsQuery);
  const { data, isLoading } = useQueryHook(params, enabled);
  const [options, setOptions] = useState<TOption[]>([]);

  useEffect(() => {
    setParams(paramsQuery);
  }, [paramsQuery]);

  useEffect(() => {
    setOptions(data?.rows ?? []);
  }, [data]);

  const loadOptions = (keyword: string | undefined) => {
    setParams({ ...(params as object), keyword } as TParams);
  };

  const debounceFetcher = useMemo(
    () => debounce(loadOptions, 800),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Select
      placeholder={placeholder}
      fieldNames={fieldNames}
      disabled={disabled}
      options={options}
      className={className}
      mode={multiple}
      loading={isLoading}
      style={style ? style : { width: '100%' }}
      labelInValue={labelInValue}
      filterOption={false}
      onSearch={debounceFetcher}
      showSearch
      notFoundContent={isLoading ? <Spin size="small" /> : <Empty />}
      allowClear
      onClear={() => loadOptions('')}
      value={value}
      onChange={(selectedValue) => {
        if (!labelInValue) {
          onChange?.(selectedValue);
          return;
        }
        const selected = selectedValue as LabelInValue;
        onChange?.({ value: selected?.value, label: selected?.label ?? '' });
      }}
      size={size}
    />
  );
};
