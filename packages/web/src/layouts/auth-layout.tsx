import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main className="flex-1 overflow-auto">
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Outlet />
      </div>
    </main>
  );
};

export default AuthLayout;
