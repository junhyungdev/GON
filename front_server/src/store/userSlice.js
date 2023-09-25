import { useMediaQuery } from "@material-ui/core";
import { createSlice } from "@reduxjs/toolkit";
//success-> isAuthenticated로 바꿈 헷갈리니까
const userSlice = createSlice({
  name: "user",
  initialState: {
    _id: "",
    full_name: "",
    account: "",
  },
  reducers: {
    loginUser: (state, action) => {
      state._id = action.payload._id;
      state.full_name = action.payload.full_name;
      state.account = action.payload.account;
    },

    clearUser: (state) => {
      state._id = "";
      state.full_name = "";
      state.account = "";
    },
  },
});

//export const { loginUser, clearUser } = userSlice.actions;
// export const { loginUser } = userSlice.actions;
// export const selectId = (state) => state.user.id;
// export const selectAc = (state) => state.user.accountinfo;
// export const selectname = (state) => state.user.username;
// export const selectSuccess = (state) => state.user.success;

export const searchAction = userSlice.actions;
export const searchReducer = userSlice.reducer;
export default userSlice;
