import React, { useState } from 'react';
import { useGetReviewsQuery } from '~/services/review/review.services';
import { useGetAppointmentByIdQuery } from '~/services/appointments/appointments.services';
import { Button } from 'react-daisyui';
import { IUser } from '~/domain/types/user/user.model';

const ReviewManagement: React.FC = () => {
  const { data: reviewsData, isLoading: isReviewsLoading } =
    useGetReviewsQuery();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  const { data: appointment, isLoading: isAppointmentLoading } =
    useGetAppointmentByIdQuery(selectedAppointmentId || '', {
      skip: !selectedAppointmentId,
    });

  const openModal = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
  };

  const closeModal = () => {
    setSelectedAppointmentId(null);
  };

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 text-center tracking-tight">
        Quản lý Đánh giá
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {isReviewsLoading ? (
          <div className="col-span-full text-center text-gray-500 text-lg">
            Đang tải...
          </div>
        ) : reviewsData?.data?.length ? (
          reviewsData.data.map((review) => (
            <div
              key={review._id}
              className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start space-x-3">
                <img
                  src={
                    typeof review.user_id === 'object' && review.user_id?.image
                      ? review.user_id?.image
                      : 'https://static.vecteezy.com/system/resources/previews/000/439/863/non_2x/vector-users-icon.jpg'
                  }
                  alt="User avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-md font-semibold text-gray-800 truncate">
                      {typeof review.user_id === 'object'
                        ? review.user_id.username
                        : 'Ẩn danh'}
                    </h3>
                    <span className="text-xs text-yellow-500">
                      {Array(review.rating).fill('★').join('')} ({review.rating}
                      /5)
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-3">
                    {review.comments}
                  </p>
                  <button
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-2 transition-colors"
                    onClick={() =>
                      openModal(
                        typeof review.appointment_id === 'string'
                          ? review.appointment_id
                          : review.appointment_id?._id,
                      )
                    }
                  >
                    Xem chi tiết vé #
                    {typeof review.appointment_id === 'string'
                      ? review.appointment_id.slice(-6)
                      : review.appointment_id?._id.slice(-6)}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 text-lg">
            Chưa có đánh giá nào.
          </div>
        )}
      </div>

      {selectedAppointmentId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-95 hover:scale-100 ">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b border-gray-200 pb-2">
              Chi tiết Vé Đặt Lịch
            </h3>
            {isAppointmentLoading ? (
              <p className="text-gray-500 text-center">Đang tải...</p>
            ) : appointment?.data ? (
              <div className="space-y-4 text-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-semibold">ID Vé:</span>
                  <span>{appointment.data?._id}</span>
                  <span className="font-semibold">Ngày:</span>
                  <span>
                    {new Date(appointment.data.date).toLocaleDateString(
                      'vi-VN',
                    )}
                  </span>
                  <span className="font-semibold">Khung giờ:</span>
                  <span>
                    {typeof appointment.data.timeslot_id === 'object' &&
                    appointment.data.timeslot_id?.startTime
                      ? `${appointment.data.timeslot_id?.startTime} - ${appointment.data.timeslot_id?.endTime}`
                      : 'N/A'}
                  </span>
                  <span className="font-semibold">Chi nhánh:</span>
                  <span>
                    {typeof appointment.data.branch_id === 'object' &&
                    'name' in appointment.data.branch_id
                      ? appointment.data.branch_id.name
                      : 'N/A'}
                  </span>
                  <span className="font-semibold">Người xăm:</span>
                  <span>
                    {appointment?.data?.user_id &&
                    typeof appointment.data.user_id === 'object'
                      ? (appointment.data.user_id as IUser).full_name || 'N/A'
                      : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Trạng thái:</span>
                  <span
                    className={`font-semibold ${
                      appointment.data.status === 'approved'
                        ? 'text-green-600'
                        : appointment.data.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {appointment.data.status}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-red-500 text-center">
                Không tìm thấy thông tin vé.
              </p>
            )}
            <div className="mt-6 flex justify-end">
              <Button
                color="primary"
                className="py-2 px-4 rounded-md hover:bg-gray-600 transition-all"
                onClick={closeModal}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
