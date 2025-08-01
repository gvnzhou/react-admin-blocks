import type { LoginForm } from '@/schemas/auth';
import { authApi, type LoginResponse } from '@/services/auth';
import { type RootState } from '@/store';
import { initializeAuth, loginSuccess, logout as logoutAction } from '@/store/authSlice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

// Auth status hook
export const useAuthStatus = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Initialize auth state from localStorage on app start
    if (!isAuthenticated && !token) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isAuthenticated, token]);

  return {
    isAuthenticated,
    user,
    token,
    isLoading: false, // Could be enhanced to check if user data is being fetched
  };
};

// Login mutation hook
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const location = useLocation();

  return useMutation<LoginResponse, Error, LoginForm>({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('token', data.token);

      // Update Redux store
      dispatch(loginSuccess({ user: data.user, token: data.token }));

      // Store user data in query cache
      queryClient.setQueryData(['user'], data.user);

      // Navigate to intended destination or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

// Logout mutation hook
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Update Redux store
      dispatch(logoutAction());

      // Clear all cached data
      queryClient.clear();

      // Navigate to login
      navigate('/login');
    },
  });
};
