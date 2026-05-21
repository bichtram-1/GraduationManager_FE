import { FormOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Typography, Modal } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '../../types/I18nKeyType';
import { cn } from '../../constants/commonConst';

const { Text } = Typography;

interface ConfigItem {
  isCreate: boolean;
  icon?: ReactNode;
  title: string;
  subTitle?: string;
  customContent?: unknown;
  initialValues?: Record<string, unknown>;
  formItem: ReactNode;
  onSave: (values: unknown) => void;
}

interface ConfigCardProps {
  item: ConfigItem;
  loading?: boolean;
}

const ConfigCard = ({ item }: ConfigCardProps) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();
      item.onSave(values);
      setIsModalOpen(false);
    } catch {
      console.log('error');
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      if (!item.isCreate && item.initialValues) {
        form.setFieldsValue(item.initialValues);
      }
    }
  }, [isModalOpen, item.isCreate, item.initialValues, form]);

  const customTitle = item.subTitle
    ? 'text-2xl font-bold'
    : 'text-xl text-titleConfigText font-medium';
  return (
    <>
      <Card className="h-full [&>.ant-card-body]:h-full">
        <div className="flex justify-between h-full">
          <div className="flex items-start gap-4">
            {item.icon && (
              <div className="text-[32px] text-blue-500 -mt-2">{item.icon}</div>
            )}

            <div className="flex flex-col h-full justify-between">
              <div className="mb-2 ">
                <Text className={cn(customTitle)}>{item.title}</Text>
              </div>

              {item.subTitle && (
                <Text type="secondary" className="block mb-3">
                  {item.subTitle}
                </Text>
              )}

              {!item.isCreate && item.customContent}
            </div>
          </div>

          <div>
            <Button
              icon={item.isCreate ? <PlusOutlined /> : <FormOutlined />}
              className="text-editConfigText text-2xl border-none"
              type="text"
              onClick={handleEdit}
            />
          </div>
        </div>
      </Card>

      <Modal
        open={isModalOpen}
        //   onCancel={handleCancel}
        footer={null}
        closable={false}
        centered
        destroyOnClose={true}
      >
        <Form
          form={form}
          preserve={false}
          onFinish={handleSave}
          layout="vertical"
          className="-ml-1 -mr-1"
        >
          {item.formItem}
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={handleCancel}>
              {t(getKey("cancel_btn"))}
            </Button>
            <Button type="primary" htmlType="submit" onClick={form.submit}>
              {t(getKey("save_btn"))}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default ConfigCard;
