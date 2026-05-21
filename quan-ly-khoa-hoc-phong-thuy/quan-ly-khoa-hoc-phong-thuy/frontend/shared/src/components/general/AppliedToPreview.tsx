import { Tag } from 'antd';

interface AppliedToItem {
  label: string;
  value: string;
}

interface AppliedToPreviewProps {
  data?: AppliedToItem[];
  showLabel?: boolean;
}

const AppliedToPreview = ({ data, showLabel = true }: AppliedToPreviewProps) => {
  if (!data || data.length === 0) return <span>-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {data.map((item) => (
        <Tag key={item.value}>{showLabel ? item.label : item.label}</Tag>
      ))}
    </div>
  );
};

export default AppliedToPreview;
