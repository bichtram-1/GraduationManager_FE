export function toKebabCase<T extends string>(str: T): KebabCase<T>;
export type KebabCase<T extends string> = T extends `${infer Head} ${infer Tail}` ? `${Lowercase<Head>}-${KebabCase<Tail>}` : Lowercase<T>;
//# sourceMappingURL=toKebabCase.d.ts.map