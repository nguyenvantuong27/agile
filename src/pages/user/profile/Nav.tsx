import React from 'react';
import { Link } from 'react-router-dom';

const menuItems = [
  { path: '/account', label: 'Tài khoản' },
  { path: '/appointment-list', label: 'Quản lý đặt bàn' },
  { path: '/order-management', label: 'Quản lý đơn hàng' },
  { path: '/favorites-management', label: 'Quản lý đơn hàng yêu thích' },
];
const Nav: React.FC<object> = () => {
  return (
    <div className="w-1/6 pl-14 py-6 flex flex-col justify-between h-auto">
      <div className="">
        {menuItems.map((item) => (
          <Link
            to={item.path}
            key={item.path}
            className="text-gray-600 dark:text-gray-200 hover:text-primary"
          >
            <div className="flex items-center py-2">
              <p>{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Nav;
