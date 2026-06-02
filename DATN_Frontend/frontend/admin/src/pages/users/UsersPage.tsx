import { Form, Input, Select, Tag, Tabs } from 'antd';
import {
  FilterOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '../../components/shared/table/FilterTable';
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
import { cn } from '../../constants/commonConst';
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
  const [role, setRole] = useState<UserRoleType>('student');

  const classFilterOptions =
    role === 'student'
      ? [
          { value: 'KTPM2020', label: 'KTPM2020' },
          { value: 'CNPM2020', label: 'CNPM2020' },
          { value: 'HTTT2020', label: 'HTTT2020' },
        ]
      : [
          { value: 'Khoa CNPM', label: 'Khoa CNPM' },
          { value: 'Khoa HTTT', label: 'Khoa HTTT' },
          { value: 'Khoa KHMT', label: 'Khoa KHMT' },
        ];

  const statusFilterOptions = [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'deleted', label: 'Đã xóa' },
  ];

  const tabItems = [
    { key: 'student', label: 'Quản lý sinh viên', icon: <TeamOutlined /> },
    { key: 'teacher', label: 'Quản lý giảng viên', icon: <UserOutlined /> },
  ];

  const columns = useMemo(
    () => [
      {
        title: role === 'student' ? 'MSSV' : 'Mã giảng viên',
        dataIndex: 'id',
        key: 'id',
        render: (id: string) => <a className={cn('text-primary')}>{id}</a>,
        width: 140,
      },
      {
        title: 'Họ tên',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
      },
      {
        title: role === 'student' ? 'Lớp' : 'Khoa',
        dataIndex: 'className',
        key: 'className',
        render: (value: string) => value || '-',
        width: 160,
      },
      {
        title: 'SĐT',
        dataIndex: 'phone',
        key: 'phone',
        width: 140,
        render: (value: string) => value || '-',
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (status: UserStatusType) => {
          if (!status) return null;
          if (status === 'active') {
            return (
              <Tag
                style={{
                  backgroundColor: '#E8F9EE',
                  color: '#00A65A',
                  borderRadius: 999,
                  padding: '0 10px',
                }}
              >
                Đang hoạt động
              </Tag>
            );
          }
          if (status === 'inactive') {
            return (
              <Tag
                style={{
                  backgroundColor: '#FFF7E6',
                  color: '#D08A00',
                  borderRadius: 999,
                  padding: '0 10px',
                }}
              >
                Không hoạt động
              </Tag>
            );
          }
          if (status === 'deleted') {
            return (
              <Tag
                style={{
                  backgroundColor: '#FFEDED',
                  color: '#C53030',
                  borderRadius: 999,
                  padding: '0 10px',
                }}
              >
                Đã xóa
              </Tag>
            );
          }
          return <Tag className="!rounded-full">{status}</Tag>;
        },
      },
    ],
    [role]
  );

  const useRoleUsersQuery = (params: BaseListParams): UseQueryResult<ListResponseTypeObject<IListUser>, Error> => {
    const typedParams = params as IUserListParams;
    const query = userHooks.useFetchListUsers({ ...(typedParams), role } as IUserListParams);
    const dataShape1 = query.data as ListResponseTypeObject<IListUser> | undefined;
    const dataShape2 = query.data as { results?: { objects?: ListResponseTypeObject<IListUser> } } | undefined;
    const allRows = dataShape1?.rows ?? dataShape2?.results?.objects?.rows ?? [];
    const normalizedKeyword = (typedParams.keyword ?? '').trim().toLowerCase();

    const filteredRows = (allRows as IListUser[])
      .filter((row) => (role ? row.role === role : true))
      .filter((row) => {
        if (!normalizedKeyword) return true;
        return [row.id, row.name, row.email, row.className]
          .join(' ')
          .toLowerCase()
          .includes(normalizedKeyword);
      })
      .filter((row) => (typedParams.status ? row.status === typedParams.status : true))
      .filter((row) => (typedParams.className ? row.className === typedParams.className : true));

    const data = { rows: filteredRows, total: filteredRows.length };
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
          <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full bg-[#2196F3]/10 px-3 py-1 text-xs font-medium text-[#1976d2]')}>
            <FilterOutlined />
            Danh mục người dùng
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
        title={role === 'student' ? 'Danh sách sinh viên' : 'Danh sách giảng viên'}
        createButtonLabel={t(getKey('add_new_modal_btn'))}
        columns={columns}
        useQueryHook={useRoleUsersQuery}
        paramVariables={listParams}
        actions={{
          isDetail: true,
          isEdit: true,
          isDelete: true,
          isDeleteDisabled: (record) => (record as IListUser).status === 'deleted',
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
            <Form.Item name="keyword" className={cn('xl:col-span-5 !mb-0')}>
              <Input
                allowClear
                prefix={<SearchOutlined className={cn('text-slate-400')} />}
                placeholder={
                  role === 'student'
                    ? 'Tìm theo MSSV, họ tên, email, lớp...'
                    : 'Tìm theo mã giảng viên, họ tên, email, khoa...'
                }
                className={cn('!h-11 !rounded-[12px] !border-slate-300')}
              />
            </Form.Item>
            <Form.Item name="className" className={cn('xl:col-span-3 !mb-0')}>
              <Select
                allowClear
                placeholder={role === 'student' ? 'Lọc theo lớp' : 'Lọc theo khoa'}
                className={cn('!h-11 !w-full')}
                options={classFilterOptions}
              />
            </Form.Item>
            <Form.Item name="status" className={cn('xl:col-span-4 !mb-0')}>
              <Select
                allowClear
                placeholder="Lọc theo trạng thái"
                className={cn('!h-11 !w-full')}
                options={statusFilterOptions}
              />
            </Form.Item>
          </div>
        )}
      />
    </div>
  );
};

export default UsersPage;
