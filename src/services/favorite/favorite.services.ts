import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import { IFavoritesResponse } from '~/interfaces/types/favorite/favorite';
import { IFavorite } from '~/domain/types/favorite/favorite.model';

export const favoriteApi = createApi({
  reducerPath: 'favoriteApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    addToFavorites: builder.mutation<
      IFavorite,
      { user_id: string; product_id: string }
    >({
      query: (data) => ({
        url: '/api/v1/favorites',
        method: 'POST',
        body: data,
      }),
    }),
    removeFromFavorites: builder.mutation<
      IFavorite,
      { user_id: string; product_id: string }
    >({
      query: (data) => ({
        url: '/api/v1/favorites',
        method: 'DELETE',
        body: data,
      }),
    }),
    getFavoritesByUserId: builder.query<IFavoritesResponse, string>({
      query: (userId) => `/api/v1/favorites/users/${userId}/favorites`,
    }),
  }),
});

export const {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
  useGetFavoritesByUserIdQuery,
} = favoriteApi;
