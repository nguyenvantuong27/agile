import { IOrderDetail } from '~/domain/types/order-details/order-details.model';

interface IResponse<T> {
  status: number;
  message?: string;
  length: number;
  data: T;
}

export type IOrderDetailsResponse = IResponse<IOrderDetail[]>;
export type IOrderDetailResponse = IOrderDetail;
