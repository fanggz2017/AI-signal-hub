import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { RegisterDTO } from "@app/core";
import { registerFn } from "../api/auth.api";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/request";

export const useRegister = () => {
  return useMutation<unknown, AxiosError<ApiErrorResponse>, RegisterDTO>({
    mutationFn: (data: RegisterDTO) => registerFn(data, { isSilent: true }),

    onSuccess: () => {
      toast.success("注册成功");
    },
  });
};
