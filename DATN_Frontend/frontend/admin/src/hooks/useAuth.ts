import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ROUTES } from '../constants/routers';
import { STORAGES } from '@shared/constants/storage';
import {
  DetailResponseType,
  GeneralErrorType,
} from '@shared/types/GeneralType';
import { DataLoginType, UserLoginType } from '../type/UserLoginType';
import { clearCookie, getCookie, setCookie } from '@shared/utils/cookie';
import { useGlobalVariable } from './GlobalVariableProvider';

const applyLoginSession = (
  data: DetailResponseType<UserLoginType>,
  setUser: (user: UserLoginType['user'] | undefined) => void,
  navigate: (route: string) => void
) => {
  const newData: UserLoginType = data?.results?.object;

  const userClone = { ...newData?.user };
  setUser(userClone);
  setCookie(STORAGES.USER_LOGIN, userClone);
  setCookie(STORAGES.ACCESS_TOKEN, newData?.access_token);
  // setCookie(STORAGES.REFRESH_TOKEN, newData?.refreshToken);
  navigate(ROUTES.DASHBOARD);
};

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useGlobalVariable();

  return useMutation<
    DetailResponseType<UserLoginType>,
    AxiosError<GeneralErrorType>,
    DataLoginType
  >({
    mutationFn: authApi.signIn,
    onSuccess: (data) => applyLoginSession(data, setUser, navigate),
  });
};

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useGlobalVariable();

  return useMutation<
    DetailResponseType<UserLoginType>,
    AxiosError<GeneralErrorType>,
    string
  >({
    mutationFn: authApi.signInWithGoogle,
    onSuccess: (data) => applyLoginSession(data, setUser, navigate),
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useGlobalVariable();

  return useMutation({
    mutationFn: async () => {
      const REFRESH_TOKEN = getCookie(STORAGES.REFRESH_TOKEN);
      return await authApi.signOut({ refreshToken: REFRESH_TOKEN });
    },
    // Always clear client-side state, even if the API call fails
    // (e.g. expired token) so the user is not stuck on a dead session.
    onSettled: () => {
      clearCookie(STORAGES.USER_LOGIN);
      clearCookie(STORAGES.ACCESS_TOKEN);
      clearCookie(STORAGES.REFRESH_TOKEN);
      setUser(undefined);
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });
};
