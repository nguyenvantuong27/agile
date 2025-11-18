import React, { useState } from 'react';
import { Button, Modal, Pagination } from 'react-daisyui';
import { MdDelete, MdLock, MdLockOpen } from 'react-icons/md';
import { IoPersonAdd } from 'react-icons/io5';
import { useForm } from 'react-hook-form';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { Toastify } from '~/helpers/Toastify';
import {
  useDeleteEmployeeMutation,
  useGetUsersWithRoleUserQuery,
  usePatchUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
} from '~/services/users/user.services';
import { IUser } from '~/domain/types/user/user.model';
import { statusUser } from '~/interfaces/enum/statusUser';

const CustomerManagement: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, error, isLoading, refetch } = useGetUsersWithRoleUserQuery({
    limit,
    page,
  });
  const [deleteUser] = useDeleteEmployeeMutation();
  const [patchUser] = usePatchUserMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: {
      patch?: boolean;
      block?: boolean;
      unblock?: boolean;
      delete?: boolean;
    };
  }>({});

  const { register, handleSubmit, reset, setValue } = useForm<IUser>();

  if (isLoading) return <LoadingLocal />;
  if (error)
    return (
      <div className="text-center text-red-500">
        Lỗi khi tải danh sách khách hàng
      </div>
    );

  const filteredData = (data?.data || []).filter(
    (user: IUser) => user.verificationCode === null,
  );
  const totalPages = data?.totalPages || 1;

  const setLoadingState = (
    userId: string,
    action: string,
    isLoading: boolean,
  ) => {
    setLoadingStates((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [action]: isLoading,
      },
    }));
  };

  const handleDelete = async (id: string) => {
    setLoadingState(id, 'delete', true);
    try {
      await deleteUser({ id }).unwrap();
      Toastify('Xóa khách hàng thành công', 201);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    } finally {
      setLoadingState(id, 'delete', false);
    }
  };

  const handleBlock = async (id: string) => {
    setLoadingState(id, 'block', true);
    try {
      await blockUser({ id }).unwrap();
      Toastify('Khóa tài khoản thành công', 200);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    } finally {
      setLoadingState(id, 'block', false);
    }
  };

  const handleUnblock = async (id: string) => {
    setLoadingState(id, 'unblock', true);
    try {
      await unblockUser({ id }).unwrap();
      Toastify('Hủy khóa tài khoản thành công', 200);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    } finally {
      setLoadingState(id, 'unblock', false);
    }
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setValue('full_name', user.full_name);
    setValue('email', user.email);
    setValue('phone', user.phone);
    setValue('sex', user.sex);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: IUser) => {
    if (!selectedUser?._id) return;
    setLoadingState(selectedUser._id, 'patch', true);
    try {
      await patchUser({ id: selectedUser._id, data }).unwrap();
      Toastify('Cập nhật thông tin khách hàng thành công', 200);
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    } finally {
      setLoadingState(selectedUser._id, 'patch', false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Danh sách khách hàng ({filteredData.length})
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map((user) => (
            <div
              key={user._id}
              className="bg-white shadow-lg rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.image}
                  alt="Ảnh đại diện"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm">
                  <span className="font-medium">Trạng thái:</span>{' '}
                  {user.status === statusUser.INACTIVE ? (
                    <span className="text-red-500 font-semibold">
                      Chưa duyệt
                    </span>
                  ) : user.status === statusUser.ACTIVE ? (
                    <span className="text-green-500 font-semibold">
                      Đã duyệt
                    </span>
                  ) : (
                    <span className="text-orange-500 font-semibold">
                      Đã khóa
                    </span>
                  )}
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  color="success"
                  size="sm"
                  className="text-white"
                  onClick={() => handleEdit(user)}
                  disabled={user._id ? loadingStates[user._id]?.patch : false}
                >
                  <IoPersonAdd className="mr-1 text-white" /> Cập nhật
                </Button>
                {user.status === statusUser.BLOCKED ? (
                  <Button
                    color="warning"
                    size="sm"
                    className="text-white"
                    onClick={() => user._id && handleUnblock(user._id)}
                    disabled={
                      user._id ? loadingStates[user._id]?.unblock : false
                    }
                  >
                    <MdLockOpen className="mr-1 text-white" /> Hủy khóa
                  </Button>
                ) : (
                  <Button
                    color="error"
                    size="sm"
                    className="text-white"
                    onClick={() => user._id && handleBlock(user._id)}
                    disabled={user._id ? loadingStates[user._id]?.block : false}
                  >
                    <MdLock className="mr-1 text-white" /> Khóa
                  </Button>
                )}
                <Button
                  color="error"
                  size="sm"
                  className="text-white hidden"
                  onClick={() => user._id && handleDelete(user._id)}
                  disabled={user._id ? loadingStates[user._id]?.delete : false}
                >
                  <MdDelete className="mr-1 text-white" /> Xóa
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            Không có khách hàng nào đã xác thực
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination>
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              size="sm"
            >
              Trước
            </Button>
            <span className="px-4 text-sm">
              Trang {page} / {totalPages}
            </span>
            <Button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              size="sm"
            >
              Sau
            </Button>
          </Pagination>
        </div>
      )}

      {isModalOpen && selectedUser && (
        <Modal open={isModalOpen}>
          <Modal.Header>
            <h3 className="text-lg font-bold">Cập nhật thông tin khách hàng</h3>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Họ và tên</label>
                <input
                  {...register('full_name', { required: true })}
                  className="input input-bordered w-full"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="Nhập email"
                />
              </div>
              <div>
                <label className="label">Số điện thoại</label>
                <input
                  {...register('phone', { required: true })}
                  className="input input-bordered w-full"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="label">Giới tính</label>
                <select
                  {...register('sex', { required: true })}
                  className="select select-bordered w-full"
                >
                  <option value={0}>Nam</option>
                  <option value={1}>Nữ</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="submit"
                  color="primary"
                  disabled={
                    selectedUser._id
                      ? loadingStates[selectedUser._id]?.patch
                      : false
                  }
                >
                  {selectedUser._id && loadingStates[selectedUser._id]?.patch
                    ? 'Đang cập nhật...'
                    : 'Cập nhật'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={
                    selectedUser._id
                      ? loadingStates[selectedUser._id]?.patch
                      : false
                  }
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default CustomerManagement;
