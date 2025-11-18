import React from 'react';
import { FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Logo } from '~/assets/images';
const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 py-12">
      <div className="container mx-auto p-6">
        <div className="lg:flex">
          <div className="w-full lg:w-2/5">
            <div>
              <a href="#">
                <img className="w-auto h-20 w-20" src={Logo} alt="Logo" />
              </a>
              <p className="max-w-sm mt-2 text-gray-500 dark:text-gray-400">
                "Lưu giữ dấu ấn, khắc sâu cá tính."
              </p>
              <div className="flex mt-6 space-x-4">
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-500"
                >
                  <FaFacebook size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-pink-500"
                >
                  <FaInstagram size={20} />
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-500"
                >
                  <FaGithub size={20} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 lg:mt-0 lg:flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-gray-700 uppercase dark:text-white">
                  Về chúng tôi
                </h3>
                <Link
                  to="about_us"
                  className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Giới thiệu
                </Link>

                <a
                  href="#"
                  className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Tuyển dụng
                </a>
              </div>
              <div>
                <h3 className="text-gray-700 uppercase dark:text-white">
                  Dịch vụ
                </h3>
                <a
                  href="#"
                  className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Đặt đơn
                </a>
              </div>
              <div>
                <h3 className="text-gray-700 uppercase dark:text-white">
                  Bộ sưu tập
                </h3>
                <a
                  href="#"
                  className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Trà sữa
                </a>
                <a
                  href="#"
                  className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Đồ ăn
                </a>
                <a
                  href="#"
                  className="block mt-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Phong cách truyền thống
                </a>
              </div>
              <div>
                <h3 className="text-gray-700 uppercase dark:text-white">
                  Liên hệ
                </h3>
                <span className="block mt-2 text-sm text-gray-600 dark:text-gray-400">
                  +84 123 456 789
                </span>
                <span className="block mt-2 text-sm text-gray-600 dark:text-gray-400">
                  @gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="h-px my-6 bg-gray-200 dark:bg-gray-700" />
        <div>
          <p className="text-center text-gray-500 dark:text-gray-400">
            © PRIME 2025 - Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
