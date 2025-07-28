import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LoginLayout from "../layouts/LoginLayout";
import DashboardPage from "../pages/DashboardPage";
import UserListPage from "../pages/UserListPage";
import LoginPage from "../pages/LoginPage";

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* 登录页单独布局 */}
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      {/* 主业务布局 */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserListPage />} />
        {/* 其他业务路由 */}
      </Route>
      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen text-2xl">
            404 Not Found
          </div>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
