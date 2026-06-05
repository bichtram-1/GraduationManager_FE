import React from 'react';
import { Button, Tag } from 'antd';
import FilterTable from '../../components/shared/table/FilterTable';
import ClassForm from './components/ClassForm';
import { classHooks } from '../../hooks/useClasses';
import type { IListClass } from '../../type/ClassType';

const ClassesAdminPage = () => {
  const { useFetchListClasses, useCreateClass, useUpdateClass, useDeleteClass } = classHooks;
  const create = useCreateClass();
  const update = useUpdateClass();
  const del = useDeleteClass();

  const rows: any[] = [];

  const columns = [
    { title: 'Mã lớp', dataIndex: 'code' },
    { title: 'Tên lớp', dataIndex: 'name' },
    { title: 'Niên khóa', dataIndex: 'year' },
    { title: 'Giảng viên chủ nhiệm', dataIndex: 'supervisor' },
    { title: 'Số SV', dataIndex: 'members', render: (m: any[]) => <Tag>{m?.length || 0}</Tag> },
    // action column removed as requested
  ];

  return (
    <div>
      <FilterTable
        pageTitle="Quản lý lớp"
        columns={columns}
        useQueryHook={useFetchListClasses}
        createInfo={{ type: 'modal', modalInfo: { modalContent: <ClassForm />, modalProps: { centered: true, width: 720, title: 'Tạo lớp' }, modalFunc: create as any } }}
        updateInfo={{ type: 'modal', modalInfo: { modalContent: <ClassForm />, modalProps: { centered: true, width: 720, title: 'Chỉnh sửa lớp' }, modalFunc: update as any } }}
        detailInfo={{ type: 'modal', modalInfo: { modalContent: <ClassForm disabled />, modalProps: { centered: true, width: 720, title: 'Chi tiết lớp', footer: null }, modalFunc: classHooks.useFetchDetailClass as any } }}
        deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: del as any } }}
      />
    </div>
  );
};

export default ClassesAdminPage;
