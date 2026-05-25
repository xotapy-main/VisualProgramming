import { createSlice } from '@reduxjs/toolkit';
import type { UserMock } from '../../types/type';

interface AuthState {
  user: UserMock | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: {
    id: 'user-123',
    name: 'Дмитрий',
    email: 'dmitry@university.edu',
  },
  Isabella: true,
  isAuthenticated: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;