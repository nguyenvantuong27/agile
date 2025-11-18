import React, { useState } from 'react';
import { FaCheck, FaBan, FaTrash, FaSearch } from 'react-icons/fa';
import {
  useGetAppointmentsQuery,
  useGetRejectedAppointmentsQuery,
  useApproveAppointmentMutation,
  useRejectAppointmentMutation,
  useDeleteAppointmentMutation,
} from '~/services/appointments/appointments.services';
import { activeAppointments } from '~/constants';
import { RootState } from '~/redux/storage/store';
import { useAppSelector } from '~/hooks/HookRouter';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { Toastify } from '~/helpers/Toastify';

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
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const [approveAppointment] = useApproveAppointmentMutation();
  const [rejectAppointment] = useRejectAppointmentMutation();
  const [deleteAppointment] = useDeleteAppointmentMutation();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const appointmentOfArtist =
    (filterStatus === 'rejected'
      ? rejectedAppointmentsData?.data
      : appointmentsData?.data
    )?.filter((x) => {
      if (typeof x.user_id === 'object') {
        return x.user_id._id === auth._id!;
      }
      return false;
    }) || [];

  const filteredAndSortedAppointments = appointmentOfArtist
    .filter((appointment) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        appointment.description?.toLowerCase().includes(searchLower) ||
        (typeof appointment.customer_id === 'object' &&
          appointment.customer_id?.full_name
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
    });

  const totalPages = Math.ceil(
    filteredAndSortedAppointments.length / ITEMS_PER_PAGE,
  );
  const paginatedAppointments = filteredAndSortedAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleApproveAppointment = async (id: string) => {
    setLoading(true);
    try {
      await approveAppointment(id).unwrap();
      Toastify('Duyệt cuộc hẹn thành công', 200);
      refetchAppointments();
      refetchRejected();
    } catch (error) {
      console.error('approveAppointment error:', error);
      Toastify('Đã có lỗi xảy ra khi duyệt cuộc hẹn!', 400);
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
      await rejectAppointment(id).unwrap();
      Toastify('Từ chối cuộc hẹn thành công', 200);
      refetchAppointments();
      refetchRejected();
    } catch (error) {
      console.error('rejectAppointment error:', error);
      Toastify('Đã có lỗi xảy ra khi từ chối cuộc hẹn!', 400);
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
      await deleteAppointment(id).unwrap();
      Toastify('Xóa cuộc hẹn thành công', 200);
      refetchAppointments();
      refetchRejected();
    } catch (error) {
      console.error('deleteAppointment error:', error);
      Toastify('Đã có lỗi xảy ra khi xóa cuộc hẹn!', 400);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (filterStatus === 'rejected' && isLoadingRejected)) {
    return (
      <div className="flex justify-center w-full">
        <LoadingLocal />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">
          Lịch hẹn vé xăm
        </h1>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo mô tả, khách hàng hoặc mã vé..."
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

      {!isLoading && filteredAndSortedAppointments.length === 0 ? (
        <p className="text-center text-lg text-gray-600">
          Bạn chưa có lịch hẹn vé xăm nào.
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
                <div className="bg-gradient-to-r from-primary to-red-600 p-4 text-white">
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
                      Hình xăm:
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
                      Người xăm:
                    </span>{' '}
                    {typeof appointment.user_id === 'object'
                      ? appointment.user_id.full_name
                      : 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold text-indigo-600">
                      Khách hàng:
                    </span>{' '}
                    {typeof appointment.customer_id === 'object'
                      ? appointment.customer_id.full_name
                      : 'Khách vãng lai'}
                  </p>
                  {typeof appointment.customer_id !== 'object' && (
                    <>
                      <p className="text-gray-700">
                        <span className="font-semibold text-indigo-600">
                          Email:
                        </span>{' '}
                        {appointment.email || 'N/A'}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold text-indigo-600">
                          Số điện thoại:
                        </span>{' '}
                        {appointment.phone || 'N/A'}
                      </p>
                    </>
                  )}
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
                      Ngày tạo:
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

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                className="px-4 py-2 bg-primary text-white rounded-md  disabled:bg-gray-100 disabled:text-gray-400"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <span className="text-gray-800">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-primary text-white rounded-md  disabled:bg-gray-100 disabled:text-gray-400"
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
    </div>
  );
};

export default AppointmentsManagement;
