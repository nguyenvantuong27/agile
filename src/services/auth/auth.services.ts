import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../redux/storage/store';
import {
  ILoginResponse,
  IRequestPasswordReset,
  IResetPasswordRequest,
  IChangePasswordRequest, // Thêm import mới
} from '../../interfaces/types/auth/auth';
import { assignNewToken, logoutUser } from '../../services/auth/auth.slice';
import { IRequestCredentials } from './../../interfaces/types/auth/auth';
import { IUsersDetailResponse } from '../../interfaces/types/user/user';

const refreshTokenFetchQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState & {
      auth: { currentUser: { refreshToken: string } };
    };
    const refreshToken = state.auth?.currentUser?.refreshToken;
    if (refreshToken) {
      headers.set('Authorization', `Bearer ${refreshToken}`);
    }
    return headers;
  },
});

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = (
      state as RootState & { auth: { currentUser: { token: string } } }
    ).auth?.currentUser?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (
      api.getState() as RootState & {
        auth: { currentUser: { refreshToken: string } };
      }
    ).auth.currentUser?.refreshToken;
    const refreshResult = await refreshTokenFetchQuery(
      {
        url: '/api/v1/auth/refresh-token',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      api.dispatch(assignNewToken(refreshResult.data as ILoginResponse));
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logoutUser());
    }
  } else if (result.error && result.error.status === 403) {
    api.dispatch(logoutUser());
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 5,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<ILoginResponse, IRequestCredentials>({
      query: (credentials) => ({
        url: '/api/v1/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<IUsersDetailResponse, FormData>({
      query: (formData) => ({
        url: '/api/v1/auth/register',
        method: 'POST',
        body: formData,
      }),
    }),

    registerGoogle: builder.mutation<IUsersDetailResponse, FormData>({
      query: (formData) => ({
        url: '/api/v1/auth/register-google',
        method: 'POST',
        body: formData,
      }),
    }),

    getTokenFromRefreshToken: builder.mutation<ILoginResponse, void>({
      query: () => ({
        url: '/api/v1/auth/refresh-token',
        method: 'POST',
      }),
    }),

    requestPasswordReset: builder.mutation<void, IRequestPasswordReset>({
      query: (requestPasswordReset) => ({
        url: '/api/v1/auth/request-password-reset',
        method: 'POST',
        body: requestPasswordReset,
      }),
    }),

    resetPassword: builder.mutation<void, IResetPasswordRequest>({
      query: (resetPasswordRequest) => ({
        url: '/api/v1/auth/reset-password',
        method: 'POST',
        body: resetPasswordRequest,
      }),
    }),

    verifyCode: builder.mutation<
      { message: string },
      { user_id: string; code: string }
    >({
      query: (verifyData) => ({
        url: '/api/v1/auth/verify-code',
        method: 'POST',
        body: verifyData,
      }),
    }),

    // Thêm endpoint mới cho changePassword
    changePassword: builder.mutation<
      { message: string },
      IChangePasswordRequest
    >({
      query: (changePasswordRequest) => ({
        url: '/api/v1/auth/change-password',
        method: 'POST',
        body: changePasswordRequest,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRegisterGoogleMutation,
  useGetTokenFromRefreshTokenMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useVerifyCodeMutation,
  useChangePasswordMutation, // Export hook mới
} = authApi;
