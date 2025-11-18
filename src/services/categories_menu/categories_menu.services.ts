import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services.ts';
import { ICategoriesMenuResponse } from '../../interfaces/types/categories_menu/categories_menu.ts';
import { ICategoriesMenu } from '../../domain/types/categories_menu/categories_menu.model.ts';

export const categoriesMenuApi = createApi({
  reducerPath: 'categoriesMenuApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getCategoriesMenu: builder.query<ICategoriesMenuResponse, void>({
      query: () => '/api/v1/categories',
    }),

    createCategoriesMenu: builder.mutation<
      ICategoriesMenuResponse,
      ICategoriesMenu
    >({
      query: (newMenu) => ({
        url: '/api/v1/categories',
        method: 'POST',
        body: newMenu,
      }),
    }),

    partialUpdateCategoriesMenu: builder.mutation<
      ICategoriesMenuResponse,
      { id: string; data: Partial<ICategoriesMenu> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    deleteCategoriesMenu: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: (id) => ({
        url: `/api/v1/categories/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetCategoriesMenuQuery,
  useCreateCategoriesMenuMutation,
  usePartialUpdateCategoriesMenuMutation,
  useDeleteCategoriesMenuMutation,
} = categoriesMenuApi;
