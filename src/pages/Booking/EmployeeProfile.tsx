import { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';

interface User {
  _id: string;
  branch_id: {
    _id: string;
    list_product_id: string;
    description: string;
    name: string;
    phone: string;
    status: string;
    address: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  username: string;
  password: string;
  full_name: string;
  email: string;
  phone: string;
  status: number;
  sex: number;
  image: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function EmployeeInfo() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  console.log(auth);

  useEffect(() => {
    fetch(`https://api-tatto-management.vercel.app/api/v1/users/${auth?._id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUser(data.data);
      })
      .catch((error) => console.error('Error fetching user data:', error));
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#C7C7CC]">
      <div className="max-w-3xl mx-auto p-6 bg-[#C7C7CC] rounded-lg  space-y-6">
        <h2 className="text-3xl font-bold text-center">Thông tin cá nhân</h2>
        <div className="flex gap-16">
          <div className="flex flex-col items-center w-1/3 space-y-4">
            <div className="w-40 h-40 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img
                  src={user?.image || imagePreview}
                  alt="Ảnh đại diện"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-500 text-lg">Ảnh</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition"
            >
              Tải ảnh lên
            </label>
          </div>

          <div className="w-2/3 grid grid-cols-2 gap-6">
            <label className="space-y-1">
              Họ và tên
              <input
                type="text"
                name="full_name"
                value={user?.full_name || ''}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </label>
            <label className="space-y-1">
              Giới tính
              <select
                name="sex"
                value={user?.sex || ''}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value={1}>Nam</option>
                <option value={0}>Nữ</option>
              </select>
            </label>
            <label className="space-y-1">
              Email
              <input
                type="email"
                name="email"
                value={user?.email || ''}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </label>
            <label className="space-y-1">
              Chức vụ
              <select
                name="role"
                value={user?.role || ''}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="Thợ xăm">Thợ xăm</option>
                <option value="Quản lý">Quản lý</option>
              </select>
            </label>
            <label className="space-y-1">
              Số điện thoại
              <input
                type="text"
                name="phone"
                value={user?.phone || ''}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <label className="space-y-1">
            Tên đăng nhập
            <input
              type="text"
              name="username"
              value={user?.username || ''}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded w-full"
            />
          </label>
          <br />
          <label className="space-y-1">
            Mật khẩu
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={user?.password || ''}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded w-full pr-10"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </button>
            </div>
          </label>
        </div>

        <div className="flex gap-4 justify-center">
          <button className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800 transition">
            Cập nhật
          </button>
          <button className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">
            Xóa tất cả
          </button>
        </div>

        <button
          className="px-5 py-2 bg-blue-500 text-white rounded absolute bottom-2 right-10 hover:bg-blue-600 transition"
          onClick={() => navigate('/BookingPage')}
        >
          Quay về
        </button>
      </div>
    </div>
  );
}
