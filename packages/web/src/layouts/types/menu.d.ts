// types/menu.ts
import { type LucideIcon } from "lucide-react";

export interface MenuItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: MenuItem[];
  roles?: string[];
}
