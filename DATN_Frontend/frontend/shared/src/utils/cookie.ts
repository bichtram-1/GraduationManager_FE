import crypto from 'crypto-js';

const isClient = typeof window !== 'undefined';

function getSecretKey(): string {
  // Vite (import.meta.env) — used by admin
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metaEnv = (import.meta as any).env;
    if (metaEnv?.VITE_COOKIE_KEY_SECRET) return metaEnv.VITE_COOKIE_KEY_SECRET;
  } catch {
    // not available
  }
  // Next.js / Node (process.env) — used by website
  if (typeof process !== 'undefined' && process.env?.VITE_COOKIE_KEY_SECRET) {
    return process.env.VITE_COOKIE_KEY_SECRET;
  }
  return 'SECRET_KEY';
}

export const encrypt = (data = '') => {
  try {
    const encryptedData = crypto.AES.encrypt(data, getSecretKey()).toString();
    return encryptedData;
  } catch (error) {
    console.error(error);
    return '';
  }
};

export const decrypted = (data = '') => {
  if (!data) return '';
  try {
    const decrypt = crypto.AES.decrypt(data, getSecretKey());
    const decryptedString = decrypt.toString(crypto.enc.Utf8);
    if (!decryptedString) return '';
    const decryptedData = JSON.parse(decryptedString);
    return decryptedData;
  } catch {
    return '';
  }
};

const getCookieWithKey = (name: string) => {
  if (!isClient) return undefined;
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${encodeURIComponent(name)}=([^;]*)`)
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

export const getCookie = (key: string) => {
  if (!isClient) return undefined;
  const oldValue = getCookieWithKey(key);
  if (oldValue) {
    const decryptedData = decrypted(oldValue);
    return decryptedData;
  }
  return undefined;
};

export const replaceCookie = (key: string, values: object) => {
  if (!isClient) return;
  if (values) {
    const jsonString = JSON.stringify(values);
    const encrypted = encrypt(jsonString) || '';
    const updatedCookie = `${encodeURIComponent(key)}=${encodeURIComponent(encrypted)};path=/;`;
    document.cookie = updatedCookie;
  }
};

export const setCookie = (key: string, value: object | string | number) => {
  if (!isClient) return;
  const jsonString = JSON.stringify(value);
  const encrypted = encrypt(jsonString) || '';
  const updatedCookie = `${encodeURIComponent(key)}=${encodeURIComponent(encrypted)};path=/;`;
  document.cookie = updatedCookie;
};

export const clearCookie = (key: string) => {
  if (!isClient) return;
  document.cookie = `${key}="";Max-Age=0;path=/;`;
};
