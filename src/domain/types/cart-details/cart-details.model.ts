import { ICart } from '../cart/cart.model';
import { IProduct } from '../product/product.model';

export interface ICartDetail {
  _id?: string;
  cart_id: ICart | string;
  product_id: IProduct | string;
  quantity: number;
}
