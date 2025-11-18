import { createApi } from '@reduxjs/toolkit/query/react';
import {
  IUsersDetailResponse,
  IUsersResponse,
} from '~/interfaces/types/user/user';
import { baseQueryWithReauth } from '../auth/auth.services';
import { IUser } from '~/domain/types/user/user.model';
import queryBuilder from '~/hooks/queryBuilder';

export const usersApi = createApi({
  reducerPath: 'employee_detailApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getEmployeeById: builder.query<IUsersDetailResponse, string>({
      query: (id) => `/api/v1/users/${id}`,
    }),
    getUserById: builder.query<IUsersDetailResponse, string>({
      query: (id) => `/api/v1/users/${id}`,
    }),
    getEmployeeDetail: builder.query<IUsersResponse, void>({
      query: () => '/api/v1/users/pending',
    }),
    getEmployeeDetailById: builder.query<IUsersResponse, string>({
      query: (id) => `/api/v1/users/active/${id}`,
    }),
    getEmployeeApprove: builder.query<IUsersResponse, void>({
      query: () => '/api/v1/users/active',
    }),
    getUsersWithPagination: builder.query<
      IUsersResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/users/active', { limit, page }),
    }),
    getAllUsers: builder.query<IUsersResponse, void>({
      query: () => '/api/v1/users',
    }),
    updateEmployeeStatus: builder.mutation<
      void,
      { id: string; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/v1/users/update-status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
    }),
    downloadUserExcel: builder.mutation<Blob, void>({
      query: () => ({
        url: `/api/v1/users/export/excel-user`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
    updateEmployeeRole: builder.mutation<void, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/api/v1/users/role/${id}`,
        method: 'PATCH',
        body: { role },
      }),
    }),
    updateEmployeeById: builder.mutation<
      void,
      {
        id: string;
        full_name: string;
        email: string;
        phone: string;
        sex: number;
      }
    >({
      query: ({ id, full_name, email, phone, sex }) => ({
        url: `/api/v1/users/update/${id}`,
        method: 'PATCH',
        body: { full_name, email, phone, sex },
      }),
    }),
    patchUser: builder.mutation<
      IUsersResponse,
      { id: string; data: Partial<IUser> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/users/update/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
    deleteEmployee: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/users/delete/${id}`,
        method: 'DELETE',
      }),
    }),
    patchUserRole: builder.mutation<void, { id: string; role: string }>({
      query: ({ id, role }) => ({
        url: `/api/v1/users/role/${id}`,
        method: 'PATCH',
        body: { role },
      }),
    }),
    getUserByBranchID: builder.query<IUsersResponse, string>({
      query: (branch_id) => `/api/v1/users/branch/${branch_id}`,
    }),
    getUsersWithRoleUser: builder.query<
      IUsersResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/users/role-user', { limit, page }),
    }),
    getUsersWithArtistOrEmployeeRole: builder.query<
      IUsersResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/users/role-artist-employee', { limit, page }),
    }),
    blockUser: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/users/block/${id}`,
        method: 'PATCH',
      }),
    }),
    unblockUser: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/users/unblock/${id}`,
        method: 'PATCH',
      }),
    }),
    createUserAddress: builder.mutation<void, { id: string; address: string }>({
      query: ({ id, address }) => ({
        url: `/api/v1/users/address/${id}`,
        method: 'POST',
        body: { address },
      }),
    }),
    updateUserAddress: builder.mutation<void, { id: string; address: string }>({
      query: ({ id, address }) => ({
        url: `/api/v1/users/address/${id}`,
        method: 'PATCH',
        body: { address },
      }),
    }),
  }),
});

export const {
  useGetEmployeeByIdQuery,
  useGetUserByIdQuery,
  useGetUsersWithPaginationQuery,
  useGetEmployeeDetailQuery,
  useGetEmployeeDetailByIdQuery,
  useGetEmployeeApproveQuery,
  useGetAllUsersQuery,
  useUpdateEmployeeStatusMutation,
  useUpdateEmployeeRoleMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeByIdMutation,
  usePatchUserMutation,
  usePatchUserRoleMutation,
  useDownloadUserExcelMutation,
  useGetUsersWithRoleUserQuery,
  useGetUsersWithArtistOrEmployeeRoleQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useCreateUserAddressMutation,
  useUpdateUserAddressMutation,
} = usersApi;
