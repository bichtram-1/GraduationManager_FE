import { Form, Input, Select, Tag, Tabs, Button, Modal, Upload, Alert, Space, Typography, message } from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  FileExcelOutlined,
  UploadOutlined,
  DownloadOutlined,
  ExclamationCircleFilled,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '../../components/shared/table/FilterTable';
import { classHooks } from '../../hooks/useClasses';
import { userHooks } from '../../hooks/useUsers';
import {
  ICreateUser,
  IDetailUser,
  IListUser,
  IUpdateUser,
  UserRoleType,
  UserStatusType,
} from '../../type/UserType';
import ModalCreateEditUser from './components/ModalCreateEditUser';
import { cn, STATUS_CODE, USER_ROLE } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import type { UseQueryResult } from '@tanstack/react-query';

interface IUserListParams extends BaseListParams {
  role: UserRoleType;
  keyword?: string;
  className?: string;
  status?: UserStatusType;
}

const UsersPage = () => {
  const { t } = useTranslation();

  const createMutation = userHooks.useCreateUser();
  const updateMutation = userHooks.useUpdateUser();
  const deleteMutation = userHooks.useDeleteUser();
  const importMutation = userHooks.useImportStudents();
  const [role, setRole] = useState<UserRoleType>(USER_ROLE.STUDENT);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [fileList, setFileList] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const handleImportSubmit = () => {
    if (!selectedClass) {
      message.error('Vui lòng chọn Lớp học.');
      return;
    }
    if (fileList.length === 0) {
      message.error('Vui lòng chọn file Excel.');
      return;
    }

    const formData = new FormData();
    formData.append('file', fileList[0]);
    formData.append('className', selectedClass);

    setImportErrors([]);
    setImportSuccessMessage(null);

    importMutation.mutate(formData, {
      onSuccess: (data) => {
        if (data.success) {
          message.success(data.message || 'Import sinh viên thành công.');
          setImportSuccessMessage(data.message);
          
          if (data.errors && data.errors.length > 0) {
            setImportErrors(data.errors);
          } else {
            setTimeout(() => {
              handleCloseImportModal();
            }, 2000);
          }
        }
      },
      onError: (error: any) => {
        const errorData = error?.response?.data;
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          setImportErrors(errorData.errors);
          message.error(errorData.message || 'Import thất bại, vui lòng kiểm tra lại file.');
        } else if (errorData?.errors && typeof errorData.errors === 'object') {
          const firstErrorKey = Object.keys(errorData.errors)[0];
          const firstError = errorData.errors[firstErrorKey][0];
          message.error(firstError);
        } else {
          message.error(errorData?.message || error?.message || 'Có lỗi xảy ra khi import.');
        }
      },
    });
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setSelectedClass(undefined);
    setFileList([]);
    setImportErrors([]);
    setImportSuccessMessage(null);
  };

  const { data: classesData } = classHooks.useFetchListClasses();

  const classFilterOptions = useMemo(() => {
    if (!classesData?.rows) return [];
    return classesData.rows.map((cls: any) => ({
      value: cls.name,
      label: cls.name,
    }));
  }, [classesData]);

  const statusFilterOptions = [
    { value: STATUS_CODE.ACTIVE, label: 'Đang hoạt động' },
    { value: STATUS_CODE.INACTIVE, label: 'Khóa tài khoản' },
  ];

  const tabItems = [
    { key: USER_ROLE.STUDENT, label: t(getKey('student_management')), icon: <TeamOutlined /> },
    { key: USER_ROLE.TEACHER, label: t(getKey('teacher_management')), icon: <UserOutlined /> },
  ];

  const columns = useMemo(
    () => [
      {
        title: role === USER_ROLE.STUDENT ? t(getKey('student_id')) : t(getKey('teacher_id')),
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => <a className={cn('text-primary')}>{id}</a>,
        width: 140,
      },
      {
        title: t(getKey('fullname')),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
      },
      {
        title: t(getKey('email')),
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
      },
      {
        title: role === USER_ROLE.STUDENT ? t(getKey('class')) : t(getKey('department')),
        dataIndex: 'className',
        key: 'className',
        render: (value: string) => value || '-',
        width: 160,
      },
      {
        title: t(getKey('phone_number')),
        dataIndex: 'phone',
        key: 'phone',
        width: 140,
        render: (value: string) => value || '-',
      },
      {
        title: t(getKey('status')),
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: (status: UserStatusType) => {
          if (!status) return null;
          if (status === STATUS_CODE.ACTIVE) {
            return (
              <Tag
                className="!m-0 !rounded-full !px-2.5 !py-[2px] !border-none !bg-[var(--color-green-light)] !text-[var(--color-green-medium)]"
              >
                {t(getKey('status_active'))}
              </Tag>
            );
          }
          if (status === STATUS_CODE.INACTIVE) {
            return (
              <Tag
                className="!m-0 !rounded-full !px-2.5 !py-[2px] !border-none !bg-[var(--color-gold-light)] !text-[var(--color-gold-medium)]"
              >
                {t(getKey('status_inactive'))}
              </Tag>
            );
          }
          if (status === STATUS_CODE.DELETED) {
            return (
              <Tag
                className="!m-0 !rounded-full !px-2.5 !py-[2px] !border-none !bg-[var(--color-red-light)] !text-[var(--color-red-medium)]"
              >
                {t(getKey('status_deleted'))}
              </Tag>
            );
          }
          return <Tag className="!rounded-full">{status}</Tag>;
        },
      },
    ],
    [role, t]
  );

  const useRoleUsersQuery = (params: BaseListParams): UseQueryResult<ListResponseTypeObject<IListUser>, Error> => {
    const typedParams = params as IUserListParams;
    const query = userHooks.useFetchListUsers({ ...typedParams, role } as IUserListParams);
    const dataShape1 = query.data as ListResponseTypeObject<IListUser> | undefined;
    const dataShape2 = query.data as { results?: { objects?: ListResponseTypeObject<IListUser> } } | undefined;
    const rows = dataShape1?.rows ?? dataShape2?.results?.objects?.rows ?? [];
    const total = dataShape1?.total ?? dataShape2?.results?.objects?.total ?? 0;
    const data = { rows, total };
    return {
      ...query,
      data,
    } as UseQueryResult<ListResponseTypeObject<IListUser>, Error>;
  };

  const listParams: IUserListParams = {
    page: 1,
    limit: 10,
    role,
  };

  return (
    <div className={cn('relative overflow-hidden pb-4')}>
      <div className={cn('mb-5 flex items-center justify-start rounded-[22px] border border-slate-100 bg-white px-6 py-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}>
        <div>
          <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--color-blue-md)]/10 px-3 py-1 text-xs font-medium text-[var(--color-blue-login-mid)]')}>
            <FilterOutlined />
            {t(getKey('user_category'))}
          </div>
          <h1 className={cn('m-0 text-[34px] font-bold leading-[40px] text-navyDark')}>{t(getKey('user_management'))}</h1>
          <p className={cn('mt-2 mb-0 text-[18px] leading-[26px] text-grayDark')}>{t(getKey('user_management_desc'))}</p>
        </div>
      </div>

      <Tabs
        activeKey={role}
        onChange={(k) => setRole(k as UserRoleType)}
        items={tabItems.map((item) => ({
          key: item.key,
          label: (
            <span className={cn('flex items-center gap-2 text-sm font-medium')}>
              {item.icon}
              {item.label}
            </span>
          ),
        }))}
        className={cn('mb-5 rounded-[20px] border border-slate-100 bg-white px-4 pt-3 shadow-[0_12px_28px_rgba(15,23,42,0.05)]')}
      />

      <FilterTable<IListUser, IDetailUser, ICreateUser, IUpdateUser>
        title={role === USER_ROLE.STUDENT ? t(getKey('student_list')) : t(getKey('teacher_list'))}
        createButtonLabel={t(getKey('add_new_modal_btn'))}
        columns={columns}
        useQueryHook={useRoleUsersQuery}
        paramVariables={listParams}
        extraHeaderActions={
          role === USER_ROLE.STUDENT ? (
            <Button
              type="primary"
              ghost
              icon={<FileExcelOutlined />}
              onClick={() => setIsImportModalOpen(true)}
              className="!h-10 !rounded-[8px] !px-4 !flex !items-center !gap-2 !font-medium"
            >
              <span>Import Excel</span>
            </Button>
          ) : undefined
        }
        actions={{
          isDetail: true,
          isEdit: true,
          isDelete: true,
          isDeleteDisabled: (record) => (record as IListUser).status === STATUS_CODE.DELETED,
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
            modalContent: <ModalCreateEditUser mode="create" role={role} />,
            modalProps: {},
            modalFunc: createMutation,
          },
        }}
        updateInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditUser mode="edit" role={role} />,
            modalProps: {},
            modalFunc: updateMutation,
          },
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditUser mode="detail" role={role} />,
            modalProps: { footer: null },
            modalFunc: userHooks.useFetchDetailUser,
          },
        }}
        filterRender={() => (
          <div className={cn('grid grid-cols-1 gap-3 xl:grid-cols-12')}>
            {role === USER_ROLE.STUDENT ? (
              <>
                <Form.Item name="keyword" className={cn('xl:col-span-5 !mb-0')}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined className={cn('text-slate-400')} />}
                    placeholder={t(getKey('search_placeholder_student'))}
                    className={cn('!h-11 !rounded-[12px] !border-slate-300')}
                  />
                </Form.Item>
                <Form.Item name="className" className={cn('xl:col-span-4 !mb-0')}>
                  <Select
                    allowClear
                    showSearch
                    placeholder={t(getKey('student_filter_class'))}
                    className={cn('!h-11 !w-full')}
                    options={classFilterOptions}
                    filterOption={(input, option) =>
                      String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
                <Form.Item name="status" className={cn('xl:col-span-3 !mb-0')}>
                  <Select
                    allowClear
                    placeholder={t(getKey('filter_by_status'))}
                    className={cn('!h-11 !w-full')}
                    options={statusFilterOptions}
                  />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item name="keyword" className={cn('xl:col-span-8 !mb-0')}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined className={cn('text-slate-400')} />}
                    placeholder={t(getKey('search_placeholder_teacher'))}
                    className={cn('!h-11 !rounded-[12px] !border-slate-300')}
                  />
                </Form.Item>
                <Form.Item name="status" className={cn('xl:col-span-4 !mb-0')}>
                  <Select
                    allowClear
                    placeholder={t(getKey('filter_by_status'))}
                    className={cn('!h-11 !w-full')}
                    options={statusFilterOptions}
                  />
                </Form.Item>
              </>
            )}
          </div>
        )}
      />

      <Modal
        title={
          <Space>
            <FileExcelOutlined className={cn('text-green-600 text-xl')} />
            <span className={cn('font-bold text-lg text-slate-800')}>Import sinh viên từ Excel</span>
          </Space>
        }
        open={isImportModalOpen}
        onCancel={handleCloseImportModal}
        footer={[
          <Button key="cancel" onClick={handleCloseImportModal} className={cn('!h-10 !px-4 !rounded-lg')}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={importMutation.isPending}
            onClick={handleImportSubmit}
            disabled={!selectedClass || fileList.length === 0}
            className={cn('!h-10 !px-4 !rounded-lg !bg-primary hover:!bg-blueDark')}
          >
            Import
          </Button>,
        ]}
        width={600}
        destroyOnClose
        centered
        maskClosable={false}
      >
        <div className={cn('py-4')}>
          <div className={cn('space-y-4 flex flex-col gap-4')}>
            <div className={cn('flex flex-col gap-1.5')}>
              <label className={cn('block text-sm font-semibold text-slate-700')}>
                1. Chọn Lớp học <span className="text-red-500">*</span>
              </label>
              <Select
                showSearch
                placeholder="-- Vui lòng chọn Lớp học --"
                className={cn('w-full !h-11')}
                options={classFilterOptions}
                value={selectedClass}
                onChange={(value) => {
                  setSelectedClass(value);
                  setFileList([]);
                  setImportErrors([]);
                  setImportSuccessMessage(null);
                }}
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

            <div className={cn('flex flex-col gap-1.5')}>
              <label className={cn('block text-sm font-semibold text-slate-700')}>
                2. Chọn file Excel dữ liệu <span className="text-red-500">*</span>
              </label>
              <Upload
                accept=".xlsx, .xls"
                fileList={fileList}
                beforeUpload={(file) => {
                  if (!selectedClass) {
                    message.warning('Vui lòng chọn Lớp học trước khi chọn file Excel.');
                    return false;
                  }
                  setFileList([file]);
                  return false;
                }}
                onRemove={() => {
                  setFileList([]);
                }}
                disabled={!selectedClass}
              >
                <Button
                  icon={<UploadOutlined />}
                  disabled={!selectedClass}
                  className={cn('!h-11 rounded-lg border-dashed border-slate-300 hover:border-primary')}
                >
                  Chọn file Excel (.xlsx, .xls)
                </Button>
              </Upload>
              {!selectedClass && (
                <p className={cn('text-xs text-amber-600 mt-1 font-medium')}>
                  * Bạn cần chọn Lớp học ở bước 1 để kích hoạt chức năng chọn file.
                </p>
              )}
            </div>

            {importSuccessMessage && (
              <Alert
                message="Thành công"
                description={importSuccessMessage}
                type="success"
                showIcon
              />
            )}

            {importErrors.length > 0 && (
              <div className={cn('flex flex-col gap-1.5')}>
                <div className={cn('text-sm font-bold text-red-600 inline-flex items-center gap-1')}>
                  <ExclamationCircleFilled /> Danh sách lỗi dòng dữ liệu ({importErrors.length} lỗi):
                </div>
                <div className={cn('max-h-60 overflow-y-auto border border-red-100 rounded-lg bg-red-50/30 p-3 text-xs text-red-700 space-y-1 font-mono')}>
                  {importErrors.map((err, idx) => (
                    <div key={idx} className={cn('border-b border-red-100/50 pb-1 last:border-0 last:pb-0')}>
                      • {err}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
