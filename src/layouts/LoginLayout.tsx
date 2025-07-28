import { Outlet } from "react-router-dom";

const LoginLayout = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md min-w-[320px] w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default LoginLayout;
