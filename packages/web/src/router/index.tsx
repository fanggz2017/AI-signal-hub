import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/main-layout";
import DashboardPage from "@/features/dashboard/dashboard-page";
import { authRoutes } from "@/features/auth/routes";
import GithubTrendingPage from "@/features/github/github-page";

const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/trends/github",
        element: <GithubTrendingPage />,
      },
    ],
  },
]);

export default router;
