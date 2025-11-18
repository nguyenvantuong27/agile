import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import { ICommentBlog } from '~/domain/types/comment-blogs/comment_blogs.model';
import {
  ICommentBlogDetailResponse,
  ICommentsBlogResponse,
} from '~/interfaces/types/comment-blog/comment_blog';

export const commentBlogApi = createApi({
  reducerPath: 'commentBlogApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Comments'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getCommentsByBlog: builder.query<ICommentsBlogResponse, string>({
      query: (blogId) => `/api/v1/comments-blogs/${blogId}`,
      providesTags: ['Comments'],
    }),

    getCommentById: builder.query<ICommentsBlogResponse, string>({
      query: (id) => `/api/v1/comments-blogs/detail/${id}`,
      providesTags: ['Comments'],
    }),

    createComment: builder.mutation<ICommentBlogDetailResponse, ICommentBlog>({
      query: (commentData) => ({
        url: '/api/v1/comments-blogs',
        method: 'POST',
        body: commentData,
      }),
      invalidatesTags: ['Comments'],
    }),

    updateComment: builder.mutation<
      ICommentsBlogResponse,
      { id: string; data: ICommentBlog }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/comments-blogs/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Comments'],
    }),

    deleteComment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/comments-blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Comments'],
    }),
  }),
});

export const {
  useGetCommentsByBlogQuery,
  useGetCommentByIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentBlogApi;
