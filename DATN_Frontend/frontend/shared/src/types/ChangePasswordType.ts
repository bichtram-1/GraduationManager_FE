export interface VerifyOtpResponse {
  sessionId: string;
}

export interface ChangePasswordPayload {
  email: string;
  newPassword: string;
  confirmNewPassword: string;
  sessionId: string;
}