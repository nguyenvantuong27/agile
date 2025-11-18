import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '~/components/header/Header';
import Footer from '~/components/footer/Footer';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import {
  useGetEmployeeByIdQuery,
  usePatchUserMutation,
} from '~/services/users/user.services';
import LoadingPage from '~/components/loading/LoadingPage';
import { Button } from 'react-daisyui';
import { Toastify } from '~/helpers/Toastify';

const Account: React.FC = () => {
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const {
    data: user,
    isLoading: isLoadingUser,
    isFetching,
  } = useGetEmployeeByIdQuery(auth._id || '', {
    skip: !auth._id,
    refetchOnMountOrArgChange: true,
  });

  const [patchUser, { isLoading: isUpdating }] = usePatchUserMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    sex: 0,
    image: '',
  });

  useEffect(() => {
    if (user?.data) {
      setFormData({
        full_name: user.data.full_name,
        email: user.data.email,
        phone: user.data.phone,
        sex: user.data.sex,
        image: user.data.image,
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'sex' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (user?.data._id) {
        await patchUser({
          id: user.data._id,
          data: formData,
        }).unwrap();
        setIsEditing(false);
        Toastify('Cập nhật thông tin thành công!', 200);
      }
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

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

  if (isLoadingUser || isFetching) {
    return <LoadingPage loading />;
  }

  if (!user?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Không tìm thấy thông tin người dùng</p>
      </div>
    );
  }

  const userData = user.data;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow px-4 py-8 ">
        <div className="w-full shadow-md rounded-lg overflow-hidden">
          <div className="p-8 text-center bg-[url(https://marketplace.canva.com/EAFvmtv4mfw/1/0/1600w/canva-purple-and-pink-anime-playful-simple-desktop-wallpaper-Lnpa-mrfsaQ.jpg)]">
            <img
              src={formData.image || 'https://via.placeholder.com/150'}
              alt={userData.full_name}
              className="w-40 h-40 rounded-full mx-auto border-4 border-white object-cover shadow-lg"
            />
            {isEditing ? (
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="URL ảnh đại diện"
                className="mt-4 w-full max-w-md mx-auto p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : null}
            <h1 className="mt-6 text-3xl font-bold text-gray-800">
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full max-w-md mx-auto p-2 border rounded text-center text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-white font-bold">{userData.full_name}</p>
              )}
            </h1>
            <p className="text-white font-bold mt-2 text-lg">
              {userData.role ? 'Khách hàng' : 'không xác định'}
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-3 mb-6">
                  Thông tin đăng nhập
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={userData.username}
                      className="w-full p-3 border rounded text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Mật khẩu
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="password"
                        readOnly
                        value="**********"
                        className="w-full p-3 border rounded text-gray-700"
                      />
                      <Link
                        to="/Reset_Password"
                        className="text-sm text-primary hover:underline whitespace-nowrap"
                      >
                        Đặt lại
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-3 mb-6">
                  Thông tin cá nhân
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="email"
                        readOnly
                        value={userData.email}
                        className="w-full p-3 border rounded text-gray-700"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={userData.phone}
                        className="w-full p-3 border rounded text-gray-700"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Giới tính
                    </label>
                    {isEditing ? (
                      <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>Nam</option>
                        <option value={1}>Nữ</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        readOnly
                        value={userData.sex === 1 ? 'Nữ' : 'Nam'}
                        className="w-full p-3 border rounded text-gray-700"
                      />
                    )}
                  </div>
                </div>
              </section>
            </div>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-3 mb-6">
                Thông tin bổ sung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tình trạng
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={
                      userData.status === 1
                        ? 'Tài khoản được phép hoạt động'
                        : 'Tài khoản bị khoá'
                    }
                    className="w-full p-3 border rounded text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Trạng thái hoạt động
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={
                      userData.isOnline
                        ? 'Đang online'
                        : `Offline ${formatOfflineTime(userData.offlineSince)}`
                    }
                    className={`w-full p-3 border rounded text-gray-700 ${
                      userData.isOnline ? 'text-green-500' : 'text-red-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Ngày tạo
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={new Date(userData.createdAt).toLocaleDateString(
                      'vi-VN',
                    )}
                    className="w-full p-3 border rounded text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Ngày cập nhật
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={new Date(userData.updatedAt).toLocaleDateString(
                      'vi-VN',
                    )}
                    className="w-full p-3 border rounded text-gray-700"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="p-8 flex justify-end gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-black text-white rounded transition-colors"
                  disabled={isUpdating}
                >
                  Hủy
                </button>
                <Button
                  color="primary"
                  onClick={handleSubmit}
                  className="px-6 py-2 text-white rounded transition-colors"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </>
            ) : (
              <Button
                color="primary"
                onClick={() => setIsEditing(true)}
                className="text-white transition-colors"
              >
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Account;
