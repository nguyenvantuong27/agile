import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import { IBlog } from '../../domain/types/blog/blog.model';
import {
  IBlogDetailResponse,
  IBlogsResponse,
} from '../../interfaces/types/blog/blog';
import { IBlogLike } from '~/domain/types/blog_like/blog_like.model';

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Blogs'],
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getBlogs: builder.query<IBlogsResponse, void>({
      query: () => '/api/v1/blogs',
      providesTags: ['Blogs'],
    }),

    getBlogById: builder.query<IBlogDetailResponse, string>({
      query: (id) => `/api/v1/blogs/${id}`,
      providesTags: ['Blogs'],
    }),

    createBlog: builder.mutation<IBlogDetailResponse, IBlog>({
      query: (blogData) => ({
        url: '/api/v1/blogs',
        method: 'POST',
        body: blogData,
      }),
      invalidatesTags: ['Blogs'],
    }),

    updateBlog: builder.mutation<
      IBlogDetailResponse,
      { id: string; data: IBlog }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/blogs/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Blogs'],
    }),

    deleteBlog: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blogs'],
    }),

    likeBlog: builder.mutation<
      { message: string },
      { userId: string; blogId: string }
    >({
      query: ({ userId, blogId }) => ({
        url: '/api/v1/blogs/like',
        method: 'POST',
        body: { userId, blogId },
      }),
      invalidatesTags: ['Blogs'],
    }),

    getLikesByBlog: builder.query<
      { totalLikes: number; data: IBlogLike[] },
      string
    >({
      query: (blogId) => `/api/v1/blogs/${blogId}/likes`,
      providesTags: ['Blogs'],
    }),
    getLikesByUser: builder.query<
      { totalLikes: number; data: IBlog[] },
      string
    >({
      query: (userId) => `/api/v1/blogs/likes/user/${userId}`,
      providesTags: ['Blogs'],
    }),
    unlikeBlog: builder.mutation<
      { message: string },
      { userId: string; blogId: string }
    >({
      query: ({ userId, blogId }) => ({
        url: '/api/v1/blogs/unlike',
        method: 'POST',
        body: { userId, blogId },
      }),
      invalidatesTags: ['Blogs'],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useLikeBlogMutation,
  useGetLikesByBlogQuery,
  useGetLikesByUserQuery,
  useUnlikeBlogMutation,
} = blogApi;
