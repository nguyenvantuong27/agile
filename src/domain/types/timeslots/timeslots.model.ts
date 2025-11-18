import { IUser } from '../user/user.model';

export interface ITimeslot {
  _id?: string;
  user_id: IUser | string;
  day_of_week: string;
  startTime: string;
  endTime: string;
  max_appointment: number;
  created_at: string;
  updated_at: string;
}
