import { IProduct } from '~/domain/types/product/product.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IProductsResponse = IResponse<IProduct[]>;
export type IProductDetailResponse = IProduct;
