import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import queryBuilder from '~/hooks/queryBuilder';
import {
  ITimeslotDetailResponse,
  ITimeslotsResponse,
} from '~/interfaces/types/timeslots/timeslots';
import { ITimeslot } from '~/domain/types/timeslots/timeslots.model';

export const timeslotApi = createApi({
  reducerPath: 'timeslotApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  tagTypes: ['Timeslots'],
  endpoints: (builder) => ({
    getTimeslots: builder.query<ITimeslotsResponse, void>({
      query: () => '/api/v1/timeslots',
      providesTags: ['Timeslots'],
    }),
    getTimeslotsPagination: builder.query<
      ITimeslotsResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/timeslots', { limit, page }),
      providesTags: ['Timeslots'],
    }),
    getTimeslotById: builder.query<ITimeslotDetailResponse, string>({
      query: (id) => `/api/v1/timeslots/${id}`,
      providesTags: ['Timeslots'],
    }),
    createTimeslot: builder.mutation<ITimeslotDetailResponse, ITimeslot>({
      query: (timeslotData) => ({
        url: '/api/v1/timeslots',
        method: 'POST',
        body: timeslotData,
      }),
      invalidatesTags: ['Timeslots'],
    }),
    deleteTimeslot: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/timeslots/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Timeslots'],
    }),
    patchTimeslot: builder.mutation<
      ITimeslotDetailResponse,
      { id: string; data: Partial<ITimeslot> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/timeslots/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Timeslots'],
    }),
    getTimeslotsByUserId: builder.query<ITimeslotsResponse, string>({
      query: (userId) => `/api/v1/timeslots/user/${userId}`,
      providesTags: ['Timeslots'],
    }),
  }),
});

export const {
  useGetTimeslotsQuery,
  useGetTimeslotsPaginationQuery,
  useGetTimeslotByIdQuery,
  useCreateTimeslotMutation,
  useDeleteTimeslotMutation,
  usePatchTimeslotMutation,
  useGetTimeslotsByUserIdQuery,
} = timeslotApi;
