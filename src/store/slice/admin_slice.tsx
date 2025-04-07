import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Admin {
  _id:string;
  email: string;
  role: string;
}

interface AdminState {
  admin: Admin | null;
}

const initialState: AdminState = {
  admin: JSON.parse(localStorage.getItem("adminData") || "null"),
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    adminLogin: (state, action: PayloadAction<Admin>) => {
        console.log("adminlogin",action.payload)
      state.admin = action.payload;
      localStorage.setItem("adminData", JSON.stringify(action.payload));
    },
    adminLogout: (state) => {
      state.admin = null;
      localStorage.removeItem("adminData");
    },
  },
});

export const { adminLogin, adminLogout } = adminSlice.actions;
export default adminSlice.reducer;