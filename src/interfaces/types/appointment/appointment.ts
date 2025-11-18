import { IAppointment } from '~/domain/types/appointments/appointment.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IAppointmentsResponse = IResponse<IAppointment[]>;
export type IAppointmentsDetailsResponse = IResponse<IAppointment>;

export type IAppointmentDetailResponse = IAppointment;
