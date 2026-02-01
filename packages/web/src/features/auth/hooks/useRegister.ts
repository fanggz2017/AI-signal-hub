import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import type { RegisterDTO } from "@app/core";
import { registerFn } from "../api/auth.api";
import type { ApiErrorResponse, ApiResponse } from "@/types/request";

export const useRegister = () => {
  return useMutation<
    ApiResponse<null>,
    AxiosError<ApiErrorResponse>,
    RegisterDTO
  >({
    mutationFn: (data) => registerFn(data, { isSilent: true }),

    onSuccess: () => {
      toast.success("注册成功");
    },
  });
};
