// packages/api/src/routes/auth.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  SendCodeSchema,
} from "@app/core";
import {
  login,
  refresh,
  register,
  resetPassword,
  sendCode,
} from "@/services/auth.service";
import { ResultUtil } from "@/utils/result";
import { z } from "zod";

const auth = new Hono();

auth.post("/register", zValidator("json", RegisterSchema), async (c) => {
  const payload = c.req.valid("json");

  const result = await register(payload);

  return ResultUtil.success(c, result, "注册成功");
});

auth.post("/login", zValidator("json", LoginSchema), async (c) => {
  const payload = c.req.valid("json");

  const result = await login(payload);

  return ResultUtil.success(c, result, "登录成功");
});

auth.post(
  "/refresh",
  zValidator("json", z.object({ refreshToken: z.string() })),
  async (c) => {
    const { refreshToken } = c.req.valid("json");
    const result = await refresh(refreshToken);
    return ResultUtil.success(c, result, "Token 刷新成功");
  }
);

auth.post(
  "/reset-password",
  zValidator("json", ResetPasswordSchema),
  async (c) => {
    const payload = c.req.valid("json");
    await resetPassword(payload);
    return ResultUtil.success(c, null, "密码重置成功");
  },
);

auth.post("/send-code", zValidator("json", SendCodeSchema), async (c) => {
  const payload = c.req.valid("json");
  await sendCode(payload);
  return ResultUtil.success(c, null, "验证码已发送，请查收邮件");
});

export default auth;
