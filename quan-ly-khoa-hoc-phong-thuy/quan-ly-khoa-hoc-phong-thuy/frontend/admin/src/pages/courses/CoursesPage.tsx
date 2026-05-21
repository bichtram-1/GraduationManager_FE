import { DeleteOutlined, DownloadOutlined, EditOutlined, ExclamationCircleFilled, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Form, Image, Input, Modal, Skeleton, Table, Tag, Typography, Upload } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { courseHooks } from '../../hooks/useCourses';
import { ICourseDetail, ILesson, ILessonInput, IQuestion } from '../../type/CourseType';
import { IMAGE_FALLBACK, initSearchParams } from '../../constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { formatNumber } from '@shared/utils/numberUtils';
import ModalCreateUpdateCourse from './components/ModalCreateUpdateCourse';

const { Text } = Typography;
const { confirm } = Modal;

// ===== Lesson Row =====
interface ILessonRowProps {
  lesson: ILesson;
  onImport: (lesson: ILesson) => void;
  onViewQuestions: (lesson: ILesson) => void;
  onDelete: (lessonId: string) => void;
}

const LessonRow = ({ lesson, onImport, onViewQuestions, onDelete }: ILessonRowProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] border border-black/10 px-3 py-3">
      <div className="min-w-0 flex-1">
        <Text className="!block !text-base !font-medium">{lesson?.name}</Text>
        <Text className="!block !text-sm !text-grayDark">
          {lesson?.duration} • {formatNumber(lesson?.questionCount ?? 0)} {t(getKey('question_unit'))}
        </Text>
      </div>
      <Flex gap={8} className="shrink-0">
        <Button size="small" icon={<UploadOutlined />} onClick={() => onImport(lesson)}>
          {t(getKey('import_questions'))}
        </Button>
        <Button size="small" onClick={() => onViewQuestions(lesson)}>
          {t(getKey('view_questions'), { count: lesson?.questionCount ?? 0 })}
        </Button>
        <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(lesson?.id)} />
      </Flex>
    </div>
  );
};

// ===== Course Card =====
interface ICourseCardProps {
  course: ICourseDetail;
  onAddLesson: (courseId: string) => void;
  onEdit: (course: ICourseDetail) => void;
  onDelete: (courseId: string) => void;
  onImportLesson: (lesson: ILesson) => void;
  onViewQuestions: (lesson: ILesson, courseId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
}

const CourseCard = ({ course, onAddLesson, onEdit, onDelete, onImportLesson, onViewQuestions, onDeleteLesson }: ICourseCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
      <Flex gap={16} align="start">
        <Image
          src={course?.image}
          alt={course?.name}
          width={128}
          height={80}
          className="!rounded-[10px] object-cover"
          preview={false}
          fallback={IMAGE_FALLBACK}
        />
        <div className="min-w-0 flex-1">
          <Text className="!text-lg !font-semibold" ellipsis>{course?.name}</Text>
          <Text className="!mt-1 !block !text-sm !text-grayDark line-clamp-4" ellipsis>
            {course?.description}
          </Text>
          <Text className="!mt-1 !block !text-sm !text-grayMedium">
            {t(getKey('lesson_count'), { count: formatNumber(course?.lessons?.length ?? 0) as unknown as number})}
          </Text>
        </div>
        <Flex gap={8} className="shrink-0">
          <Button size="small" icon={<PlusOutlined />} onClick={() => onAddLesson(course?.id)}>
            {t(getKey('add_lesson'))}
          </Button>
          <Button size="small" type="text" icon={<EditOutlined />} onClick={() => onEdit(course)} />
          <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(course?.id)} />
        </Flex>
      </Flex>

      {(course?.lessons?.length ?? 0) > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {course?.lessons?.map((lesson) => (
            <LessonRow
              key={lesson?.id}
              lesson={lesson}
              onImport={onImportLesson}
              onViewQuestions={(lesson) => onViewQuestions(lesson, course.id)}
              onDelete={onDeleteLesson}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

// ===== Courses Page =====
const CoursesPage = () => {
  const { t } = useTranslation();

  const { data, isLoading } = courseHooks.useFetchListCourses(initSearchParams);

  const createMutation = courseHooks.useCreateCourse();
  const updateMutation = courseHooks.useUpdateCourse();
  const deleteMutation = courseHooks.useDeleteCourse();
  const deleteLessonMutation = courseHooks.useDeleteLesson();
  const createLessonsMutation = courseHooks.useCreateLessons();
  const downloadTemplateMutation = courseHooks.useDownloadQuestionTemplate();
  const importQuestionsMutation = courseHooks.useImportQuestions();

  const [courseModal, setCourseModal] = useState<{ open: boolean; editingCourse: ICourseDetail | null }>({ open: false, editingCourse: null });
  const [addLessonModal, setAddLessonModal] = useState<{ open: boolean; courseId: string }>({ open: false, courseId: '' });
  const [questionModal, setQuestionModal] = useState<{ open: boolean; lesson: ILesson | null }>({ open: false, lesson: null });
  const [importModal, setImportModal] = useState<{ open: boolean; lesson: ILesson | null }>({ open: false, lesson: null });
  const [importFile, setImportFile] = useState<File | null>(null);

  const [formCourse] = Form.useForm();
  const [formAddLesson] = Form.useForm();

  const { data: questions, isLoading: questionsLoading } = courseHooks.useFetchQuestionsByLesson(
    questionModal?.lesson?.id ?? '', questionModal?.open,
  );

  const questionColumns = useMemo(() => [
    { title: t(getKey('col_stt')), key: 'stt', width: 60, align: 'center' as const,
      render: (_: unknown, __: IQuestion, idx: number) => idx + 1 },
    { title: t(getKey('col_question')), dataIndex: 'question', key: 'question', ellipsis: true,
      render: (text: string) => <Text className="!font-medium">{text}</Text> },
    { title: t(getKey('col_options')), dataIndex: 'options', key: 'options', width: 280,
      render: (options: string[], record: IQuestion) => (
        <div className="flex flex-col gap-1">
          {options?.map((opt, idx) => (
            <div key={idx} className={`rounded px-2 py-1 text-sm ${
              opt?.charAt(0) === record?.correctAnswer
                ? 'bg-greenLight font-medium text-greenDark'
                : 'bg-grayLightest text-blackSoft'
            }`}>{opt}</div>
          ))}
        </div>
      )},
    { title: t(getKey('col_correct_answer')), dataIndex: 'correctAnswer', key: 'correctAnswer', width: 130, align: 'center' as const,
      render: (answer: string) => (
        <Tag className="!rounded-full !border-0 !bg-greenLight !px-2 !text-greenDark">
          {t(getKey('correct_answer_label'), { answer })}
        </Tag>
      )},
  ], [t]);

  const handleOpenCreate = () => {
    formCourse.resetFields();
    setCourseModal({ open: true, editingCourse: null });
  };

  const handleOpenEdit = (course: ICourseDetail) => {
    formCourse.setFieldsValue({ name: course?.name, description: course?.description, image: course?.image });
    setCourseModal({ open: true, editingCourse: course });
  };

  const handleCancelCourseModal = () => {
    setCourseModal({ open: false, editingCourse: null });
    formCourse.resetFields();
  };

  const handleSubmitCourse = async (values: Record<string, unknown>) => {
    const isEdit = !!courseModal?.editingCourse;
    const body = { ...values };

    if (isEdit) {
      updateMutation.mutate(
        { id: courseModal.editingCourse!.id, body: body as Partial<ICourseDetail>, params: initSearchParams },
        { onSuccess: handleCancelCourseModal },
      );
    } else {
      createMutation.mutate(
        { body: body as unknown as ICourseDetail, params: initSearchParams },
        { onSuccess: handleCancelCourseModal },
      );
    }
  };

  const showDeleteConfirm = (onOk: () => void) => {
    confirm({
      centered: true, title: null, icon: null,
      content: (
        <div className="text-center">
          <ExclamationCircleFilled className="text-[40px] leading-none text-btnDelete" />
          <div className="mt-3 text-xl font-bold">{t(getKey('delete_title'))}</div>
          <div className="text-sm">{t(getKey('delete_content'))}</div>
        </div>
      ),
      okText: t(getKey('delete')), okButtonProps: { type: 'primary', danger: true },
      cancelButtonProps: { type: 'default', danger: true },
      cancelText: t(getKey('cancel_btn')), className: 'custom-confirm-modal',
      onOk,
    });
  };

  const handleDelete = (type: 'course' | 'lesson', id: string) =>
    showDeleteConfirm(() =>
      type === 'course'
        ? deleteMutation.mutate({ id, params: initSearchParams })
        : deleteLessonMutation.mutate({ id, params: initSearchParams })
    );

  const handleOpenImport = (lesson: ILesson) => {
    setImportFile(null);
    setImportModal({ open: true, lesson });
  };

  const handleCancelImport = () => {
    setImportModal({ open: false, lesson: null });
    setImportFile(null);
  };

  const handleSubmitImport = () => {
    if (!importFile || !importModal?.lesson) return;
    importQuestionsMutation.mutate(
      { lessonId: importModal.lesson.id, file: importFile, params: initSearchParams },
      { onSuccess: handleCancelImport },
    );
  };

  const handleCancelQuestionModal = () => setQuestionModal({ open: false, lesson: null });

  const handleCancelAddLesson = () => { setAddLessonModal({ open: false, courseId: '' }); formAddLesson.resetFields(); };

  const handleSubmitAddLesson = (values: { lessons: ILessonInput[] }) => {
    if (!addLessonModal?.courseId) return;
    createLessonsMutation.mutate(
      { courseId: addLessonModal.courseId, lessons: values?.lessons, params: initSearchParams },
      { onSuccess: handleCancelAddLesson },
    );
  };

  const handleDownloadTemplate = () => {
    downloadTemplateMutation.mutate({ params: initSearchParams });
  };

  const lessonFields = Form.useWatch('lessons', formAddLesson);
  const lessonCount = lessonFields?.length ?? 0;

  return (
    <Flex vertical gap={24} align="stretch">
      {/* Page header */}
      <Flex justify="space-between" align="center">
        <div>
          <h1 className="m-0 text-[30px] font-bold leading-[36px] text-navyDark">
            {t(getKey('course_management'))}
          </h1>
          <p className="m-0 mt-1 text-base leading-6 text-grayDark">
            {t(getKey('course_management_desc'))}
          </p>
        </div>
        <Flex align="center" gap={8}>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            loading={downloadTemplateMutation?.isPending}
            className="!h-10 !rounded-[8px] !px-4 !font-medium"
          >
            {t(getKey('download_question_template'))}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined className="text-white" />}
            onClick={handleOpenCreate}
            className="!h-10 !rounded-[8px] !bg-primary !px-5 !items-center !gap-2 !font-medium hover:!bg-blueDark"
          >
            <span className="text-white text-base font-medium">{t(getKey('add_course'))}</span>
          </Button>
        </Flex>
      </Flex>

      {/* Course card list */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => <Card key={i} className="!rounded-[10px]"><Skeleton active /></Card>)}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {data?.rows?.map((course) => (
            <CourseCard
              key={course?.id}
              course={course}
              onAddLesson={(id) => setAddLessonModal({ open: true, courseId: id })}
              onEdit={handleOpenEdit}
              onDelete={(id) => handleDelete('course', id)}
              onImportLesson={handleOpenImport}
              onViewQuestions={(lesson) => setQuestionModal({ open: true, lesson })}
              onDeleteLesson={(id) => handleDelete('lesson', id)}
            />
          ))}
        </div>
      )}

      {/* ── Create/Edit course modal ── */}
      <Modal
        centered open={courseModal?.open} onCancel={handleCancelCourseModal}
        destroyOnHidden maskClosable={false} footer={null} width={512}
      >
        <Form form={formCourse} layout="vertical" onFinish={handleSubmitCourse}
          className="max-h-[75vh] overflow-y-auto overflow-x-hidden px-1" clearOnDestroy
          scrollToFirstError={{ behavior: 'instant', focus: true, block: 'center' }}
        >
          <ModalCreateUpdateCourse isEdit={!!courseModal?.editingCourse} />

          <Flex justify="end" gap={8} className="mt-4">
            <Button
              onClick={handleCancelCourseModal}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium !border-graySilver"
            >
              {t(getKey('cancel_btn'))}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation?.isPending || updateMutation?.isPending}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium"
            >
              {courseModal?.editingCourse ? t(getKey('update_btn')) : t(getKey('create_course_btn'))}
            </Button>
          </Flex>
        </Form>
      </Modal>

      {/* ── Add lesson modal ── */}
      <Modal
        centered open={addLessonModal?.open} onCancel={handleCancelAddLesson}
        destroyOnHidden maskClosable={false} footer={null} width={768}
      >
        <Form form={formAddLesson} layout="vertical" onFinish={handleSubmitAddLesson}
          className="max-h-[75vh] overflow-y-auto overflow-x-hidden px-1" clearOnDestroy
          scrollToFirstError={{ behavior: 'instant', focus: true, block: 'center' }}
        >
          <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft mb-1">
            {t(getKey('add_lesson_title'))}
          </h2>
          <p className="mb-4 text-sm leading-5 text-grayMedium">{t(getKey('add_lesson_desc'))}</p>

          <Form.List name="lessons" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-4">
                <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-2">
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex flex-col gap-3 rounded-[10px] border border-black/10 p-4">
                      <Flex justify="space-between" align="center">
                        <Text className="!text-sm !font-medium !text-grayMedium">
                          {t(getKey('lesson_number'), { number: index + 1 })}
                        </Text>
                        {fields.length > 1 && (
                          <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                        )}
                      </Flex>
                      <Form.Item label={t(getKey('lesson_name'))} name={[field.name, 'name']}
                        rules={[{ required: true, message: t(getKey('lesson_name_required')) }]} className="!mb-0">
                        <Input placeholder={t(getKey('lesson_name_placeholder'))} className="!h-10 !rounded-lg !border-graySilver" />
                      </Form.Item>
                      <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                          label={t(getKey('youtube_url'))}
                          name={[field.name, 'youtubeUrl']}
                          className="!mb-0"
                          rules={[{
                            pattern: /^https?:\/\/(www\.)?(youtube\.com\/watch\?|youtu\.be\/|youtube\.com\/embed\/)/,
                            message: t(getKey('youtube_url_invalid')),
                          }]}
                        >
                          <Input placeholder={t(getKey('youtube_url_placeholder'))} className="!h-10 !rounded-lg !border-graySilver" />
                        </Form.Item>
                        <Form.Item label={t(getKey('lesson_duration'))} name={[field.name, 'duration']} className="!mb-0">
                          <Input placeholder={t(getKey('lesson_duration_placeholder'))} className="!h-10 !rounded-lg !border-graySilver" />
                        </Form.Item>
                      </div>
                    </div>
                  ))}
                </div>
                <Button icon={<PlusOutlined />} onClick={() => add()} className="w-full !h-10 !rounded-lg !font-medium">
                  {t(getKey('add_lesson'))}
                </Button>
              </div>
            )}
          </Form.List>

          <Flex justify="end" gap={8} className="mt-4">
            <Button
              onClick={handleCancelAddLesson}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium !border-graySilver"
            >
              {t(getKey('cancel_btn'))}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createLessonsMutation?.isPending}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium"
            >
              {t(getKey('save_all_lessons'), { count: lessonCount })}
            </Button>
          </Flex>
        </Form>
      </Modal>

      {/* ── View questions modal ── */}
      <Modal
        centered open={questionModal?.open}
        onCancel={handleCancelQuestionModal}
        destroyOnHidden maskClosable={false} width={896}
        footer={
          <Flex justify="end">
            <Button
              type="primary"
              onClick={handleCancelQuestionModal}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium"
            >
              {t(getKey('close_btn'))}
            </Button>
          </Flex>
        }
      >
        <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft mb-1">
          {t(getKey('question_list_title'))}
        </h2>
        <p className="mb-4 text-sm leading-5 text-grayMedium">{questionModal?.lesson?.name}</p>
        <Table columns={questionColumns} dataSource={questions} loading={questionsLoading}
          rowKey="id" pagination={false} scroll={{ y: 360 }} size="middle" />
      </Modal>

      {/* ── Import questions modal ── */}
      <Modal
        centered open={importModal?.open} onCancel={handleCancelImport}
        destroyOnHidden maskClosable={false} footer={null} width={512}
      >
        <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft mb-1">
          {t(getKey('import_questions_title'))}
        </h2>
        <p className="mb-6 text-sm leading-5 text-grayMedium">{importModal?.lesson?.name}</p>

        <div className="flex flex-col gap-2 mb-6">
          <Text className="!text-sm !font-medium">{t(getKey('import_questions_file_label'))}</Text>
          <Upload
            accept=".csv,.xlsx,.xls"
            showUploadList={false}
            style={{ display: 'block' }}
            beforeUpload={(file) => {
              setImportFile(file);
              return false;
            }}
          >
            <Button
              block
              icon={<UploadOutlined />}
              className="!h-10 !rounded-lg !border-graySilver !font-medium"
            >
              {importFile ? importFile.name : t(getKey('choose_file'))}
            </Button>
          </Upload>
          <Text className="!text-xs !text-grayMedium">{t(getKey('import_questions_desc'))}</Text>
        </div>

        <Flex justify="end" gap={8}>
          <Button
            onClick={handleCancelImport}
            className="!h-10 !px-4 !rounded-lg !text-base !font-medium !border-graySilver"
          >
            {t(getKey('cancel_btn'))}
          </Button>
          <Button
            type="primary"
            disabled={!importFile}
            loading={importQuestionsMutation?.isPending}
            onClick={handleSubmitImport}
            className="!h-10 !px-4 !rounded-lg !text-base !font-medium"
          >
            {t(getKey('import_questions'))}
          </Button>
        </Flex>
      </Modal>
    </Flex>
  );
};

export default CoursesPage;
