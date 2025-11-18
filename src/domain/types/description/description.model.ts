import { IUser } from '~/domain/types/user/user.model';

export interface IDescription {
  _id: string;
  user_id: IUser | string;
  rating: number;
  description: string;
  __v?: number;
}
