import { IProduct } from '../product/product.model';
import { IUser } from '../user/user.model';

export interface IFavorite {
  _id: string;
  user_id: IUser;
  product_id: IProduct;
}
