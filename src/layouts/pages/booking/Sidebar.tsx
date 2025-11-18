import { Link } from 'react-router-dom';
import { FaUsers, FaDatabase, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-black text-white p-6 fixed leading-10 font-semibold ">
      <div className="w-[90px] ml-[50px] rotate-90 ">
        <img src="../public/images/admin/logo.jpg" alt="" />
      </div>
      <ul>
        <li className="mb-2">
          <Link to="/Customerlookup" className="block p-2 hover:bg-gray-700">
            🏠 Tổng quan
          </Link>
        </li>

        <li className="mb-2">
          <Link
            to="/admin"
            className="block p-2 hover:bg-gray-700 flex gap-2 items-center"
          >
            <FaUsers />
            Đặt lịch khách hàng
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/EmployeeProfile"
            className="block p-2 hover:bg-gray-700 flex gap-2 items-center"
          >
            <FaUsers />
            Thông tin cá nhân
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/Customerlookup"
            className="block p-2 hover:bg-gray-700 flex gap-2 items-center"
          >
            <FaDatabase />
            Tra cứu khách hàng
          </Link>
        </li>
        <li className="mb-2">
          <Link
            to="/logout"
            className="block p-2 hover:bg-gray-700 flex gap-2 items-center"
          >
            <FaSignOutAlt />
            Đăng xuất
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
