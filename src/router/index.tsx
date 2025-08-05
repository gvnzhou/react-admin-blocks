import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginLayout from '../layouts/LoginLayout';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import UserListPage from '../pages/UserListPage';
import ProtectedRoute from '../shared/components/auth/ProtectedRoute';

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {/* Login page */}
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserListPage />} />
        {/* Other business routes */}
      </Route>

      {/* 404 page */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen text-2xl">404 Not Found</div>
        }
      />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
