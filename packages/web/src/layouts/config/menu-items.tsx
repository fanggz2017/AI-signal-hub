import {
  LayoutDashboard,
  TrendingUp,
  Github,
  Newspaper,
  Bot,
  Wrench,
  Microscope,
  Settings,
} from "lucide-react";
import type { MenuItem } from "../types/menu";

export const getMenuItems = (): MenuItem[] => [
  {
    title: "概览",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "情报局",
    url: "/trends",
    icon: TrendingUp,
    items: [
      { title: "GitHub 榜单", url: "/trends/github", icon: Github },
      { title: "技术资讯", url: "/trends/news", icon: Newspaper },
    ],
  },
  {
    title: "AI 聚合",
    url: "/ai-hub",
    icon: Bot,
    items: [
      { title: "模型广场", url: "/ai-hub/models" },
      { title: "工具导航", url: "/ai-hub/tools", icon: Wrench },
    ],
  },
  {
    title: "智能分析",
    url: "/insights",
    icon: Microscope,
    items: [
      { title: "项目深度分析", url: "/insights/repo-analysis" },
      { title: "趋势研报", url: "/insights/reports" },
    ],
  },
  {
    title: "设置",
    url: "/settings",
    icon: Settings,
  },
];
