import React from "react";
import type { PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC<PropsWithChildren> = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center justify-center text-xl font-bold border-b border-gray-700">
          Admin
        </div>
        <nav className="flex-1 p-4">{/* Add sidebar navigation here */}</nav>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow flex items-center px-6 border-b">
          {/* Add header content here */}
          <span className="font-semibold text-lg">Dashboard</span>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {/* 渲染子路由内容 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
