import { STORAGES } from '@shared/constants/storage';
import { decrypted } from '@shared/utils/cookie';
import ViMessages from '@shared/translation/messages/vi';
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['vi'] as const;
const DEFAULT_LOCALE = 'vi';

// Locale → messages map. All locales now resolve from the shared translation package.
const MESSAGES_BY_LOCALE = {
  vi: ViMessages,
} as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeRaw = cookieStore.get(STORAGES.LANGUAGE)?.value;
  const localeFromCookie =
    (localeRaw ? decrypted(localeRaw) : DEFAULT_LOCALE) || DEFAULT_LOCALE;
  const locale = SUPPORTED_LOCALES.includes(localeFromCookie as 'vi')
    ? localeFromCookie
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: MESSAGES_BY_LOCALE[locale as keyof typeof MESSAGES_BY_LOCALE],
  };
});
