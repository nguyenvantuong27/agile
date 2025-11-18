import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import queryBuilder from '~/hooks/queryBuilder';
import {
  IListProductResponse,
  IListProductDetailResponse,
} from '~/interfaces/types/list_product/list_product';
import { IListProduct } from '~/domain/types/list_product/list_product.model';

export const listProductApi = createApi({
  reducerPath: 'listProductApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getListProducts: builder.query<IListProductResponse, void>({
      query: () => '/api/v1/list-product',
    }),
    getListProductsPagination: builder.query<
      IListProductResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/list-product', { limit, page }),
    }),
    getListProductById: builder.query<IListProductDetailResponse, string>({
      query: (id) => `/api/v1/list-product/${id}`,
    }),
    createListProduct: builder.mutation<
      IListProductDetailResponse,
      IListProduct
    >({
      query: (productData) => ({
        url: '/api/v1/list-product',
        method: 'POST',
        body: productData,
      }),
    }),
    deleteListProduct: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/list-product/${id}`,
        method: 'DELETE',
      }),
    }),
    patchListProduct: builder.mutation<
      IListProductDetailResponse,
      { id: string; data: IListProduct }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/list-product/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetListProductsQuery,
  useGetListProductsPaginationQuery,
  useGetListProductByIdQuery,
  useCreateListProductMutation,
  useDeleteListProductMutation,
  usePatchListProductMutation,
} = listProductApi;
