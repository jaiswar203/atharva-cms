import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";
import { appSlice } from "./slice/app";
import { collegeApi } from "./api/college";
import { authApi } from "./api/auth";

const rootReducer = combineReducers({
  app: appSlice.reducer,
  [collegeApi.reducerPath]: collegeApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  blacklist: [collegeApi.reducerPath, authApi.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }).concat(thunk, collegeApi.middleware, authApi.middleware),
  });

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
