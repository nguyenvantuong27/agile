import { IListProduct } from '../list_product/list_product.model';

export interface IBranch {
  _id?: string;
  list_product_id: IListProduct;
  name: string;
  address: string;
  phone: number;
  status: string;
  description: string;
  created_at: string;
  updated_at: string;
}
