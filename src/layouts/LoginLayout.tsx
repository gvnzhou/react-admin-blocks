import React from "react";
import type { PropsWithChildren } from "react";

const LoginLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md min-w-[320px] w-full max-w-md">
        {children}
      </div>
    </div>
  );
};

export default LoginLayout;
