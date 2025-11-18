import { IUser } from '../user/user.model';

export interface ICart {
  _id?: string;
  user_id: IUser | string;
  total: number;
}
