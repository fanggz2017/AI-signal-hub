import type { ApiErrorResponse } from "@/types/request";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { loginFn } from "../api/auth.api";
import { toast } from "sonner";
import type { LoginDTO } from "@app/core";

export const useLogin = () => {
  return useMutation<unknown, AxiosError<ApiErrorResponse>, LoginDTO>({
    mutationFn: (data: LoginDTO) => loginFn(data),

    onSuccess: (res: unknown) => {
      const response = res as {
        data: { accessToken: string; refreshToken: string };
      };
      toast.success("登录成功");
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
    },

    onError: (error) => {
      const msg = error.response?.data?.message || "登录失败";
      toast.error(msg);
    },
  });
};
