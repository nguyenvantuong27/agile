import { IDescription } from '~/domain/types/description/description.model';

interface IResponse<T> {
  status: number;
  length: number;
  data: T;
}

export type IDescriptionsResponse = IResponse<IDescription[]>;
export type IDescriptionDetailResponse = IDescription;
