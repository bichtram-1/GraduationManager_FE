// SegmentedTabs.tsx
import React from 'react';
import { Flex, Segmented } from 'antd';

export type ItemSegmentTabs = {
  key: string;
  label: React.ReactNode;
  children: React.ReactNode;
};

type Props = {
  items: ItemSegmentTabs[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  block?: boolean; // full width
  size?: 'small' | 'middle' | 'large';
  rightExtra?: React.ReactNode; // nút filter... nếu muốn
};

export default function SegmentedTabs({
  items,
  defaultActiveKey,
  activeKey,
  onChange,
  block = true,
  size,
}: Props) {
  const [innerKey, setInnerKey] = React.useState(
    activeKey ?? defaultActiveKey ?? items[0]?.key
  );

  const currentKey = activeKey ?? innerKey;

  const options = items.map(i => ({ label: i.label, value: i.key, className: "font-bold" }));

  const handleChange = (val: string | number) => {
    const key = String(val);
    setInnerKey(key);
    onChange?.(key);
  };

  return (
    <Flex vertical gap={12}>
      <Segmented
        options={options}
        value={currentKey}
        shape='round'
        onChange={handleChange}
        block={block}
        size={size}
      />

      <div>
        {items.find(i => i.key === currentKey)?.children}
      </div>
    </Flex>
  );
}
