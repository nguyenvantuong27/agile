import { IAppointment } from '../appointments/appointment.model';
import { IUser } from '../user/user.model';

export interface IReview {
  _id?: string;
  appointment_id: IAppointment | string;
  user_id: IUser | string;
  rating: number;
  comments: string;
  createdAt?: string;
  updatedAt?: string;
}
