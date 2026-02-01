import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { loginFn } from "../api/auth.api";

import type { LoginDTO } from "@app/core";
import type { AxiosError } from "axios";
import type { ApiResponse, ApiErrorResponse } from "@/types/request";
import type { LoginResponse } from "../api/auth.api";

export const useLogin = () => {
  return useMutation<
    ApiResponse<LoginResponse>,
    AxiosError<ApiErrorResponse>,
    LoginDTO
  >({
    mutationFn: loginFn,
    onSuccess: (res) => {
      const { accessToken, refreshToken } = res.data;
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      toast.success("登录成功");
    },
  });
};
