import { configureStore } from '@reduxjs/toolkit';

import authReducer from './authSlice';
import permissionReducer from './permissionSlice';
import uiReducer from './uiSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    permission: permissionReducer,
    ui: uiReducer,
  },
});

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
