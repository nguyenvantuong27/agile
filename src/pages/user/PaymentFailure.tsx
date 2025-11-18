import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-daisyui';

const PaymentFailure: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full mx-4">
        <div className="mb-6">
          <img
            src="https://vnpay.vn/assets/images/logo-icon/logo-primary.svg"
            alt="VNPay Logo"
            className="w-32 mx-auto"
          />
        </div>

        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Thanh toán thất bại!
        </h1>
        <p className="text-gray-600 mb-8">
          Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại
          thông tin và thử lại.
        </p>

        <div className="space-y-4">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white w-full py-3"
            onClick={() => navigate('/cart')}
          >
            Quay lại giỏ hàng
          </Button>
          <Button
            className="bg-gray-200 hover:bg-gray-300 text-white w-full py-3"
            onClick={() => navigate('/contact')}
          >
            Liên hệ hỗ trợ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
