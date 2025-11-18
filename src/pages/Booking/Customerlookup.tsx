import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiFilter } from 'react-icons/hi';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  status: number;
  image: string;
  createdAt: string;
}

const CustomerLookup: React.FC = () => {
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  // const location = useLocation();

  const handleDetailClick = (id: string) => {
    navigate(`/customerinfo/${id}`);
  };

  localStorage.setItem('i18nextLng', 'vi-VN');
  localStorage.setItem('isWhitelist', 'true');

  const fetchUsers = () => {
    if (!auth) {
      console.error('Chưa đăng nhập!');
      return;
    }

    fetch('https://api-tatto-management.vercel.app/api/v1/users', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setUsers(data.data.slice(0, 10));
        } else {
          toast.error(data.message);
        }
      })
      .catch((error) => console.log('Error fetching users:', error.message));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <main className="w-full p-6 bg-white text-black">
        <h1 className="text-xl font-bold mb-4">Tra cứu khách hàng</h1>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="p-2 border rounded w-1/3"
          />
          <button className="bg-gray-300 px-4 py-2 rounded flex items-center gap-2">
            <HiFilter /> Bộ lọc
          </button>
        </div>
        <div className="bg-white p-4 rounded shadow-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-3">Ngày thêm</th>
                <th className="p-3">Tên khách hàng</th>
                <th className="p-3">Số điện thoại</th>
                <th className="p-3">Email</th>
                <th className="p-3">Ảnh</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b bg-gray-100 hover:bg-gray-200"
                >
                  <td className="p-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-bold">{user.full_name}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <img
                      src={user.image || '/avatar.png'}
                      alt="User"
                      className="w-10 h-10 rounded-full"
                    />
                  </td>
                  <td
                    className={`p-3 ${user.status ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {user.status ? 'Hoạt động' : 'Không hoạt động'}
                  </td>
                  <td
                    className="p-3 text-blue-600 cursor-pointer text-right"
                    onClick={() => handleDetailClick(user._id)}
                  >
                    Chi tiết
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default CustomerLookup;
