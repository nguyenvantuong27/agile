import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt,
  FaUser,
  FaDatabase,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';
import { RiBarChartBoxFill } from 'react-icons/ri';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { toast } from 'react-toastify';

interface Branch {
  _id: string;
  name: string;
  address: string;
}
interface Timeslot {
  _id: string;
  startTime: string;
  endTime: string;
}

const CustomerBooking: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  // const token = localStorage.getItem('token');
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    branch_id: '',
    timeslot_id: '',
    date: '',
    tattooDesign: '',
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);

  useEffect(() => {
    fetch(`https://api-tatto-management.vercel.app/api/v1/branches`)
      .then((res) => res.json())
      .then((data) => setBranches(data.data || []))
      .catch((error) =>
        console.error('Lỗi khi lấy danh sách chi nhánh:', error),
      );

    fetch(`https://api-tatto-management.vercel.app/api/v1/timeslots`)
      .then((res) => res.json())
      .then((data) => setTimeslots(data.data || []))
      .catch((error) => console.error('Lỗi khi lấy khung giờ:', error));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  console.log(auth);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth) {
      toast.error('Bạn chưa đăng nhập! Vui lòng đăng nhập.');
      return;
    }

    try {
      const response = await fetch(
        'https://api-tatto-management.vercel.app/api/v1/appointments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ ...formData, user_id: auth._id }),
        },
      );

      const result = await response.json();
      if (response.ok) {
        toast.success('Đặt lịch thành công!');
        navigate('/BookingSuccess');
      } else {
        toast.error(result.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error);
      toast.error('Không thể kết nối đến server.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-grow bg-gray-100">
        {/* Sidebar */}
        <aside className="w-1/5 bg-gray-900 text-white p-4">
          <div
            className="flex justify-between items-center cursor-pointer py-3 px-4"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="text-lg font-semibold flex items-center gap-2">
              <RiBarChartBoxFill /> Tổng quan
            </span>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          {isOpen && (
            <nav>
              <ul className="space-y-1 mt-2">
                <li className="py-3 px-6 flex items-center gap-3 hover:bg-gray-700 rounded-lg">
                  <FaCalendarAlt />
                  <Link to="/BookingPage">Đặt lịch cho khách hàng</Link>
                </li>
                <li className="py-3 px-6 flex items-center gap-3 hover:bg-gray-700 rounded-lg">
                  <FaUser />
                  <Link to="/EmployeeProfile">Thông tin cá nhân</Link>
                </li>
                <li className="py-3 px-6 flex items-center gap-3 hover:bg-gray-700 rounded-lg">
                  <FaDatabase />
                  <Link to="/Customerlookup">Tra cứu khách hàng</Link>
                </li>
                <li className="py-3 px-6 flex items-center gap-3 hover:bg-red-500 rounded-lg">
                  <FaSignOutAlt />
                  <Link to="/logout">Đăng xuất</Link>
                </li>
              </ul>
            </nav>
          )}
        </aside>

        {/* Main Content */}
        <main className="w-4/5 p-10 bg-gray-500 text-black shadow-lg rounded-lg flex">
          <div className="w-3/4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
              Đặt lịch cho khách hàng
            </h1>
            <form className="space-y-4" onSubmit={handleBooking}>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-3/4 p-3 border border-gray-300 rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-400"
                required
                placeholder="Tên khách hàng"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-3/4 p-3 border border-gray-300 rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-400"
                required
                placeholder="Số điện thoại"
              />
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleInputChange}
                className="w-1/2 p-3 border border-gray-300 rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-400"
              >
                <option value="" disabled>
                  Chọn chi nhánh
                </option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.address}
                  </option>
                ))}
              </select>
              <br />
              <select
                name="timeslot_id"
                value={formData.timeslot_id}
                onChange={handleInputChange}
                className="w-1/2 p-3 border border-gray-300 rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-400"
              >
                <option value="" disabled>
                  Chọn khung giờ
                </option>
                {timeslots.map((timeslot) => (
                  <option key={timeslot._id} value={timeslot._id}>
                    {timeslot.startTime}-{timeslot.endTime}
                  </option>
                ))}
              </select>
              <br />

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-1/2 p-3 border border-gray-300 rounded-lg bg-white shadow-md focus:ring-2 focus:ring-blue-400"
                required
              />
              <br />
              <button
                type="submit"
                className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg"
              >
                Đặt lịch
              </button>
            </form>
          </div>

          {/* Hiển thị avatar bên phải */}
          <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center border shadow-lg mt-12">
            <img
              src="/mnt/data/Frame 9100 (2).png"
              alt=""
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.png';
              }} // fallback nếu ảnh bị lỗi
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerBooking;
