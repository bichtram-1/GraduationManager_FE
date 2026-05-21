// ReusablePie.tsx
import { Empty, Flex, Typography } from 'antd';
import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { NotAvailable } from '../../constants/commonConst';
import { formatNumber } from '../../utils/numberUtils';

type PieDatum = {
  label: string;   // nhãn hiển thị (vd: "Gasoline")
  value: number;   // số liệu (Apex sẽ tự tính %)
  color?: string;  // màu tùy chọn cho lát này (optional)
};

export type PieChartProps = {
  title?: string;                  // tiêu đề card
  loading?: boolean;               // trạng thái loading
  subtitle?: string;               // dòng phụ (vd: "Filtered by: ...")
  data: PieDatum[];                // mảng data đầu vào
  height?: number;                 // chiều cao chart (px)
  showLegend?: boolean;            // bật/tắt legend
  legendPosition?: 'bottom' | 'right';
  // format số/thanh label — dễ thay đổi cho các ngữ cảnh khác
  percentDigits?: number;          // số chữ số thập phân %
  tooltipFormat?: (val: number) => string; // format số trong tooltip
};

const PieChart: React.FC<PieChartProps> = ({
  title,
  subtitle,
  
  data,
  height = 300,
  showLegend = true,
  legendPosition = 'bottom',
  percentDigits = 1,
  tooltipFormat = (val) => formatNumber(val),
}) => {
  // tách series (số) & labels (chuỗi) & colors (mảng màu) từ data
  const { series, labels, colors } = useMemo(() => {
    const palette = ['#4285F4', '#34A853', '#F9AB00', '#A142F4', '#FF6D01'];
    return (data ?? []).reduce(
      (acc, d, i) => {
        acc.series.push(d.value ?? 0);
        acc.labels.push(d.label ?? NotAvailable);
        acc.colors.push(palette[i % palette.length]);
        return acc;
      },
      {
        series: [] as number[],
        labels: [] as string[],
        colors: [] as string[],
      }
    );
  }, [data]);

  // options ApexCharts — tập trung UI như ảnh: nhãn “Label: 42.5%”, legend dưới, pie gọn gàng
  const options: ApexCharts.ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'pie',
        toolbar: { show: false },
        animations: { easing: 'easeinout', speed: 800 },
        parentHeightOffset: 0,
      },
      labels,
      colors,
      legend: {
        show: showLegend,
        position: legendPosition,
        horizontalAlign: legendPosition === 'bottom' ? 'center' : 'left',
        itemMargin: { horizontal: 10, vertical: 4 },
        markers: { offsetX: -2, radius: 2 }, 
        formatter(legendName, opts) {
            // Hiển thị "Label (n%)" trong legend
            const index = opts.seriesIndex;
            const percent = opts.w.globals.seriesPercent[index] ?? 0;
            return `${legendName} (${formatNumber(percent)}%)`;
        },
      },
      dataLabels: {
        enabled: true,
        dropShadow: { enabled: false },
      },
      tooltip: {
        y: {
          formatter: (val) => tooltipFormat(val), // số thô trong tooltip
        },
      },
      stroke: {
        width: 1,
        colors: ['#fff'], // viền trắng mảnh giữa các lát
      },
      // Tối ưu đọc trên màn nhỏ: có thể tắt dataLabels nếu quá chật
      responsive: [
        {
          breakpoint: 640,
          options: {
            dataLabels: { enabled: false },
            legend: { position: 'bottom' },
          },
        },
      ],
    }),
    [labels, colors, showLegend, legendPosition, percentDigits, data]
  );

  const isEmpty = data?.length === 0 || series?.length === 0;

  return (
    <div>
        {/* Header đơn giản: Title + Subtitle (tuỳ chọn) */}
        {(title || subtitle) && (
            <Flex vertical>
            {title && (
                <Typography.Title level={4} className='!mb-0'>
                    {title}
                </Typography.Title>
            )}
            {subtitle && (
                <Typography.Text>
                    {subtitle}
                </Typography.Text>
            )}
            </Flex>
        )}
        {/* Chart hoặc thông báo trống */}
        {isEmpty 
        ? <Flex align="center" justify="center" style={{ minHeight: height }} >
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> 
          </Flex>
        : <Chart options={options} series={series} type="pie" height={height} />
        }
    </div>
  );
};

export default PieChart;
