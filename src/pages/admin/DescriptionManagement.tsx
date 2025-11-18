import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import {
  useGetDescriptionsQuery,
  useCreateDescriptionMutation,
  useUpdateDescriptionMutation,
  useDeleteDescriptionMutation,
} from '~/services/description/description.services';
import { useGetAllUsersQuery } from '~/services/users/user.services';
import { Button } from 'react-daisyui';
import { IDescription } from '~/domain/types/description/description.model';
import { Toastify } from '~/helpers/Toastify';

const DescriptionManagement: React.FC = () => {
  const {
    data: descriptionsData,
    isLoading,
    refetch,
  } = useGetDescriptionsQuery();
  const { data: usersData } = useGetAllUsersQuery();

  const [createDescription] = useCreateDescriptionMutation();
  const [updateDescription] = useUpdateDescriptionMutation();
  const [deleteDescription] = useDeleteDescriptionMutation();

  const [selectedDescription, setSelectedDescription] =
    useState<IDescription | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<IDescription>();

  const handleEditDescription = (description: IDescription) => {
    setSelectedDescription(description);
    setValue(
      'user_id',
      typeof description.user_id === 'object'
        ? description.user_id?._id || ''
        : '',
    );
    setValue('rating', description.rating);
    setValue('description', description.description);
    setShowModal(true);
  };

  const handleDeleteDescription = async (id: string) => {
    await deleteDescription(id);
    Toastify('Xóa mô tả thành công', 201);
    refetch();
  };

  const onSubmit = async (data: IDescription) => {
    if (selectedDescription) {
      await updateDescription({ id: selectedDescription._id!, data });
      Toastify('Cập nhật mô tả thành công', 201);
    } else {
      await createDescription(data);
      Toastify('Thêm mô tả thành công', 201);
    }
    reset();
    setShowModal(false);
    refetch();
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">Đánh giá nhân viên</h1>
      <Button
        color="primary"
        onClick={() => {
          setSelectedDescription(null);
          setShowModal(true);
        }}
      >
        <FaPlus /> Thêm mô tả
      </Button>

      <table className="table table-zebra w-full mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Người pha chế</th>
            <th>Rating</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            descriptionsData?.data?.map((desc) => {
              return (
                <tr key={desc._id}>
                  <td>{desc._id}</td>
                  <td>
                    {typeof desc.user_id === 'object'
                      ? desc.user_id?.full_name
                      : ''}
                  </td>
                  <td>{desc.rating}</td>
                  <td>{desc.description}</td>
                  <td className="flex items-center">
                    <Button
                      color="success"
                      onClick={() => handleEditDescription(desc)}
                    >
                      <FaEdit /> Sửa
                    </Button>
                    <Button
                      onClick={() => handleDeleteDescription(desc._id!)}
                      color="error"
                      className="ml-2"
                    >
                      <FaTrash /> Xóa
                    </Button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">
              {selectedDescription ? 'Chỉnh sửa mô tả' : 'Thêm mô tả'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <label className="block text-sm font-medium">
                Người đánh giá:
              </label>
              <div>
                <label className="label">Chọn nhân viên</label>
                <select
                  {...register('user_id', { required: true })}
                  className="select select-bordered w-full"
                >
                  <option value="">Chọn nhân viên</option>
                  {usersData?.data
                    .filter((user) => user.role === 'artist')
                    .map((user) => (
                      <option key={user._id} value={user._id}>
                        {user?.full_name} - {user.branch_id?.name}
                      </option>
                    ))}
                </select>
              </div>

              <input
                {...register('rating')}
                type="number"
                placeholder="Rating (1-5)"
                className="input input-bordered w-full my-2"
                min={1}
                max={5}
              />
              <input
                {...register('description')}
                type="text"
                placeholder="Nhập mô tả"
                className="input input-bordered w-full my-2"
              />

              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {selectedDescription ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default DescriptionManagement;
