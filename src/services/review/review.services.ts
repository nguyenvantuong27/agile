import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import {
  IReviewDetailResponse,
  IReviewsResponse,
} from '~/interfaces/types/review/review';
import { IReview } from '~/domain/types/review/review.model';

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getReviews: builder.query<IReviewsResponse, void>({
      query: () => '/api/v1/reviews',
    }),
    getReviewById: builder.query<IReviewDetailResponse, string>({
      query: (id) => `/api/v1/reviews/${id}`,
    }),
    createReview: builder.mutation<IReviewDetailResponse, IReview>({
      query: (reviewData) => ({
        url: '/api/v1/reviews',
        method: 'POST',
        body: reviewData,
      }),
    }),
    deleteReview: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/reviews/${id}`,
        method: 'DELETE',
      }),
    }),
    updateReview: builder.mutation<
      IReviewDetailResponse,
      { id: string; data: Partial<IReview> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/reviews/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} = reviewApi;
