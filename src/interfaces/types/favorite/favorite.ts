import { IFavorite } from '~/domain/types/favorite/favorite.model';

export interface IFavoritesResponse {
  status: number;
  message?: string;
  length: number;
  data: IFavorite[];
}
