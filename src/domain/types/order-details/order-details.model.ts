import { IOrder } from '../order/order.model';
import { IProduct } from '../product/product.model';

export interface IOrderDetail {
  _id?: string;
  order_id: IOrder | string;
  product_id: IProduct | string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}
