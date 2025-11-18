import { IListProduct } from '~/domain/types/list_product/list_product.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IListProductResponse = IResponse<IListProduct[]>;
export type IListProductDetailResponse = IListProduct;
