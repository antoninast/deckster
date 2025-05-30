import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    value: null,
  },
  reducers: {
    setLogin: (state, action) => {
      console.log('IN SETLOGIN', action);
      state.value = action.payload;
    },
    setLogout: (state) => {
      state.value = null;
    },
  },
});

export const { setLogin, setLogout } = userSlice.actions;
export default userSlice.reducer;
