import {
  describe,
  expect,
  it,
  mock,
  beforeEach,
  beforeAll,
  spyOn,
} from "bun:test";
import { login, register } from "./auth.service";
import { prisma } from "@/db/prisma"; // 确保路径别名与你项目一致
import redis from "@/db/redis";
import { hashPassword, verifyPassword } from "@/utils/password";

// --- 1. Mock 外部依赖 ---

// Mock Database & Redis
mock.module("@/db/prisma", () => ({
  prisma: {
    user: {
      findFirst: mock(),
      create: mock(),
      findUnique: mock(),
      update: mock(),
    },
  },
}));

mock.module("@/db/redis", () => ({
  default: {
    get: mock(),
    del: mock(),
    set: mock(),
  },
}));

// Mock Utils
mock.module("@/utils/password", () => ({
  hashPassword: mock(),
  verifyPassword: mock(),
}));

// 💡 关键修复：Mock hono/jwt
// 我们不需要真的去签名，只要确保它返回一个字符串即可
mock.module("hono/jwt", () => ({
  sign: mock().mockResolvedValue("mock_token_string"),
  verify: mock().mockResolvedValue({ id: 1 }),
}));

describe("AuthService", () => {
  // 💡 关键修复：设置环境变量
  beforeAll(() => {
    process.env.JWT_SECRET = "test_secret_key";
    process.env.REFRESH_TOKEN_SECRET = "test_refresh_secret";
  });

  beforeEach(() => {
    // Reset mocks
    (prisma.user.findFirst as any).mockReset();
    (prisma.user.create as any).mockReset();
    (redis.get as any).mockReset();
    (redis.del as any).mockReset();
    (verifyPassword as any).mockReset();
    (hashPassword as any).mockReset();
  });

  describe("login", () => {
    it("should throw error if user not found", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);

      try {
        await login({ account: "test", password: "123" });
      } catch (e: any) {
        expect(e.status).toBe(401);
        // 💡 关键修复：修正文案 "用户名" -> "账号"
        expect(e.message).toBe("账号或密码错误");
      }
    });

    it("should throw error if password invalid", async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        id: 1,
        username: "test",
        password: "hashed_password",
      });
      (verifyPassword as any).mockResolvedValue(false);

      try {
        await login({ account: "test", password: "123" });
      } catch (e: any) {
        expect(e.status).toBe(401);
        // 💡 关键修复：修正文案
        expect(e.message).toBe("账号或密码错误");
      }
    });

    it("should return tokens on success", async () => {
      (prisma.user.findFirst as any).mockResolvedValue({
        id: 1,
        username: "test",
        password: "hashed_password",
        email: "test@example.com",
        role: "USER",
      });
      (verifyPassword as any).mockResolvedValue(true);

      const result = await login({ account: "test", password: "123" });

      // 验证返回结构
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      // 验证是否使用了 mock 的返回值
      expect(result.accessToken).toBe("mock_token_string");
    });
  });

  describe("register", () => {
    it("should register successfully", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);
      (redis.get as any).mockResolvedValue("123456");
      (hashPassword as any).mockResolvedValue("hashed");
      (prisma.user.create as any).mockResolvedValue({ id: 1 });

      const result = await register({
        username: "newuser",
        password: "password",
        email: "test@example.com",
        code: "123456",
      });

      expect(result).toBe(null);
      expect(prisma.user.create).toHaveBeenCalled();
      expect(redis.del).toHaveBeenCalled();
    });

    it("should fail with invalid code", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);
      (redis.get as any).mockResolvedValue("654321"); // stored code

      try {
        await register({
          username: "newuser",
          password: "password",
          email: "test@example.com",
          code: "123456", // wrong code
        });
      } catch (e: any) {
        expect(e.status).toBe(400);
        expect(e.message).toBe("验证码错误");
      }
    });
  });
});
