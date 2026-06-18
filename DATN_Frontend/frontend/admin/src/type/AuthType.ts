export interface IUserMinimal {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
}

export interface ISignInResult {
  accessToken: string;
  refreshToken: string;
  user?: IUserMinimal;
}

export interface ISignInResponse {
  results: { object: ISignInResult };
}

export interface IEmptyResponse {
  results: Record<string, unknown>;
}
