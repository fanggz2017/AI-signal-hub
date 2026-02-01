import request from "@/lib/request";
import type { ApiOptions } from "@/types/request";
import type {
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
  SendCodeDTO,
} from "@app/core";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

// 注册
export const registerFn = (data: RegisterDTO, options: ApiOptions = {}) => {
  const { isSilent = false } = options;
  return request.post<null>("/auth/register", data, {
    skipErrorHandler: isSilent,
  });
};

// 登录
export const loginFn = (data: LoginDTO) => {
  return request.post<LoginResponse>("/auth/login", data);
};

// 重置密码
export const resetPasswordFn = (data: ResetPasswordDTO) => {
  return request.post<null>("/auth/reset-password", data);
};

// 邮箱验证码
export const sendCodeFn = (data: SendCodeDTO, options: ApiOptions = {}) => {
  const { isSilent = false } = options;
  return request.post<null>("/auth/send-code", data, {
    skipErrorHandler: isSilent,
  });
};
