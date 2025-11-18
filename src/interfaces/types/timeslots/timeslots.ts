import { ITimeslot } from '~/domain/types/timeslots/timeslots.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type ITimeslotsResponse = IResponse<ITimeslot[]>;
export type ITimeslotDetailResponse = ITimeslot;
