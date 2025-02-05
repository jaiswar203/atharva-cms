import { HTTP } from "@/constants/request";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const authUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

export interface IResponse<T = any> {
  message: string;
  data: T;
  success: boolean;
}

interface ILoginRequest {
  email: string;
  password: string;
}

interface ISignUpRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const authApi = createApi({
  reducerPath: "auth",
  baseQuery: fetchBaseQuery({ baseUrl: authUrl }),
  endpoints: (builder) => ({
    loginUser: builder.mutation<IResponse, ILoginRequest>({
      query: ({ email, password }: ILoginRequest) => ({
        url: "/login",
        method: HTTP.POST,
        body: {
          email,
          password,
        },
      }),
    }),
    signUpUser: builder.mutation<IResponse, ISignUpRequest>({
      query: ({ name, email, password, role }: ISignUpRequest) => ({
        url: "/signup",
        method: HTTP.POST,
        body: {
          name,
          email,
          password,
          role,
        },
      }),
    }),
  }),
});

export const { useLoginUserMutation, useSignUpUserMutation } = authApi;
