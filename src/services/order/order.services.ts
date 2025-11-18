import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import queryBuilder from '~/hooks/queryBuilder';
import {
  IOrderDetailResponse,
  IOrdersResponse,
} from '~/interfaces/types/order/order';
import { IOrder } from '~/domain/types/order/order.model';

export const orderApi = createApi({
  reducerPath: 'orderApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    getOrders: builder.query<IOrdersResponse, void>({
      query: () => '/api/v1/orders',
      providesTags: ['Orders'],
    }),
    getOrdersByUserId: builder.query({
      query: (user_id) => `/api/v1/orders/user/${user_id}`,
      providesTags: ['Orders'],
    }),
    getOrdersPagination: builder.query<
      IOrdersResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/orders', { limit, page }),
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query<IOrderDetailResponse, string>({
      query: (id) => `/api/v1/orders/${id}`,
      providesTags: ['Orders'],
    }),
    createOrder: builder.mutation<IOrdersResponse, IOrder>({
      query: (orderData) => ({
        url: '/api/v1/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),
    deleteOrder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Orders'],
    }),
    updateOrder: builder.mutation<
      IOrderDetailResponse,
      { id: string; data: Partial<IOrder> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/orders/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation<
      IOrderDetailResponse,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/api/v1/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrdersByUserIdQuery,
  useGetOrdersPaginationQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useDeleteOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi;
