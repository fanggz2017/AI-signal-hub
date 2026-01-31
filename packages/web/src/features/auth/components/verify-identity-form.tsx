// src/features/auth/components/verify-identity-form.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { VerificationScene } from "@app/core";
import { useSendCode } from "../hooks/useSendCode";

// Schema 定义
const verifySchema = z.object({
  email: z.email("请输入有效的邮箱地址"),
  code: z.string().length(6, "验证码必须是6位"),
});

interface VerifyIdentityFormProps {
  defaultValues: { email: string; code: string };
  onNext: (data: { email: string; code: string }) => void;
}

const VerifyIdentityForm = ({
  defaultValues,
  onNext,
}: VerifyIdentityFormProps) => {
  const [countdown, setCountdown] = useState(0);
  const { mutate: sendCode, isPending: isSending } = useSendCode();

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues,
  });

  const onSendCode = async () => {
    const isEmailValid = await form.trigger("email");
    if (!isEmailValid) return;

    const email = form.getValues("email");

    sendCode(
      { scene: VerificationScene.enum.RESET_PASSWORD, email },
      {
        onSuccess: () => {
          setCountdown(60);
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) clearInterval(timer);
              return prev - 1;
            });
          }, 1000);
        },
        onError: (error) => {
          if (error.response?.data?.field === "email") {
            form.setError("email", {
              type: "manual",
              message: error.response?.data?.message,
            });
          }
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof verifySchema>) => {
    onNext(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱地址</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>验证码</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="6位数字" maxLength={6} {...field} />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  className="w-32"
                  disabled={countdown > 0 || isSending}
                  onClick={onSendCode}
                >
                  {countdown > 0
                    ? `${countdown}s`
                    : isSending
                      ? "发送中"
                      : "获取验证码"}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          下一步
        </Button>
      </form>
    </Form>
  );
};

export default VerifyIdentityForm;
