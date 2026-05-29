import React from 'react';
import { Input } from 'antd';

type AntdInputProps = React.ComponentProps<typeof Input>;
type AntdTextAreaProps = React.ComponentProps<typeof Input.TextArea>;
type AntdPasswordProps = React.ComponentProps<typeof Input.Password>;

type InputModeProps = {
  isTextArea?: false;
  isPassword?: false;
} & AntdInputProps;

type TextAreaModeProps = {
  isTextArea: true;
  isPassword?: never;
} & AntdTextAreaProps;

type PasswordModeProps = {
  isPassword: true;
  isTextArea?: never;
} & AntdPasswordProps;

type CustomInputProps = InputModeProps | TextAreaModeProps | PasswordModeProps;

type CustomInputComponent = React.FC<CustomInputProps> & {
  Password: React.FC<Omit<PasswordModeProps, 'isPassword'>>;
  TextArea: React.FC<Omit<TextAreaModeProps, 'isTextArea'>>;
};

const CustomInput: CustomInputComponent = ((props: CustomInputProps) => {
  if (props.isTextArea) {
    const {
      placeholder,
      maxLength = 1500,
      showCount = false,
      rows = 7,
      ...restTextAreaProps
    } = props;

    return (
      <Input.TextArea
        size="large"
        {...restTextAreaProps}
        placeholder={placeholder}
        maxLength={maxLength}
        showCount={showCount}
        rows={rows}
      />
    );
  }

  if (props.isPassword) {
    const {
      placeholder,
      maxLength = 200,
       
      isPassword: _isPassword,
      ...restPasswordProps
    } = props;

    return (
      <Input.Password
        size="large"
        {...restPasswordProps}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    );
  }

  const {
    placeholder,
    maxLength = 200,
    showCount = false,
    type = 'text',
    ...restInputProps
  } = props as InputModeProps;

  return (
    <Input
      size="large"
      {...restInputProps}
      placeholder={placeholder}
      type={type}
      maxLength={maxLength}
      showCount={showCount}
    />
  );
}) as CustomInputComponent;

CustomInput.Password = (props) => <CustomInput {...props} isPassword />;
CustomInput.TextArea = (props) => <CustomInput {...props} isTextArea />;
CustomInput.displayName = 'CustomInput';
CustomInput.Password.displayName = 'CustomInput.Password';
CustomInput.TextArea.displayName = 'CustomInput.TextArea';

export default CustomInput;
