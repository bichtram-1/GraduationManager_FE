import dayjs from 'dayjs';
import {
  DATE_FORMAT,
  WHITESPACE_ERROR_MESSAGE,
} from '../constants/commonConst';

function formatDate(value: Date | dayjs.Dayjs | string): string {
  return dayjs(value).format(DATE_FORMAT);
}

export function isDate(value: unknown): boolean {
  return dayjs.isDayjs(value) || value instanceof Date;
}

function isDateString(value: unknown): boolean {
  return typeof value === 'string' && !isNaN(Date.parse(value));
}

export function deepCompareObjects(
  obj1: Record<string, unknown>,
  obj2: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const allKeys = [...Object.keys(obj1), ...Object.keys(obj2)].reduce(
    (acc: string[], key) => {
      if (!acc.includes(key)) {
        acc.push(key);
      }
      return acc;
    },
    []
  );

  for (const key of allKeys) {
    const value1 = obj1[key];
    const value2 = obj2[key];

    if (value2 === undefined) {
      result[key] = value1;
      continue;
    }

    if (isDate(value1) && isDateString(value2)) {
      const formattedDate1 = formatDate(value1 as Date | dayjs.Dayjs);
      const formattedDate2 = value2 as string;

      if (formattedDate1 !== formattedDate2) {
        result[key] = formattedDate1;
      }
    } else if (
      typeof value1 === 'object' &&
      value1 !== null &&
      !Array.isArray(value1)
    ) {
      const nestedResult = deepCompareObjects(
        value1 as Record<string, unknown>,
        (value2 || {}) as Record<string, unknown>
      );
      if (Object.keys(nestedResult).length > 0) {
        result[key] = nestedResult;
      }
    } else if (value1 !== value2) {
      result[key] = value1;
    }
  }
  return result;
}

export function capitalizeFirstLetter(string: string) {
  if (!string) return '';
  string = string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function downloadBlobFunc(blob: Blob, name: string) {
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}_${dayjs().format('DD-MM-YYYY-HH-mm-ss')}.xlsx`;
  document.body.appendChild(a);
  a.click();

  window.URL.revokeObjectURL(url);
}

export const validateSpaces = (rule: unknown, value: string | undefined) => {
  if (!value) return Promise.resolve();

  const originalValue = value;
  const normalizedValue = value.trim();

  if (originalValue !== normalizedValue) {
    return Promise.reject(new Error(WHITESPACE_ERROR_MESSAGE));
  }

  return Promise.resolve();
};

export function transformToLineChartData<T extends Record<string, unknown>>(
  data: T[],
  bucketKey: keyof T = 'bucket'
): {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
} {
  if (!data || data.length === 0) {
    return { categories: [], series: [] };
  }

  const result = data.reduce(
    (acc, item) => {
      acc.categories.push(
        String(item?.[bucketKey] ?? '')
      );

      Object.keys(item).forEach((key) => {
        if (key === bucketKey) return;

        const cell = item[key] as { label?: string; value?: number } | undefined;

        if (!acc.series[key]) {
          acc.series[key] = {
            name: cell?.label ?? key,
            data: [],
          };
        }

        acc.series[key].data.push(cell?.value ?? 0);
      });

      return acc;
    },
    {
      categories: [] as string[],
      series: {} as Record<string, { name: string; data: number[] }>,
    }
  );

  return {
    categories: result.categories,
    series: Object.values(result.series),
  };
}
