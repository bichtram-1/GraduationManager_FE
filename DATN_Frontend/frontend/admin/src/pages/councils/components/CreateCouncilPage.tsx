import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button, Card, Input, Select, message } from 'antd';
import { ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn, STATUS_CODE } from '../../../constants/commonConst';
import { useTranslation } from 'react-i18next';
import { groupHooks } from '../../../hooks/useGroups';
import { assignmentHooks } from '../../../hooks/useAssignments';
import { councilHooks } from '../../../hooks/useCouncils';
import { getKey } from '@shared/types/I18nKeyType';
import { formatNumber } from '@shared/utils/numberUtils';

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

  const { data: groupList } = groupHooks.useFetchListGroups();
  const { data: teacherList = [] } = assignmentHooks.useFetchTeachers();
  const createCouncilMutation = councilHooks.useCreateCouncil();
  const updateCouncilMutation = councilHooks.useUpdateCouncil();

  const [advisorBuckets, setAdvisorBuckets] = useState<AdvisorBucket[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const isPrefilledRef = useRef(false);

  useEffect(() => {
    if (groupList?.rows) {
      const bucketsMap: Record<string, SelectedTopic[]> = {};
      groupList.rows.forEach((g: any) => {
        const supervisor = g.supervisor || 'Chưa phân công';
        if (!bucketsMap[supervisor]) {
          bucketsMap[supervisor] = [];
        }
        bucketsMap[supervisor].push({
          id: g.id,
          topicCode: g.code,
          topicName: g.title,
          members: g.members.map((m: any) => `${m.code} - ${m.name}`),
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
  }, [groupList, teacherList]);

  const availableAdvisorOptions = useMemo(
    () =>
      teacherList.map((t: any) => ({
        value: t.id,
        label: t.name,
      })),
    [teacherList],
  );

  const availableAdvisorIds = useMemo(() => new Set(teacherList.map((t: any) => t.id)), [teacherList]);
  const memberIds = form.members;

  const teacherNameById = (id: string) => {
    const found = teacherList.find((teacher: any) => teacher.id === id || teacher.name === id);
    return found ? found.name : id;
  };

  const findTeacherIdByName = (name: string) => {
    const found = teacherList.find((t: any) => t.name === name);
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

  const updateStartTimeForTopic = (topicId: string, startTime: string | null) => {
    setSelectedTopics((current) => current.map((topic) => (topic.id === topicId ? { ...topic, startTime } : topic)));
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
      if (!topic.reviewerId) {
        message.error(t(getKey('topic_missing_reviewer'), { code: topic.topicCode }));
        return;
      }

      const hasInternal = topic.examinerIds && topic.examinerIds.length > 0;
      const hasExternal = topic.externalExaminers && topic.externalExaminers.length > 0;
      if (!hasInternal && !hasExternal) {
        message.error(t(getKey('topic_missing_examiners'), { code: topic.topicCode }));
        return;
      }

      if (!topic.startTime) {
        message.error(t(getKey('topic_missing_start_time'), { code: topic.topicCode }));
        return;
      }

      if (hasInternal) {
        const conflict = (topic.examinerIds || []).some((id) => id === topic.advisorId || id === topic.reviewerId);
        if (conflict) {
          message.error(t(getKey('examiner_conflict'), { code: topic.topicCode }));
          return;
        }
      }

      if (hasExternal) {
        const conflictExt = (topic.externalExaminers || []).some((id) => id === topic.advisorId || id === topic.reviewerId);
        if (conflictExt) {
          message.error(t(getKey('external_examiner_conflict'), { code: topic.topicCode }));
          return;
        }
      }
    }

    const payload = {
      title: form.name,
      room: form.room,
      date: form.date,
      time: form.time,
      members: form.members,
      topics: selectedTopics.map(st => ({
        id: st.id,
        nhom_id: st.id,
        reviewerId: st.reviewerId,
        examinerIds: st.examinerIds || [],
        externalExaminers: st.externalExaminers || [],
        startTime: st.startTime,
        minutes: st.minutes
      }))
    };

    if (editingId) {
      updateCouncilMutation.mutate({ id: editingId, body: payload }, {
        onSuccess: () => {
          setSaved(true);
          message.success(t(getKey('update_council_success_message')));
          navigate('/councils');
        },
        onError: (err: any) => {
          message.error(err.message || t(getKey('config_error_message')));
        }
      });
    } else {
      createCouncilMutation.mutate(payload, {
        onSuccess: () => {
          setSaved(true);
          message.success(t(getKey('create_council_success'), { count: selectedTopics.length } as any));
          navigate('/councils');
        },
        onError: (err: any) => {
          message.error(err.message || t(getKey('config_error_message')));
        }
      });
    }
  };

  const selectedCountByAdvisor = (advisorId: string) => selectedTopics.filter((topic) => topic.advisorId === advisorId).length;
  const visibleAdvisorBuckets = advisorBuckets.filter((bucket) => memberIds.includes(bucket.advisorId));
  const committeeSummary = t(getKey('members_count_label'), { count: memberIds.length } as any);

  const openSortTab = () => {
    if (selectedTopics.length > 0) setWorkflowTab('sort');
  };

  // If navigated here for editing, prefill form
  useEffect(() => {
    const state: any = (location && (location as any).state) || null;
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

  // Prefill selectedTopics once advisorBuckets and council are loaded
  useEffect(() => {
    const state: any = (location && (location as any).state) || null;
    const council = state?.council;
    if (!council || advisorBuckets.length === 0 || isPrefilledRef.current) return;

    const topicsFromCouncil: SelectedTopic[] = [];
    const councilTopics = council.topics || council.topicGroups || [];
    
    councilTopics.forEach((t: any) => {
      const found = advisorBuckets.flatMap((b) => b.topics).find((pt) => pt.topicCode === t.code);
      if (found) {
        const sel: SelectedTopic = {
          ...found,
          reviewerId: t.reviewerId || (t.reviewer ? findTeacherIdByName(t.reviewer) : null),
          examinerIds: t.examinerIds || (t.examiners || []).map((n: string) => findTeacherIdByName(n)).filter(Boolean) as string[],
          externalExaminers: t.externalExaminers || [],
          startTime: t.startTime || null,
          minutes: t.minutes || found.minutes,
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
  }, [location, advisorBuckets]);

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
          <h1 className="text-2xl font-medium">{t(getKey('create_council'))}</h1>
          <p className="mt-0.5 text-sm text-gray-600">{t(getKey('create_council_desc'))}</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-[var(--color-primary)]">BƯỚC 1</div>
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
                <div className="mb-1 text-xs text-gray-600">{t(getKey('select_period'))}</div>
                <Select value={form.batch} onChange={(value) => setForm({ ...form, batch: value })} className="w-full">
                  <Select.Option value="Đợt ĐATN Học kỳ 2 - 2026">Đợt ĐATN Học kỳ 2 - 2026</Select.Option>
                </Select>
              </div>

              <div>
                <div className="mb-1 text-xs text-gray-600">{t(getKey('defense_room'))}</div>
                <Input value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} placeholder="VD: A1.401" />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">{t(getKey('defense_date'))}</div>
                  <Input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
                </div>
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">{t(getKey('start_time'))}</div>
                  <Input type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
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
                    <Select
                      value={form.members}
                      onChange={updateMembers}
                      placeholder={availableAdvisorOptions.length > 0 ? t(getKey('select_teachers_placeholder')) : t(getKey('no_teachers_available'))}
                      options={availableAdvisorOptions}
                      className="w-full"
                      mode="multiple"
                      maxTagCount="responsive"
                      disabled={availableAdvisorOptions.length === 0}
                    />
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
                <div className="text-sm font-semibold text-[var(--color-primary)]">BƯỚC 2</div>
                <div className="font-medium">{t(getKey('step2_title'))}</div>
                <div className="mt-1 text-xs text-gray-500">{t(getKey('step2_desc'))}</div>
              </div>
              <div className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-600">{t(getKey('selected_topics_count'), { count: selectedTopics.length } as any)}</div>
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
              <div className="space-y-4 p-5">
                {visibleAdvisorBuckets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                    {t(getKey('select_teachers_first_desc'))}
                  </div>
                ) : (
                  visibleAdvisorBuckets.map((bucket) => {
                    const selectedInBucket = selectedCountByAdvisor(bucket.advisorId);

                    return (
                      <div key={bucket.advisorId} className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 px-4 py-3">
                          <div>
                            <div className="text-sm font-medium">{t(getKey('advisor_short'))}: {bucket.advisorName}</div>
                            <div className="mt-1 text-xs text-gray-500">
                              {t(getKey('topics_selected_count'), { total: bucket.topics.length, count: selectedInBucket } as any)}
                            </div>
                          </div>
                          <div className="rounded-full bg-white px-3 py-1 text-[11px] text-gray-600">{t(getKey('status_active'))}</div>
                        </div>

                        <div className="overflow-x-auto bg-white">
                          <table className="w-full border-collapse text-sm">
                            <thead className="bg-white text-gray-500">
                              <tr>
                                <th className="w-14 px-4 py-3 text-left">{t(getKey('select_column'))}</th>
                                <th className="w-24 px-4 py-3 text-left">{t(getKey('group_code'))}</th>
                                <th className="px-4 py-3 text-left">{t(getKey('topic_name'))}</th>
                                <th className="px-4 py-3 text-left">{t(getKey('student_name'))}</th>
                                <th className="w-28 px-4 py-3 text-left">{t(getKey('duration_column'))}</th>
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
                                        className="h-4 w-4 accent-[var(--color-primary)]"
                                      />
                                    </td>
                                    <td className="px-4 py-3 align-top font-medium text-[var(--color-blue-md)]">{topic.topicCode}</td>
                                    <td className="px-4 py-3 align-top font-medium text-gray-900">{topic.topicName}</td>
                                    <td className="px-4 py-3 align-top text-xs text-gray-600">{topic.members.join(', ')}</td>
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
                      </div>
                    );
                  })
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
                      <th className="w-28 px-4 py-3 text-left">{t(getKey('group_code'))}</th>
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
                        <td className="px-4 py-3 align-top font-medium text-[var(--color-blue-md)]">{topic.topicCode}</td>
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
                            options={teacherList.filter((t: any) => !memberIds.includes(t.id)).map((t: any) => ({ value: t.id, label: t.name }))}
                            className="w-full min-w-[220px]"
                            allowClear
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Input
                            type="datetime-local"
                            value={topic.startTime || ''}
                            onChange={(e) => updateStartTimeForTopic(topic.id, e.target.value || null)}
                            className="w-full min-w-[200px]"
                          />
                          <div className="text-xs text-gray-500 mt-1">
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
        <Button type="primary" onClick={handleSave} disabled={!form.name || !form.room || !form.date || !form.time || memberIds.length === 0 || selectedTopics.length === 0}>
          {t(getKey('save_and_publish_btn'))}
        </Button>
      </div>

      <div className={saved ? 'mt-4' : 'hidden'}>
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {t(getKey('save_council_success_desc'))}
        </div>
      </div>
    </div>
  );
};

export default CreateCouncilPage;
