import { IContact } from '~/domain/types/contact/contact.model';

interface IResponse<T> {
  status: number;
  message: string;
  length: number;
  data: T;
  total: number;
}

export type IContactResponse = IResponse<IContact[]>;
