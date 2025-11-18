import { ICategoriesMenu } from '../categories_menu/categories_menu.model';
import { IListProduct } from '../list_product/list_product.model';

export interface IProduct {
  sold: number;
  _id: string;
  list_product_id: IListProduct[] | string[];
  category_id: ICategoriesMenu | string;
  name: string;
  price: number;
  price_sale: number;
  description: string;
  image: string;
  sub_image: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
