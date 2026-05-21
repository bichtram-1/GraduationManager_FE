import { PASSWORD_PATTERN } from '../constants/regex';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGIT = '0123456789';
const SPECIAL = '@$!%*?&';
const ALL = LOWER + UPPER + DIGIT + SPECIAL;

/** Pick a random character from `chars`. */
const pick = (chars: string): string =>
  chars.charAt(Math.floor(Math.random() * chars.length));

/** Fisher–Yates shuffle (returns a new shuffled string). */
const shuffle = (str: string): string => {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

/**
 * Generate a random password that satisfies `PASSWORD_PATTERN`:
 * - at least 1 lowercase, 1 uppercase, 1 digit, 1 special char `@$!%*?&`
 * - length >= 6, only characters from `[A-Za-z0-9@$!%*?&]`
 *
 * @param length Total length (default 10, minimum 6).
 */
export const generateRandomPassword = (length = 10): string => {
  const size = Math.max(length, 6);

  // Guarantee one of each required class, fill rest from the full pool.
  let raw = pick(LOWER) + pick(UPPER) + pick(DIGIT) + pick(SPECIAL);
  for (let i = raw.length; i < size; i++) {
    raw += pick(ALL);
  }

  const shuffled = shuffle(raw);

  // Safety check — in the astronomically unlikely case the shuffle produced
  // something that doesn't match (shouldn't happen), retry.
  return PASSWORD_PATTERN.test(shuffled) ? shuffled : generateRandomPassword(size);
};
