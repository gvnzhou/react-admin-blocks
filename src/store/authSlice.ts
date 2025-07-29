import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  roles: [],
  permissions: [],
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRoles(state, action) {
      state.roles = action.payload;
    },
    setPermissions(state, action) {
      state.permissions = action.payload;
    },
  },
});

export const { setRoles, setPermissions } = authSlice.actions;
export default authSlice.reducer;
