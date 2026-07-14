export interface IUserMinimal {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ISignInResult {
  access_token: string;
  refresh_token: string;
  user?: IUserMinimal;
}

export interface ISignInResponse {
  code: number;
  results: { object: ISignInResult };
}

export interface IEmptyResponse {
  results: Record<string, unknown>;
}
