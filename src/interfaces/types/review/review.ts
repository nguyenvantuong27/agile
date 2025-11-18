import { IReview } from '~/domain/types/review/review.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IReviewsResponse = IResponse<IReview[]>;
export type IReviewDetailResponse = IReview;
