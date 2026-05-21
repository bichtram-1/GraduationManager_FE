export class TypedData {
    /**
     * @param {Object<string, { type: any; value: any; nullable?: Boolean }>} typedSchema
     * @param {String} [ctxName]
     */
    constructor(typedSchema: {
        [x: string]: {
            type: any;
            value: any;
            nullable?: boolean;
        };
    }, ctxName?: string | undefined);
    /** @private */
    private __typedSchema;
    /** @private */
    private __ctxId;
    /** @private */
    private __schema;
    /**
     * @private
     * @type {Data}
     */
    private __data;
    /** @returns {String} */
    get uid(): string;
    /**
     * @param {String} prop
     * @param {any} value
     */
    setValue(prop: string, value: any): void;
    /** @param {Object<string, any>} updObj */
    setMultipleValues(updObj: {
        [x: string]: any;
    }): void;
    /** @param {String} prop */
    getValue(prop: string): any;
    /**
     * @param {String} prop
     * @param {(newVal: any) => void} handler
     */
    subscribe(prop: string, handler: (newVal: any) => void): {
        remove: () => void;
        callback: Function;
    };
    remove(): void;
}
//# sourceMappingURL=TypedData.d.ts.map