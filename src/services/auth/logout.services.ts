import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '~/redux/storage/store';

const logoutBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const refreshToken = state.auth?.currentUser?.refreshToken;
    if (refreshToken) {
      headers.set('Authorization', `Bearer ${refreshToken}`);
    }
    return headers;
  },
});

export const logoutApi = createApi({
  reducerPath: 'logoutApi',
  baseQuery: logoutBaseQuery,
  endpoints: (builder) => ({
    logout: builder.mutation<void, { refreshToken: string }>({
      query: ({ refreshToken }) => ({
        url: '/api/v1/auth/logout',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }),
    }),
  }),
});

export const { useLogoutMutation } = logoutApi;
