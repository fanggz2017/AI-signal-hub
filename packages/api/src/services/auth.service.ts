import { prisma } from "@/db/prisma";
import redis from "@/db/redis";
import { generateCode } from "@/utils/code";
import { hashPassword, verifyPassword } from "@/utils/password";
import {
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
  SendCodeDTO,
  VerificationScene,
} from "@app/core";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";
import { email } from "zod";

// 定义 Token 过期时间
const ACCESS_TOKEN_EXP = 60 * 15; // 15 分钟
const REFRESH_TOKEN_EXP = 60 * 60 * 24 * 7; // 7 天

// 获取密钥 (实际项目中建议分开配置)
const getJwtSecret = () => process.env.JWT_SECRET || "access_secret_fallback";
const getRefreshSecret = () => process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || "refresh_secret_fallback";

/**
 * 注册逻辑
 */
export const register = async (data: RegisterDTO) => {
  const { username, password, email, code } = data;
  const existUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existUser) {
    if (username === existUser.username) {
      throw new HTTPException(409, {
        message: "用户名已存在",
        cause: { field: "username" },
      });
    }
    if (email === existUser.email) {
      throw new HTTPException(409, {
        message: "该邮箱已被注册",
        cause: { field: "email" },
      });
    }
  }

  const verifyKey = `verify:${VerificationScene.enum.REGISTER}:${email}`;
  const storedCode = await redis.get(verifyKey);
  if (!storedCode) {
    throw new HTTPException(400, { message: "无效或过期的验证码" });
  }
  if (code !== storedCode) {
    throw new HTTPException(400, { message: "验证码错误" });
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
    message: "用户名或密码错误",
  });

  if (!user) {
    throw invalidCredentialsError;
  }

  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw invalidCredentialsError;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const payloadBase = {
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };

  const accessToken = await sign(
    { ...payloadBase, exp: now + ACCESS_TOKEN_EXP },
    getJwtSecret(),
    "HS256"
  );

  const refreshToken = await sign(
    { ...payloadBase, exp: now + REFRESH_TOKEN_EXP },
    getRefreshSecret(),
    "HS256"
  );

  return { accessToken, refreshToken };
};

/**
 * 刷新 Token 逻辑
 */
export const refresh = async (refreshToken: string) => {
  try {
    const payload = await verify(refreshToken, getRefreshSecret(), "HS256");
    
    // 检查用户是否还存在 (可选，增加安全性)
    // const user = await prisma.user.findUnique({ where: { id: payload.sub as number } });
    // if (!user) throw new Error("User not found");

    const now = Math.floor(Date.now() / 1000);
    const newAccessToken = await sign(
      {
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
        role: payload.role,
        exp: now + ACCESS_TOKEN_EXP,
      },
      getJwtSecret(),
      "HS256"
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new HTTPException(401, { message: "Refresh Token 无效或已过期" });
  }
};

/**
 * 密码重置逻辑
 */
export const resetPassword = async (data: ResetPasswordDTO) => {
  const { code, email, password } = data;
  const verifyKey = `verify:${VerificationScene.enum.RESET_PASSWORD}:${email}`;
  const storedCode = await redis.get(verifyKey);
  if (!storedCode) {
    throw new HTTPException(400, {
      message: "无效或过期的验证码",
      cause: { field: "code" },
    });
  }
  if (code !== storedCode) {
    throw new HTTPException(400, {
      message: "验证码错误",
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
    const existUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existUser) {
      throw new HTTPException(409, {
        message: "该邮箱已被注册",
        cause: { field: "email" },
      });
    }
  } else if (scene === VerificationScene.enum.RESET_PASSWORD) {
    const existUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existUser) {
      throw new HTTPException(404, {
        message: "该邮箱未注册",
        cause: { field: "email" },
      });
    }
  }
  const limitKey = `limit:${scene}:${email}`;
  const isAllowed = await redis.set(limitKey, "1", "EX", 60, "NX");
  if (!isAllowed) {
    throw new HTTPException(429, { message: "发送验证码过于频繁" });
  }
  const code = generateCode();
  const verifyKey = `verify:${scene}:${email}`;
  await redis.set(verifyKey, code, "EX", 300);
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Mock邮件] To: ${email} | Scene: ${scene} | Code: ${code}`);
  }
  return null;
};
