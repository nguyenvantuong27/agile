import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const Signup: React.FC = () => {
  return (
    <div className="font-roboto">
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl">
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>

            <form className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="full_name"
                >
                  Họ và tên
                </label>
                <input
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="full_name"
                  placeholder="Nhập họ và tên"
                  type="text"
                  required
                />
              </div>

              {/* Tên tài khoản */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="username"
                >
                  Tên tài khoản
                </label>
                <input
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="username"
                  placeholder="Nhập tên tài khoản"
                  type="text"
                  required
                />
              </div>

              {/* Mật khẩu */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <input
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  type="password"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="email"
                  placeholder="Nhập email"
                  type="email"
                  required
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="phone"
                >
                  Số điện thoại
                </label>
                <input
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  type="text"
                  required
                />
              </div>

              {/* Giới tính */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giới tính
                </label>
                <div className="mt-1 flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="sex"
                      value={1}
                      required
                    />
                    <span className="ml-2">Nam</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="sex"
                      value={2}
                      required
                    />
                    <span className="ml-2">Nữ</span>
                  </label>
                </div>
              </div>

              <button
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                type="submit"
              >
                Đăng ký
              </button>
            </form>

            {/* Đăng ký với MXH */}
            <div className="mt-6 flex justify-center space-x-4">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FaFacebook className="text-blue-600 mr-2 text-3xl" />
                Đăng ký với Facebook
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FcGoogle className="mr-2 text-3xl" />
                Đăng ký với Google
              </button>
            </div>
          </div>

          {/* Ảnh minh họa */}
          <div className="hidden md:block w-full md:w-1/2 p-8">
            <img
              alt="A person getting a tattoo on their arm by a tattoo artist wearing gloves"
              className="w-full h-auto object-cover rounded-lg"
              src="https://storage.googleapis.com/a1aa/image/jPj_rlaLbPVbD-79uwlmgSDVBeaXeWMC0P-Rh_rb9yU.jpg"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Signup;
