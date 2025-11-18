import React, { useState } from 'react';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import {
  useGetAppointmentsByCustomerIdQuery,
  useDeleteAppointmentMutation,
  useCancelAppointmentByCustomerMutation,
} from '~/services/appointments/appointments.services';
import { useCreateReviewMutation } from '~/services/review/review.services';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { toast } from 'react-toastify';
import { Toastify } from '~/helpers/Toastify';
import { Button } from 'react-daisyui';
import { IAppointment } from '~/domain/types/appointments/appointment.model';

const AppointmentList: React.FC = () => {
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const {
    data: appointments,
    isLoading,
    refetch,
  } = useGetAppointmentsByCustomerIdQuery(auth?._id || '', {
    skip: !auth?._id,
  });

  const [deleteAppointment, { isLoading: isDeleting }] =
    useDeleteAppointmentMutation();
  const [cancelAppointment, { isLoading: isCanceling }] =
    useCancelAppointmentByCustomerMutation();
  const [createReview, { isLoading: isReviewing }] = useCreateReviewMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'date'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleCancel = async (appointment: IAppointment) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt bàn này?')) return;
    try {
      const email =
        appointment.email ||
        (typeof appointment.customer_id === 'object'
          ? appointment.customer_id.email
          : auth?.email);
      const phone =
        appointment.phone ||
        (typeof appointment.customer_id === 'object'
          ? appointment.customer_id.phone
          : auth?.phone);
      if (!email) {
        toast.error('Không tìm thấy email để hủy đặt bàn!');
        return;
      }
      console.log(`Canceling appointment ID: ${appointment._id}`);
      await cancelAppointment({ id: appointment._id, email, phone }).unwrap();
      toast.success('Hủy đặt bàn thành công!');
      refetch();
    } catch (error) {
      console.error('cancelAppointment error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đặt bàn này?')) return;
    try {
      console.log(`Deleting appointment ID: ${id}`);
      await deleteAppointment(id).unwrap();
      toast.success('Xóa đặt bàn thành công!');
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      console.error('deleteAppointment error:', error);
      Toastify(errorMessage, 400);
    }
  };

  const openReviewModal = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setRating(0);
    setComments('');
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleReviewSubmit = async () => {
    if (!selectedAppointmentId || rating === 0) {
      toast.error('Vui lòng chọn số sao và nhập nội dung!');
      return;
    }
    if (!auth?._id) {
      toast.error('Không tìm thấy thông tin người dùng!');
      return;
    }

    const reviewData = {
      appointment_id: selectedAppointmentId,
      user_id: auth._id,
      rating,
      comments,
    };

    try {
      await createReview(reviewData).unwrap();
      toast.success('Đánh giá đã được gửi!');
      closeReviewModal();
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  if (isLoading) return <LoadingLocal />;

  if (!appointments || !appointments.data || appointments.data.length === 0)
    return (
      <div className="text-center text-gray-500 py-12">
        Không có đặt bàn nào.
      </div>
    );

  const filteredAppointments = appointments.data
    .filter((appointment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        appointment._id.toLowerCase().includes(searchLower) ||
        appointment.description?.toLowerCase().includes(searchLower) ||
        (typeof appointment.user_id === 'object' &&
          appointment.user_id?.full_name
            ?.toLowerCase()
            .includes(searchLower)) ||
        (typeof appointment.branch_id === 'object' &&
          appointment.branch_id?.name?.toLowerCase().includes(searchLower)) ||
        (typeof appointment.customer_id === 'object' &&
          appointment.customer_id?.email?.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => {
      const dateA = new Date(sortBy === 'createdAt' ? a.createdAt : a.date);
      const dateB = new Date(sortBy === 'createdAt' ? b.createdAt : b.date);
      return sortOrder === 'asc'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

  if (filteredAppointments.length === 0)
    return (
      <div className="text-center text-gray-500 py-12">
        Không tìm thấy đặt bàn nào khớp với tìm kiếm của bạn.
      </div>
    );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">
        Danh sách đặt bàn của bạn {'(' + appointments.data.length + ')'}
      </h2>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo mã đặt bàn, yêu cầu đặc biệt, barista, chi nhánh, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'date')}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="createdAt">Sắp xếp theo ngày tạo</option>
            <option value="date">Sắp xếp theo ngày đặt</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="desc">Giảm dần</option>
            <option value="asc">Tăng dần</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAppointments.map((appointment) => (
          <div
            key={appointment._id}
            className="relative bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 transform transition hover:shadow-2xl flex flex-col min-h-[450px]"
          >
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-200"></div>
            <div className="bg-gradient-to-r from-primary to-red-400 p-4 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">
                  Bàn #{appointment._id.slice(-6)}
                </h3>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-md ${
                    appointment.status === 'approved'
                      ? 'bg-green-200 text-green-800'
                      : appointment.status === 'pending'
                        ? 'bg-yellow-200 text-yellow-800'
                        : appointment.status === 'customer_canceled'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-red-200 text-red-800'
                  }`}
                >
                  {appointment.status === 'approved'
                    ? 'Đã xác nhận'
                    : appointment.status === 'pending'
                      ? 'Chờ xác nhận'
                      : appointment.status === 'customer_canceled'
                        ? 'Đã hủy bởi bạn'
                        : 'Đã bị từ chối'}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3 flex-1 flex flex-col">
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">
                  Yêu cầu đặc biệt:
                </span>{' '}
                {appointment.description || 'Không có yêu cầu đặc biệt'}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">Đồ uống:</span>{' '}
                {typeof appointment.tattoo_id === 'object'
                  ? appointment.tattoo_id?.title
                  : 'Đồ uống theo yêu cầu'}
              </p>
              {appointment.tattoo_id ? (
                <img
                  src={
                    typeof appointment.tattoo_id === 'object'
                      ? appointment.tattoo_id.image
                      : ''
                  }
                  alt="Drink"
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
              ) : (
                <img
                  src="https://namdinh.edu.vn/App/images/no-image.jpg"
                  alt="Drink"
                  className="w-full h-32 rounded-lg mb-2"
                />
              )}
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">Giá:</span>{' '}
                {typeof appointment.tattoo_id === 'object'
                  ? appointment.tattoo_id.price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })
                  : 'Thỏa thuận khi đến quán'}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">Ngày:</span>{' '}
                {new Date(appointment.date).toLocaleDateString('vi-VN')}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">
                  Khung giờ:
                </span>{' '}
                {typeof appointment.timeslot_id === 'object'
                  ? `${appointment.timeslot_id?.startTime} - ${appointment.timeslot_id?.endTime}`
                  : 'N/A'}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">
                  Barista phục vụ:
                </span>{' '}
                {typeof appointment.user_id === 'object'
                  ? appointment.user_id?.full_name
                  : 'N/A'}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">
                  Chi nhánh:
                </span>{' '}
                {typeof appointment.branch_id === 'object'
                  ? appointment.branch_id.name
                  : 'N/A'}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">Email:</span>{' '}
                {typeof appointment.customer_id === 'object'
                  ? appointment.customer_id?.email || 'N/A'
                  : appointment.email || 'N/A'}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">
                  Số điện thoại:
                </span>{' '}
                {typeof appointment.customer_id === 'object'
                  ? appointment.customer_id?.phone || 'N/A'
                  : appointment.phone || 'N/A'}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold text-indigo-600">
                  Ngày đặt bàn:
                </span>{' '}
                {new Date(appointment.createdAt).toLocaleString('vi-VN')}
              </p>
              <div className="flex gap-2 mt-4">
                {appointment.status === 'pending' && (
                  <Button
                    color="error"
                    className={`flex-1 text-white rounded-md ${
                      isCanceling ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handleCancel(appointment)}
                    disabled={isCanceling}
                  >
                    {isCanceling ? 'Đang hủy...' : 'Hủy đặt bàn'}
                  </Button>
                )}
                {(appointment.status === 'canceled' ||
                  appointment.status === 'customer_canceled') && (
                  <Button
                    color="error"
                    className={`flex-1 text-white rounded-md ${
                      isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => handleDelete(appointment._id)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Đang xóa...' : 'Xóa đặt bàn'}
                  </Button>
                )}
                {appointment.status === 'approved' && (
                  <Button
                    color="success"
                    className={`flex-1 text-white rounded-md ${
                      isReviewing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => openReviewModal(appointment._id)}
                    disabled={isReviewing}
                  >
                    {isReviewing ? 'Đang gửi...' : 'Đánh giá'}
                  </Button>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 flex justify-between items-center text-white text-xs">
              <span>Prime Drink</span>
              <span>Mã bàn: {appointment._id}</span>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-200"></div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Đánh giá dịch vụ</h3>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Chọn số sao (1-5):
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Nhận xét:
              </label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Nhập nhận xét của bạn..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="py-2 px-4 bg-gray-300 text-white rounded-md hover:bg-gray-400"
                onClick={closeReviewModal}
              >
                Hủy
              </button>
              <Button
                color="primary"
                className={`py-2 px-4 text-white ${
                  isReviewing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleReviewSubmit}
                disabled={isReviewing}
              >
                {isReviewing ? 'Đang gửi...' : 'Gửi đánh giá'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
