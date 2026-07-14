import { Flex, Typography, Select, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router-dom';
import { DYNAMIC_ROUTES, HEADER_TITLES, ROUTES } from '../../constants/routers';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { getKey, I18nKey } from '@shared/types/I18nKeyType';
import {
  findOptionObject,
  NotAvailable,
  RoleLevel,
} from '../../constants/commonConst';
import { useMemo, useEffect } from 'react';
import { periodHooks } from '../../hooks/usePeriods';
import { BatchStatus } from '../../type/PeriodType';

const statusBadgeColor: Record<BatchStatus, string> = {
  open: 'green',
  published: 'blue',
  grading: 'gold',
  closed: 'red',
};

const statusText: Record<BatchStatus, string> = {
  open: 'Đang mở',
  published: 'Đã công bố',
  grading: 'Chấm điểm',
  closed: 'Đã đóng',
};

const DefaultHeader = () => {
  const { user, selectedPeriod, setSelectedPeriod } = useGlobalVariable();
  const pathname = useLocation();
  const { t } = useTranslation();

  const { data: periodsData } = periodHooks.useFetchListPeriods({ page: 1, limit: 100 });
  const allPeriods = periodsData?.rows ?? [];

  const isInternshipPage =
    pathname.pathname.startsWith('/internship-students') ||
    pathname.pathname.startsWith('/assignments');

  const isThesisPage =
    pathname.pathname.startsWith('/groups') ||
    pathname.pathname.startsWith('/councils') ||
    pathname.pathname.startsWith('/topics');

  useEffect(() => {
    if (allPeriods.length === 0) return;

    if (isInternshipPage) {
      // For internship pages, we MUST select a TTTN period
      const tttnPeriods = allPeriods.filter(p => p.type === 'tttn');
      if (tttnPeriods.length > 0) {
        const isCurrentTttn = selectedPeriod && selectedPeriod.type === 'tttn';
        if (!isCurrentTttn) {
          const activeTttn = tttnPeriods.find(p => p.status === 'open' || p.status === 'published') || tttnPeriods[0];
          setSelectedPeriod(activeTttn);
        }
      }
    } else if (isThesisPage) {
      // For thesis (DATN) pages, we MUST select a DATN period
      const datnPeriods = allPeriods.filter(p => p.type === 'datn');
      if (datnPeriods.length > 0) {
        const isCurrentDatn = selectedPeriod && selectedPeriod.type === 'datn';
        if (!isCurrentDatn) {
          const activeDatn = datnPeriods.find(p => p.status === 'open' || p.status === 'published') || datnPeriods[0];
          setSelectedPeriod(activeDatn);
        }
      }
    } else {
      // General pages: select any active period if none selected
      if (!selectedPeriod) {
        const activePeriod = allPeriods.find(p => p.status === 'open' || p.status === 'published') || allPeriods[0];
        setSelectedPeriod(activePeriod);
      }
    }
  }, [allPeriods, selectedPeriod, setSelectedPeriod, pathname.pathname, pathname.search]);

  const tttnPeriods = allPeriods.filter(p => p.type === 'tttn');
  const datnPeriods = allPeriods.filter(p => p.type === 'datn');

  const handlePeriodChange = (id: string) => {
    const period = allPeriods.find(p => p.id === id);
    setSelectedPeriod(period);
  };

  const roleUser = useMemo(
    () => findOptionObject(RoleLevel(), user?.role ?? ''),
    [user?.role]
  );

  const handleDynamicRouteTitle = (): keyof I18nKey => {
    const matched = DYNAMIC_ROUTES.find((route) =>
      matchPath(route, pathname.pathname)
    );
    return matched ? HEADER_TITLES[matched] : 'unknown_page';
  };

  const title = (HEADER_TITLES[pathname.pathname] ?? handleDynamicRouteTitle()) as keyof I18nKey;

  return (
    <div className="flex justify-center items-center w-full gap-4">
      <div className="flex-1 flex justify-between items-center border-none">
        <Flex align="center" gap={55}>
          <Typography.Title level={3} className="!mb-0">
            {t(getKey(title))}
          </Typography.Title>
        </Flex>

        <Flex align="center" gap={20}>
          {/* Global Period Selector */}
          {pathname.pathname !== ROUTES.USERS &&
            pathname.pathname !== '/councils/create' &&
            pathname.pathname !== ROUTES.PERIODS &&
            pathname.pathname !== ROUTES.CLASSES &&
            pathname.pathname !== ROUTES.COMPANIES && (
            <div className="flex items-center gap-2 bg-[#f8fafc] border border-slate-200 px-3 py-1 rounded-[12px] shadow-sm">
              <span className="text-xs font-semibold text-slate-500">Đợt hoạt động:</span>
              <Select
                className="w-[240px]"
                placeholder="Chọn đợt hoạt động"
                value={selectedPeriod?.id}
                onChange={handlePeriodChange}
                variant="borderless"
                classNames={{ popup: { root: 'rounded-xl shadow-lg' } }}
              >
                {tttnPeriods.length > 0 && !isThesisPage && (
                  <Select.OptGroup label="Đợt Thực tập tốt nghiệp (TTTN)">
                    {tttnPeriods.map(p => (
                      <Select.Option key={p.id} value={p.id}>
                        <span className="font-medium text-slate-700">{p.name}</span>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                )}
                {datnPeriods.length > 0 && !isInternshipPage && (
                  <Select.OptGroup label="Đợt Đồ án tốt nghiệp (ĐATN)">
                    {datnPeriods.map(p => (
                      <Select.Option key={p.id} value={p.id}>
                        <span className="font-medium text-slate-700">{p.name}</span>
                      </Select.Option>
                    ))}
                  </Select.OptGroup>
                )}
              </Select>

              {selectedPeriod && (
                <Tag color={statusBadgeColor[selectedPeriod.status]} className="m-0 border-none rounded-full px-2.5">
                  {statusText[selectedPeriod.status]}
                </Tag>
              )}
            </div>
          )}

          <Flex vertical align="start" className="max-w-[150px] text-base">
            <p className="font-bold mb-0">{roleUser?.label || NotAvailable}</p>
            <p className="text-gray-500">{user?.name || NotAvailable}</p>
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

export default DefaultHeader;

