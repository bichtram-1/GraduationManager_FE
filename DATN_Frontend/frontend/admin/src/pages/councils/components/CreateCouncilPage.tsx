import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button, Card, DatePicker, Input, Select, Tag, TimePicker, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../../constants/commonConst';
import { useTranslation } from 'react-i18next';
import { groupHooks } from '../../../hooks/useGroups';
import { assignmentHooks } from '../../../hooks/useAssignments';
import { councilHooks } from '../../../hooks/useCouncils';
import { periodHooks } from '../../../hooks/usePeriods';
import { useGlobalVariable } from '../../../hooks/GlobalVariableProvider';
import { getKey } from '@shared/types/I18nKeyType';
import { formatNumber } from '@shared/utils/numberUtils';
import type { IListPeriod } from '../../../type/PeriodType';
import type { IListGroup, IGroupMember } from '../../../type/GroupType';
import type { IAssignmentTeacher } from '../../../type/AssignmentType';
import type { CouncilRow } from '../../../api/councilApi';

type LocationState = { council?: CouncilRow };
type CouncilTopicPayload = NonNullable<CouncilRow['topics']>[number];

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
  reviewerId?: string | null;
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
  members: string[];
};

type WorkflowTab = 'pick' | 'sort';

const CreateCouncilPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const section2Ref = useRef<HTMLDivElement | null>(null);
  const { selectedPeriod } = useGlobalVariable();
  const { data: periodList } = periodHooks.useFetchListPeriods({ page: 1, limit: 100 });
  const datnPeriods = useMemo(() => {
    const raw: IListPeriod[] = periodList?.rows ?? [];
    return raw.filter((p) => p.type?.toLowerCase() === 'datn');
  }, [periodList]);

  const [form, setForm] = useState<CommitteeForm>({
    name: '',
    batch: selectedPeriod?.name || '',
    room: '',
    date: '',
    time: '',
    members: [],
  });

  useEffect(() => {
    if (datnPeriods.length > 0 && !form.batch) {
      setForm((current) => ({ ...current, batch: datnPeriods[0].name }));
    }
  }, [datnPeriods]);
  const [selectedTopics, setSelectedTopics] = useState<SelectedTopic[]>([]);
  const [draggingTopicId, setDraggingTopicId] = useState<string | null>(null);
  const [dragOverTopicId, setDragOverTopicId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [workflowTab, setWorkflowTab] = useState<WorkflowTab>('pick');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const { data: groupList, refetch: refetchGroups } = groupHooks.useFetchListGroups();
  const { data: teacherList = [], refetch: refetchTeachers } = assignmentHooks.useFetchTeachers();
  const createCouncilMutation = councilHooks.useCreateCouncil();
  const updateCouncilMutation = councilHooks.useUpdateCouncil();

  const [advisorBuckets, setAdvisorBuckets] = useState<AdvisorBucket[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isPrefilledRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const stateFromLocation = (location?.state as LocationState) || null;
  const originalBatch = stateFromLocation?.council?.batch || '';

  useEffect(() => {
    // If we are editing and form.batch is equal to the original council batch, do not reset!
    if (editingId && form.batch === originalBatch) {
      return;
    }

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (form.batch) {
      refetchGroups();
      refetchTeachers();
      setSelectedTopics([]);
      setForm((current) => ({
        ...current,
        members: []
      }));
    }
  }, [form.batch, editingId, originalBatch]);

  useEffect(() => {
    if (groupList?.rows) {
      const bucketsMap: Record<string, SelectedTopic[]> = {};
      (groupList.rows as IListGroup[]).forEach((g) => {
        // Lọc đề tài thuộc đợt đang chọn tạo hội đồng
        const periodName = form.batch || selectedPeriod?.name || '';
        if (periodName && g.registrationBatch && g.registrationBatch !== periodName) {
          return;
        }

        const supervisor = g.supervisor || 'Chưa phân công';
        if (!bucketsMap[supervisor]) {
          bucketsMap[supervisor] = [];
        }
        bucketsMap[supervisor].push({
          id: g.id,
          topicCode: g.code,
          topicName: g.title,
          members: g.members.map((m: IGroupMember) => `${m.code} - ${m.name}`),
          advisorId: findTeacherIdByName(supervisor),
          minutes: 40,
        });
      });

      const buckets = Object.keys(bucketsMap).map((name) => ({
        advisorId: findTeacherIdByName(name),
        advisorName: name,
        topics: bucketsMap[name],
      }));
      setAdvisorBuckets(buckets);
    }
  }, [groupList, teacherList, selectedPeriod, form.batch]);

  const availableAdvisorOptions = useMemo(
    () =>
      teacherList.map((teacher: IAssignmentTeacher) => ({
        value: teacher.id,
        label: `${teacher.name} - Chuyên môn: ${teacher.major || 'Chưa rõ'}`,
      })),
    [teacherList],
  );

  const memberIds = form.members;

  const teacherNameById = (id: string) => {
    if (!id) return '';
    const cleanId = id.replace(/^(ThS|TS|PGS|GS|PGS\.\s*TS|GS\.\s*TS|ThS\.|TS\.|PGS\.\s*TS\.|GS\.\s*TS\.)\s+/i, '').trim();
    const found = teacherList.find((teacher: IAssignmentTeacher) => {
      const cleanTName = teacher.name.replace(/^(ThS|TS|PGS|GS|PGS\.\s*TS|GS\.\s*TS|ThS\.|TS\.|PGS\.\s*TS\.|GS\.\s*TS\.)\s+/i, '').trim();
      return teacher.id === id || cleanTName.toLowerCase() === cleanId.toLowerCase();
    });
    return found ? found.name : id;
  };

  const findTeacherIdByName = (name: string) => {
    if (!name) return '';
    const cleanName = name.replace(/^(ThS|TS|PGS|GS|PGS\.\s*TS|GS\.\s*TS|ThS\.|TS\.|PGS\.\s*TS\.|GS\.\s*TS\.)\s+/i, '').trim();
    const found = teacherList.find((teacher: IAssignmentTeacher) => {
      const cleanTName = teacher.name.replace(/^(ThS|TS|PGS|GS|PGS\.\s*TS|GS\.\s*TS|ThS\.|TS\.|PGS\.\s*TS\.|GS\.\s*TS\.)\s+/i, '').trim();
      return cleanTName.toLowerCase() === cleanName.toLowerCase();
    });
    return found ? found.id : name;
  };

  const updateMembers = (nextMemberIds: string[]) => {
    setForm((current) => ({ ...current, members: nextMemberIds }));
    setSelectedTopics((current) => current.filter((topic) => nextMemberIds.includes(topic.advisorId) || nextMemberIds.includes(findTeacherIdByName(topic.advisorId))));
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

  const updateTopicMinutes = (topicId: string, minutes: number) => {
    setAdvisorBuckets((current) =>
      current.map((bucket) => ({
        ...bucket,
        topics: bucket.topics.map((topic) => (topic.id === topicId ? { ...topic, minutes } : topic)),
      }))
    );
    setSelectedTopics((current) =>
      current.map((topic) => (topic.id === topicId ? { ...topic, minutes } : topic))
    );
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
      message.error(t(getKey('please_fill_all_council_info')));
      return;
    }

    if (memberIds.length === 0) {
      message.error(t(getKey('please_select_at_least_one_teacher')));
      return;
    }

    if (selectedTopics.length === 0) {
      message.error(t(getKey('please_select_at_least_one_topic')));
      return;
    }

    for (const topic of selectedTopics) {
      const hasInternal = topic.examinerIds && topic.examinerIds.length > 0;
      const hasExternal = topic.externalExaminers && topic.externalExaminers.length > 0;

      if (hasInternal) {
        const conflict = (topic.examinerIds || []).some((id) => id === topic.advisorId || (topic.reviewerId && id === topic.reviewerId));
        if (conflict) {
          message.error(t(getKey('examiner_conflict'), { code: topic.topicCode }));
          return;
        }
      }

      if (hasExternal) {
        const conflictExt = (topic.externalExaminers || []).some((id) => id === topic.advisorId || (topic.reviewerId && id === topic.reviewerId));
        if (conflictExt) {
          message.error(t(getKey('external_examiner_conflict'), { code: topic.topicCode }));
          return;
        }
      }
    }

    const selectedPeriodId = periodList?.rows?.find((p) => p.name === form.batch)?.id || selectedPeriod?.id;

    const payload = {
      title: form.name,
      room: form.room,
      date: form.date,
      time: form.time,
      dot_id: selectedPeriodId,
      members: form.members,
      topics: selectedTopics.map(st => {
        const sched = calculateTopicSchedules[st.id];
        return {
          id: st.id,
          nhom_id: st.id,
          reviewerId: st.reviewerId,
          examinerIds: st.examinerIds || [],
          externalExaminers: st.externalExaminers || [],
          startTime: sched ? sched.start : '08:00',
          minutes: st.minutes
        };
      })
    };

    if (editingId) {
      updateCouncilMutation.mutate({ id: editingId, body: payload }, {
        onSuccess: () => {
          setSaved(true);
          message.success(t(getKey('update_council_success_message')));
          navigate('/councils');
        },
        onError: (err) => {
          const data = err.response?.data as { message?: string } | undefined;
          message.error(data?.message || err.message || t(getKey('config_error_message')));
        }
      });
    } else {
      createCouncilMutation.mutate(payload, {
        onSuccess: () => {
          setSaved(true);
          message.success(t(getKey('create_council_success'), { count: selectedTopics.length }) as string);
          navigate('/councils');
        },
        onError: (err) => {
          const data = err.response?.data as { message?: string } | undefined;
          message.error(data?.message || err.message || t(getKey('config_error_message')));
        }
      });
    }
  };

  const eligibleTopics = useMemo(() => {
    return advisorBuckets
      .filter((bucket) => memberIds.includes(bucket.advisorId))
      .flatMap((bucket) => bucket.topics);
  }, [advisorBuckets, memberIds]);

  const calculateTopicSchedules = useMemo(() => {
    let currentStartTime = form.time || '08:00';
    const schedules: Record<string, { start: string; end: string }> = {};

    selectedTopics.forEach((topic) => {
      const [hours, minutes] = currentStartTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours || 8, minutes || 0, 0, 0);

      const startFormatted = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
      date.setMinutes(date.getMinutes() + (topic.minutes || 40));
      const endFormatted = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

      schedules[topic.id] = {
        start: startFormatted,
        end: endFormatted,
      };

      currentStartTime = endFormatted;
    });

    return schedules;
  }, [form.time, selectedTopics]);

  const getTeacherRoleInCouncil = (id: string, index: number) => {
    if (index === 0) return 'Chủ tịch';
    const isReviewer = selectedTopics.some((t) => t.reviewerId === id);
    if (isReviewer) return 'Phản biện';
    return 'Ủy viên';
  };
  const committeeSummary = t(getKey('members_count_label'), { count: memberIds.length }) as string;

  const openSortTab = () => {
    if (selectedTopics.length > 0) setWorkflowTab('sort');
  };

  // If navigated here for editing, prefill form
  useEffect(() => {
    const state = (location?.state as LocationState) || null;
    const council = state?.council;
    if (!council) return;

    setEditingId(council.id);

    setForm((current) => ({
      ...current,
      name: council.title || current.name,
      batch: council.batch || current.batch,
      room: council.room || current.room,
      members: (council.member || []).concat(council.chair || []).concat(council.reviewer || []).map((nm: string) => findTeacherIdByName(nm)).filter(Boolean) as string[],
      date: (() => {
        const parts = council.dateTime ? council.dateTime.split(' · ') : [];
        if (parts.length > 0) {
          const dParts = parts[0].split('/');
          if (dParts.length === 3) {
            return `${dParts[2]}-${dParts[1]}-${dParts[0]}`;
          }
        }
        return '';
      })(),
      time: (() => {
        const parts = council.dateTime ? council.dateTime.split(' · ') : [];
        return parts.length > 1 ? parts[1] : '';
      })(),
    }));
  }, [location, teacherList]);

  // Prefill selectedTopics once advisorBuckets, teacherList and council are loaded
  useEffect(() => {
    const state = (location?.state as LocationState) || null;
    const council = state?.council;
    if (!council || advisorBuckets.length === 0 || teacherList.length === 0 || isPrefilledRef.current) return;

    const topicsFromCouncil: SelectedTopic[] = [];
    const councilTopics: CouncilTopicPayload[] = council.topics || council.topicGroups || [];

    councilTopics.forEach((topic) => {
      const found = advisorBuckets.flatMap((b) => b.topics).find((pt) => pt.topicCode === topic.code);
      if (found) {
        const sel: SelectedTopic = {
          ...found,
          reviewerId: topic.reviewerId || (topic.reviewer ? findTeacherIdByName(topic.reviewer) : null),
          examinerIds: topic.examinerIds || (topic.examiners || []).map((n: string) => findTeacherIdByName(n)).filter(Boolean) as string[],
          externalExaminers: (topic.externalExaminers || []).map((n: string) => findTeacherIdByName(n)).filter(Boolean) as string[],
          startTime: topic.startTime || null,
          minutes: topic.minutes || found.minutes,
        };
        topicsFromCouncil.push(sel);
      }
    });

    if (topicsFromCouncil.length > 0) {
      setSelectedTopics(topicsFromCouncil);
      setWorkflowTab('sort');
      isPrefilledRef.current = true;
      setTimeout(() => section2Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location, advisorBuckets, teacherList]);

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
          <h1 className="text-2xl font-medium">
            {editingId ? 'Chỉnh sửa hội đồng' : t(getKey('create_council'))}
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            {editingId ? 'Chỉnh sửa thông tin hội đồng bảo vệ' : t(getKey('create_council_desc'))}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-[var(--color-primary)]">PHẦN 1</div>
              <div className="font-medium">{t(getKey('step1_title'))}</div>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-[11px] text-gray-600 shadow-sm">{t(getKey('step1_desc'))}</div>
          </div>
          <div className="space-y-4 p-5 md:p-6">
              <div>
                <div className="mb-1 text-xs text-gray-600">{t(getKey('council_name'))}</div>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="VD: Hội đồng số 1" />
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">Đợt hoạt động:</div>
                <Select 
                  value={form.batch} 
                  onChange={(value) => setForm({ ...form, batch: value })} 
                  className="w-full animate-fade-in"
                  placeholder="Chọn đợt hoạt động để lọc đề tài..."
                  disabled={!!editingId}
                >
                  {datnPeriods.map((p) => (
                    <Select.Option key={p.id} value={p.name}>
                      {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">{t(getKey('defense_room'))}</div>
                <Input value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} placeholder="VD: A1.401" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">{t(getKey('defense_date'))}</div>
                  <DatePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    value={form.date ? dayjs(form.date, 'YYYY-MM-DD', true) : null}
                    onChange={(date) => setForm({ ...form, date: date ? date.format('YYYY-MM-DD') : '' })}
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">{t(getKey('start_time'))}</div>
                  <TimePicker
                    className="w-full"
                    format="HH:mm"
                    value={form.time ? dayjs(form.time, 'HH:mm', true) : null}
                    onChange={(time) => setForm({ ...form, time: time ? time.format('HH:mm') : '' })}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-600">{t(getKey('committee_members'))}</div>
                    <div className="mt-1 text-xs text-gray-500">{t(getKey('committee_members_desc'))}</div>
                  </div>
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-600">{committeeSummary}</div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{t(getKey('committee_members'))}</div>
                      <div className="mt-1 text-xs text-gray-500">{t(getKey('committee_members_select_desc'))}</div>
                    </div>
                    <div className="w-full space-y-3">
                      <Select
                        value={form.members}
                        onChange={updateMembers}
                        placeholder={availableAdvisorOptions.length > 0 ? t(getKey('select_teachers_placeholder')) : t(getKey('no_teachers_available'))}
                        options={availableAdvisorOptions}
                        className="w-full"
                        mode="multiple"
                        disabled={availableAdvisorOptions.length === 0}
                      />
                      {form.members.length > 0 && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-inner max-h-[300px] overflow-y-auto">
                          <div className="text-xs font-semibold text-slate-500 mb-2.5">
                            Danh sách thành viên hội đồng đã chọn ({form.members.length}):
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {form.members.map((id, idx) => (
                              <div key={id} className="text-xs flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                                <span className="font-medium text-slate-700 truncate mr-2">
                                  {idx + 1}. {teacherNameById(id)}
                                </span>
                                <Tag color={idx === 0 ? 'gold' : 'blue'} className="m-0 text-[10px] uppercase font-semibold">
                                  {idx === 0 ? 'Chủ tịch' : 'Thành viên'}
                                </Tag>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3 pt-2">
                  <Button onClick={() => navigate('/councils')}>{t(getKey('cancel_btn_text'))}</Button>
                  <Button type="primary" onClick={scrollToSection2} disabled={!form.name || !form.room || !form.date || !form.time || memberIds.length === 0}>
                    {t(getKey('continue_to_select_topics'))}
                  </Button>
                </div>
              </div>
          </div>
        </Card>

        <div ref={section2Ref}>
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-[var(--color-primary)]">PHẦN 2</div>
                <div className="font-medium">{t(getKey('step2_title'))}</div>
                <div className="mt-1 text-xs text-gray-500">{t(getKey('step2_desc'))}</div>
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-600">{(t(getKey('selected_topics_count'), { count: selectedTopics.length }) as string)}</div>
            </div>

            <div className="flex gap-2 border-b border-gray-200 px-5 pt-4">
              <button
                type="button"
                onClick={() => setWorkflowTab('pick')}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium ${workflowTab === 'pick' ? 'border border-b-0 border-gray-200 bg-white text-[var(--color-primary)]' : 'bg-gray-50 text-gray-600'}`}
              >
                {t(getKey('select_topics_tab'))}
              </button>
              <button
                type="button"
                onClick={openSortTab}
                className={`rounded-t-lg px-4 py-2 text-sm font-medium ${workflowTab === 'sort' ? 'border border-b-0 border-gray-200 bg-white text-[var(--color-primary)]' : 'bg-gray-50 text-gray-600'}`}
              >
                {t(getKey('sort_topics_tab'))}
              </button>
            </div>

            {workflowTab === 'pick' ? (
              <div className="p-5">
                {eligibleTopics.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                    Chưa có đề tài nào đủ điều kiện hoặc không có giảng viên hướng dẫn nào của đề tài tham gia hội đồng này.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          <th className="w-14 px-4 py-3 text-left">{t(getKey('select_column'))}</th>
                          <th className="w-16 px-4 py-3 text-left">STT</th>
                          <th className="px-4 py-3 text-left">{t(getKey('topic_name'))}</th>
                          <th className="px-4 py-3 text-left">{t(getKey('advisor_short'))}</th>
                          <th className="px-4 py-3 text-left">Thành viên</th>
                          <th className="w-28 px-4 py-3 text-left">{t(getKey('duration_column'))}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eligibleTopics.map((topic, idx) => {
                          const checked = selectedTopics.some((item) => item.id === topic.id);

                          return (
                            <tr key={topic.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 align-top">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(event) => toggleTopic(topic, event.target.checked)}
                                  className="h-4 w-4 accent-[var(--color-primary)]"
                                />
                              </td>
                              <td className="px-4 py-3 align-top font-medium text-gray-700">{formatNumber(idx + 1)}</td>
                              <td className="px-4 py-3 align-top font-medium text-gray-900">{topic.topicName}</td>
                              <td className="px-4 py-3 align-top text-gray-600">{teacherNameById(topic.advisorId)}</td>
                              <td className="px-4 py-3 align-top text-xs text-gray-600">
                                <div className="flex flex-col gap-0.5">
                                  {topic.members.map((m: string) => (
                                    <div key={m}>{m}</div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 align-top">
                                <Input
                                  type="number"
                                  value={topic.minutes}
                                  onChange={(e) => updateTopicMinutes(topic.id, parseInt(e.target.value) || 0)}
                                  min={0}
                                  className="w-24"
                                  suffix="p"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : selectedTopics.length === 0 ? (
              <div className="px-5 py-16 text-center text-gray-500">{t(getKey('no_topics_selected_message'))}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="w-12 px-4 py-3 text-left"></th>
                      <th className="w-20 px-4 py-3 text-left">{t(getKey('stt'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('topic_name'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('advisor_short'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('reviewer_short'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('examiner_title'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('external_teachers_short'))}</th>
                      <th className="px-4 py-3 text-left">{t(getKey('time'))}</th>
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
                        <td className="px-4 py-3 align-top font-medium text-gray-700">{formatNumber(index + 1)}</td>
                        <td className="px-4 py-3 align-top font-medium text-gray-900">{topic.topicName}</td>
                        <td className="px-4 py-3 align-top text-gray-600">{teacherNameById(topic.advisorId)}</td>
                        <td className="px-4 py-3 align-top">
                          <Select
                            value={topic.reviewerId || undefined}
                            onChange={(value) => updateReviewerForTopic(topic.id, value ?? null)}
                            placeholder={t(getKey('select_reviewer_placeholder'))}
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
                            placeholder={t(getKey('select_examiners_placeholder'))}
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
                            placeholder={t(getKey('select_external_placeholder'))}
                            options={teacherList.filter((teacher) => !memberIds.includes(teacher.id)).map((teacher) => ({ value: teacher.id, label: `${teacher.name} - Chuyên môn: ${teacher.major || 'Chưa rõ'}` }))}
                            className="w-full min-w-[220px]"
                            allowClear
                          />
                        </td>
                        <td className="px-4 py-3 align-top font-semibold text-[var(--color-primary)]">
                          {(() => {
                            const sched = calculateTopicSchedules[topic.id];
                            return sched ? `${sched.start} - ${sched.end}` : '—';
                          })()}
                          <div className="text-xs text-gray-500 font-normal mt-1">
                            (Dự kiến: {topic.minutes}p)
                          </div>
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
        <Button onClick={() => navigate('/councils')}>{t(getKey('cancel_btn_text'))}</Button>
        <Button onClick={() => setIsPreviewVisible(true)} disabled={!form.name || !form.room || !form.date || !form.time || memberIds.length === 0 || selectedTopics.length === 0}>
          Xem trước
        </Button>
        <Button type="primary" onClick={handleSave} disabled={!form.name || !form.room || !form.date || !form.time || memberIds.length === 0 || selectedTopics.length === 0}>
          {editingId ? 'Cập nhật hội đồng' : 'Lưu hội đồng'}
        </Button>
      </div>

      <div className={saved ? 'mt-4' : 'hidden'}>
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {t(getKey('save_council_success_desc'))}
        </div>
      </div>

      <Modal
        title={<span className="text-lg font-bold text-slate-800">Xem trước thông tin hội đồng</span>}
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        centered
        footer={[
          <Button key="close" onClick={() => setIsPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button key="save" type="primary" onClick={() => { setIsPreviewVisible(false); handleSave(); }}>
            Xác nhận lưu
          </Button>
        ]}
        width={800}
      >
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Tên hội đồng</div>
              <div className="text-sm font-medium text-slate-800">{form.name || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Phòng bảo vệ</div>
              <div className="text-sm font-medium text-slate-800">{form.room || '—'}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Ngày bảo vệ</div>
              <div className="text-sm font-medium text-slate-800">{form.date ? new Date(form.date).toLocaleDateString('vi-VN') : '—'}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Giờ bắt đầu</div>
              <div className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                {form.time ? (
                  <>
                    {form.time}{' '}
                    <Tag color={Number(form.time.split(':')[0]) < 12 ? 'orange' : 'blue'} className="m-0 text-[10px] py-0 px-1.5 rounded">
                      {Number(form.time.split(':')[0]) < 12 ? 'Buổi sáng' : 'Buổi chiều'}
                    </Tag>
                  </>
                ) : '—'}
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              {form.members.map((id, idx) => {
                const role = getTeacherRoleInCouncil(id, idx);
                const tagColors: Record<string, string> = {
                  'Chủ tịch': 'gold',
                  'Phản biện': 'orange',
                  'Ủy viên': 'blue'
                };
                return (
                  <Tag color={tagColors[role] || 'blue'} key={id} className="px-2.5 py-1 text-xs">
                    {role}: {teacherNameById(id)}
                  </Tag>
                );
              })}
              {form.members.length === 0 && <span className="text-xs text-slate-400 italic">Chưa chọn thành viên</span>}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 mb-2">Danh sách bảo vệ & Sắp xếp ({selectedTopics.length}):</div>
            <div className="overflow-hidden rounded-lg border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-2">STT</th>
                    <th className="px-3 py-2">Đề tài / Sinh viên</th>
                    <th className="px-3 py-2">GVHD</th>
                    <th className="px-3 py-2">GVPB</th>
                    <th className="px-3 py-2">Ủy viên (Người chấm)</th>
                    <th className="px-3 py-2">Giờ bảo vệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedTopics.map((topic, index) => (
                    <tr key={topic.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 font-medium text-slate-700">{index + 1}</td>
                      <td className="px-3 py-2 max-w-[200px]">
                        <div className="font-semibold text-slate-800 truncate">{topic.topicName}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{topic.members.join(', ')}</div>
                      </td>
                      <td className="px-3 py-2 text-slate-600">{teacherNameById(topic.advisorId)}</td>
                      <td className="px-3 py-2 text-slate-600 font-medium">{topic.reviewerId ? teacherNameById(topic.reviewerId) : '—'}</td>
                      <td className="px-3 py-2 text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          {(topic.examinerIds || []).map((id) => (
                            <span key={id}>{teacherNameById(id)}</span>
                          ))}
                          {(topic.externalExaminers || []).map((id) => (
                            <span key={id} className="text-purple-600 font-medium">{teacherNameById(id)} (Ngoài trường)</span>
                          ))}
                          {(!topic.examinerIds?.length && !topic.externalExaminers?.length) && '—'}
                        </div>
                      </td>
                      <td className="px-3 py-2 font-semibold text-[var(--color-primary)]">
                        {(() => {
                          const sched = calculateTopicSchedules[topic.id];
                          return sched ? `${sched.start} - ${sched.end}` : '—';
                        })()}
                      </td>
                    </tr>
                  ))}
                  {selectedTopics.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400 italic">Chưa có đề tài nào được chọn bảo vệ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateCouncilPage;
