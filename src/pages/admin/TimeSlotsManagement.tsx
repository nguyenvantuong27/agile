import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import {
  useCreateTimeslotMutation,
  useGetTimeslotsByUserIdQuery,
  useDeleteTimeslotMutation,
  usePatchTimeslotMutation,
} from '~/services/timeslots/timeslots.services';
import { useGetAllUsersQuery } from '~/services/users/user.services';
import { ITimeslot } from '~/domain/types/timeslots/timeslots.model';
import { Toastify } from '~/helpers/Toastify';
import { Button } from 'react-daisyui';

const TimeSlotsManagement: React.FC = () => {
  const { register, handleSubmit, reset, setValue } = useForm<ITimeslot>();
  const { data: users, isLoading: isLoadingUsers } = useGetAllUsersQuery();
  const [createTimeslot, { isLoading: isCreating }] =
    useCreateTimeslotMutation();
  const [deleteTimeslot] = useDeleteTimeslotMutation();
  const [updateTimeslot, { isLoading: isUpdating }] =
    usePatchTimeslotMutation();

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTimeslot, setSelectedTimeslot] = useState<ITimeslot | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false); // Modal để tạo timeslot

  const { data: timeslots, refetch } = useGetTimeslotsByUserIdQuery(
    selectedUserId!,
    {
      skip: !selectedUserId,
    },
  );

  const onSubmit = async (data: ITimeslot) => {
    try {
      if (selectedTimeslot) {
        await updateTimeslot({ id: selectedTimeslot._id!, data }).unwrap();
        Toastify('Cập nhật lịch làm việc thành công', 200);
      } else {
        data.user_id = selectedUserId!; // Gán user_id từ nhân viên được chọn
        await createTimeslot(data).unwrap();
        Toastify('Thêm lịch làm việc thành công', 201);
      }
      resetForm();
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const onCreateSubmit = async (data: ITimeslot) => {
    try {
      await createTimeslot(data).unwrap();
      Toastify('Thêm lịch làm việc thành công', 201);
      setShowCreateModal(false);
      reset();
      if (selectedUserId) refetch(); // Refetch nếu đang xem lịch của user
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleEdit = (timeslot: ITimeslot) => {
    setSelectedTimeslot(timeslot);
    setValue('day_of_week', timeslot.day_of_week);
    setValue('startTime', timeslot.startTime);
    setValue('endTime', timeslot.endTime);
    setValue('max_appointment', timeslot.max_appointment);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTimeslot(id).unwrap();
      Toastify('Xóa lịch làm việc thành công', 200);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const resetForm = () => {
    reset();
    setSelectedTimeslot(null);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    resetForm();
  };

  const artists = users?.data.filter((user) => user.role === 'artist') || [];

  return (
    <div className="p-6 rounded-lg flex gap-6">
      {/* Danh sách nhân viên */}
      <div className="w-1/3 bg-base-200 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Danh sách nhân viên</h2>
        <Button
          color="primary"
          className="mb-4 w-full"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Thêm lịch làm việc
        </Button>
        {isLoadingUsers ? (
          <p>Đang tải...</p>
        ) : (
          <ul className="space-y-2">
            {artists.map((user) => (
              <li
                key={user._id}
                className={`p-2 cursor-pointer rounded-lg ${
                  selectedUserId === user._id
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-200'
                }`}
                onClick={() => handleUserSelect(user._id!)}
              >
                {user.full_name} - {user.branch_id?.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quản lý lịch làm việc */}
      <div className="w-2/3">
        <h2 className="text-xl font-bold mb-4">
          {selectedUserId
            ? `Lịch làm việc của ${
                artists.find((u) => u._id === selectedUserId)?.full_name || ''
              }`
            : 'Quản lý lịch làm việc'}
        </h2>

        {/* Form thêm/sửa */}
        {selectedUserId && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 mb-6 bg-base-100 p-4 rounded-lg"
          >
            <div>
              <label className="label">Chọn ngày trong tuần</label>
              <select
                {...register('day_of_week', { required: true })}
                className="select select-bordered w-full"
              >
                <option value="">Chọn ngày</option>
                {[
                  'monday',
                  'tuesday',
                  'wednesday',
                  'thursday',
                  'friday',
                  'saturday',
                  'sunday',
                ].map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Thời gian bắt đầu</label>
              <input
                type="time"
                {...register('startTime', { required: true })}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Thời gian kết thúc</label>
              <input
                type="time"
                {...register('endTime', { required: true })}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Giới hạn lịch đặt</label>
              <input
                type="number"
                {...register('max_appointment', { required: true, min: 1 })}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                color="primary"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating
                  ? 'Đang lưu...'
                  : selectedTimeslot
                    ? 'Cập nhật'
                    : 'Thêm'}
              </Button>
              {selectedTimeslot && (
                <Button type="button" onClick={resetForm}>
                  Hủy
                </Button>
              )}
            </div>
          </form>
        )}

        {/* Danh sách lịch làm việc */}
        {selectedUserId && (
          <div>
            <h3 className="text-lg font-bold mb-4">Danh sách lịch làm việc</h3>
            {timeslots?.data?.length ? (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Thời gian bắt đầu</th>
                    <th>Thời gian kết thúc</th>
                    <th>Giới hạn lịch đặt</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {timeslots.data.map((timeslot) => (
                    <tr key={timeslot._id}>
                      <td>{timeslot.day_of_week}</td>
                      <td>{timeslot.startTime}</td>
                      <td>{timeslot.endTime}</td>
                      <td>{timeslot.max_appointment}</td>
                      <td className="flex gap-2">
                        <Button
                          color="success"
                          className="text-white"
                          onClick={() => handleEdit(timeslot)}
                        >
                          <FaEdit /> Sửa
                        </Button>
                        <Button
                          color="error"
                          className="hidden"
                          onClick={() => handleDelete(timeslot._id!)}
                        >
                          <FaTrash /> Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Chưa có lịch làm việc nào cho nhân viên này.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal tạo Timeslot */}
      {showCreateModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Thêm Timeslot</h3>
            <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <label className="label">Chọn nhân viên</label>
                <select
                  {...register('user_id', { required: true })}
                  className="select select-bordered w-full"
                >
                  <option value="">Chọn nhân viên</option>
                  {artists.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.full_name} - {user.branch_id?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Chọn ngày trong tuần</label>
                <select
                  {...register('day_of_week', { required: true })}
                  className="select select-bordered w-full"
                >
                  <option value="">Chọn ngày</option>
                  {[
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday',
                  ].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Thời gian bắt đầu</label>
                <input
                  type="time"
                  {...register('startTime', { required: true })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">Thời gian kết thúc</label>
                <input
                  type="time"
                  {...register('endTime', { required: true })}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">Giới hạn lịch đặt</label>
                <input
                  type="number"
                  {...register('max_appointment', { required: true, min: 1 })}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="submit" color="primary" disabled={isCreating}>
                  {isCreating ? 'Đang lưu...' : 'Thêm'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default TimeSlotsManagement;
