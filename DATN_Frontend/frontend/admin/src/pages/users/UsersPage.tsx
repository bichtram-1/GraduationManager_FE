import { Tag, Tabs, Input, Select } from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, FilterOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '@shared/components/table/FilterTable';
import { userHooks } from '../../hooks/useUsers';
import { IListUser, IDetailUser, ICreateUser, IUpdateUser } from '../../type/UserType';
import ModalCreateEditUser from './components/ModalCreateEditUser';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { BaseListParams } from '@shared/types/GeneralType';

const UsersPage = () => {
  const { t } = useTranslation();

  const createMutation = userHooks.useCreateUser();
  const updateMutation = userHooks.useUpdateUser();
  const deleteMutation = userHooks.useDeleteUser();
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  const tabItems = [
    { key: 'student', label: 'Quản lý sinh viên', icon: <TeamOutlined /> },
    { key: 'teacher', label: 'Quản lý giảng viên', icon: <UserOutlined /> },
  ];

  const columns = useMemo(() => [
    {
      title: 'MSSV',
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
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
      render: (v: string) => v || '-',
      width: 120,
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        if (!status) return null;
        if (status === 'active') {
          return <Tag style={{ backgroundColor: '#E8F9EE', color: '#00A65A', borderRadius: 999, padding: '0 10px' }}>Đang học</Tag>;
        }
        if (status === 'inactive') {
          return <Tag style={{ backgroundColor: '#FFF7E6', color: '#D08A00', borderRadius: 999, padding: '0 10px' }}>Bảo lưu</Tag>;
        }
        if (status === 'deleted') {
          return <Tag style={{ backgroundColor: '#FFEDED', color: '#C53030', borderRadius: 999, padding: '0 10px' }}>Đã xóa</Tag>;
        }
        return <Tag className="!rounded-full">{status}</Tag>;
      },
    },
  ], []);

  const useRoleUsersQuery = (params: BaseListParams) => {
    return userHooks.useFetchListUsers({ ...params, role } as BaseListParams & {
      role: 'student' | 'teacher';
    }) as ReturnType<typeof userHooks.useFetchListUsers>;
  };

  const listParams = {
    page: 1,
    limit: 10,
    role,
  } as BaseListParams & { role: 'student' | 'teacher' };

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
        onChange={(k) => setRole(k as any)}
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
        useQueryHook={useRoleUsersQuery as any}
        paramVariables={listParams as any}
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
            modalContent: <ModalCreateEditUser />,
            modalProps: {},
            modalFunc: createMutation,
          },
        }}
        updateInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditUser />,
            modalProps: {},
            modalFunc: updateMutation,
          },
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditUser />,
            modalProps: {},
            modalFunc: userHooks.useFetchDetailUser,
          },
        }}
        filterRender={() => (
          <div className={cn('grid grid-cols-1 gap-3 xl:grid-cols-12')}>
            <div className={cn('xl:col-span-5')}>
              <Input
                allowClear
                prefix={<SearchOutlined className={cn('text-slate-400')} />}
                placeholder={role === 'student' ? 'Tìm theo MSSV, họ tên, lớp...' : 'Tìm theo mã GV, họ tên, khoa...'}
                className={cn('!h-11 !rounded-[12px] !border-slate-300')}
              />
            </div>
            <div className={cn('xl:col-span-3')}>
              <Select
                placeholder={role === 'student' ? 'Tất cả lớp' : 'Tất cả khoa'}
                className={cn('!h-11 !w-full')}
                options={role === 'student'
                  ? [
                      { value: 'all', label: 'Tất cả lớp' },
                      { value: 'KTPM2020', label: 'KTPM2020' },
                      { value: 'CNPM2020', label: 'CNPM2020' },
                      { value: 'HTTT2020', label: 'HTTT2020' },
                    ]
                  : [
                      { value: 'all', label: 'Tất cả khoa' },
                      { value: 'Khoa CNPM', label: 'Khoa CNPM' },
                      { value: 'Khoa HTTT', label: 'Khoa HTTT' },
                      { value: 'Khoa KHMT', label: 'Khoa KHMT' },
                    ]}
              />
            </div>
            <div className={cn('xl:col-span-4')}>
              <Select
                placeholder={role === 'student' ? 'Tất cả trạng thái' : 'Tất cả chức danh'}
                className={cn('!h-11 !w-full')}
                options={role === 'student'
                  ? [
                      { value: 'all', label: 'Tất cả trạng thái' },
                      { value: 'active', label: 'Đang học' },
                      { value: 'inactive', label: 'Bảo lưu' },
                      { value: 'deleted', label: 'Đã xóa' },
                    ]
                  : [
                      { value: 'all', label: 'Tất cả chức danh' },
                      { value: 'teacher', label: 'Giảng viên' },
                      { value: 'master', label: 'Thạc sĩ' },
                      { value: 'doctor', label: 'Tiến sĩ' },
                      { value: 'associate', label: 'Phó Giáo sư' },
                    ]}
              />
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default UsersPage;
