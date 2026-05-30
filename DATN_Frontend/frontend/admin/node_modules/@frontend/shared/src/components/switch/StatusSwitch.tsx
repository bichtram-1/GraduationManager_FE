import { Modal, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '../../types/I18nKeyType';

interface StatusSwitchProps {
  checked: boolean;
  checkedValue?: string;
  uncheckedValue?: string;
  useQueryHook: unknown;
  params: unknown;
  id: string;
  index: number;
  currentValue?: string;
  disabled?: boolean;
  fieldKey?: string;
  isConfirm?: boolean;
  confirmContent?: string;
  buildBody?: (fieldKey: string, checked: boolean) => void;
}

interface StatusProps {
  status: string;
}

export const StatusSwitch: React.FC<StatusSwitchProps> = ({
  checked,
  checkedValue,
  uncheckedValue,
  useQueryHook,
  params,
  id,
  index,
  currentValue,
  disabled = false,
  fieldKey = 'status',
  isConfirm = true,
  confirmContent,
  buildBody = (fieldKey, checked) => ({ [fieldKey]: !checked }),
}) => {
  const updateStatusMutation = useQueryHook();
  const { t } = useTranslation();
  const handleChangeStatus = () => {

    const body = buildBody(fieldKey, checked);

    if(isConfirm) {
      return Modal.confirm({
        centered: true,
        title: t(getKey("are_you_sure_change_status")),
        content: confirmContent ?? t(getKey("this_action_cannot_be_undone")),
        okButtonProps: {
          type: 'primary',
          danger: true,
        },
        cancelButtonProps: {
          type: 'default',
          danger: true,
        },
        onOk() {
          updateStatusMutation.mutate({
            id,
            body,
            index,
            params,
          });
        },
      });
    }

    updateStatusMutation.mutate({
      id,
      body,
      index,
      params,
    });
  };

  return (
    <Switch
      checked={checked}
      onChange={handleChangeStatus}
      disabled={disabled}
      checkedChildren={checkedValue}
      unCheckedChildren={uncheckedValue}
      loading={updateStatusMutation?.isLoading}
    />
  );
};
