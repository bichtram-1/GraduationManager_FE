/**
 * @template {{ (...args: any[]): any }} T
 * @param {T} callback
 * @param {number} wait
 * @returns {T & { cancel: () => void }} }
 */
export function debounce<T extends (...args: any[]) => any>(callback: T, wait: number): T & {
    cancel: () => void;
};
//# sourceMappingURL=debounce.d.ts.map