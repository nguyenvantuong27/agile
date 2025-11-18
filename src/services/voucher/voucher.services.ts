import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import queryBuilder from '~/hooks/queryBuilder';
import {
  IVouchersResponse,
  IVoucherDetailResponse,
  IVoucherCreateResponse,
  IVoucherUserResponse,
} from '~/interfaces/types/voucher/voucher';
import { IUserVoucher, IVoucher } from '~/domain/types/voucher/voucher.model';

export interface IUserVouchersResponse {
  data: IVoucher[];
  status: number;
  message: string;
  length: number;
}

export const voucherApi = createApi({
  reducerPath: 'voucherApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getVouchers: builder.query<IVouchersResponse, void>({
      query: () => '/api/v1/vouchers',
    }),

    getVouchersPagination: builder.query<
      IVouchersResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/vouchers', { limit, page }),
    }),

    getVoucherById: builder.query<IVoucherDetailResponse, string>({
      query: (id) => `/api/v1/vouchers/${id}`,
    }),

    createVoucher: builder.mutation<IVoucherDetailResponse, IVoucher>({
      query: (voucherData) => ({
        url: '/api/v1/vouchers',
        method: 'POST',
        body: voucherData,
      }),
    }),

    updateVoucher: builder.mutation<
      IVoucherDetailResponse,
      { id: string; data: Partial<IVoucher> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/vouchers/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    deleteVoucher: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/vouchers/${id}`,
        method: 'DELETE',
      }),
    }),

    deleteUsedUserVoucher: builder.mutation<void, string>({
      query: (userVoucherId) => ({
        url: `/api/v1/vouchers/user/${userVoucherId}`,
        method: 'DELETE',
      }),
    }),

    applyVoucher: builder.mutation<
      IVoucherCreateResponse,
      { voucherCode: string }
    >({
      query: (data) => ({
        url: '/api/v1/vouchers/apply',
        method: 'POST',
        body: data,
      }),
    }),

    spinWheel: builder.mutation<{ data: IUserVoucher; message: string }, void>({
      query: () => ({
        url: '/api/v1/vouchers/spin',
        method: 'POST',
      }),
    }),

    getSpinVouchers: builder.query<{ data: IVoucher[]; length: number }, void>({
      query: () => '/api/v1/vouchers/spin-vouchers',
    }),

    getUserVouchers: builder.query<IVoucherUserResponse, void>({
      query: () => '/api/v1/vouchers/user',
    }),
  }),
});

export const {
  useGetVouchersQuery,
  useGetVouchersPaginationQuery,
  useGetVoucherByIdQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useDeleteUsedUserVoucherMutation,
  useApplyVoucherMutation,
  useSpinWheelMutation,
  useGetSpinVouchersQuery,
  useGetUserVouchersQuery,
} = voucherApi;
