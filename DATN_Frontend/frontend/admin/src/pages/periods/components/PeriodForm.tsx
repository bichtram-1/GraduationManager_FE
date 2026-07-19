import React from 'react';
import { Form, Input, Select, Button, Table, Alert, Tag, Divider, message } from 'antd';
import dayjs from 'dayjs';
import { UserAddOutlined, DeleteOutlined, InfoCircleOutlined, SearchOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import type { BatchType, IDetailPeriod } from '../../../type/PeriodType';
import { periodApi } from '../../../api/periodApi';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { DATE_DISPLAY_FORMAT, isPeriodClosedForAdmin } from '../../../constants/commonConst';
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

  const isClosed = isPeriodClosedForAdmin(detail);
  const disabled = initialDisabled || isClosed;

  const [searchKeyword, setSearchKeyword] = React.useState('');
  const [selectedStudent, setSelectedStudent] = React.useState<IListUser | null>(null);
  const prevSchoolYearRef = React.useRef(detail?.schoolYear || '');

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
      if (!detail) {
        const currentName = form.getFieldValue('name');
        if (!currentName || currentName === 'ĐATN ' || currentName === 'TTTN ') {
          form.setFieldValue('name', tab === 'datn' ? 'ĐATN ' : 'TTTN ');
        }
      }
    }
  }, [form, tab, detail]);

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
  
  const startDateValue = Form.useWatch('startDate', form);
  const endDateValue = Form.useWatch('endDate', form);
  const regOpenDateValue = Form.useWatch('regOpenDate', form);
  const regDeadlineValue = Form.useWatch('regDeadline', form);
  const reportStartDateValue = Form.useWatch('reportStartDate', form);
  const reportDeadlineValue = Form.useWatch('reportDeadline', form);
  const reviewStartDateValue = Form.useWatch('reviewStartDate', form);
  const reviewEndDateValue = Form.useWatch('reviewEndDate', form);
  const defenseStartDateValue = Form.useWatch('defenseStartDate', form);
  const defenseEndDateValue = Form.useWatch('defenseEndDate', form);
  const gradingStartDateValue = Form.useWatch('gradingStartDate', form);
  const gradingEndDateValue = Form.useWatch('gradingEndDate', form);
  const schoolYearValue = Form.useWatch('schoolYear', form);

  const schoolYearRange = React.useMemo(() => {
    if (!schoolYearValue) return null;
    const match = schoolYearValue.match(/^(\d{4})-(\d{4})$/);
    if (!match) return null;
    return {
      start: dayjs(`${match[1]}-01-01`),
      end: dayjs(`${match[2]}-12-31`),
    };
  }, [schoolYearValue]);

  const isOutsideSchoolYear = React.useCallback((current: dayjs.Dayjs) => {
    if (!schoolYearRange) return false;
    return current.isBefore(schoolYearRange.start, 'day') || current.isAfter(schoolYearRange.end, 'day');
  }, [schoolYearRange]);

  React.useEffect(() => {
    if (disabled) return;

    const fields = tab === 'datn' 
      ? [
          'startDate', 
          'regOpenDate', 
          'regDeadline', 
          'reportStartDate', 
          'reportDeadline', 
          'reviewStartDate', 
          'reviewEndDate', 
          'defenseStartDate', 
          'defenseEndDate', 
          'gradingStartDate', 
          'gradingEndDate',
          'endDate'
        ]
      : [
          'startDate', 
          'reportStartDate', 
          'reportDeadline', 
          'gradingStartDate', 
          'gradingEndDate',
          'endDate'
        ];

    const values = form.getFieldsValue(fields);
    
    const isAfterOrEqualObj = (val: string | undefined, prevVal: string | undefined) => {
      if (!val || !prevVal) return true;
      const d = dayjs(val, DATE_DISPLAY_FORMAT, true);
      const prev = dayjs(prevVal, DATE_DISPLAY_FORMAT, true);
      return d.isAfter(prev, 'day') || d.isSame(prev, 'day');
    };

    const isAfterObj = (val: string | undefined, prevVal: string | undefined) => {
      if (!val || !prevVal) return true;
      const d = dayjs(val, DATE_DISPLAY_FORMAT, true);
      const prev = dayjs(prevVal, DATE_DISPLAY_FORMAT, true);
      return d.isAfter(prev, 'day');
    };

    let valuesChanged = false;
    const newValues = { ...values };

    // 0. startDate/endDate phải nằm trong Năm học - nếu đổi Năm học khiến ngày đã chọn
    // ra ngoài phạm vi thì tự xóa, đồng bộ với cách mọi field ngày khác trong form này
    // đều tự xóa field liên quan khi có thay đổi làm nó không còn hợp lệ.
    if (newValues.startDate && isOutsideSchoolYear(dayjs(newValues.startDate, DATE_DISPLAY_FORMAT, true))) {
      newValues.startDate = undefined;
      valuesChanged = true;
    }
    if (newValues.endDate && isOutsideSchoolYear(dayjs(newValues.endDate, DATE_DISPLAY_FORMAT, true))) {
      newValues.endDate = undefined;
      valuesChanged = true;
    }

    if (tab === 'datn') {
      // 1. regOpenDate must be >= startDate
      if (newValues.regOpenDate && !isAfterOrEqualObj(newValues.regOpenDate, newValues.startDate)) {
        newValues.regOpenDate = undefined;
        valuesChanged = true;
      }
      
      // 2. regDeadline must be > regOpenDate
      if (!newValues.regOpenDate) {
        if (newValues.regDeadline) {
          newValues.regDeadline = undefined;
          valuesChanged = true;
        }
      } else if (newValues.regDeadline && !isAfterObj(newValues.regDeadline, newValues.regOpenDate)) {
        newValues.regDeadline = undefined;
        valuesChanged = true;
      }
      
      // 3. reportStartDate must be >= regDeadline
      if (!newValues.regDeadline) {
        if (newValues.reportStartDate) {
          newValues.reportStartDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.reportStartDate && !isAfterOrEqualObj(newValues.reportStartDate, newValues.regDeadline)) {
        newValues.reportStartDate = undefined;
        valuesChanged = true;
      }
      
      // 4. reportDeadline must be > reportStartDate
      if (!newValues.reportStartDate) {
        if (newValues.reportDeadline) {
          newValues.reportDeadline = undefined;
          valuesChanged = true;
        }
      } else if (newValues.reportDeadline && !isAfterObj(newValues.reportDeadline, newValues.reportStartDate)) {
        newValues.reportDeadline = undefined;
        valuesChanged = true;
      }
      
      // 5. reviewStartDate must be > reportDeadline
      if (!newValues.reportDeadline) {
        if (newValues.reviewStartDate) {
          newValues.reviewStartDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.reviewStartDate && !isAfterObj(newValues.reviewStartDate, newValues.reportDeadline)) {
        newValues.reviewStartDate = undefined;
        valuesChanged = true;
      }
      
      // 6. reviewEndDate must be > reviewStartDate
      if (!newValues.reviewStartDate) {
        if (newValues.reviewEndDate) {
          newValues.reviewEndDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.reviewEndDate && !isAfterObj(newValues.reviewEndDate, newValues.reviewStartDate)) {
        newValues.reviewEndDate = undefined;
        valuesChanged = true;
      }
      
      // 7. defenseStartDate must be > reviewEndDate
      if (!newValues.reviewEndDate) {
        if (newValues.defenseStartDate) {
          newValues.defenseStartDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.defenseStartDate && !isAfterObj(newValues.defenseStartDate, newValues.reviewEndDate)) {
        newValues.defenseStartDate = undefined;
        valuesChanged = true;
      }
      
      // 8. defenseEndDate must be > defenseStartDate
      if (!newValues.defenseStartDate) {
        if (newValues.defenseEndDate) {
          newValues.defenseEndDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.defenseEndDate && !isAfterObj(newValues.defenseEndDate, newValues.defenseStartDate)) {
        newValues.defenseEndDate = undefined;
        valuesChanged = true;
      }
      
      // 9. gradingStartDate must be >= defenseStartDate
      if (!newValues.defenseStartDate) {
        if (newValues.gradingStartDate) {
          newValues.gradingStartDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.gradingStartDate && !isAfterOrEqualObj(newValues.gradingStartDate, newValues.defenseStartDate)) {
        newValues.gradingStartDate = undefined;
        valuesChanged = true;
      }
      
      // 10. gradingEndDate must be > gradingStartDate
      if (!newValues.gradingStartDate) {
        if (newValues.gradingEndDate) {
          newValues.gradingEndDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.gradingEndDate && !isAfterObj(newValues.gradingEndDate, newValues.gradingStartDate)) {
        newValues.gradingEndDate = undefined;
        valuesChanged = true;
      }
      
      // 11. gradingEndDate must be > defenseEndDate
      if (!newValues.defenseEndDate) {
        if (newValues.gradingEndDate) {
          newValues.gradingEndDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.gradingEndDate && !isAfterObj(newValues.gradingEndDate, newValues.defenseEndDate)) {
        newValues.gradingEndDate = undefined;
        valuesChanged = true;
      }

      // 12. endDate must be > gradingEndDate
      if (!newValues.gradingEndDate) {
        if (newValues.endDate) {
          newValues.endDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.endDate && !isAfterObj(newValues.endDate, newValues.gradingEndDate)) {
        newValues.endDate = undefined;
        valuesChanged = true;
      }
      
    } else {
      // 1. reportStartDate must be >= startDate
      if (newValues.reportStartDate && !isAfterOrEqualObj(newValues.reportStartDate, newValues.startDate)) {
        newValues.reportStartDate = undefined;
        valuesChanged = true;
      }
      
      // 2. reportDeadline must be > reportStartDate
      if (!newValues.reportStartDate) {
        if (newValues.reportDeadline) {
          newValues.reportDeadline = undefined;
          valuesChanged = true;
        }
      } else if (newValues.reportDeadline && !isAfterObj(newValues.reportDeadline, newValues.reportStartDate)) {
        newValues.reportDeadline = undefined;
        valuesChanged = true;
      }
      
      // 3. gradingStartDate must be > reportDeadline
      if (!newValues.reportDeadline) {
        if (newValues.gradingStartDate) {
          newValues.gradingStartDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.gradingStartDate && !isAfterObj(newValues.gradingStartDate, newValues.reportDeadline)) {
        newValues.gradingStartDate = undefined;
        valuesChanged = true;
      }
      
      // 4. gradingEndDate must be > gradingStartDate
      if (!newValues.gradingStartDate) {
        if (newValues.gradingEndDate) {
          newValues.gradingEndDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.gradingEndDate && !isAfterObj(newValues.gradingEndDate, newValues.gradingStartDate)) {
        newValues.gradingEndDate = undefined;
        valuesChanged = true;
      }
      
      // 5. endDate must be > gradingEndDate
      if (!newValues.gradingEndDate) {
        if (newValues.endDate) {
          newValues.endDate = undefined;
          valuesChanged = true;
        }
      } else if (newValues.endDate && !isAfterObj(newValues.endDate, newValues.gradingEndDate)) {
        newValues.endDate = undefined;
        valuesChanged = true;
      }
    }

    if (valuesChanged) {
      form.setFieldsValue(newValues);
    }
  }, [
    startDateValue,
    endDateValue,
    regOpenDateValue,
    regDeadlineValue,
    reportStartDateValue,
    reportDeadlineValue,
    reviewStartDateValue,
    reviewEndDateValue,
    defenseStartDateValue,
    defenseEndDateValue,
    gradingStartDateValue,
    gradingEndDateValue,
    schoolYearValue,
    isOutsideSchoolYear,
    tab,
    form,
    disabled
  ]);

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

              // Không cần kiểm tra nội dung tên có chứa "Thực tập"/"TT" hay "Đồ án"/"DA" nữa —
              // tiền tố "TTTN "/"ĐATN " đã được tự động điền và khoá cứng ở onChange bên dưới lúc
              // tạo mới, nên rule nội dung này chỉ còn gây từ chối nhầm khi sửa đợt cũ (tên cũ có
              // thể không theo đúng khuôn, vì prefix-lock chỉ áp dụng lúc tạo mới - xem !detail).

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
        <Input
          disabled={disabled}
          placeholder={tab === 'tttn' ? 'VD: TTTN HK1/2026-2027' : 'VD: ĐATN HK1/2026-2027'}
          onChange={(e) => {
            let val = e.target.value;
            // Chỉ khoá tiền tố lúc TẠO MỚI (giống effect tự điền tên mặc định cũng chỉ chạy
            // khi !detail) - sửa đợt cũ có tên không theo đúng khuôn này thì không đụng vào.
            if (!detail) {
              const prefix = tab === 'tttn' ? 'TTTN ' : 'ĐATN ';
              if (!val.startsWith(prefix)) {
                const idx = val.indexOf(prefix);
                if (idx >= 0) {
                  // Gõ lạc chỗ khiến tiền tố không còn ở đầu - đưa về đầu, giữ nguyên phần còn lại
                  val = prefix + val.slice(0, idx) + val.slice(idx + prefix.length);
                } else {
                  // Tiền tố bị xoá hẳn - khôi phục lại, giữ nguyên phần đã gõ thêm làm hậu tố
                  val = prefix + val;
                }
              }
            }
            form.setFieldValue('name', val);
          }}
        />
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
                if (match[1].startsWith('0') || match[2].startsWith('0')) {
                  return Promise.reject(new Error('Năm học không được bắt đầu bằng số 0, VD: 2026-2027'));
                }
                const year1 = parseInt(match[1], 10);
                const year2 = parseInt(match[2], 10);
                if (year2 !== year1 + 1) {
                  return Promise.reject(new Error('Năm học phải là 2 năm liên tiếp, VD: 2026-2027'));
                }
                return Promise.resolve();
              }
            }
          ]}
          validateTrigger="onBlur"
        >
          <Input
            disabled={disabled}
            placeholder="VD: 2026-2027"
            onChange={(e) => {
              // Chỉ giữ số và dấu gạch ngang - không cho gõ chữ/ký tự khác vào ô năm học.
              let val = e.target.value.replace(/[^\d-]/g, '');
              if (/^[1-9]\d{3}$/.test(val)) {
                const y = parseInt(val, 10);
                const newVal = `${y}-${y + 1}`;
                form.setFieldValue('schoolYear', newVal);
                prevSchoolYearRef.current = newVal;
                return;
              }
              if (/^[1-9]\d{7}$/.test(val)) {
                val = `${val.substring(0, 4)}-${val.substring(4, 8)}`;
                form.setFieldValue('schoolYear', val);
              }

              const prevMatch = prevSchoolYearRef.current.match(/^(\d{4})-(\d{4})$/);
              const currentMatch = val.match(/^(\d{4})-(\d{4})$/);
              if (prevMatch && currentMatch) {
                const prevY1 = prevMatch[1];
                const prevY2 = prevMatch[2];
                const currY1 = currentMatch[1];
                const currY2 = currentMatch[2];
                // Không tự ép nếu nửa vừa sửa bắt đầu bằng số 0 (vd "0202") - để nguyên value
                // đó cho rule validate bên trên báo lỗi rõ ràng, tránh co thành số sai như "202-203".
                if (currY1 !== prevY1 && currY2 === prevY2 && currY1[0] !== '0') {
                  const y1 = parseInt(currY1, 10);
                  if (!isNaN(y1)) {
                    const newVal = `${y1}-${y1 + 1}`;
                    form.setFieldValue('schoolYear', newVal);
                    prevSchoolYearRef.current = newVal;
                    return;
                  }
                } else if (currY2 !== prevY2 && currY1 === prevY1 && currY2[0] !== '0') {
                  const y2 = parseInt(currY2, 10);
                  if (!isNaN(y2)) {
                    const newVal = `${y2 - 1}-${y2}`;
                    form.setFieldValue('schoolYear', newVal);
                    prevSchoolYearRef.current = newVal;
                    return;
                  }
                }
              }
              form.setFieldValue('schoolYear', val);
              prevSchoolYearRef.current = val;
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
                      const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                      const schoolYearStart = dayjs(`${startYear}-01-01`);
                      if (valDate.isBefore(schoolYearStart, 'day')) {
                        return Promise.reject(new Error(`Ngày bắt đầu phải từ ngày 01/01/${startYear} trở đi`));
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
          <CustomDatePicker
            disabled={disabled}
            disabledDate={(current) => {
              if (!current) return false;
              if (isOutsideSchoolYear(current)) return true;
              if (endDateValue) {
                const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                return current.isAfter(end, 'day') || current.isSame(end, 'day');
              }
              return false;
            }}
          />
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
            <CustomDatePicker
              disabled={disabled}
              disabledDate={(current) => {
                if (!current) return false;
                if (isOutsideSchoolYear(current)) return true;
                if (startDateValue) {
                  const start = dayjs(startDateValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isBefore(start, 'day')) return true;
                }
                if (endDateValue) {
                  const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
                }
                return false;
              }}
            />
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
            <CustomDatePicker
              disabled={disabled}
              disabledDate={(current) => {
                if (!current) return false;
                if (isOutsideSchoolYear(current)) return true;
                if (regOpenDateValue) {
                  const regOpen = dayjs(regOpenDateValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isBefore(regOpen, 'day') || current.isSame(regOpen, 'day')) return true;
                } else if (startDateValue) {
                  const start = dayjs(startDateValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isBefore(start, 'day') || current.isSame(start, 'day')) return true;
                }
                if (endDateValue) {
                  const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
                }
                return false;
              }}
            />
          </Form.Item>
        )}
      </div>

      <Divider orientation="left" className="!text-sm !text-slate-500">
        {tab === 'datn' ? 'Mốc báo cáo, phản biện & bảo vệ' : 'Mốc báo cáo & chấm điểm'}
      </Divider>

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
        <Form.Item
          name="reportStartDate"
          label="Bắt đầu nộp báo cáo tiến độ"
          dependencies={tab === 'datn' ? ['startDate', 'regDeadline', 'reportDeadline', 'endDate'] : ['startDate', 'reportDeadline', 'endDate']}
          rules={[
            { required: true, message: 'Vui lòng chọn ngày bắt đầu nộp báo cáo tiến độ' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const start = getFieldValue('startDate');
                const regDeadline = getFieldValue('regDeadline');
                const reportDeadline = getFieldValue('reportDeadline');
                const end = getFieldValue('endDate');
                if (value) {
                  const valDate = dayjs(value, DATE_DISPLAY_FORMAT, true);
                  if (start && valDate.isBefore(dayjs(start, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Ngày bắt đầu nộp báo cáo tiến độ không được trước ngày bắt đầu đợt học'));
                  }
                  if (tab === 'datn' && regDeadline && valDate.isBefore(dayjs(regDeadline, DATE_DISPLAY_FORMAT, true))) {
                    return Promise.reject(new Error('Ngày bắt đầu nộp báo cáo tiến độ không được trước hạn đăng ký'));
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
          <CustomDatePicker
            disabled={disabled}
            disabledDate={(current) => {
              if (!current) return false;
              if (isOutsideSchoolYear(current)) return true;
              if (startDateValue) {
                const start = dayjs(startDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isBefore(start, 'day')) return true;
              }
              if (tab === 'datn' && regDeadlineValue) {
                const regDeadline = dayjs(regDeadlineValue, DATE_DISPLAY_FORMAT, true);
                if (current.isBefore(regDeadline, 'day')) return true;
              }
              // Chỉ chặn theo Hạn nộp báo cáo khi đang TẠO MỚI (nhập tuần tự từ đầu, lúc này
              // đổi lại hạn nộp cũng còn tự do) — khi SỬA đợt đã lưu, 2 mốc có thể cần đổi cùng
              // lúc (VD: dời cả cụm ngày sang sau) nên không chặn cứng ở lịch để tránh bế tắc
              // (không chọn được ngày muốn vì mốc kia chưa dời), chỉ validate khi submit.
              if (!detail && reportDeadlineValue) {
                const reportDeadline = dayjs(reportDeadlineValue, DATE_DISPLAY_FORMAT, true);
                if (current.isAfter(reportDeadline, 'day') || current.isSame(reportDeadline, 'day')) return true;
              }
              if (endDateValue) {
                const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
              }
              return false;
            }}
          />
        </Form.Item>

        <Form.Item
          name="reportDeadline"
          label="Hạn nộp báo cáo tiến độ"
          dependencies={tab === 'datn' ? ['regDeadline', 'reportStartDate', 'endDate'] : ['reportStartDate', 'endDate']}
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
                  if (reportStart && !valDate.isAfter(dayjs(reportStart, DATE_DISPLAY_FORMAT, true))) {
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
          <CustomDatePicker
            disabled={disabled}
            disabledDate={(current) => {
              if (!current) return false;
              if (isOutsideSchoolYear(current)) return true;
              // Tương tự trường Bắt đầu nộp báo cáo: chỉ chặn cứng theo mốc kia khi TẠO MỚI.
              // Khi SỬA đợt đã lưu, dùng mốc rộng hơn (hạn đăng ký/ngày bắt đầu đợt) làm sàn
              // thay vì Bắt đầu nộp báo cáo hiện tại, để không bị kẹt khi cần dời cả 2 mốc.
              if (!detail && reportStartDateValue) {
                const reportStart = dayjs(reportStartDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isBefore(reportStart, 'day') || current.isSame(reportStart, 'day')) return true;
              } else {
                if (tab === 'datn' && regDeadlineValue) {
                  const regDeadline = dayjs(regDeadlineValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isBefore(regDeadline, 'day') || current.isSame(regDeadline, 'day')) return true;
                } else if (startDateValue) {
                  const start = dayjs(startDateValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isBefore(start, 'day') || current.isSame(start, 'day')) return true;
                }
              }
              if (endDateValue) {
                const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
              }
              return false;
            }}
          />
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
              <CustomDatePicker
                disabled={disabled}
                disabledDate={(current) => {
                  if (!current) return false;
                  if (isOutsideSchoolYear(current)) return true;
                  if (reportDeadlineValue) {
                    const reportDeadline = dayjs(reportDeadlineValue, DATE_DISPLAY_FORMAT, true);
                    if (current.isBefore(reportDeadline, 'day') || current.isSame(reportDeadline, 'day')) return true;
                  }
                  if (endDateValue) {
                    const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                    if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
                  }
                  return false;
                }}
              />
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
              <CustomDatePicker
                disabled={disabled}
                disabledDate={(current) => {
                  if (!current) return false;
                  if (isOutsideSchoolYear(current)) return true;
                  if (reviewStartDateValue) {
                    const reviewStart = dayjs(reviewStartDateValue, DATE_DISPLAY_FORMAT, true);
                    if (current.isBefore(reviewStart, 'day') || current.isSame(reviewStart, 'day')) return true;
                  }
                  if (endDateValue) {
                    const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                    if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
                  }
                  return false;
                }}
              />
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
              <CustomDatePicker
                disabled={disabled}
                disabledDate={(current) => {
                  if (!current) return false;
                  if (isOutsideSchoolYear(current)) return true;
                  if (reviewEndDateValue) {
                    const reviewEnd = dayjs(reviewEndDateValue, DATE_DISPLAY_FORMAT, true);
                    if (current.isBefore(reviewEnd, 'day') || current.isSame(reviewEnd, 'day')) return true;
                  }
                  if (endDateValue) {
                    const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                    if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
                  }
                  return false;
                }}
              />
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
              <CustomDatePicker
                disabled={disabled}
                disabledDate={(current) => {
                  if (!current) return false;
                  if (isOutsideSchoolYear(current)) return true;
                  if (defenseStartDateValue) {
                    const defenseStart = dayjs(defenseStartDateValue, DATE_DISPLAY_FORMAT, true);
                    if (current.isBefore(defenseStart, 'day') || current.isSame(defenseStart, 'day')) return true;
                  }
                  if (endDateValue) {
                    const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                    if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
                  }
                  return false;
                }}
              />
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
          <CustomDatePicker
            disabled={disabled}
            disabledDate={(current) => {
              if (!current) return false;
              if (isOutsideSchoolYear(current)) return true;
              if (tab === 'datn') {
                if (defenseStartDateValue) {
                  const defenseStart = dayjs(defenseStartDateValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isBefore(defenseStart, 'day')) return true;
                }
              } else {
                if (reportDeadlineValue) {
                  const reportDeadline = dayjs(reportDeadlineValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isBefore(reportDeadline, 'day') || current.isSame(reportDeadline, 'day')) return true;
                } else if (reportStartDateValue) {
                  const reportStart = dayjs(reportStartDateValue, DATE_DISPLAY_FORMAT, true);
                  if (current.isBefore(reportStart, 'day') || current.isSame(reportStart, 'day')) return true;
                }
              }
              if (endDateValue) {
                const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
              }
              return false;
            }}
          />
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
          <CustomDatePicker
            disabled={disabled}
            disabledDate={(current) => {
              if (!current) return false;
              if (isOutsideSchoolYear(current)) return true;
              if (gradingStartDateValue) {
                const gradingStart = dayjs(gradingStartDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isBefore(gradingStart, 'day') || current.isSame(gradingStart, 'day')) return true;
              }
              if (tab === 'datn' && defenseEndDateValue) {
                const defenseEnd = dayjs(defenseEndDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isBefore(defenseEnd, 'day') || current.isSame(defenseEnd, 'day')) return true;
              }
              if (endDateValue) {
                const end = dayjs(endDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isAfter(end, 'day') || current.isSame(end, 'day')) return true;
              }
              return false;
            }}
          />
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
                      const schoolYearEnd = dayjs(`${endYear}-12-31`);
                      if (valDate.isAfter(schoolYearEnd, 'day')) {
                        return Promise.reject(new Error(`Ngày kết thúc không được vượt quá ngày 31/12/${endYear}`));
                      }
                    }
                  }
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <CustomDatePicker
            disabled={disabled}
            disabledDate={(current) => {
              if (!current) return false;
              if (isOutsideSchoolYear(current)) return true;
              if (startDateValue) {
                const start = dayjs(startDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isBefore(start, 'day') || current.isSame(start, 'day')) return true;
              }
              if (gradingEndDateValue) {
                const gradingEnd = dayjs(gradingEndDateValue, DATE_DISPLAY_FORMAT, true);
                if (current.isBefore(gradingEnd, 'day') || current.isSame(gradingEnd, 'day')) return true;
              }
              return false;
            }}
          />
        </Form.Item>
      </div>
    </>
  );
};

export default PeriodForm;
