import { ICommentBlog } from '~/domain/types/comment-blogs/comment_blogs.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type ICommentsBlogResponse = IResponse<ICommentBlog[]>;
export type ICommentBlogDetailResponse = IResponse<ICommentBlog>;
