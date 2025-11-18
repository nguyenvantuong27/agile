import { ICartDetail } from '~/domain/types/cart-details/cart-details.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type ICartDetailResponse = IResponse<ICartDetail[]>;
export type ICartDetailItemResponse = ICartDetail;
