// config/menu-config.ts
import { Home, Settings, Users, FileText } from "lucide-react";
import type { MenuItem } from "../types/menu";

export const getMenuItems = (userRole: string): MenuItem[] => {
  const menus: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "系统管理",
      url: "/system",
      icon: Settings,
      // roles: ["admin"], // 只有 admin 可见
      items: [
        {
          title: "用户管理",
          url: "/system/users",
          icon: Users,
        },
        {
          title: "日志管理",
          url: "/system/logs",
          icon: FileText,
        },
      ],
    },
  ];

  // 简单的权限过滤函数
  const filterByRole = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter((item) => !item.roles || item.roles.includes(userRole))
      .map((item) => ({
        ...item,
        items: item.items ? filterByRole(item.items) : undefined,
      }));
  };

  return filterByRole(menus);
};
