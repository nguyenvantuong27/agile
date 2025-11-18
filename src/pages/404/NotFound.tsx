import React from 'react';
import { Button } from 'react-daisyui';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container min-h-screen px-6 py-12 mx-auto lg:flex lg:items-center lg:gap-12">
        <div className="w-full lg:w-1/2">
          <p className="text-sm md:text-4xl font-medium text-blue-500 dark:text-blue-400">
            404 lỗi
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">
            Không tìm thấy trang
          </h1>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Xin lỗi nhưng trang bạn tìm chúng tôi không tìm thấy
          </p>

          <div className="flex items-center mt-6 gap-x-3">
            <Link to="/" className="">
              <Button color="primary" className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5 rtl:rotate-180"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
                  />
                </svg>
                Quay lại
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative w-full mt-8 lg:w-1/2 lg:mt-0">
          <img
            className="w-full lg:h-[32rem] h-80 md:h-96 rounded-lg object-cover"
            src="https://images.unsplash.com/photo-1602984338060-bfddce132ebc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Not Found"
          />
        </div>
      </div>
    </section>
  );
};

export default NotFound;
