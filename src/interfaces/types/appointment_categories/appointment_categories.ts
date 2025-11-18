import { IAppointmentCategory } from '~/domain/types/appointment_categories/appointment_categories.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IAppointmentCategoryResponse = IResponse<IAppointmentCategory[]>;

export type IAppointmentCategoryDetailResponse =
  IResponse<IAppointmentCategory>;
