/**
 * Note: dataTransfer will be destroyed outside of the call stack. So, do not try to process it asynchronous.
 *
 * @param {DataTransfer} dataTransfer
 * @returns {Promise<DropItem[]>}
 */
export function getDropItems(dataTransfer: DataTransfer): Promise<DropItem[]>;
export type DropItem = {
    type: 'file';
    file: File;
    fullPath?: string;
} | {
    type: 'url';
    url: string;
};
//# sourceMappingURL=getDropItems.d.ts.map