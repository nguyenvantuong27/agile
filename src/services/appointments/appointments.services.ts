import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import queryBuilder from '~/hooks/queryBuilder';
import {
  IAppointmentDetailResponse,
  IAppointmentsDetailsResponse,
  IAppointmentsResponse,
} from '~/interfaces/types/appointment/appointment';
import { IAppointment } from '~/domain/types/appointments/appointment.model';

export const appointmentApi = createApi({
  reducerPath: 'appointmentApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  tagTypes: ['Appointments'],
  endpoints: (builder) => ({
    getAppointments: builder.query<IAppointmentsResponse, void>({
      query: () => '/api/v1/appointments',
      providesTags: ['Appointments'],
    }),
    getAppointmentsPagination: builder.query<
      IAppointmentsResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/appointments', { limit, page }),
      providesTags: ['Appointments'],
    }),
    getAppointmentById: builder.query<IAppointmentsDetailsResponse, string>({
      query: (id) => `/api/v1/appointments/${id}`,
      providesTags: ['Appointments'],
    }),
    createAppointment: builder.mutation<
      IAppointmentDetailResponse,
      IAppointment
    >({
      query: (appointmentData) => ({
        url: '/api/v1/appointments',
        method: 'POST',
        body: appointmentData,
      }),
      invalidatesTags: ['Appointments'],
    }),
    deleteAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Appointments'],
    }),
    patchAppointment: builder.mutation<
      IAppointmentDetailResponse,
      { id: string; data: Partial<IAppointment> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/appointments/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Appointments'],
    }),
    approveAppointment: builder.mutation<IAppointmentDetailResponse, string>({
      query: (id) => ({
        url: `/api/v1/appointments/approve/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Appointments'],
    }),
    getAppointmentsByCustomerId: builder.query<IAppointmentsResponse, string>({
      query: (customerId) => `/api/v1/appointments/customer/${customerId}`,
      providesTags: ['Appointments'],
    }),
    getApprovedAppointments: builder.query<IAppointmentsResponse, void>({
      query: () => '/api/v1/appointments/approved',
      providesTags: ['Appointments'],
    }),
    getRejectedAppointments: builder.query<IAppointmentsResponse, void>({
      query: () => '/api/v1/appointments/rejected',
      providesTags: ['Appointments'],
    }),
    rejectAppointment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/appointments/reject/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Appointments'],
    }),
    cancelAppointmentByCustomer: builder.mutation<
      IAppointmentDetailResponse,
      { id: string; email: string; phone?: string }
    >({
      query: ({ id, email, phone }) => ({
        url: `/api/v1/appointments/cancel/${id}`,
        method: 'PATCH',
        body: { email, phone },
      }),
      invalidatesTags: ['Appointments'],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentsPaginationQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useDeleteAppointmentMutation,
  usePatchAppointmentMutation,
  useApproveAppointmentMutation,
  useGetAppointmentsByCustomerIdQuery,
  useGetApprovedAppointmentsQuery,
  useGetRejectedAppointmentsQuery,
  useRejectAppointmentMutation,
  useCancelAppointmentByCustomerMutation,
} = appointmentApi;
