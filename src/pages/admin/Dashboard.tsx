import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import {
  FaBox,
  FaMoneyBillWave,
  FaClipboardList,
  FaUsers,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCoffee,
  FaBlogger,
  FaStore,
} from 'react-icons/fa';
import { useGetOrdersQuery } from '~/services/order/order.services';
import { useGetAllUsersQuery } from '~/services/users/user.services';
import { useGetAppointmentsQuery } from '~/services/appointments/appointments.services';
import { useGetProductsQuery } from '~/services/product/product.services';
import { useGetReviewsQuery } from '~/services/review/review.services';
import { useGetPaymentsQuery } from '~/services/payment/payment.services';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { paymentStatus } from '~/interfaces/enum/payment.enum';
import { IAppointment } from '~/domain/types/appointments/appointment.model';
import { useGetTattoosQuery } from '~/services/tattoos/tattoos.services';
import { useGetBlogsQuery } from '~/services/blog/blog.services';
import { useGetBranchesQuery } from '~/services/branches/branches.services';

const AdminDashboardPage: React.FC = () => {
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery();
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: appointmentsData, isLoading: appointmentsLoading } =
    useGetAppointmentsQuery();
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery();
  const { data: reviewsData, isLoading: reviewsLoading } = useGetReviewsQuery();
  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetPaymentsQuery();
  const { data: drinksData } = useGetTattoosQuery();
  const { data: blogsData } = useGetBlogsQuery();
  const { data: branchesData } = useGetBranchesQuery();

  const totalOrderRevenue =
    ordersData?.data?.reduce(
      (sum, order) =>
        order.status === 'DELIVERED' ? sum + (order.total || 0) : sum,
      0,
    ) || 0;

  const totalAppointmentRevenue =
    appointmentsData?.data?.reduce((sum, appointment: IAppointment) => {
      const appointmentPayments =
        paymentsData?.data?.filter(
          (p) => p.appointment_id?._id === appointment._id,
        ) || [];

      const totalPaid = appointmentPayments.reduce(
        (paidSum, p) => paidSum + (p.amount || 0),
        0,
      );

      const totalPrice =
        typeof appointment.tattoo_id === 'object' &&
        appointment.tattoo_id !== null
          ? appointment.tattoo_id.price
          : null;

      let status: paymentStatus;
      if (totalPrice === null) {
        status = totalPaid > 0 ? paymentStatus.PAID : paymentStatus.UNPAID;
      } else {
        if (totalPaid >= totalPrice) {
          status = paymentStatus.COMPLETED;
        } else if (totalPaid > 0) {
          status = paymentStatus.DEBT;
        } else {
          status = paymentStatus.UNPAID;
        }
      }

      if (status === paymentStatus.PAID || status === paymentStatus.COMPLETED) {
        return sum + totalPaid;
      }
      return sum;
    }, 0) || 0;

  const totalRevenue = totalOrderRevenue;

  const orderStatusStats =
    ordersData?.data?.reduce(
      (acc, order) => {
        if (order.status) {
          acc[order.status] = (acc[order.status] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

  // const appointmentStatusStats =
  //   appointmentsData?.data?.reduce(
  //     (acc, appointment) => {
  //       if (appointment.status) {
  //         acc[appointment.status] = (acc[appointment.status] || 0) + 1;
  //       }
  //       return acc;
  //     },
  //     {} as Record<string, number>,
  //   ) || {};

  const totalOrders = ordersData?.data?.length || 0;
  const totalUsers = usersData?.data?.length || 0;
  const totalProducts = productsData?.data?.length || 0;
  const totalAppointments = appointmentsData?.data?.length || 0;

  const orderPieData = [
    {
      name: 'PENDING',
      value: orderStatusStats['PENDING'] || 0,
      color: '#FBBF24',
    },
    {
      name: 'CONFIRMED',
      value: orderStatusStats['CONFIRMED'] || 0,
      color: '#3B82F6',
    },
    {
      name: 'SHIPPING',
      value: orderStatusStats['SHIPPING'] || 0,
      color: '#F97316',
    },
    {
      name: 'DELIVERED',
      value: orderStatusStats['DELIVERED'] || 0,
      color: '#10B981',
    },
    {
      name: 'CANCELED',
      value: orderStatusStats['CANCELED'] || 0,
      color: '#EF4444',
    },
  ].filter((item) => item.value > 0);

  // const appointmentPieData = [
  //   { name: 'PENDING', value: appointmentStatusStats['PENDING'] || 0, color: '#FBBF24' },
  //   { name: 'APPROVED', value: appointmentStatusStats['APPROVED'] || 0, color: '#10B981' },
  //   { name: 'CANCELED', value: appointmentStatusStats['CANCELED'] || 0, color: '#EF4444' },
  // ].filter((item) => item.value > 0);

  const recentAppointments = [...(appointmentsData?.data || [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  const recentReviews = [...(reviewsData?.data || [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  const recentPayments = [...(paymentsData?.data || [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

  if (
    ordersLoading ||
    usersLoading ||
    appointmentsLoading ||
    productsLoading ||
    reviewsLoading ||
    paymentsLoading
  ) {
    return <LoadingLocal />;
  }

  return (
    <div className="w-full min-h-screen text-white p-6">
      <div className="relative w-full h-48 mb-8">
        <img
          src="https://images.unsplash.com/photo-1572116469696-31de0f17cc34?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Prime Drink Admin Dashboard"
          className="w-full h-full object-cover rounded-xl shadow-lg"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-xl"></div>
        <div className="absolute top-12 left-10 text-white">
          <p className="text-2xl">XIN CHÀO!</p>
          <p className="text-4xl font-bold tracking-wide">ADMIN PRIME DRINK</p>
          <p className="text-lg mt-2">Hệ thống quản lý đồ uống hiện đại</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-red-900 to-red-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <FaMoneyBillWave className="text-3xl text-yellow-400 mr-2" />
            <div className="text-xl font-bold">
              {totalRevenue.toLocaleString()} VND
            </div>
          </div>
          <p className="text-sm uppercase font-semibold">
            Tổng doanh thu đơn hàng
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-900 to-amber-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center ">
            <FaCalendarCheck className="text-3xl text-yellow-400 mr-2" />
            <div className="text-xl font-bold">
              {totalAppointmentRevenue.toLocaleString()} VND
            </div>
          </div>
          <p className="text-sm uppercase font-semibold">
            Tổng doanh thu đặt bàn
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <FaBox className="text-3xl text-yellow-400" />
            <div className="text-3xl font-bold">{totalProducts}</div>
          </div>
          <p className="text-sm uppercase font-semibold">Tổng sản phẩm</p>
        </div>
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <FaClipboardList className="text-3xl text-yellow-400" />
            <div className="text-3xl font-bold">{totalOrders}</div>
          </div>
          <p className="text-sm uppercase font-semibold">Tổng đơn hàng</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900 to-purple-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <FaUsers className="text-3xl text-yellow-400" />
            <div className="text-3xl font-bold">{totalUsers}</div>
          </div>
          <p className="text-sm uppercase font-semibold">Tổng khách hàng</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <FaCalendarAlt className="text-3xl text-yellow-400" />
            <div className="text-3xl font-bold">{totalAppointments}</div>
          </div>
          <p className="text-sm uppercase font-semibold">Tổng đặt bàn</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900 to-orange-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <FaCoffee className="text-3xl text-yellow-400" />
            <div className="text-3xl font-bold">{drinksData?.data.length}</div>
          </div>
          <p className="text-sm uppercase font-semibold">Tổng đồ uống</p>
        </div>
        <div className="bg-gradient-to-br from-pink-900 to-pink-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <FaBlogger className="text-3xl text-yellow-400" />
            <div className="text-3xl font-bold">{blogsData?.data.length}</div>
          </div>
          <p className="text-sm uppercase font-semibold">Tổng tin tức</p>
        </div>
        <div className="bg-gradient-to-br from-teal-900 to-teal-700 rounded-xl p-5 shadow-lg flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <FaStore className="text-3xl text-yellow-400" />
            <div className="text-3xl font-bold">
              {branchesData?.data.length}
            </div>
          </div>
          <p className="text-sm uppercase font-semibold">Tổng cửa hàng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-center mb-4">
            THỐNG KÊ ĐƠN HÀNG
          </h2>
          {orderPieData.length > 0 ? (
            <PieChart width={300} height={300}>
              <Pie
                data={orderPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {orderPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <p className="text-center text-gray-400">
              Chưa có dữ liệu đơn hàng.
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">HOẠT ĐỘNG ĐẶT ĐƠN GẦN ĐÂY</h2>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-200">
              Xem tất cả
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {ordersData?.data?.slice(0, 100).map((order) => (
              <div
                key={order._id}
                className="flex items-center gap-4 border-b border-gray-700 pb-3"
              >
                <img
                  src={
                    typeof order.user_id === 'object' && order.user_id?.image
                      ? order.user_id?.image
                      : 'https://static.vecteezy.com/system/resources/previews/000/439/863/non_2x/vector-users-icon.jpg'
                  }
                  className="w-10 h-10 object-cover rounded-full bg-gray-600 flex items-center justify-center text-white"
                />

                <div>
                  <p className="font-semibold text-blue-400">
                    {typeof order.user_id === 'object' &&
                    order.user_id?.full_name
                      ? order.user_id?.full_name
                      : 'Khách vãng lai'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Đặt đơn: {(order._id ?? '').slice(0, 8)}... -{' '}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString('vi-VN')
                      : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Tổng tiền: {(order.total ?? 0).toLocaleString()} VND
                  </p>
                </div>
              </div>
            ))}
            {totalOrders === 0 && (
              <p className="text-center text-gray-400">
                Chưa có hoạt động nào.
              </p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">ĐẶT BÀN GẦN ĐÂY</h2>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-200">
              Xem tất cả
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center gap-4 border-b border-gray-700 pb-3"
                >
                  <img
                    src={
                      typeof appointment.user_id === 'object' &&
                      typeof appointment.customer_id === 'object' &&
                      appointment.customer_id?.image
                        ? appointment.customer_id?.image
                        : 'https://static.vecteezy.com/system/resources/previews/000/439/863/non_2x/vector-users-icon.jpg'
                    }
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-blue-400">
                      {typeof appointment.customer_id === 'object' &&
                      appointment.customer_id?.full_name
                        ? appointment.customer_id?.full_name
                        : 'Khách vãng lai'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Đặt bàn #{appointment._id.slice(-6)} -{' '}
                      {new Date(appointment.createdAt).toLocaleString('vi-VN')}
                    </p>
                    <p
                      className={`text-sm ${
                        appointment.status === 'APPROVED'
                          ? 'text-green-500'
                          : appointment.status === 'PENDING'
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }`}
                    >
                      {appointment.status === 'APPROVED'
                        ? 'Đã xác nhận'
                        : appointment.status === 'PENDING'
                          ? 'Chờ xác nhận'
                          : 'Đã hủy'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">
                Chưa có hoạt động đặt bàn.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">ĐÁNH GIÁ DỊCH VỤ GẦN ĐÂY</h2>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-200">
              Xem tất cả
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div
                  key={review._id}
                  className="flex items-center gap-4 border-b border-gray-700 pb-3"
                >
                  <img
                    src={
                      typeof review.user_id === 'object' &&
                      review.user_id?.image
                        ? review.user_id?.image
                        : 'https://static.vecteezy.com/system/resources/previews/000/439/863/non_2x/vector-users-icon.jpg'
                    }
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-blue-400">
                      {typeof review.user_id === 'object' &&
                      review.user_id?.full_name
                        ? review.user_id?.full_name
                        : 'Khách vãng lai'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Đánh giá: {review.comments.slice(0, 30)}... -{' '}
                      {new Date(review.createdAt || 0).toLocaleString('vi-VN')}
                    </p>
                    <p className="text-sm text-yellow-500">
                      {Array(review.rating).fill('★').join('')} ({review.rating}
                      /5)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">Chưa có đánh giá nào.</p>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">THANH TOÁN ĐẶT BÀN GẦN ĐÂY</h2>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-200">
              Xem tất cả
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentPayments.length > 0 ? (
              recentPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center gap-4 border-b border-gray-700 pb-3"
                >
                  <img
                    src={
                      typeof payment.appointment_id === 'object' &&
                      typeof payment.appointment_id?.customer_id === 'object' &&
                      payment.appointment_id.customer_id?.image
                        ? payment.appointment_id?.customer_id?.image
                        : 'https://static.vecteezy.com/system/resources/previews/000/439/863/non_2x/vector-users-icon.jpg'
                    }
                    alt="Customer avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-blue-400">
                      {typeof payment.appointment_id === 'object' &&
                      typeof payment.appointment_id.customer_id === 'object' &&
                      payment.appointment_id?.customer_id?.full_name
                        ? payment.appointment_id?.customer_id?.full_name
                        : 'Khách vãng lai'}
                    </p>
                    <p className="text-sm text-gray-400">
                      Thanh toán đặt bàn #
                      {typeof payment.appointment_id === 'object'
                        ? payment.appointment_id?._id?.slice(-6)
                        : 'N/A'}{' '}
                      -{' '}
                      {new Date(payment.createdAt || 0).toLocaleString('vi-VN')}
                    </p>
                    <p className="text-sm text-green-500">
                      Số tiền: {(payment.amount || 0).toLocaleString()} VND
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">
                Chưa có thanh toán nào.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
