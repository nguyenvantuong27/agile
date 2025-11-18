import { IComment } from '~/domain/types/comments/comments.model';

interface IResponse<T> {
  status: number;
  length: number;
  data: T;
}

export type ICommentsResponse = IResponse<IComment[]>;
export type ICommentResponse = IComment;
