import { Empty, Flex, Typography } from 'antd';
import type { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { NotAvailable } from '../../constants/commonConst';
import { formatNumber } from '../../utils/numberUtils';

/** Một điểm dữ liệu của 1 series (số hoặc null để hổng dữ liệu) */
type Point = number;

/** Định nghĩa 1 series cột */
export type ColumnSeries = {
  name: string;        // tên hiển thị trong legend
  data: Point[];       // mảng số (cùng độ dài với categories)
  color?: string;      // màu tùy chọn cho series này
};

export type ColumnChartProps = {
  title?: string;                  // tiêu đề
  loading?: boolean;               // trạng thái loading
  subtitle?: string;               // mô tả nhỏ dưới tiêu đề
  categories: string[];            // nhãn trục X (ví dụ: ['Jan','Feb',...])
  series: ColumnSeries[];          // các cột
  height?: number;                 // chiều cao chart
  showLegend?: boolean;            // bật/tắt legend
  legendPosition?: 'bottom' | 'right';
  yLabelFormatter?: (val: number) => string; // tùy biến format nhãn Y
  tooltipValueFormatter?: (val: number) => string; // format số trong tooltip
  stacked?: boolean;               // chế độ cột chồng
  horizontal?: boolean;            // chế độ cột ngang (bar chart)
};

const ColumnChart: React.FC<ColumnChartProps> = ({
  title,
  subtitle,
  
  categories,
  series,
  height = 360,
  showLegend = true,
  legendPosition = 'bottom',
  stacked = false,
  horizontal = false,
  // format mặc định: 1,234
  yLabelFormatter = (v) => formatNumber(v),
  tooltipValueFormatter = (v) => formatNumber(v),
}) => {
  // Palette màu giống các chart khác
  const colors = useMemo(() => {
    const palette = ['#4285F4', '#34A853', '#F9AB00', '#A142F4', '#FF6D01'];
    return series?.map((s, i) => palette[i % palette.length]);
  }, [series]);

  // Options của ApexCharts — tối ưu cho column chart
  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      toolbar: { show: false },
      animations: { easing: 'easeinout', speed: 800 },
      parentHeightOffset: 0,
      stacked,
    },
    plotOptions: {
      bar: {
        horizontal: horizontal,
        columnWidth: '60%',
        borderRadius: 2,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: { 
      enabled: false,  // tắt label trên cột để gọn gàng
    },
    stroke: {
      show: true,
      width: 1,
      colors: ['transparent'],
    },
    grid: {
      strokeDashArray: 4,
      xaxis: { lines: { show: !horizontal } },
      yaxis: { lines: { show: horizontal } },
    },
    xaxis: {
      categories,
      tooltip: { enabled: false },
      axisBorder: { show: true },
      axisTicks: { show: true },
    },
    yaxis: {
      labels: {
        formatter: (val) => yLabelFormatter(val),
      },
    },
    legend: {
      show: showLegend,
      position: legendPosition,
      horizontalAlign: legendPosition === 'bottom' ? 'center' : 'left',
      markers: { size: 4, offsetX: -2, radius: 2 },
      itemMargin: { horizontal: 10, vertical: 4 },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val) => (val == null ? NotAvailable : tooltipValueFormatter(val)),
      },
    },
    colors,
    fill: {
      opacity: 0.9,
    },
    noData: { text: NotAvailable },
    responsive: [
      {
        breakpoint: 640,
        options: {
          legend: { position: 'bottom' },
          plotOptions: {
            bar: {
              columnWidth: '80%',
            },
          },
        },
      },
    ],
  }), [categories, colors, horizontal, legendPosition, showLegend, stacked, tooltipValueFormatter, yLabelFormatter]);

  const isNoData = series.length === 0 || categories.length === 0;
  
  return (
    <div>
      {(title || subtitle) && (
        <Flex vertical>
          {title && <Typography.Title level={4} className='!mb-0'>{title}</Typography.Title>}
          {subtitle && <Typography.Text>{subtitle}</Typography.Text>}
        </Flex>
      )}
      {isNoData
        ? <Flex align="center" justify="center" style={{ minHeight: height }} >
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> 
          </Flex>
        : <Chart options={options} series={series} type={'bar'} height={height} />
      }
    </div>
  );
};

export default ColumnChart;