import { useState } from 'react';
import { FaEnvelope, FaPhone, FaBuilding, FaEdit } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button, Modal } from 'react-daisyui';
import { Toastify } from '~/helpers/Toastify';
import {
  useGetEmployeeByIdQuery,
  usePatchUserMutation,
} from '~/services/users/user.services';
import { IUser } from '~/domain/types/user/user.model';

const EmployeeProfile = () => {
  const { id } = useParams();
  const { data: user, isLoading, refetch } = useGetEmployeeByIdQuery(id || '');
  const [patchUser, { isLoading: isPatching }] = usePatchUserMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<IUser>();

  if (isLoading) return <p>Đang tải thông tin nhân viên...</p>;

  const handleEdit = () => {
    if (user?.data) {
      setValue('full_name', user.data.full_name);
      setValue('email', user.data.email);
      setValue('phone', user.data.phone);
      setValue('sex', user.data.sex);
      setValue('image', user.data.image);
      setIsModalOpen(true);
    }
  };

  const onSubmit = async (data: IUser) => {
    if (!id) return;
    try {
      await patchUser({ id, data }).unwrap();
      Toastify('Cập nhật thông tin thành công', 200);
      setIsModalOpen(false);
      reset();
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Hồ sơ quản trị</h1>
        <Button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleEdit}
          disabled={isPatching}
        >
          <FaEdit /> Chỉnh sửa
        </Button>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <span
          className={`px-3 py-1 rounded-full ${user?.data.status === 1 ? 'bg-green-500' : 'bg-primary'} text-white`}
        >
          {user?.data.status === 1 ? 'Đang làm việc' : 'Không hoạt động'}
        </span>
        <span className="text-gray-600">Mã nhân viên: {user?.data._id}</span>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md col-span-1">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
            <img
              src={user?.data.image}
              alt=""
              className="rounded-full w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-center mt-4">
            {user?.data.full_name}
          </h2>
          <p className="text-gray-600 text-center">{user?.data.role}</p>
          <div className="mt-6 space-y-3">
            <p className="flex items-center gap-2">
              <FaEnvelope className="text-gray-500" /> {user?.data.email}
            </p>
            <p className="flex items-center gap-2">
              <FaPhone className="text-gray-500" /> {user?.data.phone}
            </p>
            <p className="flex items-center gap-2">
              <FaBuilding className="text-gray-500" />{' '}
              {user?.data.branch_id?.name}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h3 className="text-xl font-bold">Thông tin Hồ sơ</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-gray-600">Ngày tạo</p>
              <p className="font-semibold">{user?.data.createdAt}</p>
            </div>
            <div>
              <p className="text-gray-600">Cập nhật lần cuối</p>
              <p className="font-semibold">{user?.data.updatedAt}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md mt-6 flex gap-6">
        <Link
          to="#"
          className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-2"
        >
          Hồ sơ
        </Link>
        <Link to="#" className="text-gray-600 hover:text-blue-600">
          Việc làm
        </Link>
        <Link to="#" className="text-gray-600 hover:text-blue-600">
          Tài liệu
        </Link>
      </div>

      {/* Modal chỉnh sửa thông tin */}
      {isModalOpen && user?.data && (
        <Modal open={isModalOpen}>
          <Modal.Header>
            <h3 className="text-lg font-bold">Chỉnh sửa thông tin</h3>
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
              <div>
                <label className="label">Ảnh đại diện (URL)</label>
                <input
                  {...register('image')}
                  className="input input-bordered w-full"
                  placeholder="Nhập URL ảnh đại diện"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="submit" color="primary" disabled={isPatching}>
                  {isPatching ? 'Đang cập nhật...' : 'Cập nhật'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPatching}
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

export default EmployeeProfile;
