import React from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import successful from '../../assets/img_notification/img__suc.png';
const Cart_Successful: React.FC = () => {
  return (
    <div className="bg-white text-gray-800 font-rotobo">
      <Header />
      <div className="container mx-auto p-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div>
            <h2 className="text-xl font-bold mb-4">Thông tin khách hàng</h2>
            <form>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="username"
                >
                  Tên tài khoản
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  id="username"
                  type="text"
                  placeholder="Vui lòng nhập Tên khách hàng"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="phone"
                >
                  Số điện thoại
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  id="phone"
                  placeholder="Vui lòng nhập số điện thoại"
                  type="text"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="address"
                >
                  Địa chỉ
                </label>
                <input
                  className="w-full border border-gray-300 p-2 rounded"
                  id="address"
                  placeholder="Địa chỉ đơn hàng"
                  type="text"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium mb-2"
                  htmlFor="payment-method"
                >
                  Phương thức thanh toán
                </label>
                <select
                  id="payment-method"
                  className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="cod">Thanh toán nhận hàng</option>
                  <option value="vnpay">Thanh toán bằng Vnpay</option>
                  <option value="momo">Thanh toán bằng MoMo</option>
                </select>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="mb-4">
              {/* Product Item 1 */}
              <div className="flex items-center mb-4">
                <img
                  alt="Cà phê Espresso"
                  className="w-16 h-16 object-cover mr-4"
                  height="100"
                  src="https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=100&h=100&fit=crop&crop=center"
                  width="50"
                />
                <div>
                  <p className="font-bold">Cà phê Espresso</p>
                  <p className="text-red-500">ĐỒ UỐNG</p>
                  <p>45.000₫</p>
                </div>
              </div>

              {/* Product Item 2 */}
              <div className="flex items-center mb-4">
                <img
                  alt="Trà sữa Matcha"
                  className="w-16 h-16 object-cover mr-4"
                  height="100"
                  src="https://images.unsplash.com/photo-1568471173166-a36cb03e8056?w=400&h=400&fit=crop&crop=center"
                  width="50"
                />
                <div>
                  <p className="font-bold">Trà sữa Matcha</p>
                  <p className="text-red-500">ĐỒ UỐNG</p>
                  <p>65.000₫</p>
                </div>
              </div>

              {/* Product Item 3 */}
              <div className="flex items-center mb-4">
                <img
                  alt="Smoothie Dâu tây"
                  className="w-16 h-16 object-cover mr-4"
                  height="100"
                  src="https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop&crop=center"
                  width="50"
                />
                <div>
                  <p className="font-bold">Smoothie Dâu tây</p>
                  <p className="text-red-500">ĐỒ UỐNG</p>
                  <p>75.000₫</p>
                </div>
              </div>
            </div>

            {/* Discount Code */}
            <div className="mb-4">
              <input
                className="w-full border border-gray-300 p-2 rounded mb-2"
                placeholder="Nếu có, đừng quên nhập mã giảm giá"
                type="text"
              />
              <button className="w-full bg-gray-200 p-2 rounded">
                Xác nhận
              </button>
            </div>

            {/* Order Total */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span>Tổng thu</span>
                <span>225.000₫</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Phí giao hàng</span>
                <span>25.000₫</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Tổng</span>
                <span>250.000₫</span>
              </div>
            </div>

            {/* Payment Button */}
            <button className="w-full bg-black text-white p-2 rounded">
              Thanh toán
            </button>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-sm w-full">
          {/* Content */}
          <div className="flex flex-col items-center text-center">
            <div className="">
              <img src={successful} alt="" />
            </div>
            <h2 className="text-xl font-bold mb-2">Hoàn tất đơn hàng</h2>
            <p className="text-gray-600 mb-4">
              Thật tuyệt khi được phục vụ bạn. <br />
              Đừng ngại liên hệ chúng tôi nếu cần hỗ trợ nhé!
            </p>
            <button className="bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800 transition">
              Hoàn thành
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart_Successful;
