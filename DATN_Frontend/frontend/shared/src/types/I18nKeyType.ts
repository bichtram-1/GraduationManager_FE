import ViTranslation from '../translation/languages/vi';

/**
 * `I18nKey` is derived from the Vietnamese translation file (single source of truth).
 *
 * - All keys must be strings (enforced by `Record<..., string>`).
 * - TypeScript object literal rules in `vi.ts` guarantee no duplicate keys at compile time.
 * - Adding/removing a key in `vi.ts` automatically updates this type — no manual sync needed.
 */
export type I18nKey = Record<keyof typeof ViTranslation, string>;

export const getKey = <K extends keyof I18nKey>(key: K): K => key;
