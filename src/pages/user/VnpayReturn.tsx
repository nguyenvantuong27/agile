import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUpdateOrderStatusMutation } from '~/services/order/order.services';
import { Toastify } from '~/helpers/Toastify';

const VnpayReturn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  useEffect(() => {
    const orderId = searchParams.get('vnp_TxnRef');
    const rspCode = searchParams.get('vnp_ResponseCode');

    if (!orderId || !rspCode) {
      Toastify('Dữ liệu trả về từ VNPay không hợp lệ', 400);
      navigate('/failture');
      return;
    }

    const handleVnpayResult = async () => {
      try {
        if (rspCode === '00') {
          await updateOrderStatus({ id: orderId, status: 'PAID' }).unwrap();
          Toastify('Thanh toán thành công!', 200);
          navigate('/success');
        } else {
          Toastify('Thanh toán thất bại!', 400);
          navigate('/failture');
        }
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Đã có lỗi xảy ra!';
        Toastify(errorMessage, 400);

        navigate('/failture');
      }
    };

    handleVnpayResult();
  }, [searchParams, navigate, updateOrderStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
            className="animate-spin w-12 h-12 text-blue-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Đang xử lý thanh toán
        </h2>
        <p className="text-gray-600">
          Vui lòng chờ trong giây lát, chúng tôi đang xác nhận giao dịch của
          bạn...
        </p>
      </div>
    </div>
  );
};

export default VnpayReturn;
