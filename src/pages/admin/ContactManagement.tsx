import React from 'react';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { IContact } from '~/domain/types/contact/contact.model';
import { Toastify } from '~/helpers/Toastify';
import {
  useGetContactsQuery,
  useDeleteContactMutation,
} from '~/services/contacts/contact.services';

const ContactManagement: React.FC = () => {
  const { data, isLoading, error, refetch } = useGetContactsQuery();
  const [deleteContact, { isLoading: isDeleting }] = useDeleteContactMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteContact(id).unwrap();
      refetch();
      Toastify('Xóa liên hệ thành công', 201);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  if (isLoading) {
    return (
      <div className="">
        <LoadingLocal />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg m-4">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Có lỗi xảy ra: {JSON.stringify(error)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Quản lý Liên hệ</h2>

      {data && data.data?.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((contact: IContact) => (
            <div
              key={contact._id ?? ''}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Tên</span>
                  </label>
                  <input
                    type="text"
                    value={contact.name}
                    readOnly
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Email</span>
                  </label>
                  <input
                    type="email"
                    value={contact.email}
                    readOnly
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Nội dung</span>
                  </label>
                  <textarea
                    value={contact.content}
                    readOnly
                    className="textarea textarea-bordered h-24"
                  />
                </div>

                <div className="card-actions justify-end mt-4">
                  <button
                    className={`btn btn-error text-white ${isDeleting ? 'loading' : ''}`}
                    onClick={() => handleDelete(contact._id ?? '')}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="">
          <div>
            <span>Không có dữ liệu liên hệ nào</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
