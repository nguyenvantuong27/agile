import { IPayment } from '~/domain/types/payment/payment.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IPaymentsResponse = IResponse<IPayment[]>;
export type IPaymentDetailResponse = IPayment;
