import { IUser } from '../../../domain/types/user/user.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
  totalPages: number;
  currentPage: number;
}

export type IUsersResponse = IResponse<IUser[]>;
export type IUsersDetailResponse = IResponse<IUser>;
