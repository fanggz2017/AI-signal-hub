// src/features/auth/components/new-password-form.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { useResetPassword } from "../hooks/useResetPassword";
// import { useResetPassword } from "../hooks/use-reset-password"; // 假设你有这个 mutation

const passwordSchema = z
  .object({
    password: z.string().min(6, "新密码至少需要6位"),
    confirmPassword: z.string().min(1, "请再次输入新密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

interface NewPasswordFormProps {
  email: string;
  code: string;
  onBack: () => void;
  onSuccess: () => void;
}

const NewPasswordForm = ({
  email,
  code,
  onBack,
  onSuccess,
}: NewPasswordFormProps) => {
  const { mutate: resetPassword, isPending } = useResetPassword();

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (values: z.infer<typeof passwordSchema>) => {
    const payload = { email, code, password: values.password };

    resetPassword(payload, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>新密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder="请输入新密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认新密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder="请再次输入新密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onBack}
          >
            上一步
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "提交中..." : "确认修改"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewPasswordForm;
