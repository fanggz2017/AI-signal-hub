import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { SendCodeDTO } from "@app/core";
import { sendCodeFn } from "../api/auth.api";
import type { ApiErrorResponse, ApiResponse } from "@/types/request";

export const useSendCode = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiErrorResponse>,
    SendCodeDTO
  >({
    mutationFn: (data) => sendCodeFn(data, { isSilent: true }),

    onSuccess: (res) => {
      toast.success(res.message || "验证码已发送，请查收邮件");
    },

    onError: (error) => {
      const errData = error.response?.data;
      if (!errData?.field) {
        toast.error(errData?.message || "发送验证码失败，请稍后重试");
      }
    },
  });
};
