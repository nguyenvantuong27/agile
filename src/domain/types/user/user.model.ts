import { roleUser } from '~/interfaces/enum/roleUser';
import { IBranch } from '../branches/branches.model';

export interface IUserLogin {
  _id?: string;
  token: string;
  refreshToken: string;
  branch_id: string;
  username: string;
  password: string;
  address: string;
  full_name: string;
  email: string;
  phone: string;
  status: number;
  sex: number;
  image: string;
  role: string;
  verificationCode: string | null;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  offlineSince: string | null;
}

export interface IUser {
  userId: string | undefined;
  _id?: string;

  token: string;
  refreshToken: string;
  branch_id: IBranch;
  address: string;
  username: string;
  password: string;
  full_name: string;
  email: string;
  phone: string;
  status: number;
  sex: number;
  image: string;
  role: roleUser;
  verificationCode: string | null;
  createdAt: string;
  updatedAt: string;
  isOnline: boolean;
  offlineSince: string | null;
}
