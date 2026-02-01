import { prisma } from "@/db/prisma";
import redis from "@/db/redis";
import { generateCode } from "@/utils/code";
import { hashPassword, verifyPassword } from "@/utils/password";
import {
  type LoginDTO,
  type RegisterDTO,
  type ResetPasswordDTO,
  type SendCodeDTO,
  VerificationScene,
  type JWTPayload,
} from "@app/core";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";

// --- 配置常量 ---
const ACCESS_TOKEN_EXP = 60 * 15;
const REFRESH_TOKEN_EXP = 60 * 60 * 24 * 7;

const getEnvSecret = (key: string) => {
  const secret = process.env[key];
  if (!secret) {
    throw new Error(`❌ FATAL: Environment variable ${key} is not set.`);
  }
  return secret;
};

const createTokenPayload = (user: {
  id: number;
  email: string;
  role?: string;
}): Omit<JWTPayload, "exp"> => {
  return {
    id: user.id,
    email: user.email,
    // role: user.role, // 如果 core 里定义了 role，这里解注
  };
};

/**
 * 注册逻辑
 */
export const register = async (data: RegisterDTO) => {
  const { username, password, email, code } = data;

  const existUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });

  if (existUser) {
    const field = existUser.username === username ? "username" : "email";
    throw new HTTPException(409, {
      message: field === "username" ? "用户名已存在" : "该邮箱已被注册",
      cause: { field },
    });
  }

  // 验证码校验
  const verifyKey = `verify:${VerificationScene.enum.REGISTER}:${email}`;
  const storedCode = await redis.get(verifyKey);

  if (!storedCode || storedCode !== code) {
    throw new HTTPException(400, {
      message: !storedCode ? "验证码已失效" : "验证码错误",
      cause: { field: "code" },
    });
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });

  await redis.del(verifyKey);
  return null;
};

/**
 * 登录逻辑
 */
export const login = async (data: LoginDTO) => {
  const { account, password } = data;

  const user = await prisma.user.findFirst({
    where: { OR: [{ username: account }, { email: account }] },
  });

  const invalidCredentialsError = new HTTPException(401, {
    message: "账号或密码错误",
  });

  if (!user) throw invalidCredentialsError;

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) throw invalidCredentialsError;

  const payload = createTokenPayload(user);
  const now = Math.floor(Date.now() / 1000);

  const accessToken = await sign(
    { ...payload, exp: now + ACCESS_TOKEN_EXP },
    getEnvSecret("JWT_SECRET"),
    "HS256",
  );

  const refreshToken = await sign(
    { ...payload, exp: now + REFRESH_TOKEN_EXP },
    process.env.REFRESH_TOKEN_SECRET || getEnvSecret("JWT_SECRET"),
    "HS256",
  );

  return { accessToken, refreshToken };
};

/**
 * 刷新 Token 逻辑
 */
export const refresh = async (refreshToken: string) => {
  let payload: JWTPayload;

  try {
    const secret =
      process.env.REFRESH_TOKEN_SECRET || getEnvSecret("JWT_SECRET");
    payload = (await verify(
      refreshToken,
      secret,
      "HS256",
    )) as unknown as JWTPayload;
  } catch (error) {
    throw new HTTPException(401, { message: "无效的刷新令牌" });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
  });

  if (!user) {
    throw new HTTPException(401, { message: "用户状态异常，请重新登录" });
  }

  const now = Math.floor(Date.now() / 1000);

  const newAccessToken = await sign(
    {
      ...createTokenPayload(user),
      exp: now + ACCESS_TOKEN_EXP,
    },
    getEnvSecret("JWT_SECRET"),
    "HS256",
  );

  return { accessToken: newAccessToken };
};

/**
 * 密码重置逻辑
 */
export const resetPassword = async (data: ResetPasswordDTO) => {
  const { code, email, password } = data;
  const verifyKey = `verify:${VerificationScene.enum.RESET_PASSWORD}:${email}`;

  const storedCode = await redis.get(verifyKey);
  if (!storedCode || storedCode !== code) {
    throw new HTTPException(400, {
      message: !storedCode ? "验证码已失效" : "验证码错误",
      cause: { field: "code" },
    });
  }

  const hashedPassword = await hashPassword(password);

  try {
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  } catch (error) {
    if ((error as any).code === "P2025") {
      throw new HTTPException(404, { message: "该邮箱账号不存在" });
    }
    throw error;
  }

  await redis.del(verifyKey);
  return null;
};

/**
 * 验证码发送逻辑
 */
export const sendCode = async (data: SendCodeDTO) => {
  const { scene, email } = data;

  if (scene === VerificationScene.enum.REGISTER) {
    const exist = await prisma.user.count({ where: { email } });
    if (exist > 0) {
      throw new HTTPException(409, {
        message: "该邮箱已被注册",
        cause: { field: "email" },
      });
    }
  } else if (scene === VerificationScene.enum.RESET_PASSWORD) {
    const exist = await prisma.user.count({ where: { email } });
    if (exist === 0) {
      throw new HTTPException(404, {
        message: "该邮箱未注册",
        cause: { field: "email" },
      });
    }
  }

  const limitKey = `limit:${scene}:${email}`;
  const isAllowed = await redis.set(limitKey, "1", "EX", 60, "NX");

  if (!isAllowed) {
    throw new HTTPException(429, { message: "请等待 60 秒后再发送" });
  }

  const code = generateCode();
  const verifyKey = `verify:${scene}:${email}`;

  await redis.set(verifyKey, code, "EX", 300);

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `\x1b[36m[Mock Mail]\x1b[0m To: ${email} | Scene: ${scene} | Code: \x1b[33m${code}\x1b[0m`,
    );
  } else {
    // TODO: 集成真实的邮件发送服务 (Resend / NodeMailer)
    // await sendEmail(...)
  }

  return null;
};
