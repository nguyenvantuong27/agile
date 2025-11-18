import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-72 h-screen bg-black text-white p-6 overflow-y-auto fixed top-0 left-0 border-r border-gray-700 shadow-md">
      {/* Sidebar Header */}
      <div className="flex items-center space-x-3 mb-12">
        <div className="bg-gray-600 p-2 rounded-lg">
          <svg
            className="w-8 h-8 text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 2a8 8 0 11-8 8 8 8 0 018-8zm0 2a6 6 0 100 12 6 6 0 000-12z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      </div>

      {/* Navigation Links */}
      <ul className="space-y-4">
        <li>
          <NavLink
            to="/employee/Profile"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-md ${
                isActive ? 'bg-gray-600 font-semibold' : 'hover:bg-gray-700'
              } transition duration-200`
            }
          >
            <FaUser className="text-white text-lg mr-3" />
            Thông tin cá nhân
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/employee/Appointments"
            className={({ isActive }) =>
              `flex items-center p-3 rounded-md ${
                isActive ? 'bg-gray-600 font-semibold' : 'hover:bg-gray-700'
              } transition duration-200`
            }
          >
            <FaCalendarAlt className="text-white text-lg mr-3" />
            Danh sách đặt vé
          </NavLink>
        </li>

        {/* Additional links can go here */}
      </ul>
    </div>
  );
};

export default Sidebar;
