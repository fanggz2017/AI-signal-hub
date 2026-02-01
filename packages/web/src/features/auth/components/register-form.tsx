import { useState, useEffect } from "react"; // 1. 引入 React Hooks
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password-input";
import { RegisterSchema, VerificationScene } from "@app/core";
import { useRegister } from "../hooks/useRegister";
import { toast } from "sonner";
import { useSendCode } from "../hooks/useSendCode";
const RegisterForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useRegister();
  const { mutate: sendCode, isPending: isSending } = useSendCode();

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const formSchema = RegisterSchema.extend({
    code: z.string().length(6, { message: "验证码必须是6位数字" }),
    confirmPassword: z.string().min(1, {
      message: "请再次输入密码",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    error: "两次输入的密码不一致",
    path: ["confirmPassword"],
  });

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      code: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSendCode = async () => {
    const isEmailValid = await form.trigger("email");
    if (!isEmailValid) return;

    const email = form.getValues("email");

    sendCode(
      { scene: VerificationScene.enum.REGISTER, email },
      {
        onSuccess: () => {
          setCountdown(60);
        },
        onError: (error) => {
          if (error.response?.data?.field === "email") {
            form.setError("email", {
              type: "manual",
              message: error.response?.data?.message || "该邮箱已被注册",
            });
          }
        },
      },
    );
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...payload } = values;

    mutate(payload, {
      onSuccess: () => {
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      },
      onError: (error) => {
        if (error.response?.status === 409) {
          if (error.response?.data?.field === "username") {
            form.setError("username", {
              type: "manual",
              message: error.response?.data?.message || "该用户名已被占用",
            });
          } else if (error.response?.data?.field === "email") {
            form.setError("email", {
              type: "manual",
              message: error.response?.data?.message || "该邮箱已被注册",
            });
          }
        } else {
          toast.error(error.response?.data?.message || "注册失败，请稍后重试");
        }
      },
    });
  };

  return (
    <Card className="w-100 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">注册新账号</CardTitle>
        <CardDescription className="text-center">
          填写以下信息完成注册
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 新增：验证码字段 (带按钮的组合布局) */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>验证码</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="输入6位验证码" {...field} />
                    </FormControl>
                    <Button
                      loading={isSending}
                      type="button"
                      variant="outline"
                      disabled={countdown > 0}
                      onClick={onSendCode}
                    >
                      {countdown > 0 ? `${countdown}s 后重发` : "发送验证码"}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入用户名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="设置您的密码" {...field} />
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
                  <FormLabel>确认密码</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="请再次输入密码" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              loading={isPending}
              className="w-full cursor-pointer"
            >
              立即注册
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center">
        <div className="text-sm text-gray-500">
          已有账号？{" "}
          <Link to="/login" className="text-black font-medium hover:underline">
            去登录
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
