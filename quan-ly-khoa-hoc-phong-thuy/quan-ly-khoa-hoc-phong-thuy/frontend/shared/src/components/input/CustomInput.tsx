import React from 'react';
import { Input } from 'antd';

/** Props của <Input /> */
type AntdInputProps = React.ComponentProps<typeof Input>;

/** Props của <Input.TextArea /> */
type AntdTextAreaProps = React.ComponentProps<typeof Input.TextArea>;

/** Props của <Input.Password /> */
type AntdPasswordProps = React.ComponentProps<typeof Input.Password>;

/**
 * Text input mode: default — renders <Input />.
 * `isTextArea` và `isPassword` đều absent/false.
 */
type InputModeProps = {
  isTextArea?: false;
  isPassword?: false;
} & AntdInputProps;

/**
 * TextArea mode: renders <Input.TextArea />.
 * Discriminator: `isTextArea = true`.
 */
type TextAreaModeProps = {
  isTextArea: true;
  isPassword?: never;
} & AntdTextAreaProps;

/**
 * Password mode: renders <Input.Password /> (shows/hides with eye icon).
 * Discriminator: `isPassword = true`.
 */
type PasswordModeProps = {
  isPassword: true;
  isTextArea?: never;
} & AntdPasswordProps;

/** Discriminated union: exactly one of text / textarea / password */
type CustomInputProps = InputModeProps | TextAreaModeProps | PasswordModeProps;

// Static sub-component type so callers can do `<CustomInput.Password />`
// in the same style as antd's `<Input.Password />`.
type CustomInputComponent = React.FC<CustomInputProps> & {
  Password: React.FC<Omit<PasswordModeProps, 'isPassword'>>;
  TextArea: React.FC<Omit<TextAreaModeProps, 'isTextArea'>>;
};

const CustomInput: CustomInputComponent = ((props: CustomInputProps) => {
  // ===== TextArea mode =====
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

  // ===== Password mode =====
  if (props.isPassword) {
    const {
      placeholder,
      maxLength = 200,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // ===== Default: plain Input =====
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

// Sugar: allow `<CustomInput.Password ... />` without having to pass `isPassword`
CustomInput.Password = (props) => <CustomInput {...props} isPassword />;
CustomInput.TextArea = (props) => <CustomInput {...props} isTextArea />;

export default CustomInput;
