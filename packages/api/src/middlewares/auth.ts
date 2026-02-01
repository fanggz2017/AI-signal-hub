import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../types/auth";
import type { JWTPayload } from "@app/core";

export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    throw new HTTPException(401, { message: "未提供认证令牌" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new HTTPException(401, { message: "令牌格式错误" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ FATAL: JWT_SECRET environment variable is not set.");
    throw new HTTPException(500, { message: "服务器内部配置错误" });
  }

  try {
    const payload = await verify(token, secret, "HS256");
    c.set("user", payload as unknown as JWTPayload);
    await next();
  } catch (err) {
    throw new HTTPException(401, { message: "令牌无效或已过期" });
  }
});
