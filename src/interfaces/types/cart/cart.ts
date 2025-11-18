import { ICart } from '~/domain/types/cart/cart.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type ICartsResponse = IResponse<ICart[]>;
export type ICartDetailResponse = ICart;
