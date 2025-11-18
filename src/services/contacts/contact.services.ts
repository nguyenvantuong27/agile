import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../auth/auth.services';
import { IContactResponse } from '~/interfaces/types/contact/contact';
import { IContact } from '~/domain/types/contact/contact.model';

export const contactApi = createApi({
  reducerPath: 'contactApi',
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 60,
  endpoints: (builder) => ({
    getContacts: builder.query<IContactResponse, void>({
      query: () => '/api/v1/contacts',
    }),

    getContactById: builder.query<IContactResponse, string>({
      query: (id) => `/api/v1/contacts/${id}`,
    }),

    createContact: builder.mutation<IContactResponse, IContact>({
      query: (contactData) => ({
        url: '/api/v1/contacts',
        method: 'POST',
        body: contactData,
      }),
    }),

    updateContact: builder.mutation<
      IContactResponse,
      { id: string; data: Partial<IContact> }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/contacts/${id}`,
        method: 'PATCH',
        body: data,
      }),
    }),

    deleteContact: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/contacts/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetContactsQuery,
  useGetContactByIdQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;
