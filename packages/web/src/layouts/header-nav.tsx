import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserNav } from "./user-nav";
import { Command } from "lucide-react";

const HeaderNav = () => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-white">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />

        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2 font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Command className="size-4" />
          </div>
          <span className="hidden md:inline-block">我的博客系统</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <UserNav />
      </div>
    </header>
  );
};

export default HeaderNav;
