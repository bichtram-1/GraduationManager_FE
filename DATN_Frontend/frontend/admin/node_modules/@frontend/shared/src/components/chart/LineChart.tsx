// components/charts/LineChart.tsx
import { Empty, Flex, Typography } from 'antd';
import type { ApexOptions } from 'apexcharts';
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { NotAvailable } from '../../constants/commonConst';
import { formatNumber } from '../../utils/numberUtils';

/** Một điểm dữ liệu của 1 series (số hoặc null để hổng dữ liệu) */
type Point = number;

/** Định nghĩa 1 series đường */
export type LineSeries = {
  name: string;        // tên hiển thị trong legend
  data: Point[];       // mảng số (cùng độ dài với categories)
  color?: string;      // màu tùy chọn cho series này
};

export type LineChartProps = {
  title?: string;                  // tiêu đề
  loading?: boolean;               // trạng thái loading
  subtitle?: string;               // mô tả nhỏ dưới tiêu đề
  categories: (string)[]; // nhãn trục X (ví dụ: ['Thu','Fri',...])
  series: LineSeries[];            // các đường
  height?: number;                 // chiều cao chart
  showLegend?: boolean;            // bật/tắt legend
  legendPosition?: 'bottom' | 'right';
  yLabelFormatter?: (val: number) => string; // tùy biến format nhãn Y
  tooltipValueFormatter?: (val: number) => string; // format số trong tooltip
};

const LineChart: React.FC<LineChartProps> = ({
  title,
  subtitle,
  
  categories,
  series,
  height = 360,
  showLegend = true,
  legendPosition = 'bottom',
  // format mặc định: 1,234
  yLabelFormatter = (v) => formatNumber(v),
  tooltipValueFormatter = (v) => formatNumber(v),
}) => {
  // Nếu bạn không truyền color cho series, lấy palette mặc định (xanh dương & xanh lá như hình)
  const colors = useMemo(() => {
    const palette = ['#4285F4', '#34A853', '#F9AB00', '#A142F4', '#FF6D01'];
    return series?.map((s, i) => palette[i % palette.length]);
  }, [series]);
  // Options của ApexCharts — đã tối ưu để giống UI screenshot
  const options: ApexOptions = useMemo(() => ({
    chart: {
      type: 'line',
      toolbar: { show: false },                // ẩn toolbar
      animations: { easing: 'easeinout', speed: 800 },
      parentHeightOffset: 0,                   // tránh bị trừ chiều cao khi ở trong card có padding
    },
    stroke: {
      width: 2.5,                              // độ dày đường
      curve: 'smooth',                         // đường cong mượt
    },
    markers: {
      size: 3,                                 // kích thước điểm tròn
      strokeWidth: 2,
      hover: { size: 5 },
    },
    dataLabels: { enabled: false },            // không hiển thị số trên điểm
    grid: {
      strokeDashArray: 4,                      // lưới nét đứt giống hình
      xaxis: { lines: { show: true } },        // có cả lưới dọc
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories,
      tooltip: { enabled: false },
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
      shared: true,          // hover hiển thị tất cả series tại điểm X
      intersect: false,
      y: {
        formatter: (val) => (val == null ? NotAvailable : tooltipValueFormatter(val)),
        // title: { formatter: () => '' },
      },
    },
    colors,
    noData: { text: NotAvailable },
    responsive: [
      {
        breakpoint: 640,
        options: {
          legend: { position: 'bottom' },
          markers: { size: 2 },
          stroke: { width: 2 },
        },
      },
    ],
  }), [categories, colors, legendPosition, showLegend, tooltipValueFormatter, yLabelFormatter]);

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
      : <Chart options={options} series={series} type="line" height={height} />
      }
    </div>
  );
};

export default LineChart;
