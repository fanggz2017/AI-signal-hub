import { describe, expect, it, mock, beforeEach, spyOn } from "bun:test";
import { login, register } from "./auth.service";
import { prisma } from "../db/prisma";
import redis from "../db/redis";
import { hashPassword, verifyPassword } from "../utils/password";

// Mock external dependencies
mock.module("../db/prisma", () => ({
  prisma: {
    user: {
      findFirst: mock(),
      create: mock(),
      findUnique: mock(),
      update: mock(),
    },
  },
}));

mock.module("../db/redis", () => ({
  default: {
    get: mock(),
    del: mock(),
    set: mock(),
  },
}));

mock.module("../utils/password", () => ({
  hashPassword: mock(),
  verifyPassword: mock(),
}));

describe("AuthService", () => {
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
        expect(e.message).toBe("用户名或密码错误");
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
        expect(e.message).toBe("用户名或密码错误");
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
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
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
              code: "123456"
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
                  code: "123456" // wrong code
               });
           } catch (e: any) {
               expect(e.status).toBe(400);
               expect(e.message).toBe("验证码错误");
           }
      });
  });
});
