import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
// import persistReducer from "redux-persist/es/persistReducer";

const reducers = combineReducers({
  user: userSlice.reducer,
});

//config: key, storage는 필수, whitelist(유지하고 싶은 값을 배열로)
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], //
};

const persistedReducer = persistReducer(persistConfig, reducers); //인자로 받은 persistConfig객체를 reducer 함수에 적용하여 "enhanced reducer"(persistedReducer) 반환

const store = configureStore({
  reducer: persistedReducer,
  //non-serializable value 무시 액션 추가
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
// const store = configureStore({
//   reducer: {
//     user: searchReducer.reducer,
//     // 다른 리듀서들도 추가해주세요, 필요에 따라
//   },
// });

export default store;
