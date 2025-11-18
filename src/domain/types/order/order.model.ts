import { OrderStatus } from '~/interfaces/enum/order.enum';
import { IUser } from '../user/user.model';

export interface IOrder {
  _id?: string;
  user_id: IUser | string;
  total?: number;
  discount?: number;
  finalTotal?: number;
  phone: string;
  address: string;
  paymentMethod?: 'COD' | 'VNPAY';
  voucherCode?: string;
  status?: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}
