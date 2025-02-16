import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HTTP } from "@/constants/request";
import { RootState } from "../store";
import { IResponse } from "./auth";

export interface IPage {
  _id: string;
  content: string;
  carousel_images: string[];
  page: string;
  video_url?: string;
  createdAt: string;
  updatedAt: string;
}

export const contentApi = createApi({
  reducerPath: "content",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/cms/contents`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).app.user?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Pages"],
  endpoints: (builder) => ({
    getPages: builder.query<IResponse<IPage[]>, void>({
      query: () => ({ url: "/pages", method: HTTP.GET }),
      providesTags: ["Pages"],
    }),
    getPageById: builder.query<IResponse<IPage>, string>({
      query: (id) => ({ url: `/pages/${id}`, method: HTTP.GET }),
      providesTags: ["Pages"],
    }),
    updatePageContent: builder.mutation<
      IResponse<IPage>,
      { body: Partial<Omit<IPage, "_id" | "createdAt" | "updatedAt">>; id: string }
    >({
      query: ({ id, body }) => ({
        url: `/pages/${id}`,
        method: HTTP.PATCH,
        body,
      }),
      invalidatesTags: ["Pages"],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPageByIdQuery,
  useUpdatePageContentMutation,
} = contentApi;
