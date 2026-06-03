import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button, Card, Input, Select, message } from 'antd';
import { ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../../constants/commonConst';

const TEACHERS = [
  { id: 'GV01', name: 'TS. Nguyễn Văn X' },
  { id: 'GV02', name: 'TS. Trần Văn Y' },
  { id: 'GV03', name: 'ThS. Lê Thị Z' },
  { id: 'GV04', name: 'TS. Phạm Văn K' },
  { id: 'GV05', name: 'PGS. Đặng Thị M' },
  { id: 'GV06', name: 'TS. Lê Văn N' },
  { id: 'GV07', name: 'TS. Hoàng Minh P' },
  { id: 'GV08', name: 'ThS. Trần Hà Q' },
  { id: 'GV09', name: 'TS. Vũ Quốc R' },
  { id: 'GV10', name: 'PGS. Nguyễn Thị S' },
  { id: 'GV11', name: 'TS. Lưu Gia T' },
  { id: 'GV12', name: 'ThS. Nguyễn Bảo U' },
];

type AdvisorTopic = {
  id: string;
  topicCode: string;
  topicName: string;
  members: string[];
  advisorId: string;
  minutes: number;
  assignedCouncilId?: string | null;
};

type AdvisorBucket = {
  advisorId: string;
  advisorName: string;
  topics: AdvisorTopic[];
};

type SelectedTopic = AdvisorTopic & {
  reviewerId: string | null;
  examinerIds?: string[];
  externalExaminers?: string[];
  startTime?: string | null;
};

type CommitteeForm = {
  name: string;
  batch: string;
  room: string;
  date: string;
  time: string;
  members: string[]; // committee members (all roles chosen later)
};

type WorkflowTab = 'pick' | 'sort';

const ADVISOR_BUCKETS: AdvisorBucket[] = [
  {
    advisorId: 'GV01',
    advisorName: 'TS. Nguyễn Văn X',
    topics: [
      { id: 'T01', topicCode: 'G01', topicName: 'Hệ thống IoT giám sát nông nghiệp', members: ['20520001 - Nguyễn A', '20520002 - Trần B'], advisorId: 'GV01', minutes: 40, assignedCouncilId: 'HD01' },
      { id: 'T02', topicCode: 'G02', topicName: 'Ứng dụng AI nhận diện hình ảnh', members: ['20520003 - Phạm D'], advisorId: 'GV01', minutes: 35 },
      { id: 'T03', topicCode: 'G03', topicName: 'Nền tảng e-commerce', members: ['20520004 - Lê C', '20520005 - Hoàng E'], advisorId: 'GV01', minutes: 45, assignedCouncilId: 'HD02' },
      { id: 'T04', topicCode: 'G04', topicName: 'Hệ thống quản lý ký túc xá', members: ['20520006 - Mai H'], advisorId: 'GV01', minutes: 30, assignedCouncilId: 'HD03' },
    ],
  },
  {
    advisorId: 'GV02',
    advisorName: 'TS. Trần Văn Y',
    topics: [
      { id: 'T05', topicCode: 'G05', topicName: 'Ứng dụng học tập có gamification', members: ['20520007 - Bùi I'], advisorId: 'GV02', minutes: 40 },
      { id: 'T06', topicCode: 'G06', topicName: 'Nền tảng đặt lịch phòng lab', members: ['20520008 - Đinh J', '20520009 - Hà K'], advisorId: 'GV02', minutes: 35, assignedCouncilId: 'HD02' },
      { id: 'T07', topicCode: 'G07', topicName: 'Dashboard phân tích dữ liệu sinh viên', members: ['20520010 - Lâm L'], advisorId: 'GV02', minutes: 45, assignedCouncilId: 'HD04' },
    ],
  },
  {
    advisorId: 'GV03',
    advisorName: 'ThS. Lê Thị Z',
    topics: [
      { id: 'T08', topicCode: 'G08', topicName: 'Chatbot tư vấn tuyển sinh', members: ['20520011 - Ngọc M'], advisorId: 'GV03', minutes: 35 },
      { id: 'T09', topicCode: 'G09', topicName: 'Ứng dụng quản lý điểm danh', members: ['20520012 - Phúc N'], advisorId: 'GV03', minutes: 30 },
      { id: 'T10', topicCode: 'G10', topicName: 'Cổng thông tin thực tập doanh nghiệp', members: ['20520013 - Quang P'], advisorId: 'GV03', minutes: 40 },
    ],
  },
  {
    advisorId: 'GV04',
    advisorName: 'TS. Phạm Văn K',
    topics: [
      { id: 'T11', topicCode: 'G11', topicName: 'Hệ thống quản lý phòng khám', members: ['20520014 - Thảo Q'], advisorId: 'GV04', minutes: 45, assignedCouncilId: 'HD05' },
      { id: 'T12', topicCode: 'G12', topicName: 'App hỗ trợ học tiếng Anh', members: ['20520015 - Uyên R', '20520016 - Vy S'], advisorId: 'GV04', minutes: 35, assignedCouncilId: 'HD05' },
      { id: 'T13', topicCode: 'G13', topicName: 'Tối ưu hóa lịch học tự động', members: ['20520017 - Xuân T'], advisorId: 'GV04', minutes: 40, assignedCouncilId: 'HD06' },
    ],
  },
  {
    advisorId: 'GV05',
    advisorName: 'PGS. Đặng Thị M',
    topics: [
      { id: 'T14', topicCode: 'G14', topicName: 'Nền tảng báo cáo học phần', members: ['20520018 - Vy U'], advisorId: 'GV05', minutes: 30 },
      { id: 'T15', topicCode: 'G15', topicName: 'Ứng dụng quản lý hội đồng', members: ['20520019 - Sơn V', '20520020 - Trúc W'], advisorId: 'GV05', minutes: 40 },
      { id: 'T16', topicCode: 'G16', topicName: 'Hệ thống học nhóm trực tuyến', members: ['20520021 - Yến X'], advisorId: 'GV05', minutes: 35 },
    ],
  },
];

const CreateCouncilPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const section2Ref = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState<CommitteeForm>({
    name: '',
    batch: 'Đợt ĐATN Học kỳ 2 - 2026',
    room: '',
    date: '',
    time: '',
    members: [],
  });
  const [selectedTopics, setSelectedTopics] = useState<SelectedTopic[]>([]);
  const [draggingTopicId, setDraggingTopicId] = useState<string | null>(null);
  const [dragOverTopicId, setDragOverTopicId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [workflowTab, setWorkflowTab] = useState<WorkflowTab>('pick');

  const availableAdvisorBuckets = useMemo(
    () =>
      ADVISOR_BUCKETS
        .map((bucket) => ({
          ...bucket,
          topics: bucket.topics.filter((topic) => !topic.assignedCouncilId),
        }))
        .filter((bucket) => bucket.topics.length > 0),
    [],
  );

  const teacherOptions = useMemo(() => TEACHERS.map((teacher) => ({ value: teacher.id, label: teacher.name })), []);
  const availableAdvisorOptions = useMemo(
    () =>
      availableAdvisorBuckets.map((bucket) => ({
        value: bucket.advisorId,
        label: bucket.advisorName,
      })),
    [availableAdvisorBuckets],
  );
  const availableAdvisorIds = useMemo(() => new Set(availableAdvisorBuckets.map((bucket) => bucket.advisorId)), [availableAdvisorBuckets]);
  const memberIds = form.members;

  const teacherNameById = (id: string) => TEACHERS.find((teacher) => teacher.id === id)?.name ?? id;

  const findTeacherIdByName = (name: string) => TEACHERS.find((t) => t.name === name)?.id;

  const updateMembers = (nextMemberIds: string[]) => {
    const sanitized = nextMemberIds.filter((id) => availableAdvisorIds.has(id));
    setForm((current) => ({ ...current, members: sanitized }));
    setSelectedTopics((current) => current.filter((topic) => sanitized.includes(topic.advisorId)));
  };

  const toggleTopic = (topic: AdvisorTopic, enabled: boolean) => {
    if (!memberIds.includes(topic.advisorId)) return;

    setSelectedTopics((current) => {
      if (enabled) {
        if (current.some((item) => item.id === topic.id)) return current;
        return [...current, { ...topic, reviewerId: null, examinerIds: [], externalExaminers: [], startTime: null }];
      }

      return current.filter((item) => item.id !== topic.id);
    });
  };

  const updateReviewerForTopic = (topicId: string, reviewerId: string | null) => {
    setSelectedTopics((current) => current.map((topic) => (topic.id === topicId ? { ...topic, reviewerId } : topic)));
  };

  const updateExaminerForTopic = (topicId: string, examinerIds: string[] | null) => {
    setSelectedTopics((current) => current.map((topic) => (topic.id === topicId ? { ...topic, examinerIds: examinerIds ?? [] } : topic)));
  };

  const updateExternalExaminersForTopic = (topicId: string, externalIds: string[] | null) => {
    setSelectedTopics((current) => current.map((topic) => (topic.id === topicId ? { ...topic, externalExaminers: externalIds ?? [] } : topic)));
  };

  const updateStartTimeForTopic = (topicId: string, startTime: string | null) => {
    setSelectedTopics((current) => current.map((topic) => (topic.id === topicId ? { ...topic, startTime } : topic)));
  };

  const moveSelectedTopic = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setSelectedTopics((current) => {
      const sourceIndex = current.findIndex((topic) => topic.id === sourceId);
      const targetIndex = current.findIndex((topic) => topic.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return current;

      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(sourceIndex < targetIndex ? targetIndex - 1 : targetIndex, 0, moved);
      return next;
    });
  };

  const handleSave = () => {
    if (!form.name || !form.room || !form.date || !form.time) {
      message.error('Vui lòng điền đầy đủ thông tin hội đồng');
      return;
    }

    if (memberIds.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 giảng viên cho thành phần hội đồng');
      return;
    }

    if (selectedTopics.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 đề tài');
      return;
    }

    for (const topic of selectedTopics) {
      if (!topic.reviewerId) {
        message.error(`Đề tài ${topic.topicCode} chưa chọn GVPB`);
        return;
      }

      const hasInternal = topic.examinerIds && topic.examinerIds.length > 0;
      const hasExternal = topic.externalExaminers && topic.externalExaminers.length > 0;
      if (!hasInternal && !hasExternal) {
        message.error(`Đề tài ${topic.topicCode} chưa chọn người chấm (nội bộ hoặc GV ngoài)`);
        return;
      }

      if (!topic.startTime) {
        message.error(`Đề tài ${topic.topicCode} chưa nhập thời gian bắt đầu`);
        return;
      }

      if (hasInternal) {
        const conflict = (topic.examinerIds || []).some((id) => id === topic.advisorId || id === topic.reviewerId);
        if (conflict) {
          message.error(`Người chấm nội bộ của ${topic.topicCode} không được trùng GVHD hoặc GVPB`);
          return;
        }
      }

      if (hasExternal) {
        const conflictExt = (topic.externalExaminers || []).some((id) => id === topic.advisorId || id === topic.reviewerId);
        if (conflictExt) {
          message.error(`GV ngoài của ${topic.topicCode} không được trùng GVHD hoặc GVPB`);
          return;
        }
      }
    }

    setSaved(true);
    message.success(`Đã tạo hội đồng và gom ${selectedTopics.length} đề tài theo GVHD`);
    navigate('/councils');
  };

  const selectedCountByAdvisor = (advisorId: string) => selectedTopics.filter((topic) => topic.advisorId === advisorId).length;
  const visibleAdvisorBuckets = availableAdvisorBuckets.filter((bucket) => memberIds.includes(bucket.advisorId));
  const committeeSummary = `${memberIds.length} thành viên hội đồng`;

  const openSortTab = () => {
    if (selectedTopics.length > 0) setWorkflowTab('sort');
  };

  // If navigated here for editing, prefill form and selected topics
  useEffect(() => {
    const state: any = (location && (location as any).state) || null;
    const council = state?.council;
    if (!council) return;

    // map council to form
    setForm((current) => ({
      ...current,
      name: council.title || current.name,
      batch: council.batch || current.batch,
      room: council.room || current.room,
      // try to map chair/reviewer/member names to teacher ids
      members: (council.member || []).map((nm: string) => findTeacherIdByName(nm)).filter(Boolean) as string[],
      date: '',
      time: '',
    }));

    // build selectedTopics from council.topics if available
    const topicsFromCouncil: SelectedTopic[] = [];
    const councilTopics = council.topics || council.topicGroups || [];
    councilTopics.forEach((t: any) => {
      // find advisor bucket/topic by code
      const found = ADVISOR_BUCKETS.flatMap((b) => b.topics).find((pt) => pt.topicCode === t.code);
      if (found) {
        const sel: SelectedTopic = {
          ...found,
          reviewerId: null,
          examinerIds: (t.examiners || []).map((n: string) => findTeacherIdByName(n)).filter(Boolean) as string[],
          externalExaminers: (t.externalExaminers || []).map((n: string) => findTeacherIdByName(n) || n),
          startTime: t.startTime || null,
        };
        topicsFromCouncil.push(sel);
      }
    });

    if (topicsFromCouncil.length > 0) {
      setSelectedTopics(topicsFromCouncil);
      setWorkflowTab('sort');
      // scroll to section 2 after a tick
      setTimeout(() => section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location]);

  const scrollToSection2 = () => {
    openSortTab();
    section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={cn('pb-6')}>
      <div className={cn('mb-6 flex items-center gap-3')}>
        <button onClick={() => navigate('/councils')} className="rounded-md p-2 hover:bg-gray-100">
          <ArrowLeftOutlined />
        </button>
        <div>
          <h1 className="text-2xl font-medium">Thêm mới hội đồng bảo vệ</h1>
          <p className="mt-0.5 text-sm text-gray-600">Chọn thành phần hội đồng trước, sau đó chọn đề tài của các giảng viên đó và sắp xếp.</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-[#185FA5]">BƯỚC 1</div>
              <div className="font-medium">PHẦN 1: Thông tin chung</div>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-[11px] text-gray-600 shadow-sm">Nhập trước, chọn sau</div>
          </div>
          <div className="space-y-4 p-5 md:p-6">
              <div>
                <div className="mb-1 text-xs text-gray-600">Tên hội đồng</div>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="VD: Hội đồng số 1" />
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">Chọn đợt</div>
                <Select value={form.batch} onChange={(value) => setForm({ ...form, batch: value })} style={{ width: '100%' }}>
                  <Select.Option value="Đợt ĐATN Học kỳ 2 - 2026">Đợt ĐATN Học kỳ 2 - 2026</Select.Option>
                </Select>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">Phòng bảo vệ</div>
                <Input value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} placeholder="VD: A1.401" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">Ngày bảo vệ</div>
                  <Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">Giờ bắt đầu</div>
                  <Input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-600">Thành phần hội đồng</div>
                    <div className="mt-1 text-xs text-gray-500">Chọn nhiều giảng viên. Các vai trò cụ thể sẽ được gán khi sắp xếp đề tài.</div>
                  </div>
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-600">{committeeSummary}</div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Thành phần hội đồng</div>
                      <div className="mt-1 text-xs text-gray-500">Chọn nhiều giảng viên (những người sẽ tham gia trong hội đồng). Các vai trò cụ thể sẽ được gán khi sắp xếp đề tài.</div>
                    </div>
                    <Select
                      value={form.members}
                      onChange={updateMembers}
                      placeholder={availableAdvisorOptions.length > 0 ? 'Chọn nhiều giảng viên' : 'Không còn giảng viên có đề tài để phân công'}
                      options={availableAdvisorOptions}
                      className="w-full"
                      mode="multiple"
                      maxTagCount="responsive"
                      disabled={availableAdvisorOptions.length === 0}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <Button onClick={() => navigate('/councils')}>Hủy bỏ</Button>
                  <Button type="primary" onClick={scrollToSection2} disabled={!form.name || !form.room || !form.date || !form.time || memberIds.length === 0}>
                    Tiếp tục sang phần chọn đề tài
                  </Button>
                </div>
              </div>
          </div>
        </Card>

        <div ref={section2Ref}>
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-[#185FA5]">BƯỚC 2</div>
                <div className="font-medium">PHẦN 2: Chọn đề tài và sắp xếp</div>
                <div className="mt-1 text-xs text-gray-500">Chỉ hiển thị sau khi đã nhập xong thông tin chung để màn hình thoáng hơn.</div>
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-600">Đã chọn {selectedTopics.length} đề tài</div>
            </div>

            <div className="flex gap-2 border-b border-gray-200 px-5 pt-4">
              <button
                type="button"
                onClick={() => setWorkflowTab('pick')}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium ${workflowTab === 'pick' ? 'border border-b-0 border-gray-200 bg-white text-[#185FA5]' : 'bg-gray-50 text-gray-600'}`}
              >
                1. Chọn đề tài
              </button>
              <button
                type="button"
                onClick={openSortTab}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium ${workflowTab === 'sort' ? 'border border-b-0 border-gray-200 bg-white text-[#185FA5]' : 'bg-gray-50 text-gray-600'}`}
              >
                2. Sắp xếp đề tài đã chọn
              </button>
            </div>

            {workflowTab === 'pick' ? (
              <div className="space-y-4 p-5">
                {visibleAdvisorBuckets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                    Chọn ít nhất 1 giảng viên có đề tài chưa phân công để hiển thị danh sách đề tài tương ứng.
                  </div>
                ) : (
                  visibleAdvisorBuckets.map((bucket) => {
                    const selectedInBucket = selectedCountByAdvisor(bucket.advisorId);

                    return (
                      <div key={bucket.advisorId} className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 px-4 py-3">
                          <div>
                            <div className="text-sm font-medium">GVHD: {bucket.advisorName}</div>
                            <div className="mt-1 text-xs text-gray-500">
                              {bucket.topics.length} đề tài · đã chọn {selectedInBucket} đề tài
                            </div>
                          </div>
                          <div className="rounded-full bg-white px-3 py-1 text-[11px] text-gray-600">Đang hoạt động</div>
                        </div>

                        <div className="overflow-x-auto bg-white">
                          <table className="w-full border-collapse text-sm">
                            <thead className="bg-white text-gray-500">
                              <tr>
                                <th className="w-14 px-4 py-3 text-left">Chọn</th>
                                <th className="w-24 px-4 py-3 text-left">Mã nhóm</th>
                                <th className="px-4 py-3 text-left">Đề tài</th>
                                <th className="px-4 py-3 text-left">Sinh viên</th>
                                <th className="w-28 px-4 py-3 text-left">Thời lượng</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bucket.topics.map((topic) => {
                                const checked = selectedTopics.some((item) => item.id === topic.id);

                                return (
                                  <tr key={topic.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3 align-top">
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(event) => toggleTopic(topic, event.target.checked)}
                                        className="h-4 w-4 accent-[#185FA5]"
                                      />
                                    </td>
                                    <td className="px-4 py-3 align-top font-medium text-[#2196F3]">{topic.topicCode}</td>
                                    <td className="px-4 py-3 align-top font-medium text-gray-900">{topic.topicName}</td>
                                    <td className="px-4 py-3 align-top text-xs text-gray-600">{topic.members.join(', ')}</td>
                                    <td className="px-4 py-3 align-top text-gray-600">~{topic.minutes} phút</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : selectedTopics.length === 0 ? (
              <div className="px-5 py-16 text-center text-gray-500">Chưa có đề tài nào. Quay lại tab chọn đề tài để tick các nhóm muốn đưa vào hội đồng.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left"></th>
                      <th className="w-20 px-4 py-3 text-left">STT</th>
                      <th className="w-28 px-4 py-3 text-left">Mã nhóm</th>
                      <th className="px-4 py-3 text-left">Tên đề tài</th>
                      <th className="px-4 py-3 text-left">GVHD</th>
                      <th className="px-4 py-3 text-left">GVPB</th>
                      <th className="px-4 py-3 text-left">Người chấm</th>
                      <th className="px-4 py-3 text-left">GV ngoài</th>
                      <th className="px-4 py-3 text-left">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTopics.map((topic, index) => (
                      <tr
                        key={topic.id}
                        draggable
                        onDragStart={() => setDraggingTopicId(topic.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDragEnter={() => setDragOverTopicId(topic.id)}
                        onDrop={() => {
                          if (draggingTopicId) moveSelectedTopic(draggingTopicId, topic.id);
                        }}
                        onDragEnd={() => {
                          setDraggingTopicId(null);
                          setDragOverTopicId(null);
                        }}
                        className={`border-t border-gray-100 hover:bg-gray-50 ${draggingTopicId === topic.id ? 'opacity-50' : ''} ${dragOverTopicId === topic.id ? 'bg-gray-50' : ''}`}
                      >
                        <td className="px-4 py-3 align-top text-gray-400">
                          <MenuOutlined />
                        </td>
                        <td className="px-4 py-3 align-top font-medium text-gray-700">{index + 1}</td>
                        <td className="px-4 py-3 align-top font-medium text-[#2196F3]">{topic.topicCode}</td>
                        <td className="px-4 py-3 align-top font-medium text-gray-900">{topic.topicName}</td>
                        <td className="px-4 py-3 align-top text-gray-600">{teacherNameById(topic.advisorId)}</td>
                        <td className="px-4 py-3 align-top">
                          <Select
                            value={topic.reviewerId || undefined}
                            onChange={(value) => updateReviewerForTopic(topic.id, value ?? null)}
                            placeholder="Chọn GVPB"
                            options={memberIds
                              .filter((id) => id !== topic.advisorId)
                              .map((id) => ({ value: id, label: teacherNameById(id) }))}
                            className="w-full min-w-[220px]"
                            allowClear
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Select
                            mode="multiple"
                            value={topic.examinerIds || []}
                            onChange={(value) => updateExaminerForTopic(topic.id, value ?? [])}
                            placeholder="Chọn người chấm"
                            options={memberIds
                              .filter((id) => id !== topic.advisorId && id !== topic.reviewerId)
                              .map((id) => ({ value: id, label: teacherNameById(id) }))}
                            className="w-full min-w-[220px]"
                            allowClear
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Select
                            mode="multiple"
                            value={topic.externalExaminers || []}
                            onChange={(value) => updateExternalExaminersForTopic(topic.id, value ?? [])}
                            placeholder="Chọn GV ngoài"
                            options={TEACHERS.filter((t) => !memberIds.includes(t.id)).map((t) => ({ value: t.id, label: t.name }))}
                            className="w-full min-w-[220px]"
                            allowClear
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Input type="time" value={topic.startTime || ''} onChange={(e) => updateStartTimeForTopic(topic.id, e.target.value || null)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button onClick={() => navigate('/councils')}>Hủy bỏ</Button>
        <Button type="primary" onClick={handleSave} disabled={!form.name || !form.room || !form.date || !form.time || memberIds.length === 0 || selectedTopics.length === 0}>
          Lưu và Công bố
        </Button>
      </div>

      <div className={saved ? 'mt-4' : 'hidden'}>
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Đã lưu thành công. Hệ thống đã tạo hội đồng và phân công đề tài; bạn có thể kiểm tra các vai trò và thời gian cho từng đề tài.
        </div>
      </div>
    </div>
  );
};

export default CreateCouncilPage;
