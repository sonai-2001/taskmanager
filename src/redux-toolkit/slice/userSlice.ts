"use client"
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/redux-toolkit/store/store';

interface UserData {
  id: string;
  display_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface UserState {
  user: UserData | null;
}

const initialState: UserState = {
  user: null,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser(state, action: PayloadAction<UserData>) {
      console.log('The action payload is ', action.payload);
      state.user = action.payload;
    },
  },
});

export const { addUser } = userSlice.actions;
export const selectUser = (state: RootState) => state.user.user; // Select the user from the state

export default userSlice.reducer;
