import { ICategoriesMenu } from '../../../domain/types/categories_menu/categories_menu.model.ts';

interface IResponse<T> {
  status: number;
  message: string;
  data: T;
}

export type ICategoriesMenuResponse = IResponse<ICategoriesMenu[]>;
export type ICategoriesMenuDetailsResponse = IResponse<ICategoriesMenu>;
