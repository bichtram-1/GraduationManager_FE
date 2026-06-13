import { DetailUserProps } from './UserType';

export interface UserLoginType {
  access_token: string;
  refresh_token?: string;
  user: DetailUserProps;
}

export interface DataLoginType {
  email: string;
  password?: string;
}

export interface DataLogoutType {
  refreshToken: string;
}
