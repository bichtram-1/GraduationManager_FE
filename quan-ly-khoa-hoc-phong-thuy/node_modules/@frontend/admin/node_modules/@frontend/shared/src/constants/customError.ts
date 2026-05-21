import { getKey } from '../types/I18nKeyType';
import { getMessage } from './commonConst';

export enum ErrorId {
  AUTH_00001 = 'AUTH_00001',
  AUTH_00002 = 'AUTH_00002',
}

export const ErrorCode = () => ({
  [ErrorId.AUTH_00001]: getMessage(getKey('auth_00001_error')),
  [ErrorId.AUTH_00002]: getMessage(getKey('auth_00002_error')),
});
