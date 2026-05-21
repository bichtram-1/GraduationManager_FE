/**
 * @typedef {Object} Options
 * @property {String} [openToken='{{'] Default is `'{{'`
 * @property {String} [closeToken='}}'] Default is `'}}'`
 * @property {(value: String) => String} [transform=DEFAULT_TRANSFORMER] Default is `DEFAULT_TRANSFORMER`
 */
/**
 * @param {String} template
 * @param {InputData} [data={}] Default is `{}`
 * @param {Options} [options={}] Default is `{}`
 * @returns {String}
 */
export function applyTemplateData(template: string, data?: InputData | undefined, options?: Options | undefined): string;
/**
 * @param {String} template
 * @returns {{ variable: string; pluralKey: string; countVariable: string }[]}
 */
export function getPluralObjects(template: string): {
    variable: string;
    pluralKey: string;
    countVariable: string;
}[];
export type Options = {
    /**
     * Default is `'{{'`
     */
    openToken?: string | undefined;
    /**
     * Default is `'}}'`
     */
    closeToken?: string | undefined;
    /**
     * Default is `DEFAULT_TRANSFORMER`
     */
    transform?: ((value: string) => string) | undefined;
};
export type InputData = {
    [key: string]: string | number | boolean | InputData;
};
//# sourceMappingURL=template-utils.d.ts.map