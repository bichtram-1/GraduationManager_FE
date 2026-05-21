import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import { Card, Flex, Typography } from 'antd';
import { ReactNode } from 'react';
import { cn, NotAvailable } from '../../constants/commonConst';
import { formatNumber } from '../../utils/numberUtils';

const { Text } = Typography;

type ColorTheme = 'green' | 'black' | 'primary' | 'red' | "purple" | "orange";

export interface StatisticCardProps {
  icon?: ReactNode;
  title: string;
  value?: string;
  subValue?: string;
  trend?: number;
  trendText?: string;
  colorTheme: ColorTheme;
  isUseTrendColor?: boolean;
  classNameCustom?: string;
  isLoading?: boolean;
}

const StatisticCard = ({
  icon,
  title,
  value,
  
  trend,
  trendText,
  colorTheme,
  
  classNameCustom = '',
  isLoading,
}: StatisticCardProps) => {

  const getTrendColorClass = (
    isUseTrendColor: boolean,
    trendValue?: number,
  ) => {
    if (!isUseTrendColor) {
      return 'text-primary';
    } else {
      if (!trendValue && typeof trendValue !== 'number') return '';

      return trendValue >= 0 ? 'text-positivePoint' : 'text-redPoint';
    }
  };

  const getColorThemeClass = (colorTheme: StatisticCardProps['colorTheme']) => {
    switch (colorTheme) {
      case 'green':
        return 'text-positivePoint bg-positivePoint/10';
      case 'red':
        return 'text-redPoint bg-redPoint/10';
      case 'primary':
        return 'text-primary bg-primary/10';
      case 'black':
        return 'text-titleConfigText bg-titleConfigText/10';
      case 'purple':
        return 'text-purple-400 bg-purple-400/10';
      case 'orange':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-primary bg-primary/10';
    }
  }

  return (
    <Card
      className={cn(
        'h-full border-none [&>.ant-card-body]:h-full',
        'hover:shadow-md',
        'transition-shadow duration-300',
      )}
      loading={isLoading}
    >
      <Flex vertical gap={4}>
        <Flex align='center' gap={16}>
          {icon && (
            <div
              className={cn(
                'flex items-center justify-center rounded-full size-10',
                getColorThemeClass(colorTheme),
              )}
            >
              {icon}
            </div>
          )}
          <Flex vertical justify='space-between' className='flex-1'>
            <Text>
              {title ?? NotAvailable}
            </Text>
            <Text
              className={cn(
                'font-medium',
                classNameCustom,
              )}
            >
              {value ?? NotAvailable}
            </Text>
          </Flex>
        </Flex>
        <Flex>
          {typeof trend === 'number' && (
            <div
              className={cn(
                'flex gap-1',
                'text-xl leading-tight text-titleConfigText font-medium',
                getTrendColorClass(true, trend),
                '[&_*]:!text-inherit',
              )}
            >
              {trend >= 0 ? <RiseOutlined /> : <FallOutlined />}
              <Flex align='center' gap={4}>
                <Text>{formatNumber(trend)}%</Text>
                <Text>({trendText})</Text>
              </Flex>
            </div>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

export default StatisticCard;
