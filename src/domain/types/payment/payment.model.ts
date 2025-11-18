import { IAppointment } from '~/domain/types/appointments/appointment.model';
import { paymentMethod, paymentStatus } from '~/interfaces/enum/payment.enum';

export interface IPayment {
  _id: string;
  appointment_id: IAppointment;
  amount: number;
  payment_method: paymentMethod;
  status: paymentStatus;
  createdAt: string;
  updatedAt: string;
}
