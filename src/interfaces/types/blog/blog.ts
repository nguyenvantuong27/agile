import { IBlog } from '~/domain/types/blog/blog.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IBlogsResponse = IResponse<IBlog[]>;
export type IBlogDetailResponse = IResponse<IBlog>;
