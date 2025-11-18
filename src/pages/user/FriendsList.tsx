import React from 'react';
import Header from '~/components/header/Header';
import { useGetUsersWithRoleUserQuery } from '~/services/users/user.services';
import { useGetOrdersByUserIdQuery } from '~/services/order/order.services';
import { useGetAppointmentsByCustomerIdQuery } from '~/services/appointments/appointments.services';
import { useNavigate } from 'react-router-dom';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { IUser } from '~/domain/types/user/user.model';

interface UserItemProps {
  user: IUser;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  const navigate = useNavigate();
  const { data: ordersData } = useGetOrdersByUserIdQuery(user._id, {
    skip: !user._id,
  });
  const { data: appointmentsData } = useGetAppointmentsByCustomerIdQuery(
    user._id || '',
    {
      skip: !user._id,
    },
  );

  const formatOfflineTime = (offlineSince: string | null) => {
    if (!offlineSince) return 'vừa mới đây';
    const minutes = parseInt(offlineSince.split(' ')[0], 10);
    if (minutes < 60) return `${minutes} phút`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours < 24)
      return `${hours} giờ ${remainingMinutes > 0 ? `${remainingMinutes} phút` : ''}`;
    const days = Math.floor(hours / 24);
    return `${days} ngày`;
  };

  return (
    <div
      className="relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
      onClick={() => navigate(`/user-detail/${user._id}`)}
    >
      <div className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full">
                <img
                  src={user.image || 'https://via.placeholder.com/150'}
                  alt={user.full_name}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <span
              className={`absolute bottom-1 right-0 w-4 h-4 rounded-full border-2 border-white ${
                user.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            ></span>
          </div>
          <div className="flex-1">
            <h3 className="text-md font-semibold text-primary line-clamp-1">
              {user.full_name}
            </h3>
            <p className="text-sm text-gray-500">
              {user.isOnline
                ? 'Đang online'
                : `Offline ${formatOfflineTime(user.offlineSince)}`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium text-gray-800">Email:</span>
            <span className="line-clamp-1">{user.email}</span>
          </p>
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium text-gray-800">Phone:</span>
            {user.phone || 'Chưa cung cấp'}
          </p>
          <div className="flex gap-4">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4866/4866645.png"
                className="w-5 h-5 object-cover"
                alt="Orders"
              />
              <span>{ordersData?.data?.length || 0} đơn hàng</span>
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1497/1497835.png"
                className="w-5 h-5 object-cover"
                alt="Appointments"
              />
              <span>{appointmentsData?.data?.length || 0} lịch hẹn</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FriendsList: React.FC = () => {
  const {
    data: usersData,
    isLoading,
    error,
  } = useGetUsersWithRoleUserQuery({
    limit: 20,
    page: 1,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingLocal />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="alert alert-error max-w-md mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Lỗi khi tải danh sách khách hàng</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Danh sách khách hàng
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {usersData?.data
            ?.filter((user) => user._id)
            .map((user) => (
              <UserItem key={user._id} user={user as IUser} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default FriendsList;
