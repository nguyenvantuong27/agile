import { IUser } from '../user/user.model';

export interface ICategoriesMenu {
  _id?: string;
  name: string;
  create_by: IUser;
}
