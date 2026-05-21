import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { changePasswordApi } from "../api/changePasswordApi";
import { VerifyOtpResponse } from "@shared/types/ChangePasswordType";
import { DetailResponseType, GeneralErrorType } from "@shared/types/GeneralType";

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: changePasswordApi.verifyEmail,
  })
};

export const useVerifyOtp = () => {
  return useMutation
  <
    DetailResponseType<VerifyOtpResponse>,
    AxiosError<GeneralErrorType>,
    {
      email: string;
      code: string;
    }
  >({
    mutationFn: changePasswordApi.verifyOtp,
  })
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi.changePassword,
  })
};
