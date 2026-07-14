import React from 'react';
import { Form, Input, Select, Button, Table, Alert, Tag, Divider, message } from 'antd';
import dayjs from 'dayjs';
import { UserAddOutlined, DeleteOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import type { BatchType, IDetailPeriod } from '../../../type/PeriodType';
import { periodApi } from '../../../api/periodApi';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { STATUS_CODE, DATE_DISPLAY_FORMAT } from '../../../constants/commonConst';
import { classHooks } from '../../../hooks/useClasses';
import { userHooks } from '../../../hooks/useUsers';
import CustomDatePicker from '../../../components/shared/input/CustomDatePicker';
import type { IListClass } from '../../../type/ClassType';
import type { IListUser } from 'src/type/UserType';

type ExternalStudent = IListUser;

type Props = {
  tab: BatchType;
  disabled?: boolean;
  detail?: IDetailPeriod;
};

const PeriodForm: React.FC<Props> = ({ tab, disabled: initialDisabled, detail }) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();

  const isClosed = detail?.status === STATUS_CODE.CLOSED;
  const disabled = initialDisabled || isClosed;

  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState<IListUser | null>(null);

  // Fetch students for search dropdown
  const { data: studentsData, isLoading: isStudentsLoading } = userHooks.useFetchListUsers({
    role: 'student',
    keyword: searchKeyword,
    page: 1,
    limit: 15,
  });

  const studentsList = studentsData?.rows ?? [];

  React.useEffect(() => {
    if (form) {
      form.setFieldValue('type', tab);
    }
  }, [form, tab]);

  const { data: classesData, isLoading: isClassesLoading } = classHooks.useFetchListClasses();
  const classesList: IListClass[] = classesData?.rows ?? [];

  const classOptions = React.useMemo(() => {
    return classesList.map((c) => ({
      value: c.id,
      label: c.name,
    }));
  }, [classesList]);

  // Watch fields reactively from Ant Design Form
  const externalStudents: ExternalStudent[] = Form.useWatch('externalStudents', form) || [];
  const externalStudentIds: string[] = Form.useWatch('externalStudentIds', form) || [];
  const selectedClassIds: string[] = Form.useWatch('classIds', form) || [];

  // Filter selected classes to check if student is already in them
  const selectedClasses = React.useMemo(() => {
    return classesList.filter((c) => selectedClassIds.includes(c.id));
  }, [classesList, selectedClassIds]);

  const isStudentInSelectedClasses = (student: IListUser | null) => {
    if (!student) return false;
    return selectedClasses.some((c) => c.name === student.className);
  };

  // Automatically remove manual students if their class is selected
  React.useEffect(() => {
    if (disabled) return;
    if (!externalStudents || externalStudents.length === 0) return;

    // Check if the current form values match the initial db detail values.
    // If they are unchanged, it means it is the initial load, so we skip execution.
    const initialClassIds = detail?.classIds || [];
    const isClassIdsUnchanged = initialClassIds.length === selectedClassIds.length &&
      initialClassIds.every((id) => selectedClassIds.includes(id));

    const initialExternalStudentIds = detail?.externalStudentIds || [];
    const isExternalStudentsUnchanged = initialExternalStudentIds.length === externalStudentIds.length &&
      initialExternalStudentIds.every((id) => externalStudentIds.includes(id));

    if (isClassIdsUnchanged && isExternalStudentsUnchanged) {
      return;
    }

    const selectedClassesNames = selectedClasses.map((c) => c.name);
    const duplicates = externalStudents.filter((s) => s.className ? selectedClassesNames.includes(s.className) : false);

    if (duplicates.length > 0) {
      const duplicateNames = duplicates.map((s) => `${s.name} (${s.id})`).join(', ');
      message.warning(
        `Đã tự động loại bỏ sinh viên: ${duplicateNames} khỏi danh sách tự do do lớp học của họ đã được chọn tham gia đợt.`
      );

      const updatedStudents = externalStudents.filter((s) => s.className ? !selectedClassesNames.includes(s.className) : true);
      const updatedIds = updatedStudents.map((s) => s.id);

      form.setFieldsValue({
        externalStudents: updatedStudents,
        externalStudentIds: updatedIds,
      });
    }
  }, [selectedClassIds, selectedClasses, form, disabled, detail, externalStudents, externalStudentIds]);

  const handleAddStudent = () => {
    if (!selectedStudent) return;

    // Check if already in the external list
    const isAlreadyExternal = externalStudents.some((s) => s.id === selectedStudent.id);
    if (isAlreadyExternal) {
      message.warning('Sinh viên này đã có trong danh sách tự do!');
      return;
    }

    if (isStudentInSelectedClasses(selectedStudent)) {
      message.warning('Sinh viên này đã thuộc lớp học được chọn tham gia đợt!');
      return;
    }

    const updatedStudents = [...externalStudents, { ...selectedStudent }];
    const updatedIds = [...externalStudentIds, selectedStudent.id];

    form.setFieldsValue({
      externalStudents: updatedStudents,
      externalStudentIds: updatedIds,
    });

    setSelectedStudent(null);
    setSearchKeyword('');
  };

  const handleRemoveStudent = (studentId: string) => {
    const updatedStudents = externalStudents.filter((s) => s.id !== studentId);
    const updatedIds = externalStudentIds.filter((id) => id !== studentId);

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
    ...(!disabled ? [{
      title: 'Thao tác',
      key: 'action',
      width: '80px',
      align: 'center' as const,
      render: (_: unknown, record: ExternalStudent) => (
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
    return studentsList.map((sv) => ({
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
              Thêm sinh viên thủ công
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
                onChange={(_val, option) => {
                  const picked = Array.isArray(option) ? option[0] : option;
                  setSelectedStudent(picked ? (picked as unknown as { raw: IListUser }).raw : null);
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
            pagination={{ pageSize: 5, size: 'small', hideOnSinglePage: true, showSizeChanger: false }}
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

      <Form.Item
        name="name"
        label={t(getKey('period_name_label'))}
        validateTrigger="onBlur"
        rules={[
          { required: true, message: t(getKey('period_name_required')) },
          {
            async validator(_, value) {
              if (!value) return Promise.resolve();
              const name = value.trim();
              
              const isTttnName = /thực\s+tập|thuc\s+tap|\btt\b|\btt\d/i.test(name);
              const isDatnName = /đồ\s+án|do\s+an|\bda\b|\bda\d/i.test(name);

              if (tab === 'tttn') {
                if (isDatnName) {
                  return Promise.reject(new Error('Tên đợt chứa ký tự của ĐATN (đồ án/DA), vui lòng kiểm tra lại để tránh nhầm đợt!'));
                }
                if (!isTttnName) {
                  return Promise.reject(new Error('Tên đợt TTTN phải chứa ký tự liên quan như "Thực tập" hoặc "TT"'));
                }
              } else if (tab === 'datn') {
                if (isTttnName) {
                  return Promise.reject(new Error('Tên đợt chứa ký tự của TTTN (thực tập/TT), vui lòng kiểm tra lại để tránh nhầm đợt!'));
                }
                if (!isDatnName) {
                  return Promise.reject(new Error('Tên đợt ĐATN phải chứa ký tự liên quan như "Đồ án" hoặc "DA"'));
                }
              }

              // Check uniqueness via API in real-time
              try {
                const resp = await periodApi.getListPeriod({ page: 1, type: 'all', status: 'all', limit: 1000 });
                const list = resp?.rows ?? [];
                const isDuplicate = list.some(
                  (p) => p.name.trim().toLowerCase() === name.toLowerCase() && p.id !== detail?.id
                );
                if (isDuplicate) {
                  return Promise.reject(new Error(`Tên đợt tốt nghiệp "${name}" đã tồn tại. Vui lòng chọn tên khác!`));
                }
              } catch (_e) {
                // Ignore API list errors in validator
              }

              return Promise.resolve();
            }
          }
        ]}
      >
        <Input disabled={disabled} placeholder={tab === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'} />
      </Form.Item>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <Form.Item name="semester" label="Học kỳ" rules={[{ required: true, message: 'Vui lòng chọn học kỳ' }]}>
          <Select
            disabled={disabled}
            placeholder="Chọn học kỳ"
            options={[
              { value: '1', label: 'Học kỳ 1' },
              { value: '2', label: 'Học kỳ 2' },
              { value: 'HE', label: 'Học kỳ hè' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="schoolYear"
          label="Năm học"
          rules={[
            { required: true, message: 'Vui lòng nhập năm học' },
            {
              validator(_, value) {
                if (!value) return Promise.resolve();
                const match = value.match(/^(\d{4})-(\d{4})$/);
                if (!match) {
                  return Promise.reject(new Error('Định dạng năm học phải là YYYY-YYYY, VD: 2026-2027'));
                }
                const year1 = parseInt(match[1], 10);
                const year2 = parseInt(match[2], 10);
                if (year2 <= year1) {
                  return Promise.reject(new Error('Năm sau phải lớn hơn năm trước'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            disabled={disabled}
            placeholder="VD: 2026-2027"
            onChange={(e) => {
              let val = e.target.value.replace(/\s+/g, '');
              if (/^\d{8}$/.test(val)) {
                val = `${val.substring(0, 4)}-${val.substring(4, 8)}`;
                form.setFieldValue('schoolYear', val);
              }
            }}
          />
        </Form.Item>
      </div>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <Form.Item
          name="startDate"
          label={t(getKey('start_date'))}
          dependencies={['schoolYear', 'endDate']}
          rules={[
            { required: true, message: t(getKey('start_date_required')) },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const schoolYear = getFieldValue('schoolYear');
                const end = getFieldValue('endDate');
                if (value) {
                  if (schoolYear) {
                    const match = schoolYear.match(/^(\d{4})-(\d{4})$/);
                    if (match) {
                      const startYear = parseInt(match[1], 10);
                      const valYear = dayjs(value, DATE_DISPLAY_FORMAT, true).year();
                      if (valYear < startYear) {
                        return Promise.reject(new Error(`Ngày bắt đầu phải từ năm học ${startYear} trở đi`));
                      }
                    }
                  }
                  if (end && !dayjs(value, DATE_DISPLAY_FORMAT, true).isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Ngày bắt đầu phải trước ngày kết thúc đợt học'));
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <CustomDatePicker disabled={disabled} />
        </Form.Item>
        <Form.Item
          name="endDate"
          label={t(getKey('end_date'))}
          dependencies={['startDate', 'schoolYear']}
          rules={[
            { required: true, message: t(getKey('end_date_required')) },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue('startDate');
                const schoolYear = getFieldValue('schoolYear');
                if (value) {
                  const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                  if (start && !valDate.isAfter(dayjs(start, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                  }
                  if (schoolYear) {
                    const match = schoolYear.match(/^(\d{4})-(\d{4})$/);
                    if (match) {
                      const endYear = parseInt(match[2], 10);
                      if (valDate.year() > endYear) {
                        return Promise.reject(new Error(`Ngày kết thúc không được vượt quá năm học ${endYear}`));
                      }
                    }
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <CustomDatePicker disabled={disabled} />
        </Form.Item>
        {tab === 'datn' && (
          <Form.Item
            name="regOpenDate"
            label="Mở đăng ký"
            dependencies={['startDate', 'endDate']}
            rules={[
              { required: true, message: 'Vui lòng chọn ngày mở đăng ký' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue('startDate');
                  const end = getFieldValue('endDate');
                  if (value && start) {
                    const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                    const startDate = dayjs(start, DATE_DISPLAY_FORMAT, true);
                    if (valDate.isBefore(startDate)) {
                      return Promise.reject(new Error('Mở đăng ký không được trước Bắt đầu'));
                    }
                    if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Ngày mở đăng ký phải trước ngày kết thúc đợt học'));
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <CustomDatePicker disabled={disabled} />
          </Form.Item>
        )}

        {tab === 'datn' && (
          <Form.Item
            name="regDeadline"
            label={t(getKey('reg_deadline_label'))}
            dependencies={['regOpenDate', 'endDate']}
            rules={[
              { required: true, message: t(getKey('reg_deadline_required')) },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const regOpen = getFieldValue('regOpenDate');
                  const end = getFieldValue('endDate');
                  if (value) {
                    const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                    if (regOpen && !valDate.isAfter(dayjs(regOpen, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Hạn đăng ký phải sau ngày mở đăng ký'));
                    }
                    if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Hạn đăng ký phải trước ngày kết thúc đợt học'));
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <CustomDatePicker disabled={disabled} />
          </Form.Item>
        )}
      </div>

      <Divider orientation="left" className="!text-sm !text-slate-500">
        {tab === 'datn' ? 'Mốc báo cáo, phản biện & bảo vệ' : 'Mốc báo cáo & chấm điểm'}
      </Divider>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        {tab === 'tttn' && (
          <Form.Item
            name="reportStartDate"
            label="Bắt đầu nộp báo cáo tiến độ"
            dependencies={['startDate', 'reportDeadline', 'endDate']}
            rules={[
              { required: true, message: 'Vui lòng chọn ngày bắt đầu nộp báo cáo tiến độ' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const start = getFieldValue('startDate');
                  const reportDeadline = getFieldValue('reportDeadline');
                  const end = getFieldValue('endDate');
                  if (value) {
                    const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                    if (start && valDate.isBefore(dayjs(start, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Ngày bắt đầu nộp báo cáo tiến độ không được trước ngày bắt đầu đợt học'));
                    }
                    if (reportDeadline && !valDate.isBefore(dayjs(reportDeadline, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Ngày bắt đầu nộp báo cáo tiến độ phải trước hạn nộp báo cáo'));
                    }
                    if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Ngày bắt đầu nộp báo cáo tiến độ phải trước ngày kết thúc đợt học'));
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <CustomDatePicker disabled={disabled} />
          </Form.Item>
        )}

        <Form.Item
          name="reportDeadline"
          label="Hạn nộp báo cáo tiến độ"
          dependencies={tab === 'datn' ? ['regDeadline', 'endDate'] : ['reportStartDate', 'endDate']}
          rules={[
            { required: true, message: 'Vui lòng chọn hạn nộp báo cáo tiến độ' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const regDeadline = getFieldValue('regDeadline');
                const reportStart = getFieldValue('reportStartDate');
                const end = getFieldValue('endDate');
                if (value) {
                  const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                  if (tab === 'datn' && regDeadline && !valDate.isAfter(dayjs(regDeadline, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Hạn nộp báo cáo tiến độ phải sau hạn đăng ký'));
                  }
                  if (tab === 'tttn' && reportStart && !valDate.isAfter(dayjs(reportStart, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Hạn nộp báo cáo tiến độ phải sau ngày bắt đầu nộp báo cáo'));
                  }
                  if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Hạn nộp báo cáo tiến độ phải trước ngày kết thúc đợt học'));
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <CustomDatePicker disabled={disabled} />
        </Form.Item>

        {tab === 'datn' && (
          <>
            <Form.Item
              name="reviewStartDate"
              label="Bắt đầu phản biện"
              dependencies={['reportDeadline', 'endDate']}
              rules={[
                { required: true, message: 'Vui lòng chọn ngày bắt đầu phản biện' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const report = getFieldValue('reportDeadline');
                    const end = getFieldValue('endDate');
                    if (value) {
                      const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                      if (report && !valDate.isAfter(dayjs(report, DATE_DISPLAY_FORMAT, true))) {
                        return Promise.reject(new Error('Ngày bắt đầu phản biện phải sau hạn nộp báo cáo tiến độ'));
                      }
                      if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                        return Promise.reject(new Error('Ngày bắt đầu phản biện phải trước ngày kết thúc đợt học'));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <CustomDatePicker disabled={disabled} />
            </Form.Item>

            <Form.Item
              name="reviewEndDate"
              label="Kết thúc phản biện"
              dependencies={['reviewStartDate', 'endDate']}
              rules={[
                { required: true, message: 'Vui lòng chọn ngày kết thúc phản biện' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('reviewStartDate');
                    const end = getFieldValue('endDate');
                    if (value) {
                      const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                      if (start && !valDate.isAfter(dayjs(start, DATE_DISPLAY_FORMAT, true))) {
                        return Promise.reject(new Error('Ngày kết thúc phản biện phải sau ngày bắt đầu phản biện'));
                      }
                      if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                        return Promise.reject(new Error('Ngày kết thúc phản biện phải trước ngày kết thúc đợt học'));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <CustomDatePicker disabled={disabled} />
            </Form.Item>

            <Form.Item
              name="defenseStartDate"
              label="Bắt đầu bảo vệ"
              dependencies={['reviewEndDate', 'endDate']}
              rules={[
                { required: true, message: 'Vui lòng chọn ngày bắt đầu bảo vệ' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const reviewEnd = getFieldValue('reviewEndDate');
                    const end = getFieldValue('endDate');
                    if (value) {
                      const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                      if (reviewEnd && !valDate.isAfter(dayjs(reviewEnd, DATE_DISPLAY_FORMAT, true))) {
                        return Promise.reject(new Error('Ngày bắt đầu bảo vệ phải sau ngày kết thúc phản biện'));
                      }
                      if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                        return Promise.reject(new Error('Ngày bắt đầu bảo vệ phải trước ngày kết thúc đợt học'));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <CustomDatePicker disabled={disabled} />
            </Form.Item>

            <Form.Item
              name="defenseEndDate"
              label="Kết thúc bảo vệ"
              dependencies={['defenseStartDate', 'endDate']}
              rules={[
                { required: true, message: 'Vui lòng chọn ngày kết thúc bảo vệ' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue('defenseStartDate');
                    const end = getFieldValue('endDate');
                    if (value) {
                      const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                      if (start && !valDate.isAfter(dayjs(start, DATE_DISPLAY_FORMAT, true))) {
                        return Promise.reject(new Error('Ngày kết thúc bảo vệ phải sau ngày bắt đầu bảo vệ'));
                      }
                      if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                        return Promise.reject(new Error('Ngày kết thúc bảo vệ phải trước ngày kết thúc đợt học'));
                      }
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <CustomDatePicker disabled={disabled} />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="gradingStartDate"
          label="Bắt đầu chấm điểm"
          dependencies={tab === 'datn' ? ['defenseStartDate', 'endDate'] : ['reportStartDate', 'reportDeadline', 'endDate']}
          rules={[
            { required: true, message: 'Vui lòng chọn ngày bắt đầu chấm điểm' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const defenseStart = getFieldValue('defenseStartDate');
                const reportStart = getFieldValue('reportStartDate');
                const report = getFieldValue('reportDeadline');
                const end = getFieldValue('endDate');
                if (value) {
                  const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                  if (tab === 'datn') {
                    if (defenseStart && valDate.isBefore(dayjs(defenseStart, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Bắt đầu chấm điểm không được trước Bắt đầu bảo vệ'));
                    }
                  } else {
                    if (reportStart && !valDate.isAfter(dayjs(reportStart, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Ngày bắt đầu chấm điểm phải sau ngày bắt đầu nộp báo cáo tiến độ'));
                    }
                    if (report && !valDate.isAfter(dayjs(report, DATE_DISPLAY_FORMAT, true))) {
                      return Promise.reject(new Error('Ngày bắt đầu chấm điểm phải sau hạn nộp báo cáo tiến độ'));
                    }
                  }
                  if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Ngày bắt đầu chấm điểm phải trước ngày kết thúc đợt học'));
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <CustomDatePicker disabled={disabled} />
        </Form.Item>

        <Form.Item
          name="gradingEndDate"
          label="Kết thúc chấm điểm"
          dependencies={tab === 'datn' ? ['gradingStartDate', 'defenseEndDate', 'endDate'] : ['gradingStartDate', 'endDate']}
          rules={[
            { required: true, message: 'Vui lòng chọn ngày kết thúc chấm điểm' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue('gradingStartDate');
                const end = getFieldValue('endDate');
                const defenseEnd = getFieldValue('defenseEndDate');
                if (value) {
                  const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                  if (start && !valDate.isAfter(dayjs(start, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Ngày kết thúc chấm điểm phải sau ngày bắt đầu chấm điểm'));
                  }
                  if (tab === 'datn' && defenseEnd && !valDate.isAfter(dayjs(defenseEnd, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Ngày kết thúc chấm điểm phải sau ngày kết thúc bảo vệ'));
                  }
                  if (end && !valDate.isBefore(dayjs(end, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Ngày kết thúc chấm điểm phải trước ngày kết thúc đợt học'));
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <CustomDatePicker disabled={disabled} />
        </Form.Item>
      </div>
    </>
  );
};

export default PeriodForm;
