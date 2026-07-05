import crypto from 'crypto-js';

const isClient = typeof window !== 'undefined';

const getSecretKey = () => {
  if (typeof process !== 'undefined' && process.env?.VITE_COOKIE_KEY_SECRET) {
    return process.env.VITE_COOKIE_KEY_SECRET;
  }
  return 'SECRET_KEY';
}

export const decryptedsafe = (data = '') => {
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

export const decrypted = decryptedsafe;

export const getCookie = (name: string) => {
  if (!isClient) {
    return '';
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];

  if (!cookieValue) return '';

  const decoded = decodeURIComponent(cookieValue);

  // Try decrypting first
  const decryptedData = decrypted(decoded);
  if (decryptedData !== '') {
    return decryptedData;
  }

  // If decryption fails, check if it's a JSON string, else return as raw string
  try {
    if ((decoded.startsWith('{') && decoded.endsWith('}')) ||
        (decoded.startsWith('[') && decoded.endsWith(']')) ||
        (decoded.startsWith('"') && decoded.endsWith('"'))) {
      return JSON.parse(decoded);
    }
    return decoded;
  } catch {
    return decoded;
  }
};
