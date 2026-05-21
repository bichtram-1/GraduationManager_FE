import { UseQueryResult } from '@tanstack/react-query';
import { Empty, Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { initSearchParams } from '../../constants/commonConst';
import { ListResponseTypeObject } from '../../types/GeneralType';

/**
 * Row shape of an option returned by the query hook.
 * Callers can pass any record shape — `fieldNames` maps the actual label/value keys.
 */
type OptionRecord = Record<string, unknown>;

/** Value emitted by `onChange` when `labelInValue = true`. */
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
  /**
   * Query hook returning a paginated list response.
   * Must accept `(params, enabled)` and return `{ data: { rows, total } }`.
   */
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
