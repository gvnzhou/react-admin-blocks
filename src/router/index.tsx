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
      {/* Login page */}
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      {/* Main layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserListPage />} />
        {/* Other business routes */}
      </Route>
      {/* 404 page */}
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
