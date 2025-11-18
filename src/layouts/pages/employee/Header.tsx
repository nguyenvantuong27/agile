import { useState } from 'react';
import { Button } from 'react-daisyui';
import { Logo } from '~/assets/images';
import {
  FaBell,
  FaMapMarkerAlt,
  FaSearch,
  FaQuestionCircle,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaBell as FaBellOutline,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Toastify } from '~/helpers/Toastify';
import { useAppSelector } from '~/hooks/HookRouter';
import { useLogoutHandler } from '~/hooks/useLogoutHandler';
import { ILogoutError } from '~/interfaces/types/auth/auth';
import { RootState } from '~/redux/storage/store';
import { useLogoutMutation } from '~/services/auth/logout.services';

const Header = () => {
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  const branches = ['Chi nhánh A', 'Chi nhánh B', 'Chi nhánh C'];

  const filteredBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(search.toLowerCase()),
  );
  const [logout, { isLoading }] = useLogoutMutation();
  const { handleLogout: logoutHandle } = useLogoutHandler();
  const refreshToken = useAppSelector(
    (state: RootState) => state.auth.currentUser.refreshToken,
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout({ refreshToken });
      logoutHandle();
      Toastify('Đăng xuất thành công', 201);
      navigate('/auth/login', { replace: true });
    } catch (error) {
      const err = error as ILogoutError;
      if (err.data?.message === 'Không tìm thấy session để xóa') {
        logoutHandle();
      } else {
        Toastify('Đăng xuất thất bại', 400);
      }
    }
  };

  return (
    <div className="bg-black text-white p-4 fixed w-full top-0 flex justify-between items-center shadow-lg z-[999]">
      <a href="#">
        <img className="h-100% w-[75px]" src={Logo} alt="Logo" />
      </a>

      {/* Các nút bên phải */}
      <div className="flex items-center space-x-4">
        {/* Icon hỗ trợ */}
        <FaQuestionCircle className="text-xl cursor-pointer" />

        {/* Icon thông báo có badge */}
        <div className="relative cursor-pointer">
          <FaBell className="text-xl" />
          <span className="absolute -top-2 -right-2 bg-[#E6A971] text-black text-xs font-bold px-2 rounded-full">
            1
          </span>
        </div>

        {/* Nút Chi nhánh */}
        <div className="relative">
          <button
            onClick={() => setIsBranchOpen(!isBranchOpen)}
            className="flex items-center bg-white text-black px-4 py-3 rounded-full font-bold shadow border border-black"
          >
            Chi nhánh
            <FaMapMarkerAlt className="ml-2" />
          </button>

          {/* Dropdown danh sách chi nhánh */}
          {isBranchOpen && (
            <div className="absolute mt-2 w-45 bg-white rounded-lg shadow-lg border border-gray-300">
              {/* Ô tìm kiếm */}
              <div className="flex items-center px-3 py-2 border-b">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full outline-none bg-transparent text-black placeholder-gray-400"
                />
              </div>

              {/* Danh sách chi nhánh */}
              <ul className="py-2">
                {filteredBranches.length > 0 ? (
                  filteredBranches.map((branch, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-bold text-black"
                      onClick={() => setIsBranchOpen(false)}
                    >
                      {branch}
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-400">Không tìm thấy</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Avatar + tên admin + dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center bg-white text-black px-3 py-1 rounded-full shadow border border-gray-300"
          >
            {auth?._id ? (
              <div className="flex items-center">
                <div className="w-10 h-10 border border-gray-300 rounded-full overflow-hidden mr-2">
                  <img
                    src={auth?.image}
                    alt="ảnh"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <p className="font-bold">{auth?.full_name}</p>
                  <p className="text-xs text-black">chức vụ: {auth?.role}</p>
                </div>
              </div>
            ) : (
              <Link to="/auth/login">
                <Button color="primary" className="flex w-full text-white">
                  <FaSignOutAlt className="mr-2 text-base" />
                  <p>Đăng nhập</p>
                </Button>
              </Link>
            )}
          </button>

          {/* Dropdown menu user */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-[180px] bg-white rounded-lg shadow-lg border border-gray-300">
              <p className="px-4 py-2 text-sm font-bold text-gray-700 border-b">
                My Account
              </p>
              <ul className="py-2">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                  <FaUser className="mr-2 text-black" />{' '}
                  <Link to={`/admin/profile/${auth._id}`}>
                    <p className="text-black">Profile</p>
                  </Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                  <FaCog className="mr-2 text-black" />{' '}
                  <p className="text-black">Setting</p>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                  <FaBellOutline className="mr-2 text-black" />{' '}
                  <p className="text-black">Notification</p>
                </li>
                <Button
                  className="w-full justify-start cursor-pointer flex items-center"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <FaSignOutAlt className="mr-2 text-black" />{' '}
                  <p className="text-black">Log out</p>
                </Button>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
