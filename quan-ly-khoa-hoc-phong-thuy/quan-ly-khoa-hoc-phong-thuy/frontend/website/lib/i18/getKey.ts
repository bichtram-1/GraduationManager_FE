import type { ViMessagesType } from '@shared/translation/messages/vi';

/**
 * Type-safe key helper for next-intl namespaces.
 * Pulls the namespace shape from the shared translation package
 * (single source of truth: `@shared/translation/languages/vi.ts`).
 *
 * @example
 * const t = useTranslations('HomePage')
 * const getKey = createGetKey('HomePage')
 * t(getKey('statsTitle'))
 */
export function createGetKey<NS extends keyof ViMessagesType>(_namespace: NS) {
  return (key: keyof ViMessagesType[NS] & string): string => key;
}
