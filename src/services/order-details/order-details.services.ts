import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from '../auth/auth.services';
import { IOrderDetailsResponse } from '~/interfaces/types/order-details/order-details';
import { IOrderDetail } from '~/domain/types/order-details/order-details.model';
import { IOrderDetailResponse } from '~/interfaces/types/order/order';

export const orderDetailApi = createApi({
  reducerPath: 'orderDetailApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getOrderDetails: builder.query<IOrderDetailsResponse, void>({
      query: () => '/api/v1/order-details',
    }),
    getOrderDetailsByOrderId: builder.query<IOrderDetailsResponse, string>({
      query: (order_id) => `/api/v1/order-details/order/${order_id}`,
    }),
    getOrderDetailById: builder.query<IOrderDetailResponse, string>({
      query: (id) => `/api/v1/order-details/${id}`,
    }),
    createOrderDetail: builder.mutation<IOrderDetailResponse, IOrderDetail>({
      query: (orderDetailData) => ({
        url: '/api/v1/order-details',
        method: 'POST',
        body: orderDetailData,
      }),
    }),
    deleteOrderDetail: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/order-details/${id}`,
        method: 'DELETE',
      }),
    }),
    updateOrderDetail: builder.mutation<
      IOrderDetailResponse,
      { id: string; data: Partial<IOrderDetail> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/order-details/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetOrderDetailsQuery,
  useGetOrderDetailsByOrderIdQuery,
  useGetOrderDetailByIdQuery,
  useCreateOrderDetailMutation,
  useDeleteOrderDetailMutation,
  useUpdateOrderDetailMutation,
} = orderDetailApi;
