import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id:string;
  id: string;
  Name: string;
  email: string;
  profileImage:string
  phoneNumber:string
  role: string;
}

interface UserState {
    User: User | null;
}

const initialState: UserState = {
    User: JSON.parse(localStorage.getItem("userData") || "null"),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    userLogin: (state, action: PayloadAction<User>) => {
      state.User = action.payload;
      localStorage.setItem("userData", JSON.stringify(action.payload));
    },
    userUpdate: (state, action: PayloadAction<Partial<User>>) => {
      if (state.User) {
        state.User = { ...state.User, ...action.payload };
        localStorage.setItem("userData", JSON.stringify(state.User));
      }
    },
    userLogout: (state) => {
      state.User = null;
      localStorage.removeItem("userData");
    },
  },
});

export const { userLogin,userUpdate, userLogout } = userSlice.actions;
export default userSlice.reducer;