import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  token: string;
  role: string;
}

interface IAppState {
  user: IUser | null;
}

const initialState: IAppState = {
  user: null,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
    logOutUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUser, logOutUser } = appSlice.actions;

export const app = (state: RootState) => state._persist;

export default appSlice.reducer;
