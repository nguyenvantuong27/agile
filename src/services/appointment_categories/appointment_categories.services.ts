import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import { IAppointmentCategoryResponse } from '~/interfaces/types/appointment_categories/appointment_categories';
import { IAppointmentCategory } from '~/domain/types/appointment_categories/appointment_categories.model';

export const appointmentCategoriesApi = createApi({
  reducerPath: 'appointmentCategoriesApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAppointmentCategories: builder.query<IAppointmentCategoryResponse, void>(
      {
        query: () => '/api/v1/appointment-categories',
      },
    ),

    createAppointmentCategory: builder.mutation<
      IAppointmentCategoryResponse,
      IAppointmentCategory
    >({
      query: (newCategory) => ({
        url: '/api/v1/appointment-categories',
        method: 'POST',
        body: newCategory,
      }),
    }),

    partialUpdateAppointmentCategory: builder.mutation<
      IAppointmentCategoryResponse,
      { id: string; data: Partial<IAppointmentCategory> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/appointment-categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    deleteAppointmentCategory: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `/api/v1/appointment-categories/${id}`,
        method: 'DELETE',
      }),
    }),

    searchAppointmentCategoriesByName: builder.query<
      IAppointmentCategoryResponse,
      string
    >({
      query: (name) =>
        `/api/v1/appointment-categories/search/name?name=${name}`,
    }),
  }),
});

export const {
  useGetAppointmentCategoriesQuery,
  useCreateAppointmentCategoryMutation,
  usePartialUpdateAppointmentCategoryMutation,
  useDeleteAppointmentCategoryMutation,
  useSearchAppointmentCategoriesByNameQuery,
} = appointmentCategoriesApi;
