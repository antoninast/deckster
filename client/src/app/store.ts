import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../user/userState';

// const savedUser = localStorage.getItem('user');
// const initialUser = savedUser ? JSON.parse(savedUser) : null;

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  // preloadedState: {
  //   user: { value: initialUser },
  // },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
