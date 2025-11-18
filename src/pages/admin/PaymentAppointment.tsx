import React, { useState, useMemo } from 'react';
import { useGetApprovedAppointmentsQuery } from '~/services/appointments/appointments.services';
import {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useDeletePaymentMutation,
  usePatchPaymentMutation,
} from '~/services/payment/payment.services';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { Toastify } from '~/helpers/Toastify';
import { IPayment } from '~/domain/types/payment/payment.model';
import { useForm, Controller } from 'react-hook-form';
import { paymentMethod, paymentStatus } from '~/interfaces/enum/payment.enum';
import { FaSearch } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { IAppointment } from '~/domain/types/appointments/appointment.model';

const ITEMS_PER_PAGE = 8;

const PaymentAppointment: React.FC = () => {
  const {
    data: payments,
    isLoading: isLoadingPayments,
    error: paymentsError,
    refetch,
  } = useGetPaymentsQuery();

  const {
    data: appointments,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
  } = useGetApprovedAppointmentsQuery();

  const [createPayment, { isLoading: isCreatingPayment }] =
    useCreatePaymentMutation();
  const [deletePayment, { isLoading: isDeletingPayment }] =
    useDeletePaymentMutation();
  const [patchPayment, { isLoading: isUpdatingPayment }] =
    usePatchPaymentMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<IPayment | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    control: controlCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
    setValue: setValueCreate,
  } = useForm<IPayment>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    control: controlEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
    setValue,
  } = useForm<IPayment>();

  const paymentDetails = useMemo(() => {
    if (!appointments?.data || !payments?.data) return {};

    const details: {
      [key: string]: {
        totalPaid: number;
        totalPrice: number | null;
        remaining: number | null;
        status: paymentStatus;
      };
    } = {};

    appointments.data.forEach((appointment: IAppointment) => {
      const appointmentPayments = payments.data.filter(
        (p) => p.appointment_id?._id === appointment._id,
      );
      const totalPaid = appointmentPayments.reduce(
        (sum, p) => sum + p.amount,
        0,
      );
      const totalPrice =
        typeof appointment.tattoo_id === 'object' &&
        appointment.tattoo_id !== null
          ? appointment.tattoo_id.price
          : null;
      const remaining = totalPrice !== null ? totalPrice - totalPaid : null;

      let status: paymentStatus;
      if (totalPrice === null) {
        status = totalPaid > 0 ? paymentStatus.COMPLETED : paymentStatus.DEBT;
      } else {
        status =
          totalPaid >= totalPrice
            ? paymentStatus.COMPLETED
            : paymentStatus.DEBT;
      }

      details[appointment._id] = { totalPaid, totalPrice, remaining, status };
    });

    return details;
  }, [appointments, payments]);

  const unpaidAppointments = useMemo(() => {
    if (!appointments?.data || !payments?.data) return [];
    return appointments.data.filter((appointment) => {
      // Kiểm tra xem lịch hẹn có thanh toán nào không
      const hasPayment = payments.data.some(
        (p) => p.appointment_id?._id === appointment._id,
      );
      // Chỉ giữ các lịch hẹn chưa có thanh toán
      return !hasPayment;
    });
  }, [appointments, payments]);

  const filteredPayments = useMemo(() => {
    if (!payments?.data) return [];
    return payments.data.filter((payment) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        payment._id.toLowerCase().includes(searchLower) ||
        (payment.appointment_id?.date &&
          new Date(payment.appointment_id.date)
            .toLocaleDateString('vi-VN')
            .includes(searchLower)) ||
        (typeof payment.appointment_id?.user_id !== 'string' &&
          payment.appointment_id?.user_id?.full_name
            ?.toLowerCase()
            .includes(searchLower)) ||
        (typeof payment.appointment_id?.customer_id !== 'string' &&
          payment.appointment_id?.customer_id?.full_name
            ?.toLowerCase()
            .includes(searchLower));

      const matchesStatus =
        filterStatus === 'all' ||
        paymentDetails[payment.appointment_id?._id || ''].status ===
          filterStatus;
      const matchesMethod =
        filterMethod === 'all' || payment.payment_method === filterMethod;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchTerm, filterStatus, filterMethod, paymentDetails]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const onCreateSubmit = async (data: IPayment) => {
    try {
      const selectedAppointment = appointments?.data.find(
        (a) => a._id === data.appointment_id._id,
      );
      const totalPrice =
        typeof selectedAppointment?.tattoo_id === 'object' &&
        selectedAppointment?.tattoo_id !== null
          ? selectedAppointment.tattoo_id.price
          : null;

      // Kiểm tra số tiền nhập không vượt quá số tiền còn nợ
      if (totalPrice !== null) {
        const existingPayments = payments?.data.filter(
          (p) => p.appointment_id?._id === data.appointment_id._id,
        );
        const totalPaid =
          existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const remaining = totalPrice - totalPaid;
        if (data.amount > remaining) {
          Toastify(
            `Số tiền nhập không được vượt quá ${remaining.toLocaleString('vi-VN')} VNĐ còn nợ`,
            400,
          );
          return;
        }
      }

      // Tự động xác định trạng thái
      const existingPayments = payments?.data.filter(
        (p) => p.appointment_id?._id === data.appointment_id._id,
      );
      const totalPaid =
        existingPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const newTotalPaid = totalPaid + data.amount;
      data.status =
        totalPrice === null || newTotalPaid >= (totalPrice || 0)
          ? paymentStatus.COMPLETED
          : paymentStatus.DEBT;

      await createPayment(data).unwrap();
      Toastify('Thanh toán thành công', 201);
      setIsCreateModalOpen(false);
      resetCreate();
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const onEditSubmit = async (data: IPayment) => {
    if (!selectedPayment?._id) return;

    const detail = paymentDetails[selectedPayment.appointment_id?._id || ''];
    if (detail?.status === paymentStatus.COMPLETED) {
      Toastify('Không thể chỉnh sửa thanh toán đã hoàn tất', 400);
      return;
    }

    try {
      const selectedAppointment = appointments?.data.find(
        (a) => a._id === selectedPayment.appointment_id?._id,
      );
      const totalPrice =
        typeof selectedAppointment?.tattoo_id === 'object' &&
        selectedAppointment?.tattoo_id !== null
          ? selectedAppointment.tattoo_id.price
          : null;

      // Kiểm tra số tiền nhập không vượt quá số tiền còn nợ
      if (totalPrice !== null) {
        const otherPayments = payments?.data.filter(
          (p) =>
            p.appointment_id?._id === selectedPayment.appointment_id?._id &&
            p._id !== selectedPayment._id,
        );
        const totalPaid =
          otherPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const remaining = totalPrice - totalPaid;
        if (data.amount > remaining) {
          Toastify(
            `Số tiền nhập không được vượt quá ${remaining.toLocaleString('vi-VN')} VNĐ còn nợ`,
            400,
          );
          return;
        }
      }

      // Tự động xác định trạng thái
      const otherPayments = payments?.data.filter(
        (p) =>
          p.appointment_id?._id === selectedPayment.appointment_id?._id &&
          p._id !== selectedPayment._id,
      );
      const totalPaid =
        otherPayments?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const newTotalPaid = totalPaid + data.amount;
      data.status =
        totalPrice === null || newTotalPaid >= (totalPrice || 0)
          ? paymentStatus.COMPLETED
          : paymentStatus.DEBT;

      await patchPayment({ id: selectedPayment._id, data }).unwrap();
      Toastify('Cập nhật thanh toán thành công', 200);
      setIsEditModalOpen(false);
      resetEdit();
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleDelete = async (id: string) => {
    const payment = payments?.data.find((p) => p._id === id);
    if (!payment) return;

    const detail = paymentDetails[payment.appointment_id?._id || ''];
    if (detail?.status === paymentStatus.COMPLETED) {
      Toastify('Không thể xóa thanh toán đã hoàn tất', 400);
      return;
    }

    if (window.confirm('Bạn có chắc muốn xóa thanh toán này?')) {
      try {
        await deletePayment(id).unwrap();
        Toastify('Xóa thanh toán thành công', 200);
        refetch();
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Đã có lỗi xảy ra!';
        Toastify(errorMessage, 400);
      }
    }
  };

  const openEditModal = (payment: IPayment) => {
    const detail = paymentDetails[payment.appointment_id?._id || ''];
    if (detail?.status === paymentStatus.COMPLETED) {
      Toastify('Không thể chỉnh sửa thanh toán đã hoàn tất', 400);
      return;
    }
    setSelectedPayment(payment);
    setValue('appointment_id._id', payment.appointment_id?._id || '');
    setValue('amount', payment.amount);
    setValue('payment_method', payment.payment_method);
    setIsEditModalOpen(true);
  };

  const handleExport = () => {
    const exportData = filteredPayments.map((payment) => {
      const detail = paymentDetails[payment.appointment_id?._id || ''];
      return {
        'Mã thanh toán': payment._id.slice(-6),
        'Ngày đặt bàn': payment.appointment_id?.date
          ? new Date(payment.appointment_id.date).toLocaleDateString('vi-VN')
          : 'N/A',
        'Khung giờ':
          typeof payment.appointment_id?.timeslot_id !== 'string'
            ? `${payment.appointment_id.timeslot_id?.startTime} - ${payment.appointment_id.timeslot_id?.endTime}`
            : 'N/A',
        'Số tiền đã trả': detail?.totalPaid.toLocaleString('vi-VN') + ' VNĐ',
        'Tổng giá': detail?.totalPrice
          ? detail.totalPrice.toLocaleString('vi-VN') + ' VNĐ'
          : 'Không xác định',
        'Còn nợ':
          detail?.remaining !== null && detail.remaining > 0
            ? detail.remaining.toLocaleString('vi-VN') + ' VNĐ'
            : '0 VNĐ',
        'Phương thức':
          payment.payment_method === paymentMethod.CASH
            ? 'Tiền mặt'
            : payment.payment_method === paymentMethod.CARD
              ? 'Thẻ tín dụng'
              : 'Thanh toán online',
        'Trạng thái':
          detail?.status === paymentStatus.COMPLETED ? 'Hoàn tất' : 'Nợ',
        'Ngày tạo': payment.createdAt
          ? new Date(payment.createdAt).toLocaleDateString('vi-VN')
          : 'N/A',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    XLSX.writeFile(workbook, 'Danh_sach_thanh_toan.xlsx');
    Toastify('Xuất dữ liệu thành công', 200);
  };

  if (isLoadingPayments || isLoadingAppointments) return <LoadingLocal />;
  if (paymentsError)
    return (
      <div className="text-red-500">
        Lỗi khi tải danh sách thanh toán: {JSON.stringify(paymentsError)}
      </div>
    );
  if (appointmentsError)
    return (
      <div className="text-red-500">
        Lỗi khi tải danh sách đặt bàn: {JSON.stringify(appointmentsError)}
      </div>
    );

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800">
          Quản lý thanh toán đặt bàn
        </h2>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={handleExport}
          >
            Xuất Excel
          </button>
          <button
            className={`px-4 py-2 rounded-md text-white font-semibold ${
              unpaidAppointments.length
                ? 'bg-indigo-500 hover:bg-indigo-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!unpaidAppointments.length}
          >
            Tạo thanh toán mới
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, ngày, nhân viên phục vụ, khách hàng..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value={paymentStatus.COMPLETED}>Hoàn tất</option>
          <option value={paymentStatus.DEBT}>Nợ</option>
        </select>
        <select
          value={filterMethod}
          onChange={(e) => {
            setFilterMethod(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">Tất cả phương thức</option>
          {Object.values(paymentMethod).map((method) => (
            <option key={method} value={method}>
              {method === paymentMethod.CASH
                ? 'Tiền mặt'
                : method === paymentMethod.CARD
                  ? 'Thẻ tín dụng'
                  : 'Thanh toán online'}
            </option>
          ))}
        </select>
      </div>

      {filteredPayments.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedPayments.map((payment) => {
              const detail = paymentDetails[payment.appointment_id?._id || ''];
              const isCompleted = detail?.status === paymentStatus.COMPLETED;

              return (
                <div
                  key={payment._id}
                  className="relative bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200 transform transition hover:shadow-2xl"
                >
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-200"></div>
                  <div className="bg-gradient-to-r from-primary to-red-500 p-4 text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">
                        Thanh toán #{payment._id.slice(-6)}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          detail?.status === paymentStatus.COMPLETED
                            ? 'bg-green-200 text-green-800'
                            : 'bg-red-200 text-red-800'
                        }`}
                      >
                        {detail?.status === paymentStatus.COMPLETED
                          ? 'Hoàn tất'
                          : 'Nợ'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-gray-700">
                      <span className="font-semibold text-green-600">
                        Đặt bàn:
                      </span>{' '}
                      {payment.appointment_id?.date
                        ? new Date(
                            payment.appointment_id.date,
                          ).toLocaleDateString('vi-VN')
                        : 'N/A'}{' '}
                      -{' '}
                      {typeof payment.appointment_id?.timeslot_id !== 'string'
                        ? `${payment.appointment_id.timeslot_id?.startTime} - ${payment.appointment_id.timeslot_id?.endTime}`
                        : 'N/A'}
                    </p>
                    <p className="text-gray-700">
                      {payment.appointment_id?.customer_id ? (
                        <div className="">
                          <span className="font-semibold text-green-600">
                            Khách hàng:
                          </span>{' '}
                          {typeof payment.appointment_id?.customer_id !==
                          'string'
                            ? payment.appointment_id.customer_id?.full_name
                            : 'N/A'}
                        </div>
                      ) : (
                        ''
                      )}
                    </p>
                    <p>
                      <span className="font-semibold text-green-600">
                        Số điện thoại:
                      </span>{' '}
                      {payment.appointment_id?.customer_id
                        ? typeof payment.appointment_id?.customer_id !==
                          'string'
                          ? payment.appointment_id.customer_id?.phone
                          : 'N/A'
                        : payment.appointment_id?.phone}
                    </p>
                    <div className="flex flex-wrap items-center">
                      <span className="font-semibold text-green-600">
                        Email:
                      </span>{' '}
                      {payment.appointment_id?.customer_id ? (
                        <div>
                          {typeof payment.appointment_id?.customer_id !==
                          'string'
                            ? payment.appointment_id.customer_id?.email
                            : 'N/A'}
                        </div>
                      ) : (
                        payment.appointment_id?.email
                      )}
                    </div>
                    <p>
                      <span className="font-semibold text-green-600">
                        Nhân viên phục vụ:
                      </span>{' '}
                      {typeof payment.appointment_id?.user_id !== 'string'
                        ? payment.appointment_id.user_id?.full_name
                        : 'N/A'}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-green-600">
                        Số tiền thanh toán lần này:
                      </span>{' '}
                      {payment.amount.toLocaleString('vi-VN')} VNĐ
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-green-600">
                        Tổng đã trả:
                      </span>{' '}
                      {detail?.totalPaid.toLocaleString('vi-VN')} VNĐ
                    </p>
                    {detail?.totalPrice !== null && (
                      <>
                        <p className="text-gray-700">
                          <span className="font-semibold text-green-600">
                            Giá đồ uống:
                          </span>{' '}
                          {detail.totalPrice.toLocaleString('vi-VN')} VNĐ
                        </p>
                        <p className="text-gray-700">
                          <span className="font-semibold text-green-600">
                            Còn nợ:
                          </span>{' '}
                          {detail.remaining && detail.remaining > 0
                            ? detail.remaining.toLocaleString('vi-VN') + ' VNĐ'
                            : '0 VNĐ'}
                        </p>
                      </>
                    )}
                    <p className="text-gray-700">
                      <span className="font-semibold text-green-600">
                        Phương thức:
                      </span>{' '}
                      {payment.payment_method === paymentMethod.CASH
                        ? 'Tiền mặt'
                        : payment.payment_method === paymentMethod.CARD
                          ? 'Thẻ tín dụng'
                          : 'Thanh toán online'}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold text-green-600">
                        Ngày tạo:
                      </span>{' '}
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString(
                            'vi-VN',
                          )
                        : 'N/A'}
                    </p>
                    <div className="flex gap-2 mt-4">
                      <button
                        className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 mb-4 ${
                          isCompleted
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                        onClick={() => openEditModal(payment)}
                        disabled={isCompleted || isUpdatingPayment}
                      >
                        Sửa
                      </button>
                      <button
                        className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 ${
                          isCompleted
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        onClick={() => handleDelete(payment._id)}
                        disabled={isCompleted || isDeletingPayment}
                      >
                        {isDeletingPayment ? 'Đang xóa...' : 'Xóa'}
                      </button>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 w-full bg-gradient-to-r from-green-500 to-teal-600 p-2 flex justify-center items-center text-white text-xs my-auto">
                    Mã: {payment._id}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </button>
              <span className="text-gray-800">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
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
      ) : (
        <p className="text-center text-gray-500 mb-6">
          Chưa có thanh toán nào.
        </p>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Tạo thanh toán mới
            </h3>
            <form
              onSubmit={handleSubmitCreate(onCreateSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Chọn đặt bàn
                </label>
                <Controller
                  name="appointment_id._id"
                  control={controlCreate}
                  rules={{ required: 'Vui lòng chọn đặt bàn' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        const selectedAppointment = unpaidAppointments.find(
                          (a) => a._id === e.target.value,
                        );
                        if (
                          typeof selectedAppointment?.tattoo_id === 'object' &&
                          selectedAppointment?.tattoo_id?.price
                        ) {
                          setValueCreate(
                            'amount',
                            selectedAppointment.tattoo_id.price,
                          );
                        } else {
                          setValueCreate('amount', 0);
                        }
                      }}
                    >
                      <option value="">Chọn đặt bàn</option>
                      {unpaidAppointments.map((appointment) => (
                        <option key={appointment._id} value={appointment._id}>
                          {appointment.date
                            ? new Date(appointment.date).toLocaleDateString(
                                'vi-VN',
                              )
                            : 'N/A'}{' '}
                          -{' '}
                          {typeof appointment.timeslot_id !== 'string'
                            ? `${appointment.timeslot_id?.startTime} - ${appointment.timeslot_id?.endTime}`
                            : 'N/A'}{' '}
                          -{' '}
                          {typeof appointment.user_id !== 'string'
                            ? appointment.user_id?.full_name
                            : 'N/A'}{' '}
                          -{' '}
                          {typeof appointment.customer_id !== 'string'
                            ? appointment.customer_id?.full_name
                            : 'Unknown'}{' '}
                          {typeof appointment.tattoo_id === 'object' &&
                          appointment.tattoo_id?.price
                            ? `- ${appointment.tattoo_id.price.toLocaleString('vi-VN')} VNĐ`
                            : '(Không có giá đồ uống)'}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errorsCreate.appointment_id?._id && (
                  <p className="text-red-500 text-sm">
                    {errorsCreate.appointment_id._id.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  {...registerCreate('amount', {
                    required: 'Vui lòng nhập số tiền',
                    min: { value: 1, message: 'Số tiền phải lớn hơn 0' },
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập số tiền"
                  disabled={isCreatingPayment}
                />
                {errorsCreate.amount && (
                  <p className="text-red-500 text-sm">
                    {errorsCreate.amount.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phương thức thanh toán
                </label>
                <Controller
                  name="payment_method"
                  control={controlCreate}
                  rules={{ required: 'Vui lòng chọn phương thức thanh toán' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isCreatingPayment}
                    >
                      <option value="">Chọn phương thức</option>
                      {Object.values(paymentMethod).map((method) => (
                        <option key={method} value={method}>
                          {method === paymentMethod.CASH
                            ? 'Tiền mặt'
                            : method === paymentMethod.CARD
                              ? 'Thẻ tín dụng'
                              : 'Thanh toán online'}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errorsCreate.payment_method && (
                  <p className="text-red-500 text-sm">
                    {errorsCreate.payment_method.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
                  disabled={isCreatingPayment}
                >
                  {isCreatingPayment ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreatingPayment}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Chỉnh sửa thanh toán
            </h3>
            <form
              onSubmit={handleSubmitEdit(onEditSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  {...registerEdit('amount', {
                    required: 'Vui lòng nhập số tiền',
                    min: { value: 1, message: 'Số tiền phải lớn hơn 0' },
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập số tiền"
                  disabled={isUpdatingPayment}
                />
                {errorsEdit.amount && (
                  <p className="text-red-500 text-sm">
                    {errorsEdit.amount.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phương thức thanh toán
                </label>
                <Controller
                  name="payment_method"
                  control={controlEdit}
                  rules={{ required: 'Vui lòng chọn phương thức thanh toán' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isUpdatingPayment}
                    >
                      <option value="">Chọn phương thức</option>
                      {Object.values(paymentMethod).map((method) => (
                        <option key={method} value={method}>
                          {method === paymentMethod.CASH
                            ? 'Tiền mặt'
                            : method === paymentMethod.CARD
                              ? 'Thẻ tín dụng'
                              : 'Thanh toán online'}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errorsEdit.payment_method && (
                  <p className="text-red-500 text-sm">
                    {errorsEdit.payment_method.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
                  disabled={isUpdatingPayment}
                >
                  {isUpdatingPayment ? 'Đang xử lý...' : 'Cập nhật'}
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md ihover:bg-gray-400"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isUpdatingPayment}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentAppointment;
