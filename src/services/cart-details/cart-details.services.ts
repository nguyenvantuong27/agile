import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import { ICartDetail } from '~/domain/types/cart-details/cart-details.model';

export const cartDetailsApi = createApi({
  reducerPath: 'cartDetailApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CartDetail'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getCartDetailsByCartId: builder.query<{ data: ICartDetail[] }, string>({
      query: (cart_id) => `/api/v1/cart-details/${cart_id}`,
      providesTags: ['CartDetail'],
    }),
    addProductToCart: builder.mutation<
      { data: ICartDetail },
      Partial<ICartDetail>
    >({
      query: (body) => ({
        url: '/api/v1/cart-details',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CartDetail'],
    }),
    updateCartDetail: builder.mutation<
      { data: ICartDetail },
      { cart_id: string; product_id: string; quantity: number }
    >({
      query: ({ cart_id, product_id, quantity }) => ({
        url: `/api/v1/cart-details/${cart_id}/${product_id}`,
        method: 'PATCH',
        body: { quantity },
      }),
      invalidatesTags: ['CartDetail'],
    }),
    deleteCartDetail: builder.mutation<
      void,
      { cart_id: string; product_id: string }
    >({
      query: ({ cart_id, product_id }) => ({
        url: `/api/v1/cart-details/${cart_id}/${product_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CartDetail'],
    }),
  }),
});

export const {
  useGetCartDetailsByCartIdQuery,
  useAddProductToCartMutation,
  useUpdateCartDetailMutation,
  useDeleteCartDetailMutation,
} = cartDetailsApi;
