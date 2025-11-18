import { createApi } from '@reduxjs/toolkit/query/react';
import {
  ITattooDetailResponse,
  ITattoosResponse,
} from '~/interfaces/types/tattoo/tattoo';
import { ITattoo } from '~/domain/types/tattoo/tattoo.model';
import { baseQueryWithReauth } from '../auth/auth.services';

export const tattooApi = createApi({
  reducerPath: 'tattooApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getTattoos: builder.query<ITattoosResponse, void>({
      query: () => '/api/v1/tattos',
    }),
    getTattooById: builder.query<ITattooDetailResponse, string>({
      query: (id) => `/api/v1/tattos/${id}`,
    }),
    createTattoo: builder.mutation<ITattooDetailResponse, ITattoo>({
      query: (tattooData) => ({
        url: '/api/v1/tattos',
        method: 'POST',
        body: tattooData,
      }),
    }),
    deleteTattoo: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/tattos/${id}`,
        method: 'DELETE',
      }),
    }),
    updateTattoo: builder.mutation<
      ITattooDetailResponse,
      { id: string; data: Partial<ITattoo> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/tattos/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTattoosQuery,
  useGetTattooByIdQuery,
  useCreateTattooMutation,
  useDeleteTattooMutation,
  useUpdateTattooMutation,
} = tattooApi;
