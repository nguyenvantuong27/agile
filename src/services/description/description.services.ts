import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import {
  IDescriptionsResponse,
  IDescriptionDetailResponse,
} from '~/interfaces/types/description/description';
import { IDescription } from '~/domain/types/description/description.model';

export const descriptionApi = createApi({
  reducerPath: 'descriptionApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getDescriptions: builder.query<IDescriptionsResponse, void>({
      query: () => '/api/v1/descriptions',
    }),
    getDescriptionById: builder.query<IDescriptionDetailResponse, string>({
      query: (id) => `/api/v1/descriptions/${id}`,
    }),
    createDescription: builder.mutation<
      IDescriptionDetailResponse,
      IDescription
    >({
      query: (descriptionData) => ({
        url: '/api/v1/descriptions',
        method: 'POST',
        body: descriptionData,
      }),
    }),
    deleteDescription: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/descriptions/${id}`,
        method: 'DELETE',
      }),
    }),
    updateDescription: builder.mutation<
      IDescriptionDetailResponse,
      { id: string; data: Partial<IDescription> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/descriptions/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    getDescriptionsByUserId: builder.query<IDescriptionsResponse, string>({
      query: (userId) => `/api/v1/descriptions/user/${userId}`,
    }),
  }),
});

export const {
  useGetDescriptionsQuery,
  useGetDescriptionByIdQuery,
  useCreateDescriptionMutation,
  useDeleteDescriptionMutation,
  useUpdateDescriptionMutation,
  useGetDescriptionsByUserIdQuery,
} = descriptionApi;
