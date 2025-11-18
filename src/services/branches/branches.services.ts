import { createApi } from '@reduxjs/toolkit/query/react'; // Đúng

import {
  IBranchDetailResponse,
  IBranchesResponse,
} from '~/interfaces/types/branch/branch';
import { baseQueryWithReauth } from '../auth/auth.services';
import { IBranch } from '~/domain/types/branches/branches.model';
import queryBuilder from '~/hooks/queryBuilder';

export const branchApi = createApi({
  reducerPath: 'branchApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getBranches: builder.query<IBranchesResponse, void>({
      query: () => '/api/v1/branches',
    }),
    getBranchesPagination: builder.query<
      IBranchesResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/branches', { limit, page }),
    }),
    getBranchById: builder.query<IBranchDetailResponse, string>({
      query: (id) => `/api/v1/branches/${id}`,
    }),
    createBranch: builder.mutation<IBranchDetailResponse, IBranch>({
      query: (branchData) => ({
        url: '/api/v1/branches',
        method: 'POST',
        body: branchData,
      }),
    }),
    deleteBranch: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/branches/${id}`,
        method: 'DELETE',
      }),
    }),
    patchBranch: builder.mutation<
      IBranchDetailResponse,
      { id: string; data: IBranch }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/branches/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetBranchesQuery,
  useGetBranchesPaginationQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useDeleteBranchMutation,
  usePatchBranchMutation,
} = branchApi;
