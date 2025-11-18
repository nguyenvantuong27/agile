import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const Forget: React.FC = () => {
  return (
    <div className="font-roboto">
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl">
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Quên mật khẩu
            </h2>
            <form className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  Email &amp; số điện thoại
                </label>
                <input
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  id="email & number"
                  placeholder="Vui lòng nhập email & số điện thoại"
                  type="text & number"
                />
              </div>
              <div>
                <button
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  type="submit"
                >
                  Gửi yêu cầu khôi phục
                </button>
              </div>
            </form>
          </div>
          <div className="hidden md:block w-full md:w-1/2 p-8">
            <img
              alt="Barista đang pha chế đồ uống tươi ngon tại Prime Drink"
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

export default Forget;
