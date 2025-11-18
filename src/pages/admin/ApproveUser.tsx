import React from 'react';
import { Table, Button } from 'react-daisyui';
import { IoPersonAdd } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { Toastify } from '~/helpers/Toastify';
import {
  useDeleteEmployeeMutation,
  useGetEmployeeDetailQuery,
  useUpdateEmployeeStatusMutation,
} from '~/services/users/user.services';

const ApproveUser: React.FC = () => {
  const { data, error, isLoading, refetch } = useGetEmployeeDetailQuery();
  const [approveUser, { isLoading: isApproving }] =
    useUpdateEmployeeStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteEmployeeMutation();

  if (isLoading) return <LoadingLocal />;
  if (error) return <div>Lỗi khi tải danh sách nhân viên</div>;

  const handleApprove = async (id: string) => {
    try {
      await approveUser({ id, status: 1 }).unwrap();
      Toastify('Duyệt nhân viên thành công', 201);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser({ id }).unwrap();
      Toastify('Xóa nhân viên thành công', 201);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Duyệt nhân viên</h2>
      <Table className="w-full border">
        <Table.Head className="text-center">
          <span>#</span>
          <span>Ảnh đại diện</span>
          <span>Họ và tên</span>
          <span>Email</span>

          <span>Vai trò</span>
          <span>Trạng thái </span>

          <span>Hành động</span>
        </Table.Head>
        <Table.Body>
          {data?.data.map((user, index) => (
            <Table.Row key={user._id} className="text-center">
              <span>{index + 1}</span>
              <span className="flex justify-center items-center">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={user.image}
                  alt="Ảnh đại diện"
                />
              </span>
              <span>{user.full_name}</span>
              <span>{user.email}</span>
              <span>{user.role}</span>
              <span>
                {user.status === 0 ? (
                  <p className="text-red-500 font-semibold">Chưa duyệt</p>
                ) : (
                  'Đã duyệt'
                )}
              </span>
              <span className="flex space-x-2 justify-center">
                <Button
                  color="success"
                  className="text-white"
                  onClick={() => user._id && handleApprove(user._id)}
                  disabled={isApproving}
                >
                  <IoPersonAdd /> Duyệt
                </Button>
                <Button
                  color="error"
                  className="text-white"
                  onClick={() => user._id && handleDelete(user._id)}
                  disabled={isDeleting}
                >
                  <MdDelete /> Xóa
                </Button>
              </span>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default ApproveUser;
