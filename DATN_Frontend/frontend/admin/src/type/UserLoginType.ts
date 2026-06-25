import { IDetailUser } from './UserType';

export interface UserLoginType {
  access_token: string;
  refresh_token?: string;
  user: IDetailUser;
}

export interface DataLoginType {
  email: string;
  password?: string;
}

export interface DataLogoutType {
  refreshToken: string;
}
