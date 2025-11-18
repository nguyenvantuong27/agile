import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheck, FaPlus, FaBan, FaTrash, FaSearch } from 'react-icons/fa';
import {
  useGetAppointmentsQuery,
  useGetRejectedAppointmentsQuery,
  useCreateAppointmentMutation,
  usePatchAppointmentMutation,
  useApproveAppointmentMutation,
  useRejectAppointmentMutation,
  useDeleteAppointmentMutation,
} from '~/services/appointments/appointments.services';
import { useGetAllUsersQuery } from '~/services/users/user.services';
import { useGetTimeslotsQuery } from '~/services/timeslots/timeslots.services';
import { useGetBranchesQuery } from '~/services/branches/branches.services';
import { IAppointment } from '~/domain/types/appointments/appointment.model';
import { Toastify } from '~/helpers/Toastify';

enum activeAppointments {
  PENDING = 'pending',
  APPROVED = 'approved',
  CANCELED = 'canceled',
  CUSTOMER_CANCELED = 'customer_canceled',
}

const ITEMS_PER_PAGE = 8;

const AppointmentsManagement: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    data: appointmentsData,
    isLoading,
    refetch: refetchAppointments,
  } = useGetAppointmentsQuery();
  const {
    data: rejectedAppointmentsData,
    isLoading: isLoadingRejected,
    refetch: refetchRejected,
  } = useGetRejectedAppointmentsQuery(undefined, {
    skip: filterStatus !== 'rejected',
  });
  const { data: usersData, isFetching: isFetchingUsers } =
    useGetAllUsersQuery();
  const { data: timeslotsData, isFetching: isFetchingTimeslots } =
    useGetTimeslotsQuery();
  const { data: branchesData } = useGetBranchesQuery();

  const [createAppointment] = useCreateAppointmentMutation();
  const [updateAppointment] = usePatchAppointmentMutation();
  const [approveAppointment] = useApproveAppointmentMutation();
  const [rejectAppointment] = useRejectAppointmentMutation();
  const [deleteAppointment] = useDeleteAppointmentMutation();

  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IAppointment>();

  const calculateFutureDatesFromDayOfWeek = (dayOfWeek: string) => {
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
    const diff = targetDayIndex - currentDayIndex;

    const futureDates: string[] = [];
    const startDate = new Date(today);

    if (diff < 0) {
      startDate.setDate(today.getDate() + (7 + diff));
    } else {
      startDate.setDate(today.getDate() + diff);
    }

    for (let i = 0; i < 4; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + i * 7);
      futureDates.push(nextDate.toISOString().split('T')[0]);
    }

    return futureDates;
  };

  const handleTimeslotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTimeslotId = e.target.value;
    const selectedTimeslot = filteredTimeslots?.find(
      (timeslot) => timeslot._id === selectedTimeslotId,
    );
    if (selectedTimeslot) {
      const dates = calculateFutureDatesFromDayOfWeek(
        selectedTimeslot.day_of_week,
      );
      setAvailableDates(dates);
      setValue('date', dates[0]);
    }
  };

  const handleApproveAppointment = async (id: string) => {
    setLoading(true);
    try {
      await approveAppointment(id).unwrap();
      Toastify('Duyệt cuộc hẹn thành công', 200);
      refetchAppointments();
      refetchRejected();
    } catch (error) {
      console.error('approveAppointment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAppointment = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối cuộc hẹn này?')) {
      return;
    }
    setLoading(true);
    try {
      console.log(`Calling rejectAppointment for ID: ${id}`);
      const response = await rejectAppointment(id).unwrap();
      console.log('rejectAppointment response:', response);
      Toastify('Từ chối cuộc hẹn thành công', 200);
      refetchAppointments();
      refetchRejected();
    } catch (error) {
      console.error('rejectAppointment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa cuộc hẹn này?')) {
      return;
    }
    setLoading(true);
    try {
      console.log(`Calling deleteAppointment for ID: ${id}`);
      await deleteAppointment(id).unwrap();
      Toastify('Xóa cuộc hẹn thành công', 200);
      refetchAppointments();
      refetchRejected();
    } catch (error) {
      console.error('deleteAppointment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: IAppointment) => {
    setLoading(true);
    try {
      if (selectedAppointment) {
        await updateAppointment({ id: selectedAppointment._id!, data });
        Toastify('Cập nhật cuộc hẹn thành công', 201);
      } else {
        data.user_id = selectedUser;
        data.branch_id = selectedBranch;
        await createAppointment(data);
        Toastify('Thêm cuộc hẹn thành công', 201);
      }
      reset();
      setShowModal(false);
      setSelectedBranch('');
      setSelectedUser('');
      setAvailableDates([]);
      refetchAppointments();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm, lọc và phân trang
  const filteredAndSortedAppointments =
    (filterStatus === 'rejected'
      ? rejectedAppointmentsData?.data
      : appointmentsData?.data
    )
      ?.filter((appointment) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          appointment.description?.toLowerCase().includes(searchLower) ||
          (typeof appointment.customer_id === 'object' &&
            appointment.customer_id?.full_name
              ?.toLowerCase()
              .includes(searchLower)) ||
          (typeof appointment.user_id === 'object' &&
            appointment.user_id?.full_name
              ?.toLowerCase()
              .includes(searchLower)) ||
          appointment._id.toLowerCase().includes(searchLower);

        const matchesStatus =
          filterStatus === 'all' ||
          (filterStatus === 'rejected'
            ? [
                activeAppointments.CANCELED,
                activeAppointments.CUSTOMER_CANCELED,
              ].includes(appointment.status as activeAppointments)
            : appointment.status === filterStatus);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        const today = new Date().toDateString();

        const isTodayA = dateA.toDateString() === today;
        const isTodayB = dateB.toDateString() === today;

        if (isTodayA && !isTodayB) return -1;
        if (!isTodayA && isTodayB) return 1;
        return dateB.getTime() - dateA.getTime();
      }) || [];

  // Phân trang
  const totalPages = Math.ceil(
    filteredAndSortedAppointments.length / ITEMS_PER_PAGE,
  );
  const paginatedAppointments = filteredAndSortedAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const filteredUsers = usersData?.data?.filter(
    (user) => user.branch_id?._id === selectedBranch && user.role === 'artist',
  );
  const filteredTimeslots = timeslotsData?.data?.filter(
    (timeslot) =>
      typeof timeslot.user_id === 'object' &&
      timeslot.user_id?._id === selectedUser,
  );

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          Quản lý đặt bàn Prime Drink
        </h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-600 flex items-center gap-2"
          onClick={() => {
            setSelectedAppointment(null);
            setSelectedBranch('');
            setSelectedUser('');
            setAvailableDates([]);
            setShowModal(true);
          }}
        >
          <FaPlus /> Thêm đặt bàn
        </button>
      </div>

      {/* Thanh tìm kiếm và lọc */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo mô tả, khách hàng, nhân viên phục vụ hoặc mã đặt bàn..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value={activeAppointments.PENDING}>Chờ duyệt</option>
          <option value={activeAppointments.APPROVED}>Đã duyệt</option>
          <option value="rejected">Đã từ chối</option>
          <option value={activeAppointments.CUSTOMER_CANCELED}>
            Khách hủy đơn
          </option>
        </select>
      </div>

      {isLoading || (filterStatus === 'rejected' && isLoadingRejected) ? (
        <p className="text-center text-lg text-gray-600">Đang tải...</p>
      ) : filteredAndSortedAppointments.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          Không tìm thấy cuộc hẹn nào.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="relative bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 transform transition hover:shadow-2xl"
              >
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-200"></div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">
                      Vé #{appointment._id.slice(-6)}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        appointment.status === activeAppointments.APPROVED
                          ? 'bg-green-200 text-green-800'
                          : appointment.status === activeAppointments.PENDING
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-red-200 text-red-800'
                      }`}
                    >
                      {appointment.status === activeAppointments.PENDING
                        ? 'Chờ duyệt'
                        : appointment.status === activeAppointments.APPROVED
                          ? 'Đã duyệt'
                          : appointment.status ===
                              activeAppointments.CUSTOMER_CANCELED
                            ? 'Khách đã hủy'
                            : 'Đã từ chối'}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Mô tả:
                    </span>{' '}
                    {appointment.description || 'Không có'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Đồ uống:
                    </span>{' '}
                    {typeof appointment.tattoo_id === 'object'
                      ? appointment.tattoo_id?.title
                      : 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Chi nhánh:
                    </span>{' '}
                    {typeof appointment.branch_id === 'object'
                      ? appointment.branch_id.name
                      : 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Nhân viên phục vụ:
                    </span>{' '}
                    {typeof appointment.user_id === 'object'
                      ? appointment.user_id?.full_name
                      : 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Khách hàng:
                    </span>{' '}
                    {typeof appointment.customer_id === 'object'
                      ? appointment.customer_id?.full_name
                      : 'Khách vãng lai'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Email:
                    </span>{' '}
                    {typeof appointment.customer_id === 'object'
                      ? appointment.customer_id?.email || 'N/A'
                      : appointment.email || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Số điện thoại:
                    </span>{' '}
                    {typeof appointment.customer_id === 'object'
                      ? appointment.customer_id?.phone || 'N/A'
                      : appointment.phone || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">Ngày:</span>{' '}
                    {new Date(appointment.date).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Khung giờ:
                    </span>{' '}
                    {typeof appointment.timeslot_id === 'object'
                      ? `${appointment.timeslot_id?.startTime} - ${appointment.timeslot_id?.endTime}`
                      : 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Ngày đặt lịch:
                    </span>{' '}
                    {new Date(appointment.createdAt).toLocaleString('vi-VN')}
                  </p>
                  <div className="flex gap-2 mt-4">
                    {appointment.status === activeAppointments.PENDING && (
                      <>
                        <button
                          className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
                          onClick={() =>
                            handleApproveAppointment(appointment._id!)
                          }
                          disabled={loading}
                        >
                          <FaCheck /> Duyệt
                        </button>
                        <button
                          className="flex-1 bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 flex items-center justify-center gap-2"
                          onClick={() =>
                            handleRejectAppointment(appointment._id!)
                          }
                          disabled={loading}
                        >
                          <FaBan /> Từ chối
                        </button>
                      </>
                    )}
                    {(appointment.status === activeAppointments.CANCELED ||
                      appointment.status ===
                        activeAppointments.CUSTOMER_CANCELED) && (
                      <button
                        className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 flex items-center justify-center gap-2"
                        onClick={() =>
                          handleDeleteAppointment(appointment._id!)
                        }
                        disabled={loading}
                      >
                        <FaTrash /> Xóa
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 flex justify-between items-center text-white text-xs">
                  <span>Mã vé: {appointment._id}</span>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-200"></div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <span className="text-black">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {selectedAppointment
                ? 'Chỉnh sửa cuộc hẹn'
                : 'Đặt bàn Prime Drink'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  {...register('description', {
                    required: 'Vui lòng nhập mô tả',
                  })}
                  type="text"
                  placeholder="Mô tả yêu cầu đặt bàn"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <select
                  {...register('branch_id', {
                    required: 'Vui lòng chọn chi nhánh',
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSelectedUser('');
                    setAvailableDates([]);
                  }}
                >
                  <option value="">Chọn chi nhánh</option>
                  {branchesData?.data.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {errors.branch_id && (
                  <p className="text-red-500 text-sm">
                    {errors.branch_id.message}
                  </p>
                )}
              </div>
              <div>
                <select
                  {...register('user_id', {
                    required: 'Vui lòng chọn Nhân viên phục vụ',
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                    setAvailableDates([]);
                  }}
                  disabled={!selectedBranch || isFetchingUsers}
                >
                  <option value="">Chọn Nhân viên phục vụ</option>
                  {isFetchingUsers ? (
                    <option>Đang tải Nhân viên phục vụ...</option>
                  ) : (
                    filteredUsers?.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.full_name}
                      </option>
                    ))
                  )}
                </select>
                {errors.user_id && (
                  <p className="text-red-500 text-sm">
                    {errors.user_id.message}
                  </p>
                )}
              </div>
              <div>
                <select
                  {...register('timeslot_id', {
                    required: 'Vui lòng chọn khung giờ',
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!selectedUser || isFetchingTimeslots}
                  onChange={handleTimeslotChange}
                >
                  <option value="">Chọn khung giờ</option>
                  {isFetchingTimeslots ? (
                    <option>Đang tải khung giờ...</option>
                  ) : (
                    filteredTimeslots?.map((timeslot) => (
                      <option key={timeslot._id} value={timeslot._id}>
                        {timeslot.startTime} - {timeslot.endTime} -{' '}
                        {timeslot.day_of_week}
                      </option>
                    ))
                  )}
                </select>
                {errors.timeslot_id && (
                  <p className="text-red-500 text-sm">
                    {errors.timeslot_id.message}
                  </p>
                )}
              </div>
              <div>
                <select
                  {...register('date', { required: 'Vui lòng chọn ngày' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={!availableDates.length}
                >
                  <option value="">Chọn ngày</option>
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date.message}</p>
                )}
              </div>
              {!selectedAppointment && (
                <>
                  <div>
                    <input
                      {...register('phone', {
                        required: 'Vui lòng nhập số điện thoại',
                        pattern: {
                          value: /^\d{10,11}$/,
                          message: 'Số điện thoại không hợp lệ (10-11 số)',
                        },
                      })}
                      type="text"
                      placeholder="Nhập số điện thoại"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      {...register('email', {
                        required: 'Vui lòng nhập email',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Email không hợp lệ',
                        },
                      })}
                      type="email"
                      placeholder="Nhập email"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-600 disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading
                    ? 'Đang xử lý...'
                    : selectedAppointment
                      ? 'Cập nhật'
                      : 'Thêm'}
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-white px-4 py-2 rounded-md hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
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

export default AppointmentsManagement;
