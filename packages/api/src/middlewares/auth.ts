import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { HTTPException } from "hono/http-exception";

// 定义 JWT Payload 的类型 (根据你登录时签发的内容)
type JWTPayload = {
  id: number;
  email: string;
  // role: 'admin' | 'user'; // 如果有角色权限，放这里
  exp: number; // 过期时间
};

// 扩展 Hono 的 Context 变量类型，这样 c.get('user') 才有代码提示！
type Env = {
  Variables: {
    user: JWTPayload;
  };
};

// 🔐 创建认证中间件
export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    throw new HTTPException(401, { message: "未提供认证令牌" });
  }

  // 格式通常是 "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new HTTPException(401, { message: "令牌格式错误" });
  }

  try {
    // 验证 Token (密钥必须和登录签发时的一样！)
    const payload = await verify(token, process.env.JWT_SECRET || "your_secret_key", "HS256");

    // ✅ 关键点：验证通过后，把用户信息挂载到 c (Context) 上
    // 这样后续的路由处理函数就能直接拿到 user，不用再查库或解密了
    c.set("user", payload as JWTPayload);

    await next(); // 放行，进入下一个环节
  } catch (err) {
    throw new HTTPException(401, { message: "令牌无效或已过期" });
  }
});
