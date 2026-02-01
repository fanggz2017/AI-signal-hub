import { describe, expect, it } from "bun:test";
import {
  LoginSchema,
  RegisterSchema,
  ResetPasswordSchema,
  SendCodeSchema,
} from "../schemas/auth";

describe("Auth Schemas", () => {
  describe("LoginSchema", () => {
    it("should validate correct input", () => {
      const result = LoginSchema.safeParse({
        account: "testuser",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should fail if account is too short", () => {
      const result = LoginSchema.safeParse({
        account: "ab",
        password: "password123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = result.error.format();
        expect(formatted.account?._errors[0]).toBe("账号至少需要3个字符");
      }
    });

    it("should fail if password is too short", () => {
      const result = LoginSchema.safeParse({
        account: "testuser",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const formatted = result.error.format();
        expect(formatted.password?._errors[0]).toBe("密码至少需要6位");
      }
    });
  });

  describe("RegisterSchema", () => {
    it("should validate correct input", () => {
      const result = RegisterSchema.safeParse({
        username: "newuser",
        password: "password123",
        email: "test@example.com",
        code: "123456",
      });
      expect(result.success).toBe(true);
    });

    it("should fail on invalid email", () => {
      const result = RegisterSchema.safeParse({
        username: "newuser",
        password: "password123",
        email: "invalid-email",
        code: "123456",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("ResetPasswordSchema", () => {
    it("should validate correct input", () => {
      const result = ResetPasswordSchema.safeParse({
        email: "test@example.com",
        code: "123456",
        password: "newpassword123",
      });
      expect(result.success).toBe(true);
    });
  });
});
