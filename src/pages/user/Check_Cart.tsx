import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useForm } from 'react-hook-form';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { useGetCartDetailsByCartIdQuery } from '~/services/cart-details/cart-details.services';
import { useCreateOrderMutation } from '~/services/order/order.services';
import { useApplyVoucherMutation } from '~/services/voucher/voucher.services';
import {
  useCreateUserAddressMutation,
  useUpdateUserAddressMutation,
} from '~/services/users/user.services';
import { Toastify } from '~/helpers/Toastify';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { Button } from 'react-daisyui';
import { IProduct } from '~/domain/types/product/product.model';
import { ICartDetail } from '~/domain/types/cart-details/cart-details.model';

interface CheckoutForm {
  phone: string;
  address: string;
}

const Check_Cart: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const { cartId, totalAmount } = state || {};

  const { data: cartDetailsData, isLoading } = useGetCartDetailsByCartIdQuery(
    cartId || '',
    { skip: !cartId },
  );

  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();
  const [applyVoucher, { isLoading: isApplyingVoucher }] =
    useApplyVoucherMutation();
  const [createUserAddress, { isLoading: isCreatingAddress }] =
    useCreateUserAddressMutation();
  const [updateUserAddress, { isLoading: isUpdatingAddress }] =
    useUpdateUserAddressMutation();
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<CheckoutForm>({
    defaultValues: {
      phone: auth?.phone || '',
      address: auth?.address || '',
    },
  });

  // Cập nhật form với thông tin từ auth khi component mount
  useEffect(() => {
    if (auth) {
      setValue('phone', auth.phone || '');
      setValue('address', auth.address || '');
    }
  }, [auth, setValue]);

  const recalculatedTotalAmount =
    cartDetailsData?.data?.reduce((total: number, item: ICartDetail) => {
      const product =
        typeof item.product_id === 'object'
          ? (item.product_id as IProduct)
          : ({} as IProduct);
      const effectivePrice =
        product.price_sale && product.price_sale < (product.price || 0)
          ? product.price_sale
          : product.price || 0;
      return total + effectivePrice * item.quantity;
    }, 0) ||
    totalAmount ||
    0;

  const shippingFee = 30000;
  const total = recalculatedTotalAmount + shippingFee;
  const finalTotal = Math.max(total - discount, 0);

  const handleApplyVoucher = async () => {
    if (!voucherCode) {
      Toastify('Vui lòng nhập mã voucher!', 400);
      return;
    }

    try {
      const response = await applyVoucher({ voucherCode }).unwrap();
      const voucher = response.data;

      let discountValue = 0;
      if (voucher.discountType === 'fixed') {
        discountValue = voucher.discountValue;
      } else if (voucher.discountType === 'percentage') {
        discountValue = (total * voucher.discountValue) / 100;
        if (voucher.maxDiscount && discountValue > voucher.maxDiscount) {
          discountValue = voucher.maxDiscount;
        }
      }

      if (total < (voucher.minOrderValue ?? 0)) {
        Toastify(
          `Đơn hàng phải từ ${(voucher.minOrderValue ?? 0).toLocaleString()}₫ để áp dụng voucher này!`,
          400,
        );
        return;
      }

      setDiscount(discountValue);
      Toastify('Áp dụng voucher thành công!', 200);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Áp dụng voucher thất bại!';
      Toastify(errorMessage, 400);
    }
  };

  const handleUpdateAddress = async (newAddress: string) => {
    if (!auth?._id) {
      Toastify('Vui lòng đăng nhập để quản lý địa chỉ', 400);
      return;
    }

    if (!newAddress || newAddress.length < 5) {
      Toastify('Địa chỉ phải có ít nhất 5 ký tự', 400);
      return;
    }

    try {
      if (auth.address) {
        // Nếu đã có địa chỉ, gọi API cập nhật
        await updateUserAddress({ id: auth._id, address: newAddress }).unwrap();
        Toastify('Cập nhật địa chỉ thành công!', 200);
      } else {
        // Nếu chưa có địa chỉ, gọi API tạo mới
        await createUserAddress({ id: auth._id, address: newAddress }).unwrap();
        Toastify('Tạo địa chỉ thành công!', 200);
      }
      setValue('address', newAddress); // Cập nhật giá trị trong form
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Quản lý địa chỉ thất bại!';
      Toastify(errorMessage, 400);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (!auth?._id || !cartId) {
      Toastify('Vui lòng đăng nhập và kiểm tra giỏ hàng', 400);
      navigate('/auth/login');
      return;
    }

    if (!cartDetailsData?.data?.length) {
      Toastify('Giỏ hàng trống, không thể đặt hàng!', 400);
      return;
    }

    try {
      const orderData = {
        user_id: auth._id,
        phone: data.phone,
        address: data.address,
        paymentMethod,
        voucherCode: voucherCode || undefined,
        total: recalculatedTotalAmount + shippingFee,
      };

      const response = await createOrder(orderData).unwrap();

      type OrderResponseData = { _id: string } | { _id: string }[];
      const responseData = response.data as OrderResponseData;

      if (paymentMethod === 'VNPAY') {
        if (response.vnpayUrl && response.vnpayUrl.startsWith('http')) {
          window.location.href = response.vnpayUrl;
        } else {
          Toastify('Lỗi: URL thanh toán VNPay không hợp lệ', 400);
        }
      } else {
        Toastify('Đặt hàng thành công! Đơn hàng đang chờ xử lý.', 201);
        navigate('/order-management', {
          state: {
            orderId: Array.isArray(responseData)
              ? responseData[0]._id
              : responseData._id,
          },
        });
      }
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  if (isLoading) return <LoadingLocal />;
  if (!cartDetailsData?.data?.length)
    return <div>Giỏ hàng trống hoặc không hợp lệ</div>;

  return (
    <div className="min-h-screen text-gray-800 font-roboto">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Thanh toán</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Thông tin giao hàng
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="phone"
                >
                  Số điện thoại
                </label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  id="phone"
                  type="text"
                  placeholder="Nhập số điện thoại"
                  {...register('phone', {
                    required: 'Số điện thoại là bắt buộc',
                    pattern: {
                      value: /^\d{10,11}$/,
                      message: 'Số điện thoại phải có 10-11 chữ số',
                    },
                  })}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="address"
                >
                  Địa chỉ giao hàng
                </label>
                {auth?.address ? (
                  <div>
                    <p className="text-gray-800 mb-2">
                      Địa chỉ hiện tại: {auth.address}
                    </p>
                    <input
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      id="address"
                      type="text"
                      placeholder="Nhập địa chỉ mới"
                      {...register('address', {
                        required: 'Địa chỉ là bắt buộc',
                        minLength: {
                          value: 5,
                          message: 'Địa chỉ phải có ít nhất 5 ký tự',
                        },
                      })}
                    />
                    <Button
                      className="mt-2 bg-blue-500 text-white"
                      onClick={() => handleUpdateAddress(getValues('address'))}
                      disabled={isUpdatingAddress}
                    >
                      {isUpdatingAddress
                        ? 'Đang cập nhật...'
                        : 'Cập nhật địa chỉ'}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-500 mb-2">
                      Chưa có địa chỉ, vui lòng nhập địa chỉ mới
                    </p>
                    <input
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      id="address"
                      type="text"
                      placeholder="Nhập địa chỉ"
                      {...register('address', {
                        required: 'Địa chỉ là bắt buộc',
                        minLength: {
                          value: 5,
                          message: 'Địa chỉ phải có ít nhất 5 ký tự',
                        },
                      })}
                    />
                    <Button
                      className="mt-2 bg-blue-500 text-white"
                      onClick={() => handleUpdateAddress(getValues('address'))}
                      disabled={isCreatingAddress}
                    >
                      {isCreatingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
                    </Button>
                  </div>
                )}
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương thức thanh toán
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mr-2"
                    />
                    Thanh toán khi nhận hàng (COD)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="VNPAY"
                      checked={paymentMethod === 'VNPAY'}
                      onChange={() => setPaymentMethod('VNPAY')}
                      className="mr-2"
                    />
                    Thanh toán qua VNPay
                  </label>
                </div>
              </div>
              <Button
                color="primary"
                className="w-full text-white mt-6 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                type="submit"
                disabled={isCreatingOrder}
              >
                {isCreatingOrder ? 'Đang xử lý...' : 'Đặt hàng'}
              </Button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Tổng quan đơn hàng
            </h2>
            <div className="space-y-4">
              {cartDetailsData.data.map((item: ICartDetail) => {
                const product: IProduct =
                  typeof item.product_id === 'object'
                    ? (item.product_id as IProduct)
                    : ({} as IProduct);
                const effectivePrice =
                  product.price_sale && product.price_sale < product.price
                    ? product.price_sale
                    : product.price || 0;

                return (
                  <div key={item._id} className="flex items-center mb-4">
                    <img
                      alt={product.name || 'Sản phẩm'}
                      className="w-16 h-16 object-cover rounded-md mr-4"
                      src={product.image || 'https://via.placeholder.com/150'}
                    />
                    <div>
                      <p className="font-bold text-gray-800">
                        {product.name || 'Không tên'}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-800">
                          {effectivePrice.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}{' '}
                          x {item.quantity}
                        </p>
                        {product.price_sale &&
                        product.price_sale < product.price ? (
                          <p className="text-sm text-gray-500 line-through">
                            {product.price.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã voucher
                </label>
                <div className="flex gap-2">
                  <input
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    type="text"
                    placeholder="Nhập mã voucher (nếu có)"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />
                  <Button
                    className="bg-blue-500 text-white"
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher}
                  >
                    {isApplyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
                  </Button>
                </div>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Tổng thu</span>
                <span>
                  {recalculatedTotalAmount.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Phí vận chuyển</span>
                <span>
                  {shippingFee.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Giảm giá (Voucher)</span>
                  <span>
                    -
                    {discount.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Tổng cộng</span>
                <span>
                  {finalTotal.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Check_Cart;
