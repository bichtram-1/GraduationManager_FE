import React from 'react';
import { Form, Input, InputNumber, Select, Button, Table, Space, Card, Alert, Tag, Divider, Tooltip } from 'antd';
import { UserAddOutlined, DeleteOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import type { BatchType } from '../../../type/PeriodType';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, DATE_DISPLAY_FORMAT } from '../../../constants/commonConst';
import { classHooks } from '../../../hooks/useClasses';
import { userHooks } from '../../../hooks/useUsers';

type Props = {
  tab: BatchType;
  disabled?: boolean;
  allowStudentListUpload?: boolean;
};

const PeriodForm: React.FC<Props> = ({ tab, disabled, allowStudentListUpload }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();

  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);

  // Fetch students for search dropdown
  const { data: studentsData, isLoading: isStudentsLoading } = userHooks.useFetchListUsers({
    role: 'student',
    keyword: searchKeyword,
    page: 1,
    limit: 15,
  });

  const studentsList = React.useMemo(() => {
    if (!studentsData) return [];
    if (Array.isArray(studentsData)) return studentsData;
    if (Array.isArray((studentsData as any).rows)) return (studentsData as any).rows;
    return [];
  }, [studentsData]);

  React.useEffect(() => {
    if (form) {
      form.setFieldValue('type', tab);
    }
  }, [form, tab]);

  const { data: classesData, isLoading: isClassesLoading } = classHooks.useFetchListClasses();
  const classesList = React.useMemo(() => {
    if (!classesData) return [];
    if (Array.isArray(classesData)) return classesData;
    if (Array.isArray((classesData as any).rows)) return (classesData as any).rows;
    return [];
  }, [classesData]);

  const classOptions = React.useMemo(() => {
    return classesList.map((c: any) => ({
      value: c.id,
      label: `${c.code} - ${c.name}`,
    }));
  }, [classesList]);

  // Watch fields reactively from Ant Design Form
  const externalStudents = Form.useWatch('externalStudents', form) || [];
  const externalStudentIds = Form.useWatch('externalStudentIds', form) || [];
  const selectedClassIds = Form.useWatch('classIds', form) || [];

  // Filter selected classes to check if student is already in them
  const selectedClasses = React.useMemo(() => {
    return classesList.filter((c: any) => selectedClassIds.includes(c.id));
  }, [classesList, selectedClassIds]);

  const isStudentInSelectedClasses = (student: any) => {
    if (!student) return false;
    return selectedClasses.some((c: any) => c.name === student.className);
  };

  const handleAddStudent = () => {
    if (!selectedStudent) return;
    
    // Check if already in the external list
    const isAlreadyExternal = externalStudents.some((s: any) => s.id === selectedStudent.id);
    if (isAlreadyExternal) return;

    const updatedStudents = [...externalStudents, { ...selectedStudent, reason: 'Rớt đợt trước' }];
    const updatedIds = [...externalStudentIds, selectedStudent.id];

    form.setFieldsValue({
      externalStudents: updatedStudents,
      externalStudentIds: updatedIds,
    });
    
    setSelectedStudent(null);
    setSearchKeyword('');
  };

  const handleRemoveStudent = (studentId: string) => {
    const updatedStudents = externalStudents.filter((s: any) => s.id !== studentId);
    const updatedIds = externalStudentIds.filter((id: string) => id !== studentId);

    form.setFieldsValue({
      externalStudents: updatedStudents,
      externalStudentIds: updatedIds,
    });
  };

  const studentColumns = [
    {
      title: 'MSSV',
      dataIndex: 'id',
      key: 'id',
      width: '130px',
      render: (text: string) => <span className="font-semibold text-slate-700">{text}</span>
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium text-slate-800">{text}</span>
    },
    {
      title: 'Lớp gốc',
      dataIndex: 'className',
      key: 'className',
      render: (text: string) => text ? <Tag color="blue" className="border-none bg-blue-50 text-blue-700 font-medium">{text}</Tag> : <span className="text-slate-400">Không có lớp</span>
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (text: string) => <Tag color="warning" className="border-none bg-amber-50 text-amber-700 font-medium">{text || 'Rớt đợt trước'}</Tag>
    },
    ...(!disabled ? [{
      title: 'Thao tác',
      key: 'action',
      width: '80px',
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => handleRemoveStudent(record.id)}
          className="hover:!bg-red-50 rounded-lg flex items-center justify-center mx-auto"
        />
      )
    }] : [])
  ];

  const studentOptions = React.useMemo(() => {
    return studentsList.map((sv: any) => ({
      value: sv.id,
      label: `${sv.id} - ${sv.name} (${sv.className || 'Không lớp'})`,
      raw: sv
    }));
  }, [studentsList]);

  return (
    <>
      <Form.Item name="type" initialValue={tab} hidden>
        <Input />
      </Form.Item>

      <Form.Item
        name="classIds"
        label={t(getKey('class_label')) || 'Lớp học'}
        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một lớp học!' }]}
      >
        <Select
          mode="multiple"
          allowClear
          loading={isClassesLoading}
          disabled={disabled}
          placeholder="Chọn các lớp học tham gia đợt..."
          optionFilterProp="label"
          options={classOptions}
          className="w-full"
        />
      </Form.Item>

      <Form.Item name="externalStudentIds" hidden />
      <Form.Item name="externalStudents" hidden />

      {/* Dynamic student list selection section */}
      <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserAddOutlined className="text-primary text-lg" />
            <span className="font-semibold text-slate-800 text-[15px]">
              Sinh viên tự do / Rớt đợt trước
            </span>
          </div>
          <Tag color="cyan" className="font-medium border-none bg-cyan-50 text-cyan-700">
            {externalStudents.length} sinh viên được thêm
          </Tag>
        </div>

        <Alert
          message={
            <div className="text-[13px] text-slate-600">
              Thêm các sinh viên rớt đợt trước hoặc sinh viên tự do không thuộc các lớp đã chọn ở trên.
            </div>
          }
          type="info"
          showIcon
          className="mb-4 border-none bg-blue-50/50"
        />

        {!disabled && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Select
                showSearch
                value={selectedStudent?.id || undefined}
                placeholder="Tìm kiếm sinh viên theo tên hoặc MSSV..."
                defaultActiveFirstOption={false}
                suffixIcon={<SearchOutlined />}
                filterOption={false}
                onSearch={(val) => setSearchKeyword(val)}
                onChange={(val, option: any) => {
                  setSelectedStudent(option ? option.raw : null);
                }}
                notFoundContent={isStudentsLoading ? 'Đang tìm...' : 'Không tìm thấy sinh viên'}
                className="w-full"
                options={studentOptions}
              />
              {selectedStudent && isStudentInSelectedClasses(selectedStudent) && (
                <div className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                  <InfoCircleOutlined />
                  Sinh viên này đã thuộc lớp học được chọn ở trên.
                </div>
              )}
            </div>
            <Button
              type="primary"
              onClick={handleAddStudent}
              disabled={!selectedStudent || isStudentInSelectedClasses(selectedStudent)}
              icon={<PlusOutlined />}
              className="h-[32px] rounded-lg font-medium bg-primary hover:bg-primary/95"
            >
              Thêm vào đợt
            </Button>
          </div>
        )}

        {externalStudents.length > 0 ? (
          <Table
            dataSource={externalStudents}
            columns={studentColumns}
            rowKey="id"
            pagination={{ pageSize: 5, size: 'small', hideOnSinglePage: true }}
            size="small"
            bordered={false}
            className="bg-white rounded-lg overflow-hidden border border-slate-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg border border-dashed border-slate-200">
            <UserOutlined className="text-slate-300 text-3xl mb-2" />
            <span className="text-slate-400 text-xs">Chưa có sinh viên tự do nào được thêm.</span>
          </div>
        )}
      </div>

      <Form.Item name="name" label={t(getKey('period_name_label'))} rules={[{ required: true, message: t(getKey('period_name_required')) }]}>
        <Input disabled={disabled} placeholder={tab === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'} />
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <Form.Item name="startDate" label={t(getKey('start_date'))} rules={[{ required: true, message: t(getKey('start_date_required')) }]}>
          <Input disabled={disabled} placeholder={DATE_DISPLAY_FORMAT} />
        </Form.Item>
        <Form.Item name="endDate" label={t(getKey('end_date'))} rules={[{ required: true, message: t(getKey('end_date_required')) }]}>
          <Input disabled={disabled} placeholder={DATE_DISPLAY_FORMAT} />
        </Form.Item>
        <Form.Item name="regDeadline" label={t(getKey('reg_deadline_label'))} rules={[{ required: true, message: t(getKey('reg_deadline_required')) }]}>
          <Input disabled={disabled} placeholder={DATE_DISPLAY_FORMAT} />
        </Form.Item>
        <Form.Item name="status" label={t(getKey('status'))} rules={[{ required: true, message: t(getKey('please_select_status')) }]}>
          <Select disabled={disabled} options={[
            { value: STATUS_CODE.OPEN, label: t(getKey('period_status_open')) },
            { value: STATUS_CODE.PUBLISHED, label: t(getKey('period_status_published')) },
            { value: STATUS_CODE.GRADING, label: t(getKey('period_status_grading')) },
            { value: STATUS_CODE.CLOSED, label: t(getKey('period_status_closed')) }
          ]} />
        </Form.Item>
      </div>

      {(tab === 'tttn') ? (
        <div className="mt-4 space-y-4 rounded-md border border-blue-200 bg-blue-50/40 p-4">
          <div className="text-sm font-medium text-gray-700">{t(getKey('tttn_config_title'))}</div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item name="numberDN" label={t(getKey('companies_number_label'))}>
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item name="numberSV" label={t(getKey('students_number_label'))}>
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4 rounded-md border border-green-200 bg-green-50/40 p-4">
          <div className="text-sm font-medium text-gray-700">{t(getKey('datn_config_title'))}</div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            <Form.Item name="numberTopics" label={t(getKey('topics_number_label'))}>
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
            <Form.Item name="numberCouncils" label={t(getKey('councils_number_label'))}>
              <InputNumber disabled={disabled} className="!w-full" min={0} />
            </Form.Item>
          </div>
        </div>
      )}
    </>
  );
};

export default PeriodForm;
