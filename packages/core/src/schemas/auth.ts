import { z } from "zod";

export const VerificationScene = z.enum([
  "REGISTER", // 注册
  "RESET_PASSWORD", // 重置密码
  "LOGIN", // 验证码登录 (未来可能用到)
  "BIND_EMAIL", // 绑定邮箱 (未来可能用到)
]);

export const RegisterSchema = z.object({
  username: z.string().min(3, { message: "用户名至少需要3个字符" }).max(30),
  password: z.string().min(6, { message: "密码至少需要6位" }),
  email: z.email({ message: "邮箱格式不正确" }),
  code: z.string().min(6, { message: "验证码至少需要6位" }),
});

export const LoginSchema = z.object({
  account: z.string().min(3, { message: "账号至少需要3个字符" }).max(30),
  password: z.string().min(6, { message: "密码至少需要6位" }),
});

export const ResetPasswordSchema = z.object({
  email: z.email("邮箱格式不正确"),
  code: z.string().min(6, { message: "验证码至少需要6位" }),
  password: z.string().min(6, { message: "密码至少需要6位" }),
});

export const SendCodeSchema = z.object({
  scene: VerificationScene,
  email: z.email("邮箱格式不正确").optional(),
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export type VerificationSceneType = z.infer<typeof VerificationScene>;
export type SendCodeDTO = z.infer<typeof SendCodeSchema>;
