import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import {
  ICartDetailResponse,
  ICartsResponse,
} from '~/interfaces/types/cart/cart';
import { ICart } from '~/domain/types/cart/cart.model';

export const cartApi = createApi({
  reducerPath: 'cartApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getCarts: builder.query<ICartsResponse, void>({
      query: () => '/api/v1/carts',
    }),
    getCartByUserId: builder.query<{ data: ICart }, string>({
      query: (user_id) => `api/v1/carts/${user_id}`,
    }),
    getCartById: builder.query<ICartDetailResponse, string>({
      query: (id) => `/api/v1/carts/${id}`,
    }),
    createCart: builder.mutation<ICartsResponse, ICart>({
      query: (cartData) => ({
        url: '/api/v1/carts',
        method: 'POST',
        body: cartData,
      }),
    }),
    updateCart: builder.mutation<
      ICartDetailResponse,
      { id: string; data: ICart }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/carts/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    deleteCart: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/carts/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCartsQuery,
  useGetCartByUserIdQuery,
  useGetCartByIdQuery,
  useCreateCartMutation,
  useUpdateCartMutation,
  useDeleteCartMutation,
} = cartApi;
