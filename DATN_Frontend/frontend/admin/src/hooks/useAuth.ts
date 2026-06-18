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

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useGlobalVariable();
  return useMutation<
    DetailResponseType<UserLoginType>,
    AxiosError<GeneralErrorType>,
    DataLoginType
  >({
    mutationFn: authApi.signIn,
    onSuccess: (data) => {
      const responseData = data?.data || data?.results?.object || data;
      
      const newData = {
        ...responseData,
        // Normalize tên field
        access_token: responseData?.access_token || responseData?.accessToken,
        refresh_token: responseData?.refresh_token || responseData?.refreshToken,
      } as UserLoginType;

      const userClone = { 
        ...newData?.user,
        role: newData?.role || newData?.user?.role || 'USER'   // ← Thêm dòng này
      };
      setUser(userClone);
      setCookie(STORAGES.USER_LOGIN, userClone);
      setCookie(STORAGES.ACCESS_TOKEN, newData?.access_token || newData?.access_token);
      setCookie(STORAGES.REFRESH_TOKEN, newData?.refresh_token || newData?.refresh_token);
      navigate(ROUTES.DASHBOARD);
    },
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
