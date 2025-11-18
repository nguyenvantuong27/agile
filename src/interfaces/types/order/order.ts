import { IOrder } from '~/domain/types/order/order.model';

interface IResponse<T> {
  vnpayUrl: string;
  status: number;
  message?: string;
  length: number;
  data: T;
}

export type IOrdersResponse = IResponse<IOrder[]>;
export type IOrderDetailResponse = IOrder;
