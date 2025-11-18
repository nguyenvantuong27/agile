import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '~/components/header/Header';
import Footer from '~/components/footer/Footer';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { useGetUserByIdQuery } from '~/services/users/user.services';
import { useGetLikesByUserQuery } from '~/services/blog/blog.services';
import { useGetDescriptionsByUserIdQuery } from '~/services/description/description.services';
import { useGetTimeslotsByUserIdQuery } from '~/services/timeslots/timeslots.services';
import { FaUserCircle } from 'react-icons/fa';
import { roleUser } from '~/interfaces/enum/roleUser';

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(
    userId!,
  );
  const { data: likedBlogsData, isLoading: likedBlogsLoading } =
    useGetLikesByUserQuery(userId!, {
      skip: !userId || userData?.data.role !== roleUser.USER,
    });
  const { data: descriptionData, isLoading: descriptionLoading } =
    useGetDescriptionsByUserIdQuery(userId!, {
      skip: !userId || userData?.data.role !== roleUser.ARTIST,
    });
  const { data: timeslotsData, isLoading: timeslotsLoading } =
    useGetTimeslotsByUserIdQuery(userId!, {
      skip: !userId || userData?.data.role !== roleUser.ARTIST,
    });

  if (
    userLoading ||
    (userData?.data.role === roleUser.USER && likedBlogsLoading) ||
    (userData?.data.role === roleUser.ARTIST &&
      (descriptionLoading || timeslotsLoading))
  )
    return <LoadingLocal />;

  if (!userData || !userData.data) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg">
        Không tìm thấy thông tin người dùng
      </div>
    );
  }

  const user = userData.data;

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

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-6 py-12 flex flex-col items-center">
        <div
          className={`flex flex-col md:flex-row gap-6 mb-12 w-full ${
            user.role === roleUser.ADMIN ? 'justify-center' : ''
          }`}
        >
          <div className={`bg-white h-full shadow-md rounded-2xl p-6 w-1/2`}>
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.full_name}
                    className="w-24 h-24 rounded-full border-4 border-primary object-cover shadow-md"
                  />
                ) : (
                  <FaUserCircle className="text-gray-400 text-6xl" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {user.full_name}
              </h1>

              <p className="mb-2 text-green-500 font-semibold text-sm">
                {user.verificationCode === null
                  ? 'Tài khoản đã xác thực'
                  : 'Tài khoản chưa xác thực'}
              </p>
              <p className="mb-2 text-sm">
                <span className="font-semibold">Trạng thái: </span>
                <span
                  className={user.isOnline ? 'text-green-500' : 'text-red-500'}
                >
                  {user.isOnline
                    ? 'Đang online'
                    : `Offline ${formatOfflineTime(user.offlineSince)}`}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-left text-sm">
              {[
                {
                  label: 'Giới tính',
                  value:
                    user.sex === 0 ? 'Nam' : user.sex === 1 ? 'Nữ' : 'Khác',
                },
                {
                  label: 'Vai trò',
                  value:
                    user.role === 'user'
                      ? 'Khách hàng'
                      : user.role === 'admin'
                        ? 'Quản trị viên'
                        : 'Barista',
                },
                {
                  label: 'Ngày tạo',
                  value: new Date(user.createdAt).toLocaleDateString('vi-VN'),
                },
                {
                  label: 'Cập nhật',
                  value: new Date(user.updatedAt).toLocaleDateString('vi-VN'),
                },
              ].map((item, index) => (
                <div key={index} className="flex justify-between border-b py-1">
                  <span className="font-semibold">{item.label}:</span>
                  <span>{item.value}</span>
                </div>
              ))}
              <div className="flex justify-between border-b py-1">
                <span className="font-semibold">Tình trạng:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs text-white ${
                    user.status === 1 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {user.status === 1
                    ? 'Tài khoản được phép hoạt động'
                    : 'Bị khóa'}
                </span>
              </div>
            </div>
          </div>

          {user.role === roleUser.ARTIST && (
            <div className="mt-6 md:w-full bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Đánh giá gần đây
              </h3>
              {descriptionData?.data?.length ? (
                <div className="space-y-2">
                  {descriptionData.data.map((desc) => (
                    <div
                      key={desc._id}
                      className="p-2 rounded-md shadow-sm my-1 transition-colors duration-200"
                    >
                      <div className="mt-2 flex items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Đánh giá:
                        </span>
                        <span className="ml-2 text-sm font-semibold text-yellow-500">
                          {desc.rating}/5
                        </span>

                        <svg
                          className="ml-1 w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.357-2.44a1 1 0 00-1.175 0l-3.357 2.44c-.784.57-1.838-.197-1.54-1.118l1.287-3.97a1 1 0 00-.364-1.118L2.98 9.397c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.97z" />
                        </svg>
                      </div>
                      <div className="text-sm mt-1">{desc.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-base italic">
                  Chưa có thông tin mô tả nào cho barista này.
                </p>
              )}

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">
                Lịch trực ca
              </h3>
              {timeslotsData?.data?.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full  border rounded-lg">
                    <thead>
                      <tr className="bg-primary">
                        <th className="py-3 px-4 text-left text-sm font-semibold text-white">
                          Thứ
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-white">
                          Giờ bắt đầu
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-white">
                          Giờ kết thúc
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-white">
                          Giới hạn đặt bàn
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeslotsData.data.map((slot) => (
                        <tr
                          key={slot._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {slot.day_of_week === 'monday'
                              ? 'Thứ Hai'
                              : slot.day_of_week === 'tuesday'
                                ? 'Thứ Ba'
                                : slot.day_of_week === 'wednesday'
                                  ? 'Thứ Tư'
                                  : slot.day_of_week === 'thursday'
                                    ? 'Thứ Năm'
                                    : slot.day_of_week === 'friday'
                                      ? 'Thứ Sáu'
                                      : slot.day_of_week === 'saturday'
                                        ? 'Thứ Bảy'
                                        : 'Chủ Nhật'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatTime(slot.startTime)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatTime(slot.endTime)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {slot.max_appointment} lượt
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-base italic">
                  Chưa có lịch trực ca nào.
                </p>
              )}
            </div>
          )}

          {user.role === roleUser.USER && (
            <div className="bg-white shadow-lg rounded-2xl p-6 w-full md:w-full">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Bài viết đã thích
              </h2>
              {likedBlogsData?.data?.length ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {likedBlogsData.data.slice(0, 5).map((blog) => (
                    <Link
                      to={`/news/${blog._id}`}
                      key={blog._id}
                      className="flex items-center gap-4 p-2 border-b hover:bg-blue-100 transition-all"
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-2">
                          {typeof blog.author === 'object' &&
                            blog.author?.image && (
                              <img
                                src={blog.author.image}
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                          {typeof blog.author === 'object' &&
                          blog.author?.full_name
                            ? blog.author.full_name
                            : 'N/A'}{' '}
                          •{' '}
                          {blog.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString(
                                'vi-VN',
                              )
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        <span>{blog.likeCount} lượt thích</span>
                      </div>

                      <div className="text-xs text-gray-500">
                        <span>{blog.viewCount} lượt xem</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm">
                  Chưa thích bài viết nào
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDetail;
