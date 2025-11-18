export const gioitinh = [
  { id: 0, name: 'Nam' },
  { id: 1, name: 'Nữ' },
  { id: 2, name: 'Khác' },
];

export const role = [{ id: 3, name: 'employee' }];

export enum ROLE {
  USER = 'user',

  ADMIN = 'admin',
  EMPLOYEE = 'artist',
  ARTIST = 'employee',
}

export enum activeAppointments {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CUSTOMER_CANCELED = 'customer_canceled',
  CANCELED = 'canceled',
}
