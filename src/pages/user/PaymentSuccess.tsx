import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-daisyui';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();

  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  return (
    <div className="min-h-screen flex items-center justify-center bg">
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
            className="w-16 h-16 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Thanh toán thành công!
        </h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn{' '}
          <span className="text-primary font-bold">{auth?.full_name}</span> đã
          mua sắm. Đơn hàng của bạn đã được xác nhận và đang được xử lý.
        </p>

        <div className="space-y-4">
          <Button
            color="primary"
            className=" text-white w-full py-3"
            onClick={() => navigate('/order-management')}
          >
            Xem đơn hàng
          </Button>
          <Button
            className="bg-gray-200 hover:bg-gray-300 text-white w-full py-3"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
