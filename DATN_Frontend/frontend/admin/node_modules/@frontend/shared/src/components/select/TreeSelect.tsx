import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TreeSelect, Typography, Space, Tag, List } from 'antd';
import { NotAvailable } from '../../constants/commonConst';

// ======================= Mock DB & Fake API =======================
type Brand = { id: string; name: string };
type Station = { id: string; name: string; brandId: string; status: 'active' | 'closed'; address?: string };

const BRAND_COUNT = 6;
const STATION_PER_BRAND = 180;

// Tạo mock DB
const BRANDS: Brand[] = Array.from({ length: BRAND_COUNT }).map((_, i) => ({
  id: `b-${String(i + 1).padStart(2, '0')}`,
  name: `Brand ${i + 1}`,
}));

const STATIONS_BY_BRAND: Record<string, Station[]> = {};
for (const b of BRANDS) {
  STATIONS_BY_BRAND[b.id] = Array.from({ length: STATION_PER_BRAND }).map((_, j) => ({
    id: `s-${b.id}-${String(j + 1).padStart(3, '0')}`,
    name: `Station ${j + 1} of ${b.name}`,
    brandId: b.id,
    status: j % 11 === 0 ? 'closed' : 'active',
    address: `#${j + 1} Example Street, Ward ${((j % 10) + 1).toString()}`,
  }));
}

function sleep(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

type Page<T> = { items: T[]; nextCursor: string | null; hasMore: boolean };

function paginate<T>(arr: T[], cursor: string | null | undefined, limit: number): Page<T> {
  const idx = cursor ? parseInt(cursor, 10) : 0;
  const items = arr.slice(idx, idx + limit);
  const next = idx + limit;
  return {
    items,
    nextCursor: next < arr.length ? String(next) : null,
    hasMore: next < arr.length,
  };
}

async function apiFetchBrands(params: { search?: string; cursor?: string | null; limit?: number }): Promise<Page<Brand>> {
  const { search = '', cursor = null, limit = 20 } = params || {};
  const q = search.trim().toLowerCase();
  const filtered = q ? BRANDS.filter((b) => b.name.toLowerCase().includes(q)) : BRANDS;
  await sleep();
  return paginate(filtered, cursor, limit);
}

async function apiFetchStations(params: {
  brandId: string;
  search?: string;
  cursor?: string | null;
  limit?: number;
}): Promise<Page<Station>> {
  const { brandId, search = '', cursor = null, limit = 50 } = params || {};
  const all = STATIONS_BY_BRAND[brandId] ?? [];
  const q = search.trim().toLowerCase();
  const filtered = q ? all.filter((s) => s.name.toLowerCase().includes(q)) : all;
  await sleep();
  return paginate(filtered, cursor, limit);
}

// ======================= TreeSelect Types =======================
type TreeNode = {
  key: string;              // unique
  value: string;            // unique (TreeSelect dùng value)
  title: React.ReactNode;
    labelText?: string;       // text thuần để TreeSelect dùng làm `label` (khi labelInValue)
  isLeaf?: boolean;
  selectable?: boolean;
  disableCheckbox?: boolean;
  disabled?: boolean;
  children?: TreeNode[];

  // Custom meta để lưu cursor/hasMore/brand
  nodeType: 'brand' | 'station';
  brandId?: string;         // với station
  meta?: {
    stationsCursor?: string | null; // cursor cho brand
    stationsHasMore?: boolean;
    loaded?: boolean;               // đã nạp children lần đầu chưa
  };
};

// ======================= Helpers =======================
function toBrandNode(b: Brand): TreeNode {
  return {
    key: `brand-${b.id}`,
    value: `brand-${b.id}`, // dùng prefix để không đụng stationId
    title: b.name,
    labelText: b.name,
    nodeType: 'brand',
    isLeaf: false,
    meta: { stationsCursor: null, stationsHasMore: true, loaded: false },
  };
}

function toStationNode(s: Station): TreeNode {
  const label = (
    <Space size={6}>
      <span>{s.name}</span>
      {s.status === 'closed' ? <Tag color="error">Closed</Tag> : <Tag>Active</Tag>}
    </Space>
  );
  return {
    key: s.id,
    value: s.id,
    title: label,
    labelText: s.name,
    nodeType: 'station',
    isLeaf: true,
    brandId: s.brandId,
  };
}

function updateNodeChildren(tree: TreeNode[], key: string, updater: (children: TreeNode[], node: TreeNode) => TreeNode[]): TreeNode[] {
  const dfs = (nodes: TreeNode[]): TreeNode[] =>
    nodes.map((n) => {
      if (n.key === key) {
        const nextChildren = updater(n.children || [], n);
        return { ...n, children: nextChildren };
      }
      if (n.children?.length) return { ...n, children: dfs(n.children) };
      return n;
    });
  return dfs(tree);
}

function getNodeByKey(tree: TreeNode[], key: string): TreeNode | undefined {
  const stack = [...tree];
  while (stack.length) {
    const n = stack.shift()!;
    if (n.key === key) return n;
    if (n.children?.length) stack.push(...n.children);
  }
  return undefined;
}

// ======================= Debounce =======================
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// ======================= Custom TreeSelect Component =======================
interface CustomTreeSelectProps {
  value?: Array<{
    id: string;
    name: string;
    stations: Array<{
      id: string;
      name: string;
    }>;
  }>;
  onChange?: (value: Array<{
    id: string;
    name: string;
    stations: Array<{
      id: string;
      name: string;
    }>;
  }>) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const CustomTreeSelect: React.FC<CustomTreeSelectProps> = ({
  value = [],
  onChange,
  placeholder = "Select brand or stations...",
  disabled = false,
  style = { width: '100%' }
}) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [internalValue, setInternalValue] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounced(searchValue, 350);
  const inSearch = !!debouncedSearch;
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const expandedBrands = useMemo(
    () => expandedKeys.filter((k) => k.startsWith('brand-')),
    [expandedKeys]
  );

  // Convert nested array to flat TreeSelect format
  const convertToInternalValue = (nestedValue: typeof value) => {
    const flatValue: unknown[] = [];
    
    nestedValue.forEach(brand => {
      if (brand.stations.length === 0) {
        // If no stations selected, select the brand itself
        flatValue.push({
          label: brand.name,
          value: `brand-${brand.id}`,
        });
      } else {
        // Add individual stations
        brand.stations.forEach(station => {
          flatValue.push({
            label: station.name,
            value: station.id,
          });
        });
      }
    });
    
    return flatValue;
  };

  // Convert flat TreeSelect value to nested array format
  const convertToNestedValue = (flatValue: any[]) => {
    const brandMap = new Map<string, {
      id: string;
      name: string;
      stations: Array<{ id: string; name: string; }>;
    }>();

    flatValue.forEach(item => {
      if (item.value.startsWith('brand-')) {
        // This is a brand selection
        const brandId = item.value.replace('brand-', '');
        if (!brandMap.has(brandId)) {
          brandMap.set(brandId, {
            id: brandId,
            name: item.label,
            stations: []
          });
        }
      } else {
        // This is a station selection
        const stationId = item.value;
        const stationName = item.label;
        
        // Find the brand for this station
        const brandId = findBrandIdForStation(stationId);
        if (brandId) {
          const brandName = findBrandNameById(brandId);
          if (!brandMap.has(brandId)) {
            brandMap.set(brandId, {
              id: brandId,
              name: brandName || `Brand ${brandId}`,
              stations: []
            });
          }
          brandMap.get(brandId)!.stations.push({
            id: stationId,
            name: stationName
          });
        }
      }
    });

    return Array.from(brandMap.values());
  };

  const findBrandIdForStation = (stationId: string): string | null => {
    for (const [brandId, stations] of Object.entries(STATIONS_BY_BRAND)) {
      if (stations.some((s: any) => s.id === stationId)) {
        return brandId;
      }
    }
    return null;
  };

  const findBrandNameById = (brandId: string): string | null => {
    const brand = BRANDS.find(b => b.id === brandId);
    return brand ? brand.name : null;
  };

  // Sync external value with internal value
  useEffect(() => {
    setInternalValue(convertToInternalValue(value));
  }, [value]);

  // Mới mount: load brands
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const page = await apiFetchBrands({ limit: 50 });
      if (cancelled) return;
      setTreeData(page.items.map(toBrandNode));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Search remote: build tree gồm các brand match + một ít station match theo q
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!debouncedSearch) {
        // Clear search -> quay lại danh sách brand gốc (không nạp children)
        const page = await apiFetchBrands({ limit: 50 });
        if (cancelled) return;
        setTreeData(page.items.map(toBrandNode));
        return;
      }
      setLoading(true);
      const brandsPage = await apiFetchBrands({ search: debouncedSearch, limit: 10 });
      if (cancelled) return;

      // Nạp trước mỗi brand ~20 station khớp search (demo)
      const nextTree: TreeNode[] = [];
      for (const b of brandsPage.items) {
        const brandNode = toBrandNode(b);
        const stations = await apiFetchStations({ brandId: b.id, search: debouncedSearch, limit: 20 });
        brandNode.children = stations.items.map(toStationNode);
        brandNode.meta = {
          stationsCursor: stations.nextCursor,
          stationsHasMore: stations.hasMore,
          loaded: true,
        };
        nextTree.push(brandNode);
      }
      setTreeData(nextTree);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  // Lazy load children khi expand brand lần đầu
  const loadChildren = async (node: any) => {
    const n = getNodeByKey(treeData, node.key);
    if (!n || n.nodeType !== 'brand') return;
    // Nếu đã loaded & không search -> bỏ qua
    if (n.meta?.loaded && !inSearch) return;

    const brandId = n.value.replace('brand-', '');
    const page = await apiFetchStations({
      brandId,
      search: inSearch ? debouncedSearch : undefined,
      cursor: n.meta?.stationsCursor ?? null,
      limit: 50,
    });

    setTreeData((prev) =>
      updateNodeChildren(prev, n.key, (children, current) => {
        const merged = (children || []).concat(page.items.map(toStationNode));
        return merged;
      })
    );

    // Cập nhật meta (cursor/hasMore/loaded)
    setTreeData((prev) =>
      prev.map((x) =>
        x.key === n.key
          ? {
              ...x,
              meta: {
                stationsCursor: page.nextCursor,
                stationsHasMore: page.hasMore,
                loaded: true,
              },
            }
          : x
      )
    );
  };

  // Infinite scroll: khi cuộn gần đáy -> nạp thêm cho những brand đang mở có hasMore
  const isLoadingMoreRef = useRef(false);
  const handlePopupScroll: React.UIEventHandler<HTMLDivElement> = async (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (!nearBottom || isLoadingMoreRef.current) return;

    // ưu tiên brand vừa mở sau cùng
    const candidates = [...expandedBrands].reverse();

    for (const brandKey of candidates) {
      const brandNode = getNodeByKey(treeData, brandKey);
      if (
        brandNode &&
        brandNode.nodeType === 'brand' &&
        brandNode.meta?.stationsHasMore
      ) {
        try {
          isLoadingMoreRef.current = true;
          const brandId = brandNode.value.replace('brand-', '');
          const page = await apiFetchStations({
            brandId,
            search: inSearch ? debouncedSearch : undefined,
            cursor: brandNode.meta?.stationsCursor ?? null,
            limit: 60,
          });

          setTreeData((prev) =>
            updateNodeChildren(prev, brandKey, (children) => {
              return (children || []).concat(page.items.map(toStationNode));
            })
          );

          // update meta
          setTreeData((prev) =>
            prev.map((x) =>
              x.key === brandKey
                ? {
                    ...x,
                    meta: {
                      stationsCursor: page.nextCursor,
                      stationsHasMore: page.hasMore,
                      loaded: true,
                    },
                  }
                : x
            )
          );
        } finally {
          isLoadingMoreRef.current = false;
        }
        break; // mỗi lần chỉ tải thêm 1 brand để mượt
      }
    }
  };
  
  const handleInternalChange = (newVal: unknown[], label: unknown, extra: unknown) => {
    setInternalValue(newVal);
    const nestedValue = convertToNestedValue(newVal);
    onChange?.(nestedValue);
  };

  return (
    <TreeSelect
      treeData={treeData}
      treeCheckable
      showSearch
      treeNodeLabelProp='labelText'
      filterTreeNode={false}
      searchValue={searchValue}
      onSearch={setSearchValue}
      loadData={loadChildren}
      styles={{ popup: { root: { maxHeight: 420, overflow: 'auto' } } }}
      onPopupScroll={handlePopupScroll}
      treeExpandedKeys={expandedKeys}
      onTreeExpand={(keys) => setExpandedKeys(keys as string[])}
      maxTagCount={0}
      maxTagPlaceholder={NotAvailable}
      value={internalValue}
      onChange={handleInternalChange}
      labelInValue
      allowClear
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      listHeight={360}
      virtual
      showCheckedStrategy={TreeSelect.SHOW_PARENT}
      loading={loading}
    />
  );
};

export default CustomTreeSelect;
