import { ITattoo } from '~/domain/types/tattoo/tattoo.model';

interface IResponse<T> {
  status: number;
  length: number;
  data: T;
}

export type ITattoosResponse = IResponse<ITattoo[]>;
export type ITattooDetailResponse = ITattoo;
