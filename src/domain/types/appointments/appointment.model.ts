import { IBranch } from '../branches/branches.model';
import { ITattoo } from '../tattoo/tattoo.model';
import { ITimeslot } from '../timeslots/timeslots.model';
import { IUser } from '../user/user.model';

export interface IAppointment {
  _id: string;
  user_id: IUser | string;
  customer_id: IUser | string;
  branch_id: IBranch | string;
  tattoo_id: ITattoo | string;
  timeslot_id: ITimeslot | string;
  phone: string;
  email: string;
  date: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
