import type { ApiErrorResponse } from "@/types/request";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { loginFn } from "../api/auth.api";
import { toast } from "sonner";
import type { LoginDTO } from "@app/core";

export const useLogin = () => {
  return useMutation<any, AxiosError<ApiErrorResponse>, LoginDTO>({
    mutationFn: (data: LoginDTO) => loginFn(data),

    onSuccess: (res) => {
      toast.success("登录成功");
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
    },
  });
};
