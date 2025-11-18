import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import queryBuilder from '~/hooks/queryBuilder';
import {
  IProductDetailResponse,
  IProductsResponse,
} from '~/interfaces/types/product/product';
import { IProduct } from '~/domain/types/product/product.model';
import {
  ICommentResponse,
  ICommentsResponse,
} from '~/interfaces/types/comments/comments';

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getProducts: builder.query<IProductsResponse, void>({
      query: () => '/api/v1/products',
    }),
    getProductsPagination: builder.query<
      IProductsResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/products', { limit, page }),
    }),
    getProductById: builder.query<IProductDetailResponse, string>({
      query: (id) => `/api/v1/products/${id}`,
    }),
    createProduct: builder.mutation<IProductDetailResponse, IProduct>({
      query: (productData) => ({
        url: '/api/v1/products',
        method: 'POST',
        body: productData,
      }),
    }),
    updateProduct: builder.mutation<
      IProductDetailResponse,
      { id: string; data: IProduct }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/products/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/products/${id}`,
        method: 'DELETE',
      }),
    }),
    getCommentsByProductId: builder.query<ICommentsResponse, string>({
      query: (productId) => `/api/v1/products/${productId}/comments`,
    }),
    createComment: builder.mutation<
      ICommentResponse,
      { product_id: string; user_id: string; content: string }
    >({
      query: (commentData) => ({
        url: `/api/v1/products/${commentData.product_id}/comments`,
        method: 'POST',
        body: commentData,
      }),
    }),
    updateComment: builder.mutation<
      ICommentResponse,
      { commentId: string; content: string; user_id: string }
    >({
      query: ({ commentId, content, user_id }) => ({
        url: `/api/v1/products/comments/${commentId}`,
        method: 'PATCH',
        body: { content, user_id },
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductsPaginationQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCommentsByProductIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
} = productApi;
