// OverviewBuilder.tsx
import { Card, Col, ColProps, Flex, Form, Row } from 'antd';
import { debounce } from 'lodash';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { RangeParams } from '@shared/types/GeneralType';
import StatisticCard, { StatisticCardProps } from '@shared/components/card/StatisticCard';
import ColumnChart from '@shared/components/chart/ColumnChart';
import LineChart from '@shared/components/chart/LineChart';
import PieChart from '@shared/components/chart/PieChart';
import RangePickerWithPreset from '@shared/components/rangePicker/RangePickerWithPreset';
import SelectBrandGasStation from './SelectBrandGasStation';

// ===== Types chung =====
export type Params = RangeParams & { brandId?: string; gasStationId?: string; [key: string]: unknown };

export type DataHook<T> = (params: Params) => {
  data?: T;
  isLoading: boolean;
  error?: unknown;
};

// Card item (Statistic)
export type CardItem<TData = unknown> = {
  span?: ColProps["span"];                    // span Col
  flex?: ColProps["flex"];         // flex Col
  mapData: (data?: TData) => StatisticCardProps;
  component?: React.ComponentType<StatisticCardProps>; // mặc định StatisticCard
} & Partial<ColProps>;

export type CardGroup<T = unknown> = {
    items: CardItem<T>[];
    useQuery: DataHook<T>;
};

// Chart item
type ChartType = 'pie' | 'line' | 'bar' | 'area';

export type ChartItem<TData = unknown, ChartProps = unknown> = {
  span?: ColProps["span"];  // span Col
  type: ChartType;
  useQuery: DataHook<TData>;
  mapData: (data?: TData) => ChartProps;  // trả props đúng cho PieChart/LineChart...
  subtitle?: React.ReactNode;
  height?: number;
} & Partial<ColProps>;

// Table item
export type TableItem<TComponentProps = unknown> = {
  span?: number;
  component: React.ComponentType<TComponentProps>;
  componentProps?: Omit<TComponentProps, 'additionalParams'> & {
    additionalParams?: Record<string, unknown>;
  };
} & Partial<ColProps>;

// Tổng config
export type OverviewConfig = {
  grid?: { gutter?: [number, number] };
  filterRender?: React.ReactNode;
  cards?: CardGroup;
  charts?: ChartItem[];
  tables?: TableItem[];
  initialParams?: Params;
  onParamsChange?: (p: Params) => void;
};

// ===== Params Context =====
const ParamsContext = createContext<{
  params: Params;
  setParams: (patch: Partial<Params>) => void;
} | null>(null);

export const useOverviewParams = () => {
  const context = useContext(ParamsContext);
  if (!context) throw new Error('useOverviewParams must be inside OverviewBuilder');
  return context;
};

// ===== Renderers registry =====

const ChartRegistry: Record<ChartType, React.ComponentType<unknown>> = {
  pie: PieChart,
  line: LineChart,
  bar: ColumnChart,
  area: (_props: unknown) => <div>TODO: AreaChart renderer</div>,
};

// ===== FilterBar =====
const FilterBar: React.FC<{ filterRender?: OverviewConfig['filterRender'] }> = ({ filterRender }) => {
  const { params, setParams } = useOverviewParams();
  const [form] = Form.useForm();
  const handleChange = useCallback(
    debounce(() => {
      const values = form.getFieldsValue();
      const newParams = { ...params, ...values };
      setParams(newParams);
    }, 500),
    [params, form, setParams],
  );

  return (
    <Form form={form} layout="inline" className="flex justify-end" onValuesChange={handleChange}>
      <Row gutter={[ 8, 8 ]}>
        <SelectBrandGasStation />
        
        <Form.Item
          name={"time"}
        >
          <RangePickerWithPreset formKey={["start", "end"]} />
        </Form.Item>

        <Form.Item name={"start"} hidden />
        <Form.Item name={"end"} hidden />

        {/* Extra render */}
        {filterRender}
      </Row>
    </Form>
  );
};

// ===== Cards Grid =====
const CardGrid: React.FC<{ cards: OverviewConfig['cards'] }> = ({ cards }) => {
    if(!cards) return null;
    const { params } = useOverviewParams();
    const { data, isLoading } = cards.useQuery(params);
    return (
        <Row gutter={[16, 16]}>
            {cards?.items?.map((item: CardItem, i: number) => (
                <CardTile key={i} item={item} data={data} isLoading={isLoading} />
            ))}
        </Row>
  );    
};

const CardTile: React.FC<{ item: CardItem, data: unknown, isLoading: boolean }> = ({ item, data, isLoading }) => {
  const props = item.mapData(data);
  const Comp = item.component || StatisticCard;
  return (
    <Col span={item?.span} flex={item?.flex} {...item}>
      <Comp {...props} isLoading={isLoading} />
    </Col>
  );
};

// ===== Charts Grid =====
const ChartGrid: React.FC<{ items?: OverviewConfig['charts'] }> = ({ items }) => {
  return (
    <Row gutter={[16, 16]}>
      {items?.map((item, i) => (
        <ChartTile key={i} item={item} />
      ))}
    </Row>
  );
};

const ChartTile: React.FC<{ item: ChartItem }> = ({ item }) => {
  const { params } = useOverviewParams();
  const { data, isLoading } = item.useQuery(params);
  const Comp = ChartRegistry[item.type];
  const props = item.mapData(data);
  const span = item.span ?? 12;
  return (
    <Col span={span} {...item}>
      <Card loading={isLoading}>
        <Comp height={item.height ?? 320} {...props} />
      </Card>
    </Col>
  );
};

// ===== Tables Grid =====
const TableGrid: React.FC<{ items?: OverviewConfig['tables'] }> = ({ items }) => {
  const { params } = useOverviewParams();
  return (
    <Row gutter={[16, 16]}>
      {items?.map((it, i) => {
        const Comp = it.component;
        const mergedProps = {
          ...it.componentProps,
          additionalParams: { ...params, ...it.componentProps?.additionalParams }
        };
        return (
          <Col span={it.span ?? 24} key={i} {...it}>
            <Comp {...mergedProps} />
          </Col>
        );
      })}
    </Row>
  );
};

// ===== OverviewBuilder (export) =====
export const OverviewBuilder: React.FC<{ config: OverviewConfig }> = ({ config }) => {
  const [params, setParamsState] = useState<Params>(config.initialParams || {
    start: null,
    end: null,
  });
  const setParams = (patch: Partial<Params>) => {
    const next = { ...params, ...patch };
    setParamsState(next);
  };

  const ctx = useMemo(() => ({ params, setParams }), [params]);

  return (
    <ParamsContext.Provider value={ctx}>
      <Flex vertical gap={16}>
        <FilterBar filterRender={config.filterRender} />
        <CardGrid cards={config.cards} />
        <ChartGrid items={config.charts} />
        <TableGrid items={config.tables} />
      </Flex>
    </ParamsContext.Provider>
  );
};
