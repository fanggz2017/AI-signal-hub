import { type RouteObject } from "react-router-dom";
import LoginPage from "./login-page";
import AuthLayout from "@/layouts/auth-layout";
import RegisterPage from "./register-page";
import ForgetPasswordPage from "./forget-password-page";

export const authRoutes: RouteObject[] = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "reset-password",
        element: <ForgetPasswordPage />,
      },
    ],
  },
];
