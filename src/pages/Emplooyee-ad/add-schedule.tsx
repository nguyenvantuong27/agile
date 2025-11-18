import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useCreateTimeslotMutation,
  useGetTimeslotsByUserIdQuery,
  usePatchTimeslotMutation,
} from '~/services/timeslots/timeslots.services';
import { ITimeslot } from '~/domain/types/timeslots/timeslots.model';
import { Toastify } from '~/helpers/Toastify';
import { Button } from 'react-daisyui';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';

const AddSchedule: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<ITimeslot>();
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  const [createTimeslot, { isLoading: isCreating }] =
    useCreateTimeslotMutation();
  const [updateTimeslot, { isLoading: isUpdating }] =
    usePatchTimeslotMutation();

  const [selectedTimeslot, setSelectedTimeslot] = useState<ITimeslot | null>(
    null,
  );

  const { refetch } = useGetTimeslotsByUserIdQuery(auth._id!, {
    skip: !auth._id,
  });

  const onSubmit = async (data: ITimeslot) => {
    /*
      {"day_of_week":"wednesday","startTime":"13:00","endTime":"13:30","max_appointment":"4"}
    */
    try {
      if (selectedTimeslot) {
        await updateTimeslot({ id: selectedTimeslot._id!, data }).unwrap();
        Toastify('Cập nhật ca làm thành công', 200);
      } else {
        data.user_id = auth._id!; // Gán user_id từ nhân viên được chọn
        await createTimeslot(data).unwrap();
        Toastify('Thêm ca làm thành công', 201);
      }
      resetForm();
      refetch();
    } catch {
      Toastify('Có lỗi xảy ra, vui lòng thử lại!', 400);
    }
  };

  const resetForm = () => {
    reset();
    setSelectedTimeslot(null);
  };

  return (
    <div className="p-6 rounded-lg flex gap-6">
      {/* Lịch làm việc */}
      <div className="w-2/3">
        <h2 className="text-xl font-bold mb-4">Thêm ca làm</h2>

        {/* Form thêm/sửa */}
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
      </div>
    </div>
  );
};

export default AddSchedule;
