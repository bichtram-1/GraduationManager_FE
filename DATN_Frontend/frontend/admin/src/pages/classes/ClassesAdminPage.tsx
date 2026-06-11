import React, { useMemo } from 'react';
import { Form, Input, Select, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import FilterTable from '../../components/shared/table/FilterTable';
import ClassForm from './components/ClassForm';
import { classHooks } from '../../hooks/useClasses';
import type { IListClass, ICreateClass, IUpdateClass, IDetailClass } from '../../type/ClassType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import type { BaseListParams } from '@shared/types/GeneralType';
import { STATUS_CODE } from '../../constants/commonConst';

const ClassesAdminPage = () => {
  const { t } = useTranslation();
  const { useFetchListClasses, useUpdateClass, useDeleteClass } = classHooks;
  const { data: classList } = useFetchListClasses();
  const update = useUpdateClass();
  const del = useDeleteClass();

  const allRows = classList?.rows ?? [];

  const levels = useMemo(() => Array.from(new Set(allRows.map((c) => c.level).filter(Boolean))), [allRows]);
  const courses = useMemo(() => Array.from(new Set(allRows.map((c) => c.course).filter(Boolean))), [allRows]);
  const majors = useMemo(() => Array.from(new Set(allRows.map((c) => c.major).filter(Boolean))), [allRows]);

  const useFilteredClassesQuery = (params: BaseListParams) => {
    const query = useFetchListClasses();
    const typedParams = params as BaseListParams & { keyword?: string; level?: string; course?: string; major?: string };
    const keyword = (typedParams.keyword ?? '').trim().toLowerCase();
    const level = typedParams.level;
    const course = typedParams.course;
    const major = typedParams.major;

    const sourceRows = (query.data?.rows ?? []) as IListClass[];
    const filteredRows = sourceRows.filter((c) => {
      if (level && level !== 'all' && c.level !== level) return false;
      if (course && course !== 'all' && c.course !== course) return false;
      if (major && major !== 'all' && c.major !== major) return false;
      if (keyword) {
        const match = [c.code, c.name, c.supervisor || ''].join(' ').toLowerCase().includes(keyword);
        if (!match) return false;
      }
      return true;
    });

    const data = { rows: filteredRows, total: filteredRows.length };
    return {
      ...query,
      data,
    } as any;
  };

  const columns = [
    { title: t(getKey('class_code')), dataIndex: 'code', key: 'code' },
    { title: t(getKey('class_name_full')), dataIndex: 'name', key: 'name', ellipsis: true },
    { title: t(getKey('education_level')), dataIndex: 'level', key: 'level' },
    { title: t(getKey('course_class_term')), dataIndex: 'course', key: 'course' },
    { title: t(getKey('major_branch')), dataIndex: 'major', key: 'major', ellipsis: true },
    { title: t(getKey('supervisor_teacher')), dataIndex: 'supervisor', key: 'supervisor', ellipsis: true },
  ];

  return (
    <div>
      <Card className="overflow-hidden rounded-[18px] border border-slate-100 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <FilterTable<IListClass, IDetailClass, ICreateClass, IUpdateClass>
          title={t(getKey('class_list'))}
          pageTitle={t(getKey('class_management'))}
          pageSubtitle={t(getKey('class_management_desc'))}
          columns={columns}
          useQueryHook={useFilteredClassesQuery}
          filterRender={() => (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-12 mb-4">
              <Form.Item name="keyword" className="xl:col-span-5 !mb-0">
                <Input allowClear prefix={<SearchOutlined className="text-slate-400" />} placeholder={t(getKey('search_class_placeholder'))} className="!h-11 !rounded-[12px] !border-slate-300" />
              </Form.Item>
              <Form.Item name="level" className="xl:col-span-3 !mb-0">
                <Select allowClear placeholder={t(getKey('education_level'))} className="!h-11 w-full" options={[{ value: 'all', label: t(getKey('all_levels')) }, ...levels.map((l) => ({ value: l, label: l }))]} />
              </Form.Item>
              <Form.Item name="course" className="xl:col-span-2 !mb-0">
                <Select allowClear placeholder={t(getKey('course_class_term'))} className="!h-11 w-full" options={[{ value: 'all', label: t(getKey('all_courses')) }, ...courses.map((c) => ({ value: c, label: c }))]} />
              </Form.Item>
              <Form.Item name="major" className="xl:col-span-2 !mb-0">
                <Select allowClear placeholder={t(getKey('major_branch'))} className="!h-11 w-full" options={[{ value: 'all', label: t(getKey('all_majors')) }, ...majors.map((m) => ({ value: m, label: m }))]} />
              </Form.Item>
            </div>
          )}
          updateInfo={{ type: 'modal', modalInfo: { modalContent: <ClassForm />, modalProps: { centered: true, width: 720, title: t(getKey('edit_class')) }, modalFunc: update as any } }}
          detailInfo={{ type: 'modal', modalInfo: { modalContent: <ClassForm disabled />, modalProps: { centered: true, width: 720, title: t(getKey('detail_class')), footer: null }, modalFunc: classHooks.useFetchDetailClass as any } }}
          deleteInfo={{ type: 'modal', modalInfo: { modalContent: null, modalProps: {}, modalFunc: del as any } }}
          formatInitialValues={(c) => ({ code: c?.code ?? '', name: c?.name ?? '', level: c?.level ?? '', course: c?.course ?? '', major: c?.major ?? '', supervisor: c?.supervisor ?? '', members: c?.members ?? [], maxStudents: c?.maxStudents ?? 40, status: c?.status ?? STATUS_CODE.ACTIVE_UP })}
          formatFormValues={(v) => v as unknown as ICreateClass}
          actions={{ isDetail: true, isEdit: true, isDelete: true }}
        />
      </Card>
    </div>
  );
};

export default ClassesAdminPage;
