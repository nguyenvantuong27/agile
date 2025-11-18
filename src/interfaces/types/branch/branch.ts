import { IBranch } from '~/domain/types/branches/branches.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IBranchesResponse = IResponse<IBranch[]>;
export type IBranchDetailResponse = IResponse<IBranch>;
