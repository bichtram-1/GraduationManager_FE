import * as crypto from 'crypto-js';

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
  const globalProcess = (globalThis as any).process;
  if (globalProcess && globalProcess.env?.VITE_COOKIE_KEY_SECRET) {
    return globalProcess.env.VITE_COOKIE_KEY_SECRET;
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
    if (decryptedData !== '') {
      return decryptedData;
    }
    
    // Fallback if decryption fails (e.g. it was saved as raw text by website/nextjs)
    try {
      const decoded = decodeURIComponent(oldValue);
      if ((decoded.startsWith('{') && decoded.endsWith('}')) || 
          (decoded.startsWith('[') && decoded.endsWith(']')) || 
          (decoded.startsWith('"') && decoded.endsWith('"'))) {
        return JSON.parse(decoded);
      }
      return decoded;
    } catch {
      return oldValue;
    }
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
  // Clear without domain
  document.cookie = `${encodeURIComponent(key)}=; Max-Age=-99999999; path=/;`;
  
  // Clear with current domain
  const hostname = window.location.hostname;
  document.cookie = `${encodeURIComponent(key)}=; Max-Age=-99999999; path=/; domain=${hostname};`;
  
  // Clear with dot domain
  document.cookie = `${encodeURIComponent(key)}=; Max-Age=-99999999; path=/; domain=.${hostname};`;
  
  // If it is on a subdomain, try to clear on parent domain too
  const domainParts = hostname.split('.');
  if (domainParts.length > 2) {
    const parentDomain = domainParts.slice(-2).join('.');
    document.cookie = `${encodeURIComponent(key)}=; Max-Age=-99999999; path=/; domain=.${parentDomain};`;
  }
};
