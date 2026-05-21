import { CopyOutlined } from '@ant-design/icons';
import { Button, Flex, TableColumnsType, Tag, Tooltip, message } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '@shared/components/table/FilterTable';
import { codeHooks } from '../../hooks/useCodes';
import { ICreateCode, IDetailCode, IListCode, IUpdateCode } from '../../type/CodeType';
import { IValueLabel } from '../../type/UserType';

// Status matches backend `CodeStatus` enum (code.entity.ts).
const CODE_STATUS = { USED: 'used', UNUSED: 'unused' } as const;
import { cn, DATE_DISPLAY_FORMAT } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import ModalCreateCode from './components/ModalCreateCode';

const CodesPage = () => {
  const { t } = useTranslation();

  const createMutation = codeHooks.useCreateCode();
  const deleteMutation = codeHooks.useDeleteCode();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success(t(getKey('code_copied')));
  };

  const columns: TableColumnsType<IListCode> = useMemo(
    () => [
      {
        title: t(getKey('code')),
        dataIndex: 'code',
        key: 'code',
        fixed: 'left',
        render: (code: string) => (
          <Flex gap={8} align="center">
            <span className={cn('rounded bg-bgAdvanceSection px-2 py-1 font-mono text-sm font-bold')}>
              {code}
            </span>
            <Tooltip title={t(getKey('copy_code'))}>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyCode(code);
                }}
              />
            </Tooltip>
          </Flex>
        ),
      },
      {
        title: t(getKey('assigned_to')),
        dataIndex: 'userInfo',
        key: 'userInfo',
        ellipsis: true,
        render: (userInfo: IValueLabel | undefined) =>
          userInfo?.label || t(getKey('not_available')),
      },
      {
        title: t(getKey('course')),
        dataIndex: 'coursesInfo',
        key: 'coursesInfo',
        render: (coursesInfo: IValueLabel[] | undefined) => (
          <Flex gap={4} wrap="wrap">
            {coursesInfo?.map((course) => (
              <Tag key={course.value} color="blue" className="!m-0 !whitespace-nowrap">
                {course.label}
              </Tag>
            ))}
          </Flex>
        ),
      },
      {
        title: t(getKey('created_date')),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: string) => date ? dayjs(date).format(DATE_DISPLAY_FORMAT) : '',
      },
      {
        title: t(getKey('status')),
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => {
          const isUsed = status === CODE_STATUS.USED;
          return (
            <Tag
              className={cn('!rounded-full !px-2 !py-0.5')}
              color={isUsed ? 'success' : 'default'}
            >
              {isUsed ? t(getKey('status_used')) : t(getKey('status_unused'))}
            </Tag>
          );
        },
      },
    ],
    [t],
  );

  return (
    <FilterTable<IListCode, IDetailCode, ICreateCode, IUpdateCode>
      pageTitle={t(getKey('code_management'))}
      pageSubtitle={t(getKey('code_management_desc'))}
      title={t(getKey('code_list'))}
      createButtonLabel={t(getKey('create_code'))}
      columns={columns}
      useQueryHook={codeHooks.useFetchListCodes}
      actions={{
        isDetail: false,
        isEdit: false,
        isDelete: true,
        isDeleteDisabled: (record) => (record as IListCode).status === CODE_STATUS.USED,
      }}
      deleteInfo={{
        type: 'modal',
        modalInfo: {
          modalContent: null,
          modalProps: {},
          modalFunc: deleteMutation,
        },
      }}
      createInfo={{
        type: 'modal',
        modalInfo: {
          modalContent: <ModalCreateCode />,
          modalProps: {},
          modalFunc: createMutation,
        },
      }}
    />
  );
};

export default CodesPage;
