import { createApi } from '@reduxjs/toolkit/query/react';
import queryBuilder from '~/hooks/queryBuilder';
import { baseQueryWithReauth } from '../auth/auth.services';
import {
  IPaymentDetailResponse,
  IPaymentsResponse,
} from '~/interfaces/types/payment/payment';
import { IPayment } from '~/domain/types/payment/payment.model';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getPayments: builder.query<IPaymentsResponse, void>({
      query: () => '/api/v1/payments',
    }),
    getPaymentsPagination: builder.query<
      IPaymentsResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/payments', { limit, page }),
    }),
    getPaymentById: builder.query<IPaymentDetailResponse, string>({
      query: (id) => `/api/v1/payments/${id}`,
    }),
    createPayment: builder.mutation<IPaymentDetailResponse, IPayment>({
      query: (paymentData) => ({
        url: '/api/v1/payments',
        method: 'POST',
        body: paymentData,
      }),
    }),
    deletePayment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/payments/${id}`,
        method: 'DELETE',
      }),
    }),
    patchPayment: builder.mutation<
      IPaymentDetailResponse,
      { id: string; data: Partial<IPayment> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/payments/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentsPaginationQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useDeletePaymentMutation,
  usePatchPaymentMutation,
} = paymentApi;
