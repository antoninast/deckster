import { configureStore } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import userReducer from '../user/userState';
import AuthService from '../utils/auth.js';

const token = localStorage.getItem('id_token') || '';
let initialUser = null;

if (token && !AuthService.isTokenExpired(token)) {
  const savedUser = jwtDecode(token);
  initialUser = (savedUser as any)?.data || null;
}

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: {
    user: { value: initialUser },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
