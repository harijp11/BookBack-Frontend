import { configureStore } from "@reduxjs/toolkit";
import adminReducer from "./slice/admin_slice"
import userReducer from "./slice/user_slice"


export const store = configureStore({
  reducer: {
    admin: adminReducer,
    user:userReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;