import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { LoginSchema } from "@app/core";
import { useLogin } from "../hooks/useLogin";

const LoginForm = () => {
  const navigate = useNavigate();
  const { mutate, isPending } = useLogin();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      account: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof LoginSchema>) {
    mutate(values, {
      onSuccess: () => {
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      },
    });
  }

  return (
    <Card className="w-87.5 shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">欢迎登录</CardTitle>
        <CardDescription className="text-center">
          请输入您的账号密码以继续
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="account"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>账号</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入用户名或邮箱" {...field} />
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
                  <div className="flex items-center justify-between">
                    <FormLabel>密码</FormLabel>
                    <Link
                      to="/reset-password"
                      className="text-sm text-gray-500 hover:text-gray-800 hover:underline"
                    >
                      忘记密码？
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="请输入密码"
                      {...field}
                    />
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
              登录
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="justify-center">
        <div className="text-sm text-gray-500">
          还没有账号？{" "}
          <Link
            to="/register"
            className="text-black font-medium hover:underline"
          >
            去注册
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
