import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Button, Card, DatePicker, Input, Select, Tag, TimePicker, Modal, message, Checkbox } from 'antd';
import dayjs from 'dayjs';
import { ArrowLeftOutlined, MenuOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
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
  examinerId?: string | null;
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

const useDragScroll = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('select') ||
        target.closest('input') ||
        target.closest('button') ||
        target.closest('.ant-select') ||
        target.closest('.ant-btn') ||
        target.closest('tr[draggable]')
      ) {
        return;
      }
      isDown = true;
      el.style.cursor = 'grabbing';
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      el.style.cursor = '';
    };

    const handleMouseUp = () => {
      isDown = false;
      el.style.cursor = '';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mousemove', handleMouseMove);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return ref;
};

const normalizeString = (str: any) => {
  if (typeof str !== 'string') str = String(str || '');
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

const cleanAndNormalize = (str: any) => {
  if (typeof str !== 'string') str = String(str || '');
  if (!str) return '';
  return str
    .normalize('NFC')
    .replace(/^((GS|PGS)\b\.?\s*(TS\b)?\.?|ThS\b\.?|TS\b\.?|GVC\b\.?)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const cleanNormalizeNoAccent = (str: any) => {
  if (typeof str !== 'string') str = String(str || '');
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/^((GS|PGS)\b\.?\s*(TS\b)?\.?|ThS\b\.?|TS\b\.?|GVC\b\.?)\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const CreateCouncilPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const section2Ref = useRef<HTMLDivElement | null>(null);
  const pickContainerRef = useDragScroll();
  const sortContainerRef = useDragScroll();
  const previewContainerRef = useDragScroll();
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
  const [selectedChairId, setSelectedChairId] = useState<string | null>(null);
  const [selectedSecretaryId, setSelectedSecretaryId] = useState<string | null>(null);
  const [swappingTopic, setSwappingTopic] = useState<SelectedTopic | null>(null);
  const [examinersToSwapOut, setExaminersToSwapOut] = useState<string[]>([]);
  const [replacementExaminers, setReplacementExaminers] = useState<string[]>([]);
  const [draggingTopicId, setDraggingTopicId] = useState<string | null>(null);
  const [dragOverTopicId, setDragOverTopicId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [workflowTab, setWorkflowTab] = useState<WorkflowTab>('pick');
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const [checkedSortTopicIds, setCheckedSortTopicIds] = useState<string[]>([]);

  useEffect(() => {
    const selectedIds = selectedTopics.map((t) => t.id);
    setCheckedSortTopicIds((prev) => prev.filter((id) => selectedIds.includes(id)));
  }, [selectedTopics]);

  const handleBulkDeselect = () => {
    setSelectedTopics((current) => current.filter((t) => !checkedSortTopicIds.includes(t.id)));
    setCheckedSortTopicIds([]);
  };

  const [activeRowTopicId, setActiveRowTopicId] = useState<string | null>(null);

  const moveTopicUpDown = (index: number, direction: 'up' | 'down') => {
    setSelectedTopics((current) => {
      const next = [...current];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return current;

      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleScrollPropagation = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const deltaY = e.deltaY;

    // Check if scrolling up at the top
    if (deltaY < 0 && el.scrollTop === 0) {
      const contentEl = document.querySelector('.ant-layout-content') || document.documentElement;
      contentEl.scrollTop += deltaY;
    }
    // Check if scrolling down at the bottom
    else if (deltaY > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      const contentEl = document.querySelector('.ant-layout-content') || document.documentElement;
      contentEl.scrollTop += deltaY;
    }
  };
  const [advisorSortOrder, setAdvisorSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [selectedAdvisorFilterId, setSelectedAdvisorFilterId] = useState<string | null>(null);

  const { data: groupList, refetch: refetchGroups } = groupHooks.useFetchListGroups();
  const { data: teacherList = [], refetch: refetchTeachers } = assignmentHooks.useFetchTeachers();
  const createCouncilMutation = councilHooks.useCreateCouncil();
  const updateCouncilMutation = councilHooks.useUpdateCouncil();
  const { data: councilsList = [] } = councilHooks.useFetchListCouncils();

  const [advisorBuckets, setAdvisorBuckets] = useState<AdvisorBucket[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const isPrefilledRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const stateFromLocation = (location?.state as LocationState) || null;
  const originalBatch = stateFromLocation?.council?.batch || '';

  useEffect(() => {
    if (!editingId && councilsList && councilsList.length > 0) {
      let maxNum = 0;
      const currentPeriodName = form.batch || selectedPeriod?.name || '';
      const councilsInPeriod = councilsList.filter((c: any) => 
        String(c.dot_id) === String(selectedPeriod?.id) || 
        c.batch === currentPeriodName
      );

      councilsInPeriod.forEach((c) => {
        const match = c.title?.match(/^Hội\s+đồng\s+(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      });
      if (maxNum === 0) {
        maxNum = councilsInPeriod.length;
      }
      setForm((current) => ({
        ...current,
        name: `Hội đồng ${maxNum + 1}`,
      }));
    } else if (!editingId && (!councilsList || councilsList.length === 0)) {
      setForm((current) => ({
        ...current,
        name: 'Hội đồng 1',
      }));
    }
  }, [councilsList, editingId, form.batch, selectedPeriod]);

  const roomOptions = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      value: `F7.${i + 1}`,
      label: `F7.${i + 1}`,
    }));
  }, []);

  const selectedPeriodObj = useMemo(() => {
    return datnPeriods.find((p) => p.name === form.batch);
  }, [datnPeriods, form.batch]);

  const validateDefenseDate = (dateStr: string, periodObj?: IListPeriod) => {
    if (!dateStr || !periodObj) {
      setDateError(null);
      return true;
    }
    
    const date = dayjs(dateStr, 'YYYY-MM-DD');
    const defenseStart = periodObj.defenseStartDate ? dayjs(periodObj.defenseStartDate, 'DD/MM/YYYY') : null;
    const defenseEnd = periodObj.defenseEndDate ? dayjs(periodObj.defenseEndDate, 'DD/MM/YYYY') : null;

    if (defenseStart && defenseEnd) {
      if (date.isBefore(defenseStart, 'day') || date.isAfter(defenseEnd, 'day')) {
        const startStr = defenseStart.format('DD/MM/YYYY');
        const endStr = defenseEnd.format('DD/MM/YYYY');
        setDateError(`Ngày bảo vệ phải nằm trong thời gian quy định ${startStr} - ${endStr}`);
        return false;
      }
    }

    setDateError(null);
    return true;
  };

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
    // Chỉ ẩn thanh cuộn của khung nhìn chính khi đang ở trang Tạo/Sửa hội đồng này
    const contentEl = document.querySelector('.ant-layout-content');
    if (contentEl) {
      contentEl.classList.add('no-scrollbar');
    }
    return () => {
      if (contentEl) {
        contentEl.classList.remove('no-scrollbar');
      }
    };
  }, []);

  useEffect(() => {
    if (groupList?.rows) {
      const bucketsMap: Record<string, SelectedTopic[]> = {};
      (groupList.rows as IListGroup[]).forEach((g) => {
        // Lọc đề tài thuộc đợt đang chọn tạo hội đồng
        const periodName = form.batch || selectedPeriod?.name || '';
        if (periodName && g.registrationBatch && g.registrationBatch !== periodName) {
          return;
        }

        // Chỉ hiển thị nhóm đề tài chưa được gán vào hội đồng nào, hoặc đang thuộc hội đồng hiện tại đang chỉnh sửa
        const isAssignedToOther = g.hoi_dong_id && (!editingId || String(g.hoi_dong_id) !== String(editingId));
        if (isAssignedToOther) {
          return;
        }

        // Lọc theo kết quả hướng dẫn/phản biện dựa trên thời gian đợt
        const periodObj = datnPeriods.find((p) => p.name === periodName);
        if (periodObj) {
          const parsePeriodDate = (dateStr?: string) => {
            if (!dateStr) return null;
            let d = dayjs(dateStr, 'DD/MM/YYYY');
            if (!d.isValid()) d = dayjs(dateStr, 'YYYY-MM-DD');
            return d.isValid() ? d : null;
          };

          const today = dayjs();
          const ngayBatDauPhanBien = parsePeriodDate(periodObj.reviewStartDate);

          const kqHd = g.ket_qua_huong_dan;
          const kqPb = g.ket_qua_phan_bien;

          if (ngayBatDauPhanBien && today.isAfter(ngayBatDauPhanBien.subtract(1, 'day'), 'day')) {
            // Từ ngày bắt đầu phản biện đến cuối đợt: Loại bỏ các nhóm đề tài có kết quả là KHONG_DAT, giữ lại NULL và DAT
            if (kqHd === 'KHONG_DAT' || kqPb === 'KHONG_DAT') {
              return;
            }
          } else {
            // Trước ngày bắt đầu phản biện: Chỉ hiện các nhóm có kết quả hướng dẫn & phản biện là null hoặc DAT
            const isHdValid = !kqHd || kqHd === 'DAT';
            const isPbValid = !kqPb || kqPb === 'DAT';
            if (!isHdValid || !isPbValid) {
              return;
            }
          }
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
  }, [groupList, teacherList, selectedPeriod, form.batch, editingId, datnPeriods]);

  const lecturersWithUnassignedTopics = useMemo(() => {
    const totalGroupsCount: Record<string, number> = {};
    const assignedGroupsCount: Record<string, number> = {};

    if (groupList?.rows) {
      const periodName = form.batch || selectedPeriod?.name || '';
      (groupList.rows as IListGroup[]).forEach((g) => {
        // Lọc đề tài thuộc đợt đang chọn tạo hội đồng
        if (g.registrationBatch !== periodName) {
          return;
        }

        const supervisor = g.supervisor;
        if (supervisor && supervisor !== 'Chưa phân công' && supervisor !== '—') {
          const teacherId = findTeacherIdByName(supervisor);
          if (teacherId) {
            totalGroupsCount[teacherId] = (totalGroupsCount[teacherId] || 0) + 1;

            const isAssignedToOther = g.hoi_dong_id && (!editingId || String(g.hoi_dong_id) !== String(editingId));
            if (isAssignedToOther) {
              assignedGroupsCount[teacherId] = (assignedGroupsCount[teacherId] || 0) + 1;
            }
          }
        }
      });
    }

    const excludedIds = new Set<string>();
    Object.keys(totalGroupsCount).forEach((teacherId) => {
      const total = totalGroupsCount[teacherId];
      const assigned = assignedGroupsCount[teacherId] || 0;
      if (total > 0 && assigned === total) {
        excludedIds.add(teacherId);
      }
    });

    const allowedIds = new Set<string>();
    teacherList.forEach((teacher) => {
      if (!excludedIds.has(teacher.id)) {
        allowedIds.add(teacher.id);
      }
    });

    return allowedIds;
  }, [groupList, teacherList, form.batch, editingId, selectedPeriod]);

  const availableAdvisorOptions = useMemo(() => {
    let filteredTeachers: IAssignmentTeacher[] = [];

    if (searchValue.trim() === '') {
      // Lọc danh sách các giảng viên đang có nhóm sinh viên hướng dẫn đề tài chưa được phân công vào hội đồng nào
      filteredTeachers = teacherList.filter((teacher: IAssignmentTeacher) =>
        lecturersWithUnassignedTopics.has(teacher.id) ||
        form.members.includes(teacher.id)
      );
    } else {
      // Khi nhập từ khoá tìm kiếm thì sẽ lọc theo họ tên của danh sách các giảng viên của hệ thống
      const query = normalizeString(searchValue);
      filteredTeachers = teacherList.filter((teacher: IAssignmentTeacher) =>
        normalizeString(teacher.name).includes(query) ||
        form.members.includes(teacher.id)
      );
    }

    return filteredTeachers.map((teacher: IAssignmentTeacher) => ({
      value: teacher.id,
      label: teacher.name,
    }));
  }, [teacherList, lecturersWithUnassignedTopics, form.members, searchValue]);

  const memberIds = form.members;

  function teacherNameById(id: any) {
    if (!id) return '';
    const idStr = String(id).trim();
    const found = teacherList.find((teacher: IAssignmentTeacher) => String(teacher.id).trim() === idStr);
    if (found) return found.name;

    const cleanId = cleanAndNormalize(idStr);
    const cleanIdNoAccent = cleanNormalizeNoAccent(idStr);
    
    const matchedByName = teacherList.find((teacher: IAssignmentTeacher) => {
      const tName = cleanAndNormalize(teacher.name);
      if (tName === cleanId) return true;
      const tNameNoAccent = cleanNormalizeNoAccent(teacher.name);
      return tNameNoAccent === cleanIdNoAccent;
    });

    return matchedByName ? matchedByName.name : id;
  }

  function findTeacherIdByName(name: string) {
    if (!name) return '';
    
    const cleanName = cleanAndNormalize(name);
    const cleanNameNoAccent = cleanNormalizeNoAccent(name);

    const found = teacherList.find((teacher: IAssignmentTeacher) => {
      const tName = cleanAndNormalize(teacher.name);
      if (tName === cleanName) return true;
      const tNameNoAccent = cleanNormalizeNoAccent(teacher.name);
      return tNameNoAccent === cleanNameNoAccent;
    });

    return found ? found.id : name;
  }

  const getOtherCouncilAssignment = (teacherId: string) => {
    if (!teacherId) return null;
    const teacherName = teacherNameById(teacherId);
    const currentPeriodName = form.batch || selectedPeriod?.name || '';
    const matchedCouncil = councilsList.find((c: any) => {
      if (editingId && String(c.id) === String(editingId)) return false;
      const isCurrentPeriod = String(c.dot_id) === String(selectedPeriod?.id) || c.batch === currentPeriodName;
      if (!isCurrentPeriod) return false;
      const isChair = c.chair && c.chair.includes(teacherName);
      const isSec = c.secretary && c.secretary.includes(teacherName);
      return isChair || isSec;
    });

    if (matchedCouncil) {
      const isChair = matchedCouncil.chair && matchedCouncil.chair.includes(teacherName);
      return {
        title: matchedCouncil.title,
        role: isChair ? 'Chủ tịch' : 'Thư ký'
      };
    }
    return null;
  };

  const updateMembers = (nextMemberIds: string[]) => {
    setForm((current) => ({ ...current, members: nextMemberIds }));
    setSelectedTopics((current) => current
      .filter((topic) => nextMemberIds.includes(topic.advisorId) || nextMemberIds.includes(findTeacherIdByName(topic.advisorId)))
      .map((topic) => {
        const defaultExaminers = nextMemberIds.filter((id) => {
          const advisorName = teacherNameById(topic.advisorId);
          const reviewerName = topic.reviewerId ? teacherNameById(topic.reviewerId) : null;
          const currentName = teacherNameById(id);
          return currentName !== advisorName && id !== topic.advisorId &&
                 currentName !== reviewerName && id !== topic.reviewerId;
        });
        return {
          ...topic,
          examinerId: defaultExaminers[0] || null,
          examinerIds: defaultExaminers,
        };
      })
    );
    setSelectedChairId((prev) => (prev && nextMemberIds.includes(prev) ? prev : null));
    setSelectedSecretaryId((prev) => (prev && nextMemberIds.includes(prev) ? prev : null));
    setSelectedAdvisorFilterId((prev) => (prev && nextMemberIds.includes(prev) ? prev : null));
  };

  const toggleTopic = (topic: AdvisorTopic | SelectedTopic, enabled: boolean) => {
    if (enabled && !memberIds.includes(topic.advisorId)) return;

    setSelectedTopics((current) => {
      if (enabled) {
        if (current.some((item) => item.id === topic.id)) return current;
        const defaultExaminers = memberIds.filter((id) => {
          const advisorName = teacherNameById(topic.advisorId);
          const reviewerId = (topic as SelectedTopic).reviewerId || null;
          const reviewerName = reviewerId ? teacherNameById(reviewerId) : null;
          const currentName = teacherNameById(id);
          return currentName !== advisorName && id !== topic.advisorId &&
                 currentName !== reviewerName && id !== reviewerId;
        });
        return [...current, { ...topic, reviewerId: null, examinerId: defaultExaminers[0] || null, examinerIds: defaultExaminers, externalExaminers: [], startTime: null }];
      }

      return current.filter((item) => item.id !== topic.id);
    });
  };

  const updateReviewerForTopic = (topicId: string, reviewerId: string | null) => {
    const isSameId = (id1: any, id2: any) => {
      if (id1 === id2) return true;
      if (!id1 || !id2) return false;
      return String(id1).trim() === String(id2).trim();
    };

    const includesId = (arr: any[], id: any) => {
      return arr.some(item => isSameId(item, id));
    };

    const topic = selectedTopics.find((t) => isSameId(t.id, topicId));
    if (topic) {
      // 1. Identify existing swaps (council members who were swapped for external teachers)
      const prevReviewerId = topic.reviewerId;
      const defaultExaminersPrev = memberIds.filter((id) => {
        const advisorName = teacherNameById(topic.advisorId);
        const reviewerName = prevReviewerId ? teacherNameById(prevReviewerId) : null;
        const currentName = teacherNameById(id);
        return currentName !== advisorName && !isSameId(id, topic.advisorId) &&
               currentName !== reviewerName && !isSameId(id, prevReviewerId);
      });

      const externalExaminers = (topic.examinerIds || []).filter((id) => !includesId(memberIds, id));
      const missingExaminers = defaultExaminersPrev.filter((id) => !includesId(topic.examinerIds || [], id));

      // Map missing examiner to external examiner
      const swapMap: Record<string, string> = {};
      missingExaminers.forEach((id, idx) => {
        if (externalExaminers[idx]) {
          swapMap[String(id)] = String(externalExaminers[idx]);
        }
      });

      // 2. If new reviewerId was swapped out, automatically discard that swap and notify the user
      if (reviewerId && swapMap[String(reviewerId)]) {
        Modal.warning({
          centered: true,
          title: 'Hủy luân chuyển người chấm',
          content: `Đã tự động hủy luân chuyển người chấm cho giảng viên ${teacherNameById(reviewerId)} do giảng viên này được phân công làm GVPB.`,
          okText: 'Xác nhận',
          okButtonProps: { className: 'rounded-xl font-semibold bg-blue-600 border-none text-white hover:opacity-90' },
        });
      }

      // 3. Compute new default examiners
      const newDefaultExaminers = memberIds.filter((id) => {
        const advisorName = teacherNameById(topic.advisorId);
        const reviewerName = reviewerId ? teacherNameById(reviewerId) : null;
        const currentName = teacherNameById(id);
        return currentName !== advisorName && !isSameId(id, topic.advisorId) &&
               currentName !== reviewerName && !isSameId(id, reviewerId);
      });

      // 4. Apply swaps to new default examiners list
      const nextExaminerIds = newDefaultExaminers.map((id) => {
        const key = String(id);
        return swapMap[key] || id;
      });

      // 5. Update state
      setSelectedTopics((current) => current.map((t) => {
        if (isSameId(t.id, topicId)) {
          return {
            ...t,
            reviewerId,
            examinerId: nextExaminerIds[0] || null,
            examinerIds: nextExaminerIds,
          };
        }
        return t;
      }));
      return;
    }

    setSelectedTopics((current) => current.map((t) => {
      if (isSameId(t.id, topicId)) {
        const defaultExaminers = memberIds.filter((id) => {
          const advisorName = teacherNameById(t.advisorId);
          const reviewerName = reviewerId ? teacherNameById(reviewerId) : null;
          const currentName = teacherNameById(id);
          return currentName !== advisorName && !isSameId(id, t.advisorId) &&
                 currentName !== reviewerName && !isSameId(id, reviewerId);
        });
        return {
          ...t,
          reviewerId,
          examinerId: defaultExaminers[0] || null,
          examinerIds: defaultExaminers,
        };
      }
      return t;
    }));
  };

  const updateExaminerForTopic = (topicId: string, examinerIds: string[] | null) => {
    const list = examinerIds ?? [];
    setSelectedTopics((current) => current.map((topic) => (topic.id === topicId ? { ...topic, examinerId: list[0] || null, examinerIds: list } : topic)));
  };

  const swapExaminer = (topicId: string, externalTeacherId: string) => {
    setSelectedTopics((current) => current.map((topic) => {
      if (topic.id === topicId) {
        return {
          ...topic,
          examinerId: externalTeacherId,
          examinerIds: [externalTeacherId]
        };
      }
      return topic;
    }));
  };

  const handleToggleSwapOut = (id: string) => {
    setExaminersToSwapOut((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setReplacementExaminers((rep) => rep.slice(0, next.length));
      return next;
    });
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
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const handleSave = () => {
    if (!form.name || !form.room || !form.date || !form.time) {
      message.error(t(getKey('please_fill_all_council_info')));
      return;
    }

    if (!validateDefenseDate(form.date, selectedPeriodObj)) {
      return;
    }

    if (!selectedChairId) {
      message.error("Vui lòng chọn Chủ tịch hội đồng");
      return;
    }

    if (!selectedSecretaryId) {
      message.error("Vui lòng chọn Thư ký hội đồng");
      return;
    }

    if (selectedChairId === selectedSecretaryId) {
      message.error("Chủ tịch và Thư ký không được trùng nhau");
      return;
    }

    const chairAssignment = getOtherCouncilAssignment(selectedChairId);
    if (chairAssignment) {
      message.error(`giảng viên ${teacherNameById(selectedChairId)} đã làm ${chairAssignment.role} tại ${chairAssignment.title}`);
      return;
    }

    const secAssignment = getOtherCouncilAssignment(selectedSecretaryId);
    if (secAssignment) {
      message.error(`giảng viên ${teacherNameById(selectedSecretaryId)} đã làm ${secAssignment.role} tại ${secAssignment.title}`);
      return;
    }

    const rearrangedMembers = Array.from(new Set([
      selectedChairId,
      selectedSecretaryId,
      ...form.members.filter((id) => id !== selectedChairId && id !== selectedSecretaryId)
    ].filter(Boolean))) as string[];

    if (rearrangedMembers.length < 5) {
      message.error("không đủ thành viên hội đồng ít nhất 5 thành viên");
      return;
    }



    for (const topic of selectedTopics) {
      const hasInternal = topic.examinerIds && topic.examinerIds.length > 0;
      const hasExternal = topic.externalExaminers && topic.externalExaminers.length > 0;

      if (hasInternal) {
        const conflict = (topic.examinerIds || []).some((id) => {
          const sId = String(id).trim();
          const sAdv = String(topic.advisorId || '').trim();
          const sRev = String(topic.reviewerId || '').trim();
          return sId === sAdv || (topic.reviewerId && sId === sRev);
        });
        if (conflict) {
          message.error(t(getKey('examiner_conflict'), { code: topic.topicName || topic.topicCode || `Đề tài #${topic.id}` }));
          return;
        }
      }

      if (hasExternal) {
        const conflictExt = (topic.externalExaminers || []).some((id) => {
          const sId = String(id).trim();
          const sAdv = String(topic.advisorId || '').trim();
          const sRev = String(topic.reviewerId || '').trim();
          return sId === sAdv || (topic.reviewerId && sId === sRev);
        });
        if (conflictExt) {
          message.error(t(getKey('external_examiner_conflict'), { code: topic.topicName || topic.topicCode || `Đề tài #${topic.id}` }));
          return;
        }
      }
    }

    // Validate cross-council schedule conflicts for all busy teachers in this council's topics
    if (form.date && form.time) {
      const [y, m, d] = form.date.split('-');
      const currentCouncilDateStr = `${d}/${m}/${y}`;

      for (const topic of selectedTopics) {
        const sched = calculateTopicSchedules[topic.id];
        if (!sched) continue;

        const [tH, tM] = sched.start.split(':').map(Number);
        const tStartSec = tH * 60 + tM;
        const tEndSec = tStartSec + (topic.minutes || 40);

        const busyIds: string[] = [
          topic.advisorId,
          topic.reviewerId,
          ...(topic.examinerIds || []),
          selectedChairId,
          selectedSecretaryId
        ].filter(Boolean).map(String).map((tId: string) => tId.trim()).filter((tId: string) => /^\d+$/.test(tId));

        for (const c of councilsList) {
          if (editingId && String(c.id) === String(editingId)) continue;

          const parts = c.dateTime ? c.dateTime.split(' · ') : [];
          const cDate = parts.length > 0 ? parts[0] : '';
          if (cDate !== currentCouncilDateStr) continue;

          const otherChairId = c.chair && c.chair[0] ? findTeacherIdByName(c.chair[0]) : null;
          const otherSecId = c.secretary && c.secretary[0] ? findTeacherIdByName(c.secretary[0]) : null;

          let foundConflict = false;
          for (const otherTopicRaw of (c.topics || [])) {
            const otherTopic = otherTopicRaw as any;
            const [oH, oM] = (otherTopic.startTime || '08:00').split(':').map(Number);
            const oStart = oH * 60 + oM;
            const oEnd = oStart + (otherTopic.minutes || 40);

            const isOverlap = tStartSec < oEnd && oStart < tEndSec;
            if (isOverlap) {
              const otherBusy = [
                otherTopic.advisorId,
                otherTopic.reviewerId,
                ...(otherTopic.examinerIds || []),
                otherChairId,
                otherSecId
              ].filter(Boolean).map(String).map((tId: string) => tId.trim()).filter((tId: string) => /^\d+$/.test(tId));

              const commonTeacherId: string | undefined = busyIds.find((tId: string) => otherBusy.includes(tId));
              if (commonTeacherId) {
                const otherMemberNames = [
                  ...(c.chair || []),
                  ...(c.secretary || []),
                  ...(c.reviewer || []),
                  ...(c.member || [])
                ];
                const otherMemberIds = otherMemberNames.map((name: string) => findTeacherIdByName(name));

                const isMemberOfOther = otherChairId === commonTeacherId || 
                                       otherSecId === commonTeacherId || 
                                       otherMemberIds.includes(commonTeacherId);

                const isExternalInOther = !isMemberOfOther && (otherTopic.examinerIds || []).includes(commonTeacherId);

                let otherRole = 'Thành viên';
                if (otherChairId === commonTeacherId) otherRole = 'Chủ tịch';
                else if (otherSecId === commonTeacherId) otherRole = 'Thư ký';
                else if (String(otherTopic.reviewerId).trim() === String(commonTeacherId).trim()) otherRole = 'Giảng viên phản biện';
                else if (String(otherTopic.advisorId).trim() === String(commonTeacherId).trim()) otherRole = 'Giảng viên hướng dẫn';
                else if (isExternalInOther) otherRole = 'Giảng viên chấm luân chuyển';
                else if ((otherTopic.examinerIds || []).includes(commonTeacherId)) otherRole = 'Giảng viên chấm';

                const isExternalInCurrent = (topic.externalExaminers || []).includes(commonTeacherId);

                let currentRole = 'Thành viên';
                if (selectedChairId === commonTeacherId) currentRole = 'Chủ tịch';
                else if (selectedSecretaryId === commonTeacherId) currentRole = 'Thư ký';
                else if (String(topic.reviewerId).trim() === String(commonTeacherId).trim()) currentRole = 'Giảng viên phản biện';
                else if (String(topic.advisorId).trim() === String(commonTeacherId).trim()) currentRole = 'Giảng viên hướng dẫn';
                else if (isExternalInCurrent) currentRole = 'Giảng viên chấm luân chuyển';
                else if ((topic.examinerIds || []).includes(commonTeacherId)) currentRole = 'Giảng viên chấm';

                Modal.error({
                  centered: true,
                  title: 'Trùng lịch bảo vệ',
                  width: 600,
                  content: (
                    <div className="text-slate-600 text-sm space-y-3">
                      <div className="mt-2">
                        Phát hiện trùng lịch cho giảng viên:{' '}
                        <strong className="text-red-600 text-base">{teacherNameById(commonTeacherId)}</strong>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2">
                        <div>
                          <span className="font-semibold text-slate-700">Lịch đã phân công (Bận):</span>
                          <ul className="list-disc pl-5 mt-1 text-xs text-slate-500 space-y-1">
                            <li>
                              Hội đồng: <strong>"{c.title}"</strong>
                            </li>
                            <li>
                              Đề tài: <strong>{otherTopic.topicName}</strong>
                            </li>
                            <li>
                              Vai trò: <strong className="text-blue-600">{otherRole}</strong>
                            </li>
                            <li>
                              Khung giờ: <strong>{otherTopic.startTime || '08:00'}</strong> ngày <strong>{cDate}</strong>
                            </li>
                          </ul>
                        </div>

                        <div className="border-t border-slate-100 pt-2">
                          <span className="font-semibold text-slate-700">Lịch phân công mới (Trùng lắp):</span>
                          <ul className="list-disc pl-5 mt-1 text-xs text-slate-500 space-y-1">
                            <li>
                              Hội đồng hiện tại: <strong>"{form.name || 'Hội đồng mới'}"</strong>
                            </li>
                            <li>
                              Đề tài: <strong>{topic.topicName}</strong>
                            </li>
                            <li>
                              Vai trò: <strong className="text-red-600">{currentRole}</strong>
                            </li>
                            <li>
                              Khung giờ: <strong>{sched.start} - {sched.end}</strong> ngày <strong>{currentCouncilDateStr}</strong>
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="mt-3 font-semibold text-slate-800 bg-red-50 text-red-700 p-2.5 rounded-lg text-xs">
                        ⚠️ Yêu cầu: Vui lòng đổi lịch hội đồng sang ngày khác hoặc chọn giảng viên khác thay thế để tránh trùng lịch bảo vệ!
                      </div>
                    </div>
                  ),
                  okText: 'Xác nhận',
                  okButtonProps: { className: 'rounded-xl font-semibold bg-blue-600 border-none text-white hover:opacity-90' },
                });
                foundConflict = true;
                break;
              }
            }
          }

          if (foundConflict) {
            return;
          }
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
      members: rearrangedMembers,
      chairId: selectedChairId,
      secretaryId: selectedSecretaryId,
      topics: selectedTopics.map(st => {
        const sched = calculateTopicSchedules[st.id];
        return {
          id: st.id,
          nhom_id: st.id,
          reviewerId: st.reviewerId,
          examinerId: st.examinerId || null,
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
        }
      });
    } else {
      createCouncilMutation.mutate(payload, {
        onSuccess: () => {
          setSaved(true);
          message.success(t(getKey('create_council_success'), { count: selectedTopics.length }) as string);
          navigate('/councils');
        }
      });
    }
  };

  const eligibleTopics = useMemo(() => {
    let list = advisorBuckets
      .filter((bucket) => memberIds.includes(bucket.advisorId))
      .flatMap((bucket) =>
        bucket.topics.map((t) => ({ ...t, advisorName: bucket.advisorName }))
      );

    if (selectedAdvisorFilterId) {
      list = list.filter((t) => t.advisorId === selectedAdvisorFilterId);
    }

    if (advisorSortOrder) {
      list.sort((a, b) => {
        const nameA = a.advisorName || '';
        const nameB = b.advisorName || '';
        if (advisorSortOrder === 'asc') {
          return nameA.localeCompare(nameB, 'vi');
        } else {
          return nameB.localeCompare(nameA, 'vi');
        }
      });
    }

    return list;
  }, [advisorBuckets, memberIds, advisorSortOrder, selectedAdvisorFilterId]);

  const isAllSelected = useMemo(() => {
    if (eligibleTopics.length === 0) return false;
    return eligibleTopics.every((topic) => selectedTopics.some((item) => item.id === topic.id));
  }, [eligibleTopics, selectedTopics]);

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const newSelections = [...selectedTopics];
      eligibleTopics.forEach((topic) => {
        if (!newSelections.some((item) => item.id === topic.id)) {
          const defaultExaminers = memberIds.filter((id) => {
            const advisorName = teacherNameById(topic.advisorId);
            const reviewerId = (topic as SelectedTopic).reviewerId || null;
            const reviewerName = reviewerId ? teacherNameById(reviewerId) : null;
            const currentName = teacherNameById(id);
            return currentName !== advisorName && id !== topic.advisorId &&
                   currentName !== reviewerName && id !== reviewerId;
          });
          newSelections.push({
            ...topic,
            reviewerId: null,
            examinerId: defaultExaminers[0] || null,
            examinerIds: defaultExaminers,
            externalExaminers: [],
            startTime: null,
            minutes: topic.minutes || 40,
          });
        }
      });
      setSelectedTopics(newSelections);
    } else {
      const eligibleIds = eligibleTopics.map((t) => t.id);
      setSelectedTopics((current) => current.filter((item) => !eligibleIds.includes(item.id)));
    }
  };

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
    if (id === selectedChairId) return 'Chủ tịch';
    if (id === selectedSecretaryId) return 'Thư ký (TH)';
    const isReviewer = selectedTopics.some((t) => t.reviewerId === id);
    if (isReviewer) return 'Phản biện';
    return 'Ủy viên';
  };

  const checkTeacherScheduleConflict = (teacherId: string, topicId: string) => {
    if (!form.date || !form.time || !calculateTopicSchedules[topicId]) return false;

    // 1. Calculate time window of the target topic
    const targetSched = calculateTopicSchedules[topicId];
    const [targetH, targetM] = targetSched.start.split(':').map(Number);
    const targetStartSec = targetH * 60 + targetM;
    const targetEndSec = targetStartSec + (selectedTopics.find((t) => t.id === topicId)?.minutes || 40);

    // 2. Check conflict in the current council being edited
    const hasConflictInCurrent = selectedTopics.some((otherTopic) => {
      if (otherTopic.id === topicId) return false;
      const otherSched = calculateTopicSchedules[otherTopic.id];
      if (!otherSched) return false;
      const [otherH, otherM] = otherSched.start.split(':').map(Number);
      const otherStartSec = otherH * 60 + otherM;
      const otherEndSec = otherStartSec + (otherTopic.minutes || 40);

      const isOverlap = targetStartSec < otherEndSec && otherStartSec < targetEndSec;
      if (isOverlap) {
        const busyIds = [
          otherTopic.advisorId,
          otherTopic.reviewerId,
          ...(otherTopic.examinerIds || [])
        ].map(String).map(id => id.trim()).filter(id => /^\d+$/.test(id));
        if (busyIds.includes(String(teacherId).trim())) return true;
      }
      return false;
    });

    if (hasConflictInCurrent) return true;

    // 3. Check conflict in other councils
    const [y, m, d] = form.date.split('-');
    const currentCouncilDateStr = `${d}/${m}/${y}`;

    const hasConflictInOther = councilsList.some((c: any) => {
      if (String(c.id) === String(editingId)) return false;

      const parts = c.dateTime ? c.dateTime.split(' · ') : [];
      const cDate = parts.length > 0 ? parts[0] : '';
      if (cDate !== currentCouncilDateStr) return false;

      // Calculate total council duration
      let cStartSec = 24 * 60;
      let cEndSec = 0;
      (c.topics || []).forEach((t: any) => {
        const [tH, tM] = (t.startTime || '08:00').split(':').map(Number);
        const tStart = tH * 60 + tM;
        const tEnd = tStart + (t.minutes || 40);
        if (tStart < cStartSec) cStartSec = tStart;
        if (tEnd > cEndSec) cEndSec = tEnd;
      });

      const isOverlapWithCouncil = targetStartSec < cEndSec && cStartSec < targetEndSec;
      if (isOverlapWithCouncil) {
        // If they are a council member, they are busy
        const cMemberNames = [
          ...(c.chair || []),
          ...(c.secretary || []),
          ...(c.reviewer || []),
          ...(c.member || [])
        ];
        const cMemberIds = cMemberNames.map(findTeacherIdByName).filter(id => /^\d+$/.test(id));
        if (cMemberIds.includes(teacherId)) return true;
      }

      // Check specific overlapping topics in that council
      const hasOverlapTopic = (c.topics || []).some((t: any) => {
        const [tH, tM] = (t.startTime || '08:00').split(':').map(Number);
        const tStart = tH * 60 + tM;
        const tEnd = tStart + (t.minutes || 40);

        const isOverlap = targetStartSec < tEnd && tStart < targetEndSec;
        if (isOverlap) {
          const busyIds = [
            t.advisorId,
            t.reviewerId,
            ...(t.examinerIds || [])
          ].map(String).map(id => id.trim()).filter(id => /^\d+$/.test(id));
          if (busyIds.includes(String(teacherId).trim())) return true;
        }
        return false;
      });

      return hasOverlapTopic;
    });

    return hasConflictInOther;
  };
  const committeeSummary = t(getKey('members_count_label'), { count: memberIds.length }) as string;

  const rearrangedMembers = useMemo(() => {
    return [
      selectedChairId,
      selectedSecretaryId,
      ...form.members.filter((id) => id !== selectedChairId && id !== selectedSecretaryId)
    ].filter(Boolean) as string[];
  }, [form.members, selectedChairId, selectedSecretaryId]);

  const openSortTab = () => {
    if (selectedTopics.length > 0) setWorkflowTab('sort');
  };

  // If navigated here for editing, prefill form
  useEffect(() => {
    const state = (location?.state as LocationState) || null;
    const council = state?.council;
    if (!council || teacherList.length === 0) return;

    setEditingId(council.id);

    const mappedMembers = Array.from(new Set(
      (council.member || [])
        .concat(council.chair || [])
        .concat(council.reviewer || [])
        .concat(council.secretary || [])
        .map((nm: string) => findTeacherIdByName(nm))
        .filter(Boolean)
    )) as string[];

    setForm((current) => ({
      ...current,
      name: council.title || current.name,
      batch: council.batch || current.batch,
      room: council.room || current.room,
      members: mappedMembers,
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

    const chName = council.chair?.[0] || '';
    const secName = council.secretary?.[0] || '';
    if (chName) {
      setSelectedChairId(findTeacherIdByName(chName));
    }
    if (secName) {
      setSelectedSecretaryId(findTeacherIdByName(secName));
    }
  }, [location, teacherList]);

  // Prefill selectedTopics once advisorBuckets, teacherList and council are loaded
  useEffect(() => {
    const state = (location?.state as LocationState) || null;
    const council = state?.council;
    if (!council || advisorBuckets.length === 0 || teacherList.length === 0 || isPrefilledRef.current) return;

    const topicsFromCouncil: SelectedTopic[] = [];
    const councilTopics: CouncilTopicPayload[] = council.topics || council.topicGroups || [];

    councilTopics.forEach((topic) => {
      const found = advisorBuckets.flatMap((b) => b.topics).find((pt) => pt.id === topic.id);
      if (found) {
        const rawRevId = topic.reviewerId || (topic.reviewer ? findTeacherIdByName(topic.reviewer) : null);
        const revId = rawRevId ? findTeacherIdByName(rawRevId) : null;
        
        const rawExIds = topic.examinerIds || [];
        const savedExIds = rawExIds.length > 0
          ? rawExIds.map((idOrName) => findTeacherIdByName(idOrName)).filter(Boolean) as string[]
          : (topic.examiners || []).map((n: string) => findTeacherIdByName(n)).filter(Boolean) as string[];
        
        const defaultExIds = savedExIds.length > 0 ? savedExIds : memberIds.filter((id) => {
          const advisorName = teacherNameById(found.advisorId);
          const reviewerName = revId ? teacherNameById(revId) : null;
          const currentName = teacherNameById(id);
          return currentName !== advisorName && id !== found.advisorId &&
                 currentName !== reviewerName && id !== revId;
        });

        const sel: SelectedTopic = {
          ...found,
          reviewerId: revId,
          examinerId: defaultExIds[0] || null,
          examinerIds: defaultExIds,
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
  }, [location, advisorBuckets, teacherList, memberIds]);

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
                <Input value={form.name} disabled placeholder="Tên hội đồng sẽ tự động tạo" />
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
                <Select
                  value={form.room || undefined}
                  onChange={(value) => setForm({ ...form, room: value })}
                  placeholder="Chọn phòng bảo vệ..."
                  options={roomOptions}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <div className="mb-1 text-xs text-gray-600">{t(getKey('defense_date'))}</div>
                  <DatePicker
                    className="w-full"
                    status={dateError ? 'error' : undefined}
                    format="DD/MM/YYYY"
                    value={form.date ? dayjs(form.date, 'YYYY-MM-DD', true) : null}
                    onChange={(date) => {
                      const formatted = date ? date.format('YYYY-MM-DD') : '';
                      setForm({ ...form, date: formatted });
                      if (formatted && selectedPeriodObj) {
                        validateDefenseDate(formatted, selectedPeriodObj);
                      } else {
                        setDateError(null);
                      }
                    }}
                  />
                  {dateError && (
                    <div className="mt-1 text-xs text-red-500 font-medium leading-normal animate-fade-in">
                      {dateError}
                    </div>
                  )}
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
                        mode="multiple"
                        showSearch
                        value={form.members}
                        searchValue={searchValue}
                        onSearch={setSearchValue}
                        onChange={(value) => {
                          updateMembers(value);
                          setSearchValue('');
                        }}
                        onBlur={() => setSearchValue('')}
                        placeholder={availableAdvisorOptions.length > 0 ? t(getKey('select_teachers_placeholder')) : t(getKey('no_teachers_available'))}
                        options={availableAdvisorOptions}
                        className="w-full"
                        disabled={availableAdvisorOptions.length === 0}
                        filterOption={false}
                      />
                      {form.members.length > 0 && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 shadow-inner space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                             <div className="mb-1.5 text-xs font-semibold text-slate-600">Phân công Chủ tịch:</div>
                              <Select
                                value={selectedChairId || undefined}
                                onChange={(value) => {
                                  if (value) {
                                    const assignment = getOtherCouncilAssignment(value);
                                    if (assignment) {
                                      message.error(`giảng viên ${teacherNameById(value)} đã làm ${assignment.role} tại ${assignment.title}`);
                                      return;
                                    }
                                  }
                                  setSelectedChairId(value ?? null);
                                  if (value === selectedSecretaryId) {
                                    setSelectedSecretaryId(null);
                                  }
                                }}
                                placeholder="Chọn Chủ tịch hội đồng..."
                                options={form.members.map((id) => ({
                                  value: id,
                                  label: teacherNameById(id),
                                }))}
                                className="w-full"
                                allowClear
                              />
                            </div>
                            <div>
                              <div className="mb-1.5 text-xs font-semibold text-slate-600">Phân công Thư ký:</div>
                              <Select
                                value={selectedSecretaryId || undefined}
                                onChange={(value) => {
                                  if (value) {
                                    const assignment = getOtherCouncilAssignment(value);
                                    if (assignment) {
                                      message.error(`giảng viên ${teacherNameById(value)} đã làm ${assignment.role} tại ${assignment.title}`);
                                      return;
                                    }
                                  }
                                  setSelectedSecretaryId(value ?? null);
                                }}
                                placeholder="Chọn Thư ký hội đồng..."
                                options={form.members
                                  .filter((id) => id !== selectedChairId)
                                  .map((id) => ({
                                    value: id,
                                    label: teacherNameById(id),
                                  }))}
                                className="w-full"
                                allowClear
                                disabled={!selectedChairId}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-semibold text-slate-500 mb-2">
                              Thành viên hội đồng đã chọn ({form.members.length}):
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {form.members.map((id) => {
                                const isChair = id === selectedChairId;
                                const isSec = id === selectedSecretaryId;
                                return (
                                  <Tag
                                    color={isChair ? 'gold' : isSec ? 'cyan' : 'blue'}
                                    key={id}
                                    className="px-2.5 py-1 text-xs"
                                  >
                                    {teacherNameById(id)} {isChair ? '(Chủ tịch)' : isSec ? '(Thư ký)' : ''}
                                  </Tag>
                                );
                              })}
                            </div>
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
              <div className="p-5 space-y-4">
                {/* Lọc theo giảng viên trong hội đồng */}
                {memberIds.length > 0 && (
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl w-fit">
                    <span className="text-xs font-semibold text-slate-600">Lọc theo GVHD (Thành viên hội đồng):</span>
                    <Select
                      value={selectedAdvisorFilterId || undefined}
                      onChange={(value) => setSelectedAdvisorFilterId(value ?? null)}
                      placeholder="Tất cả giảng viên trong hội đồng..."
                      options={memberIds.map((id) => ({
                        value: id,
                        label: teacherNameById(id),
                      }))}
                      className="w-72"
                      allowClear
                    />
                  </div>
                )}

                {eligibleTopics.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                    Chưa có đề tài nào đủ điều kiện hoặc không có giảng viên hướng dẫn nào của đề tài tham gia hội đồng này.
                  </div>
                ) : (
                  <div ref={pickContainerRef} onWheel={handleScrollPropagation} className="overflow-auto max-h-[400px] rounded-xl border border-gray-200 bg-white">
                    <table className="w-full min-w-[800px] border-collapse text-sm">
                      <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                        <tr>
                          <th className="w-14 px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={(e) => handleToggleAll(e.target.checked)}
                              className="h-4 w-4 accent-[var(--color-primary)]"
                            />
                          </th>
                          <th className="w-16 px-4 py-3 text-left">STT</th>
                          <th className="px-4 py-3 text-left">{t(getKey('topic_name'))}</th>
                          <th
                            className="px-4 py-3 text-left whitespace-nowrap cursor-pointer select-none hover:bg-gray-100 transition-colors"
                            onClick={() => {
                              setAdvisorSortOrder((prev) => {
                                if (prev === null) return 'asc';
                                if (prev === 'asc') return 'desc';
                                return null;
                              });
                            }}
                          >
                            <span className="flex items-center gap-1.5">
                              {t(getKey('advisor_short'))}
                              {advisorSortOrder === 'asc' && <span className="text-[10px] text-slate-600">▲</span>}
                              {advisorSortOrder === 'desc' && <span className="text-[10px] text-slate-600">▼</span>}
                              {advisorSortOrder === null && <span className="text-[10px] text-slate-400">⇅</span>}
                            </span>
                          </th>
                          <th className="px-4 py-3 text-left">SVTH</th>
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
                              <td className="px-4 py-3 align-top text-gray-600 whitespace-nowrap font-medium">{teacherNameById(topic.advisorId)}</td>
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
              <div className="p-5 space-y-4">
                {checkedSortTopicIds.length > 0 && (
                  <div className="flex items-center justify-between bg-red-50 border border-red-100 p-3 rounded-xl">
                    <span className="text-xs font-semibold text-red-700">
                      Đã chọn {checkedSortTopicIds.length} đề tài để bỏ chọn
                    </span>
                    <Button
                      type="primary"
                      danger
                      onClick={handleBulkDeselect}
                    >
                      Bỏ chọn các đề tài đã chọn ({checkedSortTopicIds.length})
                    </Button>
                  </div>
                )}
                <div ref={sortContainerRef} onWheel={handleScrollPropagation} className="overflow-auto max-h-[450px] rounded-xl border border-gray-200 bg-white">
                  <table className="w-full min-w-[1200px] border-collapse text-sm">
                    <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                      <tr>
                        <th className="w-14 px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedTopics.length > 0 && checkedSortTopicIds.length === selectedTopics.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCheckedSortTopicIds(selectedTopics.map((t) => t.id));
                              } else {
                                setCheckedSortTopicIds([]);
                              }
                            }}
                            className="h-4 w-4 accent-[var(--color-primary)]"
                          />
                        </th>
                        <th className="w-20 px-4 py-3 text-left">{t(getKey('stt'))}</th>
                        <th className="px-4 py-3 text-left">{t(getKey('topic_name'))}</th>
                        <th className="px-4 py-3 text-left">{t(getKey('advisor_short'))}</th>
                        <th className="px-4 py-3 text-left">{t(getKey('reviewer_short'))}</th>
                         <th className="px-4 py-3 text-left">GV Chấm</th>
                        <th className="px-4 py-3 text-left">{t(getKey('time'))}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTopics.map((topic, index) => (
                        <tr
                          key={topic.id}
                          draggable
                          onDragStart={(e) => {
                            setTimeout(() => {
                              setDraggingTopicId(topic.id);
                            }, 0);
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDragEnter={() => {
                            if (draggingTopicId && draggingTopicId !== topic.id) {
                              moveSelectedTopic(draggingTopicId, topic.id);
                            }
                          }}
                          onDragEnd={() => {
                            setDraggingTopicId(null);
                            setDragOverTopicId(null);
                          }}
                          onClick={() => setActiveRowTopicId(topic.id)}
                          className={cn(
                            "border-t border-gray-100 transition-all duration-200",
                            draggingTopicId === topic.id
                              ? "bg-blue-50/10 border-2 border-dashed border-blue-300 opacity-60 scale-[0.99] shadow-inner"
                              : activeRowTopicId === topic.id
                              ? "bg-blue-50/70 border-y border-blue-300 shadow-[0_4px_12px_rgba(37,99,235,0.08)] relative z-10 scale-[1.005]"
                              : "hover:bg-slate-50 cursor-grab active:cursor-grabbing"
                          )}
                          title="Nhấn giữ và kéo thả dòng này để thay đổi thứ tự bảo vệ"
                        >
                          <td className={cn("px-4 py-3 align-top", draggingTopicId === topic.id && "invisible")}>
                            <input
                              type="checkbox"
                              checked={checkedSortTopicIds.includes(topic.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setCheckedSortTopicIds((prev) => [...prev, topic.id]);
                                } else {
                                  setCheckedSortTopicIds((prev) => prev.filter((id) => id !== topic.id));
                                }
                              }}
                              className="h-4 w-4 accent-[var(--color-primary)]"
                            />
                          </td>
                          <td className={cn("px-4 py-3 align-top font-medium text-gray-700", draggingTopicId === topic.id && "invisible")}>
                            <div className="flex items-center gap-1.5">
                              <span>{formatNumber(index + 1)}</span>
                              {activeRowTopicId === topic.id && (
                                <div className="flex flex-col gap-0.5 ml-1">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<span className="text-[10px] font-bold">▲</span>}
                                    disabled={index === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveTopicUpDown(index, 'up');
                                    }}
                                    className="h-5 w-5 p-0 flex items-center justify-center hover:bg-blue-100 text-blue-600 rounded"
                                    title="Di chuyển lên"
                                  />
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<span className="text-[10px] font-bold">▼</span>}
                                    disabled={index === selectedTopics.length - 1}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveTopicUpDown(index, 'down');
                                    }}
                                    className="h-5 w-5 p-0 flex items-center justify-center hover:bg-blue-100 text-blue-600 rounded"
                                    title="Di chuyển xuống"
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className={cn("px-4 py-3 align-top font-medium text-gray-900", draggingTopicId === topic.id && "invisible")}>{topic.topicName}</td>
                          <td className={cn("px-4 py-3 align-top text-gray-600", draggingTopicId === topic.id && "invisible")}>{teacherNameById(topic.advisorId)}</td>
                          <td className={cn("px-4 py-3 align-top", draggingTopicId === topic.id && "invisible")}>
                            <Select
                              value={topic.reviewerId || undefined}
                              onChange={(value) => updateReviewerForTopic(topic.id, value ?? null)}
                              placeholder={t(getKey('select_reviewer_placeholder'))}
                              options={memberIds
                                .filter((id) => {
                                  const advisorName = teacherNameById(topic.advisorId);
                                  const currentName = teacherNameById(id);
                                  return currentName !== advisorName && id !== topic.advisorId;
                                })
                                .map((id) => ({ value: id, label: teacherNameById(id) }))}
                              className="w-full min-w-[220px]"
                              allowClear
                            />
                          </td>
                          <td className={cn("px-4 py-3 align-top", draggingTopicId === topic.id && "invisible")}>
                            <div className="flex items-center justify-between gap-2 border border-slate-100 bg-slate-50/50 p-2 rounded-lg min-w-[220px]">
                              <div className="flex flex-col gap-0.5 max-w-[170px]">
                                {(topic.examinerIds || []).map((id) => (
                                  <Tag
                                    key={id}
                                    closable={false}
                                    className="mr-1 my-0.5 bg-slate-100 border-slate-200 text-slate-700 font-medium rounded truncate max-w-full"
                                    title={teacherNameById(id)}
                                  >
                                    {teacherNameById(id)}
                                  </Tag>
                                ))}
                                {!topic.examinerIds?.length && (
                                  <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                                )}
                              </div>
                              <Button
                                type="text"
                                size="small"
                                icon={<SwapOutlined className="text-blue-500 hover:text-blue-700" />}
                                onClick={() => setSwappingTopic(topic)}
                                title="Luân chuyển giảng viên chấm"
                                className="flex items-center justify-center p-1 hover:bg-blue-50 rounded"
                              />
                            </div>
                          </td>

                          <td className={cn("px-4 py-3 align-top font-semibold text-[var(--color-primary)]", draggingTopicId === topic.id && "invisible")}>
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
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button onClick={() => navigate('/councils')}>{t(getKey('cancel_btn_text'))}</Button>
        <Button
          onClick={() => {
            if (!selectedChairId) {
              message.error("Vui lòng chọn Chủ tịch hội đồng");
              return;
            }
            if (!selectedSecretaryId) {
              message.error("Vui lòng chọn Thư ký hội đồng");
              return;
            }
            if (selectedChairId === selectedSecretaryId) {
              message.error("Chủ tịch và Thư ký không được trùng nhau");
              return;
            }
            if (validateDefenseDate(form.date, selectedPeriodObj)) {
              setIsPreviewVisible(true);
            }
          }}
          disabled={!form.name || !form.room || !form.date || !form.time || memberIds.length === 0}
        >
          Xem trước
        </Button>
        <Button type="primary" onClick={handleSave} disabled={!form.name || !form.room || !form.date || !form.time || memberIds.length === 0}>
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
              {rearrangedMembers.map((id, idx) => {
                const role = getTeacherRoleInCouncil(id, idx);
                const tagColors: Record<string, string> = {
                  'Chủ tịch': 'gold',
                  'Thư ký (TH)': 'cyan',
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
            <div ref={previewContainerRef} className="overflow-auto max-h-[350px] rounded-lg border border-slate-100">
              <table className="w-full min-w-[650px] text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-2">STT</th>
                    <th className="px-3 py-2">Đề tài / Sinh viên</th>
                    <th className="px-3 py-2">GVHD</th>
                    <th className="px-3 py-2">GVPB</th>
                    <th className="px-3 py-2">GV Chấm</th>
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
                          {(topic.externalExaminers || []).map((id) => (
                            <span key={id}>{teacherNameById(id)}</span>
                          ))}
                          {!topic.externalExaminers?.length && '—'}
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

      {/* Popup luân chuyển giảng viên chấm */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
            <SwapOutlined className="text-blue-500 animate-pulse" />
            <span>Luân chuyển Giảng viên chấm</span>
          </div>
        }
        open={swappingTopic !== null}
        onCancel={() => {
          setSwappingTopic(null);
          setExaminersToSwapOut([]);
          setReplacementExaminers([]);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setSwappingTopic(null);
              setExaminersToSwapOut([]);
              setReplacementExaminers([]);
            }}
            className="rounded-md font-medium"
          >
            Hủy
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={() => {
              if (!swappingTopic) return;
              if (examinersToSwapOut.length === 0) {
                message.error("Vui lòng chọn giảng viên hiện tại cần luân chuyển");
                return;
              }
              if (replacementExaminers.length === 0) {
                message.error("Vui lòng chọn giảng viên ngoài hội đồng thay thế");
                return;
              }
              if (examinersToSwapOut.length !== replacementExaminers.length) {
                message.error(`Số lượng giảng viên ngoài hội đồng thay thế phải bằng số lượng giảng viên cần luân chuyển (đã chọn: ${examinersToSwapOut.length}, thay thế: ${replacementExaminers.length})`);
                return;
              }

              const currentIds = swappingTopic.examinerIds || [];
              const nextIds = currentIds
                .filter((id) => !examinersToSwapOut.includes(id))
                .concat(replacementExaminers);

              const nextExternalIds = nextIds.filter((id) => !memberIds.some((mId) => String(mId).trim() === String(id).trim()));

              setSelectedTopics((current) => current.map((t) => {
                if (t.id === swappingTopic.id) {
                  return {
                    ...t,
                    examinerId: nextIds[0] || null,
                    examinerIds: nextIds,
                    externalExaminers: nextExternalIds
                  };
                }
                return t;
              }));

              message.success("Luân chuyển giảng viên chấm thành công");
              setSwappingTopic(null);
              setExaminersToSwapOut([]);
              setReplacementExaminers([]);
            }}
            className="rounded-md font-medium bg-blue-500 hover:bg-blue-600 border-none"
          >
            Xác nhận luân chuyển
          </Button>
        ]}
        width={600}
        destroyOnClose
      >
        {swappingTopic && (
          <div className="py-4">
            <div className="mb-4 bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs text-blue-700">
              <span className="font-semibold">Đề tài:</span> {swappingTopic.topicName}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Cột 1: GV Chấm hiện tại */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <div className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">GV Chấm trong hội đồng (Chọn luân chuyển)</div>
                <div className="flex flex-col gap-1.5">
                  {(swappingTopic.examinerIds || []).map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-3 bg-white border border-slate-100 px-3 py-2 rounded-lg shadow-sm hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() => handleToggleSwapOut(id)}
                    >
                      <Checkbox
                        checked={examinersToSwapOut.includes(id)}
                        onChange={() => handleToggleSwapOut(id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs font-semibold text-slate-700">{teacherNameById(id)}</span>
                    </div>
                  ))}
                  {!swappingTopic.examinerIds?.length && (
                    <span className="text-xs text-slate-400 italic">Chưa có người chấm</span>
                  )}
                </div>
              </div>

              {/* Cột 2: GV Ngoài hội đồng */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">GV Ngoài hội đồng thay thế</div>
                  {examinersToSwapOut.length > 0 && (
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      Đã chọn: {replacementExaminers.length}/{examinersToSwapOut.length}
                    </span>
                  )}
                </div>
                <Select
                  mode="multiple"
                  showSearch
                  placeholder={
                    examinersToSwapOut.length === 0
                      ? "Vui lòng chọn giảng viên cần luân chuyển trước"
                      : "Chọn giảng viên ngoài hội đồng thay thế"
                  }
                  disabled={examinersToSwapOut.length === 0}
                  optionFilterProp="label"
                  value={replacementExaminers}
                  onChange={(val) => {
                    const limit = examinersToSwapOut.length;
                    if (val.length > limit) {
                      message.warning(`Chỉ được chọn tối đa ${limit} giảng viên thay thế`);
                      setReplacementExaminers(val.slice(0, limit));
                    } else {
                      setReplacementExaminers(val);
                    }
                  }}
                  options={teacherList
                    .filter((teacher) => {
                      const isMember = memberIds.some((id) => String(id).trim() === String(teacher.id).trim());
                      if (isMember) return false;

                      if (swappingTopic && checkTeacherScheduleConflict(teacher.id, swappingTopic.id)) {
                        return false;
                      }

                      return true;
                    })
                    .map((teacher) => {
                      const isSelected = replacementExaminers.some((id) => String(id).trim() === String(teacher.id).trim());
                      const reachedLimit = replacementExaminers.length >= examinersToSwapOut.length;
                      return {
                        value: teacher.id,
                        label: teacher.name,
                        disabled: !isSelected && reachedLimit,
                      };
                    })}
                  className="w-full"
                  allowClear
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CreateCouncilPage;
