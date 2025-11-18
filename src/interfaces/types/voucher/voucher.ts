import { IUserVoucher, IVoucher } from '~/domain/types/voucher/voucher.model';

interface IResponse<T> {
  status: number;
  message?: string;
  length?: number;
  data: T;
  total?: number;
}

export type IVouchersResponse = IResponse<IVoucher[]>;
export type IVoucherDetailResponse = IVoucher;
export type IVoucherCreateResponse = IResponse<IVoucher>;
export type IVoucherUserResponse = IResponse<IUserVoucher>;
