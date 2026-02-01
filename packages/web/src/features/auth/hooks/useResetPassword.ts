import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/request";
import { resetPasswordFn } from "../api/auth.api";
import type { ResetPasswordDTO } from "@app/core";

export const useResetPassword = () => {
  return useMutation<unknown, AxiosError<ApiErrorResponse>, ResetPasswordDTO>({
    mutationFn: (data: ResetPasswordDTO) => resetPasswordFn(data),
    onSuccess: () => {
      toast.success("密码重置成功");
    },
  });
};
