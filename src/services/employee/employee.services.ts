import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services'; // base query để bảo mật
import queryBuilder from '~/hooks/queryBuilder'; // Tạo query với các tham số động như phân trang
import {
  IEmployeeDetailResponse,
  IEmployeeResponse,
} from '~/interfaces/types/employee/employee'; // Định nghĩa các type của employee

export const employeeApi = createApi({
  reducerPath: 'employeeApi', // Đặt tên cho reducer của API
  baseQuery: baseQueryWithReauth, // Sử dụng base query với xác thực
  keepUnusedDataFor: 60, // Dữ liệu sẽ được lưu trữ trong 60 giây
  endpoints: (builder) => ({
    // Lấy danh sách employee với phân trang
    getEmployeesWithPagination: builder.query<
      IEmployeeResponse,
      { limit: number; page: number }
    >({
      query: ({ limit, page }) =>
        queryBuilder('/api/v1/employees', { limit, page }),
    }),

    // Lấy thông tin employee theo ID
    getEmployeeById: builder.query<IEmployeeDetailResponse, string>({
      query: (id) => `/api/v1/employees/${id}`,
    }),

    // Thêm mới employee
    createEmployee: builder.mutation<
      IEmployeeDetailResponse,
      { full_name: string; email: string; phone: string; sex: number }
    >({
      query: (newEmployee) => ({
        url: '/api/v1/employees',
        method: 'POST',
        body: newEmployee,
      }),
    }),

    // Cập nhật thông tin employee theo ID
    updateEmployeeById: builder.mutation<
      IEmployeeDetailResponse,
      {
        id: string;
        full_name: string;
        email: string;
        phone: string;
        sex: number;
      }
    >({
      query: ({ id, ...updatedData }) => ({
        url: `/api/v1/employees/${id}`,
        method: 'PATCH',
        body: updatedData,
      }),
    }),

    // Xóa employee theo ID
    deleteEmployee: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/employees/${id}`,
        method: 'DELETE',
      }),
    }),

    // Cập nhật trạng thái của employee (active/inactive)
    updateEmployeeStatus: builder.mutation<
      void,
      { id: string; status: number }
    >({
      query: ({ id, status }) => ({
        url: `/api/v1/employees/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
    }),
  }),
});

export const {
  useGetEmployeesWithPaginationQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeByIdMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeStatusMutation,
} = employeeApi;
