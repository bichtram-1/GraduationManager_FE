import { Button, Form, FormItemProps, Input, InputRef } from 'antd';
import React, { useEffect, useMemo, useRef } from 'react';
import { CountrySelector, defaultCountries, parseCountry, usePhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { getKey } from '../../types/I18nKeyType';
import { useTranslation } from 'react-i18next';
import { isPhoneValid } from '../../utils/phoneUtils';

interface AntPhoneProps {
  value?: string;
  onChange?: (phone: string) => void;
}

const WHITELIST = ['vn', 'kr', 'us'];

export const CustomPhoneInput: React.FC<AntPhoneProps> = ({ value, onChange }) => {

  const { t } = useTranslation()
  // ✅ Chuẩn hóa thành CountryData[]
  const countries = useMemo(() => defaultCountries.filter((country) => {
    const { iso2 } = parseCountry(country);
    return WHITELIST.includes(iso2);
  }), []);
  const phoneInput = usePhoneInput({
    defaultCountry: "vn",
    value : value || "",
    countries: countries,
    // disableDialCodePrefill: true, // không điền mã vùng mặc định từ đầu
    onChange: (data) => {
      onChange?.(data.phone);
    },
  });

  const inputRef = useRef<InputRef>(null);

  // Need to reassign inputRef because antd provides not default ref
  useEffect(() => {
    if (phoneInput.inputRef && inputRef.current?.input) {
      phoneInput.inputRef.current = inputRef.current.input;
    }
  }, [inputRef, phoneInput.inputRef]);

  return (
    <div className='flex items-center'>
      <CountrySelector
        selectedCountry={phoneInput.country.iso2}
        onSelect={(country) => phoneInput.setCountry(country.iso2)}
        countries={countries}
        className="h-6 flex items-center justify-center"
        renderButtonWrapper={({ children, rootProps }) => (
          <Button
            {...rootProps}
            className='px-4 mr-3'
          >
            {children}
          </Button>
        )}
      />
      <Input
        placeholder={t(getKey('phone_number'))}
        type="tel"
        value={phoneInput.inputValue}
        onChange={phoneInput.handlePhoneValueChange}
        ref={inputRef}
        name="phone"
        autoComplete="tel"
      />
    </div>
  );
};

type PhoneFormItemProps = FormItemProps

export const PhoneFormItem = ({ rules, ...itemProps }: PhoneFormItemProps) => {
  const { t } = useTranslation();
  return (
    <Form.Item
      name={"phone"}
      label={t(getKey("phone_number"))}
      rules={[
        {
          validateTrigger: ['onChange', 'onBlur'], // onChange hoặc onBlur thì không validate khi chỉ có mã vùng
          validator: (_, v) => {
            if(!v) return Promise.resolve();
            if(v?.length < 4) return Promise.resolve()
            if (isPhoneValid(v)) {
              return Promise.resolve();
            }
            return Promise.reject(new Error(t(getKey("phone_invalid"))));
          }
        },
        {
          validateTrigger: ["onSubmit"], // onSubmit thì validate luôn
          validator: (_, v) => {
            if(!v) return Promise.resolve();
            if (isPhoneValid(v)) {
              return Promise.resolve();
            }
            return Promise.reject(new Error(t(getKey("phone_invalid"))));
          }
        },
        ...(rules || []) // merge rules ở ngoài truyền vào
      ]}
      {...itemProps} // ghi đè props ở ngoài truyền vào nếu có (như required, initialValue,...)
    >
      <CustomPhoneInput />
    </Form.Item>
  );
}