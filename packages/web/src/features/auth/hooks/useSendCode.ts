import { useMutation } from "@tanstack/react-query";
import type { SendCodeDTO } from "@app/core";
import { sendCodeFn } from "../api/auth.api";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/request";
import { toast } from "sonner";

export const useSendCode = () => {
  return useMutation<any, AxiosError<ApiErrorResponse>, SendCodeDTO>({
    mutationFn: (data: SendCodeDTO) => sendCodeFn(data, { isSilent: true }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "验证码已发送，请查收邮件");
    },
    onError: (error) => {
      if (!error.response?.data?.field) {
        toast.error(
          error.response?.data?.message || "发送验证码失败，请稍后重试",
        );
      }
    },
  });
};
