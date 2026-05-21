import { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrophyOutlined } from '@ant-design/icons';
import { getKey } from '@shared/types/I18nKeyType';
import { COLORS } from '@shared/constants/color';
import FilterTable from '@shared/components/table/FilterTable';
import { achievementHooks } from '../../hooks/useAchievements';
import {
  ICreateAchievement,
  IDetailAchievement,
  IListAchievement,
  IUpdateAchievement,
} from '../../type/AchievementType';
import { cn, DATE_DISPLAY_FORMAT } from '../../constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';
import ModalCreateEditAchievement from './components/ModalCreateEditAchievement';

// Wrapper: ignore enabled param from FilterTable so detail fetches for both detail & update modal types
const useFetchAchievementDetail = (id: string, _enabled: boolean = true) => {
  return achievementHooks.useFetchDetailAchievement(id, !!id);
};

const AchievementsPage = () => {
  const { t } = useTranslation();

  const createMutation = achievementHooks.useCreateAchievement();
  const updateMutation = achievementHooks.useUpdateAchievement();
  const deleteMutation = achievementHooks.useDeleteAchievement();

  const columns: TableColumnsType<IDetailAchievement> = useMemo(
    () => [
      {
        title: t(getKey('achievement_name')),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        ellipsis: true,
        render: (name: string) => (
          <div className={cn('flex items-center gap-2')}>
            <TrophyOutlined
              style={{ fontSize: 20, color: COLORS.goldMedium }}
            />
            <span className={cn('text-sm font-medium text-black')}>{name}</span>
          </div>
        ),
      },
      {
        title: t(getKey('required_courses')),
        dataIndex: 'requiredCourses',
        key: 'requiredCourses',
        render: (count: number) => (
          <span
            className={cn(
              'inline-block whitespace-nowrap rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'
            )}
          >
            {formatNumber(count)} {t(getKey('course')).toLowerCase()}
          </span>
        ),
      },
      {
        title: t(getKey('created_date')),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format(DATE_DISPLAY_FORMAT) : '',
      },
    ],
    [t]
  );

  return (
    <FilterTable<
      IListAchievement,
      IDetailAchievement,
      ICreateAchievement,
      IUpdateAchievement
    >
      pageTitle={t(getKey('achievement_management'))}
      pageSubtitle={t(getKey('achievement_management_desc'))}
      title={t(getKey('achievement_list'))}
      createButtonLabel={t(getKey('add_achievement'))}
      columns={columns}
      useQueryHook={achievementHooks.useFetchListAchievements}
      actions={{
        isDetail: false,
        isEdit: true,
        isDelete: true,
      }}
      deleteInfo={{
        type: 'modal',
        modalInfo: {
          modalContent: null,
          modalProps: {},
          modalFunc: deleteMutation,
        },
      }}
      createInfo={{
        type: 'modal',
        modalInfo: {
          modalContent: <ModalCreateEditAchievement />,
          modalProps: {},
          modalFunc: createMutation,
        },
      }}
      updateInfo={{
        type: 'modal',
        modalInfo: {
          modalContent: <ModalCreateEditAchievement />,
          modalProps: {},
          modalFunc: updateMutation,
        },
      }}
      detailInfo={{
        type: 'modal',
        modalInfo: {
          modalContent: null,
          modalProps: { footer: null },
          modalFunc: useFetchAchievementDetail,
        },
      }}
    />
  );
};

export default AchievementsPage;
