import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginForm from "../login-form";
import { BrowserRouter } from "react-router-dom";

// Mock custom Hook
vi.mock("../../hooks/useLogin", () => ({
  useLogin: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe("LoginForm", () => {
  it("renders login inputs", () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );
    expect(
      screen.getByPlaceholderText("请输入用户名或邮箱"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("请输入密码")).toBeInTheDocument();
  });

  it("validates empty input", async () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>,
    );

    // Click login button
    fireEvent.click(screen.getByText("登录"));

    // Validation (Zod schema requires min length)
    await waitFor(() => {
      // Checking for "账号至少需要3个字符" based on schema
      expect(screen.getByText("账号至少需要3个字符")).toBeInTheDocument();
    });
  });
});
