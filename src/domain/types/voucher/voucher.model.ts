import { IUser } from '../user/user.model';

export interface IVoucher {
  _id?: string;
  code: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  minOrderValue?: number;
  maxDiscount?: number | null;
  expirationDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount?: number;
  usedBy?: IUser[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserVoucher {
  _id?: string;
  voucherId: IVoucher | string;
  userId: IUser | string;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
