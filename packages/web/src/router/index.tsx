import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/main-layout";
import DashboardPage from "@/features/dashboard/dashboard-page";
import { authRoutes } from "@/features/auth/routes";

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
    ],
  },
]);

export default router;
