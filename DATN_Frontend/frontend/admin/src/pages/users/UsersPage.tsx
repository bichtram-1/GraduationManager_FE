import { Button, Tag, Tooltip, Tabs, Input, Space } from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '@shared/components/table/FilterTable';
import { userHooks } from '../../hooks/useUsers';
import { IListUser, IDetailUser, ICreateUser, IUpdateUser } from '../../type/UserType';
import ModalCreateEditUser from './components/ModalCreateEditUser';
import { cn } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { DATE_DISPLAY_FORMAT } from '../../constants/commonConst';
import dayjs from 'dayjs';

const UsersPage = () => {
  const { t } = useTranslation();

  const createMutation = userHooks.useCreateUser();
  const updateMutation = userHooks.useUpdateUser();
  const deleteMutation = userHooks.useDeleteUser();
  const [role, setRole] = useState<'student' | 'teacher'>('student');

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

  return (
    <div>
      <Tabs activeKey={role} onChange={(k) => setRole(k as any)}>
        <Tabs.TabPane tab={'Quản lý sinh viên'} key="student" />
        <Tabs.TabPane tab={'Quản lý giảng viên'} key="teacher" />
      </Tabs>

      <FilterTable<IListUser, IDetailUser, ICreateUser, IUpdateUser>
        pageTitle={t(getKey('user_management'))}
        pageSubtitle={t(getKey('user_management_desc'))}
        title={role === 'student' ? 'Danh sách sinh viên' : 'Danh sách giảng viên'}
        createButtonLabel={t(getKey('add_new_modal_btn'))}
        columns={columns}
        useQueryHook={(params) => userHooks.useFetchListUsers({ ...params, role })}
        paramVariables={{ page: 1, limit: 10, role }}
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
          <div className="flex gap-3 items-center">
            <Input.Search placeholder="Tìm kiếm..." enterButton={false} style={{ width: 260, height: 40 }} />
            <Input placeholder="Bộ lọc 1" style={{ width: 240, height: 40 }} />
            <Input placeholder="Bộ lọc 2" style={{ width: 240, height: 40 }} />
          </div>
        )}
      />
    </div>
  );
};

export default UsersPage;
