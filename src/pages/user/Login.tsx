import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const Login: React.FC = () => {
  return (
    <div className="font-roboto">
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl">
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
            <form className="space-y-4">
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
                  placeholder="Vui lòng nhập tên tài khoản"
                  type="text"
                  required
                />
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md relative">
                  <label
                    className="block text-sm font-medium text-gray-700"
                    htmlFor="password"
                  >
                    Mật khẩu
                  </label>
                  <input
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                    id="password"
                    placeholder="Vui lòng nhập mật khẩu"
                    type="password"
                    required
                  />
                </div>
              </div>

              <div className="text-right">
                <a className="text-sm text-blue-600 hover:underline" href="#">
                  Quên mật khẩu
                </a>
              </div>
              <div>
                <button
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  type="submit"
                >
                  Đăng nhập
                </button>
              </div>
              <div className="text-center text-sm text-gray-600">
                Bạn chưa có tài khoản?{' '}
                <a className="text-blue-600 hover:underline" href="./Signup">
                  Đăng ký
                </a>
              </div>
            </form>
            <div className="mt-6 flex justify-center space-x-4">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FaFacebook className="text-blue-600 mr-2 text-3xl" />
                Đăng nhập với Facebook
              </button>
              <button className="flex items-cente r px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FcGoogle className="mr-2 text-3xl" />
                Đăng nhập với Google
              </button>
            </div>
          </div>
          <div className="hidden md:block w-full md:w-1/2 p-8">
            <img
              alt="A person getting a tattoo on their arm by a tattoo artist wearing gloves"
              className="w-full h-auto object-cover rounded-lg"
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
