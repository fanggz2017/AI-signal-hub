import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import HeaderNav from "./header-nav";

const MainLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50">
        <AppSidebar />

        <main className="flex flex-1 flex-col overflow-hidden">
          <HeaderNav />

          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
