import { IProduct } from '../product/product.model';
import { IUser } from '../user/user.model';

export interface IComment {
  _id: string;
  product_id: IProduct;
  user_id: IUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}
