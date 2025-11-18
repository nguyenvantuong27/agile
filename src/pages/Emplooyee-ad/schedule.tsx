import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import {
  useGetTimeslotsByUserIdQuery,
  useDeleteTimeslotMutation,
  usePatchTimeslotMutation,
} from '~/services/timeslots/timeslots.services';
import { ITimeslot } from '~/domain/types/timeslots/timeslots.model';
import { Toastify } from '~/helpers/Toastify';
import { Button } from 'react-daisyui';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { Link } from 'react-router-dom';
import LoadingLocal from '~/components/loading/LoadingLocal';

const Schedule: React.FC = () => {
  console.log('schedule');
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  const { register, handleSubmit, reset, setValue } = useForm<ITimeslot>();
  const [deleteTimeslot] = useDeleteTimeslotMutation();
  const [updateTimeslot, { isLoading: isUpdating }] =
    usePatchTimeslotMutation();

  const [selectedTimeslot, setSelectedTimeslot] = useState<ITimeslot | null>(
    null,
  );
  const [showEditModal, setShowEditModal] = useState(false); // Modal để sửa timeslot

  const {
    data: timeslots,
    refetch,
    isFetching,
  } = useGetTimeslotsByUserIdQuery(auth._id!, {
    skip: !auth._id,
  });

  // fetch api to update timeslot
  const onEditSubmit = async (data: ITimeslot) => {
    try {
      data.user_id = auth._id!;
      if (selectedTimeslot != null) {
        await updateTimeslot({ id: selectedTimeslot._id!, data }).unwrap();
      }
      Toastify('Cập nhật lịch làm việc thành công', 201);
      setShowEditModal(false);
      reset();
    } catch {
      Toastify('Có lỗi xảy ra, vui lòng thử lại!', 400);
    }
  };

  // set value for form
  const handleEdit = (timeslot: ITimeslot) => {
    setShowEditModal(true);
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
    } catch {
      Toastify('Không thể xóa lịch làm việc', 400);
    }
  };

  console.log('what?');
  if (isFetching) {
    return (
      <div className="flex justify-center w-full">
        <LoadingLocal />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg flex gap-6">
      <div className="w-full">
        <div className="flex justify-between">
          <h2 className="text-xl font-bold mb-4">Ca làm</h2>
          <Button className="relative" size="md" color="error">
            <FaPlus />
            <p>Thêm ca làm</p>
            <Link to="/artist/add-schedule" className="inset-0 absolute"></Link>
          </Button>
        </div>
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
          <p className="text-center">Bạn chưa có ca làm việc nào.</p>
        )}
      </div>

      {/* Modal update Timeslot */}
      {showEditModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Thêm Timeslot</h3>
            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
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
                <Button type="submit" color="primary" disabled={isUpdating}>
                  {isUpdating ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isUpdating}
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

export default Schedule;
