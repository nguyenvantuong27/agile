import { IAppointmentCategory } from '../appointment_categories/appointment_categories.model';
import { IUser } from '../user/user.model';

export interface ITattoo {
  _id: string;
  artist_id: IUser | string;
  category_appointment: IAppointmentCategory | string;
  price: number;
  title: string;
  image: string;
  description: string;
  suggested_positions: string[];
  createdAt: string;
  updatedAt: string;
}
