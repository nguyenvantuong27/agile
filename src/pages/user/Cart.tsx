import React, { useState } from 'react';
import {
  FaInfoCircle,
  FaMinus,
  FaPlus,
  FaHeart,
  FaTrashAlt,
} from 'react-icons/fa';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { useGetCartByUserIdQuery } from '~/services/cart/cart.services';
import {
  useGetCartDetailsByCartIdQuery,
  useUpdateCartDetailMutation,
  useDeleteCartDetailMutation,
} from '~/services/cart-details/cart-details.services';
import {
  useGetFavoritesByUserIdQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from '~/services/favorite/favorite.services';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { Toastify } from '~/helpers/Toastify';
import { Button } from 'react-daisyui';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const [isOpen, setIsOpen] = useState(false);
  // State lưu số lượng tạm thời
  const [optimisticQuantities, setOptimisticQuantities] = useState<{
    [key: string]: number;
  }>({});
  // State theo dõi trạng thái loading khi cập nhật giỏ hàng
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const {
    data: cartData,
    isLoading: cartLoading,
    refetch: refetchCart,
  } = useGetCartByUserIdQuery(auth?._id || '', { skip: !auth?._id });

  const {
    data: cartDetailsData,
    isLoading: detailsLoading,
    refetch: refetchCartDetails,
  } = useGetCartDetailsByCartIdQuery(cartData?.data?._id || '', {
    skip: !cartData?.data?._id,
  });

  const {
    data: favoritesData,
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = useGetFavoritesByUserIdQuery(auth?._id || '', { skip: !auth?._id });

  const [updateCartDetail] = useUpdateCartDetailMutation();
  const [deleteCartDetail] = useDeleteCartDetailMutation();
  const [addToFavorites, { isLoading: isAddingFavorite }] =
    useAddToFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemovingFavorite }] =
    useRemoveFromFavoritesMutation();

  const totalAmount =
    cartDetailsData?.data?.reduce((total: number, item) => {
      const product =
        typeof item.product_id === 'object' && item.product_id !== null
          ? (item.product_id as { price_sale?: number; price?: number })
          : {};
      const effectivePrice =
        product.price_sale && product.price_sale < (product.price || 0)
          ? product.price_sale
          : product.price || 0;
      const quantity =
        optimisticQuantities[
          typeof item.product_id === 'object' &&
          item.product_id !== null &&
          '_id' in item.product_id
            ? (item.product_id as { _id: string })._id
            : ''
        ] || item.quantity;
      return total + effectivePrice * quantity;
    }, 0) || 0;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOptimisticQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  // Xử lý cập nhật giỏ hàng
  const handleUpdateCart = async () => {
    if (
      !cartData?.data?._id ||
      Object.keys(optimisticQuantities).length === 0
    ) {
      Toastify('Không có thay đổi để cập nhật', 400);
      return;
    }

    setIsUpdating(true);
    const updates = Object.entries(optimisticQuantities).map(
      ([productId, quantity]) => ({
        cart_id: cartData.data._id,
        product_id: productId,
        quantity,
      }),
    );

    try {
      await Promise.all(
        updates.map((update) =>
          updateCartDetail({
            cart_id: update.cart_id ?? '',
            product_id: update.product_id,
            quantity: update.quantity,
          }).unwrap(),
        ),
      );
      Toastify('Cập nhật giỏ hàng thành công', 200);
      setOptimisticQuantities({});
      refetchCartDetails();
      refetchCart();
    } catch (error) {
      setOptimisticQuantities({});
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra khi cập nhật giỏ hàng!';
      Toastify(errorMessage, 400);
      refetchCartDetails(); // Refetch để đảm bảo đồng bộ
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async (cartId: string, productId: string) => {
    try {
      await deleteCartDetail({
        cart_id: cartId,
        product_id: productId,
      }).unwrap();
      // Xóa số lượng tạm thời của sản phẩm bị xóa
      setOptimisticQuantities((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });
      Toastify('Đã xóa sản phẩm khỏi giỏ hàng', 200);
      refetchCartDetails();
      refetchCart();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!auth?._id) {
      Toastify('Vui lòng đăng nhập để thêm vào yêu thích', 400);
      navigate('/auth/login');
      return;
    }

    const isFavorite = favoritesData?.data.some(
      (fav) => fav.product_id._id === productId,
    );

    try {
      if (isFavorite) {
        await removeFromFavorites({
          user_id: auth._id,
          product_id: productId,
        }).unwrap();
        Toastify('Đã xóa khỏi danh sách yêu thích', 200);
      } else {
        await addToFavorites({
          user_id: auth._id,
          product_id: productId,
        }).unwrap();
        Toastify('Đã thêm vào danh sách yêu thích', 201);
      }
      refetchFavorites();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleCheckout = () => {
    if (!auth?._id || !cartDetailsData?.data?.length) {
      Toastify('Giỏ hàng trống hoặc bạn chưa đăng nhập', 400);
      return;
    }
    // Kiểm tra xem có thay đổi chưa lưu không
    if (Object.keys(optimisticQuantities).length > 0) {
      Toastify('Vui lòng cập nhật giỏ hàng trước khi thanh toán', 400);
      return;
    }
    navigate('/check-cart', {
      state: { cartId: cartData?.data?._id, totalAmount },
    });
  };

  if (cartLoading || detailsLoading || favoritesLoading)
    return <LoadingLocal />;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Giỏ hàng của bạn
        </h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            {!auth?._id ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600">
                  Vui lòng đăng nhập để xem giỏ hàng.
                </p>
              </div>
            ) : !cartData?.data || !cartDetailsData?.data?.length ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600">Giỏ hàng của bạn đang trống.</p>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 flex items-center">
                    <FaInfoCircle className="mr-2" /> Kiểm tra lại giỏ hàng
                    trước khi thanh toán.
                  </p>
                  <div>
                    <Button
                      color="primary"
                      className="text-white py-2 px-4 font-semibold transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={handleUpdateCart}
                      disabled={
                        isUpdating ||
                        Object.keys(optimisticQuantities).length === 0
                      }
                    >
                      {isUpdating ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">⏳</span> Đang cập
                          nhật...
                        </span>
                      ) : (
                        'Cập nhật giỏ hàng'
                      )}
                    </Button>
                  </div>
                </div>
                {/* Hiển thị thông báo nếu có thay đổi chưa lưu */}
                {Object.keys(optimisticQuantities).length > 0 && (
                  <p className="text-sm text-yellow-600 mb-4">
                    Có thay đổi chưa được lưu. Vui lòng nhấn "Cập nhật giỏ hàng"
                    để lưu thay đổi.
                  </p>
                )}
                {cartDetailsData.data.map((item) => {
                  const productId =
                    typeof item.product_id === 'object' &&
                    '_id' in item.product_id
                      ? item.product_id._id
                      : '';
                  const isFavorite = favoritesData?.data.some(
                    (fav) => fav.product_id._id === productId,
                  );
                  const product =
                    typeof item.product_id === 'object'
                      ? (item.product_id as {
                          price_sale?: number;
                          price?: number;
                          name?: string;
                          description?: string;
                          image?: string;
                        })
                      : {};
                  const effectivePrice =
                    product.price_sale &&
                    product.price_sale < (product.price ?? 0)
                      ? product.price_sale
                      : product.price || 0;

                  return (
                    <div
                      key={item._id}
                      className="flex items-center py-4 border-b border-gray-200 transition-colors duration-200"
                    >
                      <Link to={`/product_detail/${productId}`}>
                        <img
                          alt={product.name || 'Sản phẩm'}
                          className="w-24 h-32 object-cover rounded-md hover:scale-105 transition-transform duration-200"
                          src={
                            product.image || 'https://via.placeholder.com/150'
                          }
                        />
                      </Link>

                      <div className="ml-6 flex-1">
                        <h2 className="text-xl font-semibold text-gray-800">
                          {product.name || 'Không tên'}
                        </h2>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-primary">
                            {effectivePrice.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </p>
                          {product.price_sale &&
                          product.price_sale < (product.price ?? 0) ? (
                            <p className="text-sm text-gray-500 line-through">
                              {(product.price ?? 0).toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              })}
                            </p>
                          ) : null}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {product.description || 'Không có mô tả'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center rounded-full p-1">
                          <button
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                            disabled={
                              (optimisticQuantities[productId] ||
                                item.quantity) <= 1
                            }
                            onClick={() =>
                              handleQuantityChange(
                                productId,
                                (optimisticQuantities[productId] ||
                                  item.quantity) - 1,
                              )
                            }
                          >
                            <FaMinus />
                          </button>
                          <span className="px-4 rounded-md text-black font-medium">
                            {optimisticQuantities[productId] || item.quantity}
                          </span>
                          <button
                            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                            onClick={() =>
                              handleQuantityChange(
                                productId,
                                (optimisticQuantities[productId] ||
                                  item.quantity) + 1,
                              )
                            }
                          >
                            <FaPlus />
                          </button>
                        </div>
                        <button
                          className={`transition-colors ${
                            isFavorite
                              ? 'text-red-700 hover:text-red-500'
                              : 'text-primary hover:text-red-700'
                          }`}
                          onClick={() => handleToggleFavorite(productId)}
                          disabled={isAddingFavorite || isRemovingFavorite}
                        >
                          <FaHeart className="text-xl" />
                        </button>
                        <button
                          className="text-gray-500 hover:text-red-600 transition-colors"
                          onClick={() =>
                            handleRemove(cartData.data._id ?? '', productId)
                          }
                        >
                          <FaTrashAlt className="text-xl" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Tổng đơn hàng
              </h2>
              <div className="space-y-4 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng thu</span>
                  <span>
                    {totalAmount.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Vận chuyển</span>
                  <span>
                    {(30000).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-800">
                  <span>Tổng cộng</span>
                  <span>
                    {(totalAmount + 30000).toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </span>
                </div>
              </div>
              <Button
                color="primary"
                className="w-full text-white py-3 font-semibold transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleCheckout}
                disabled={
                  !cartDetailsData?.data?.length ||
                  Object.keys(optimisticQuantities).length > 0
                }
              >
                Thanh toán ngay
              </Button>
              {/* Thông báo khi nút Thanh toán ngay bị vô hiệu hóa do thay đổi chưa lưu */}
              {Object.keys(optimisticQuantities).length > 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  Vui lòng cập nhật giỏ hàng trước khi thanh toán.
                </p>
              )}
              <div className="mt-6 rounded-lg shadow-sm p-1">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Giao hàng tươi ngon & an toàn
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                    <li>
                      <span className="">- Đồ uống tươi ngon</span> đảm bảo chất
                      lượng
                    </li>
                    <li>
                      <span className="">- Miễn phí giao hàng</span> cho đơn từ{' '}
                      {(300000).toLocaleString('vi-VN')}₫
                    </li>
                    <li>
                      <span className="">- Giao hàng nhanh</span> trong 30-45
                      phút
                    </li>
                    <li>
                      <span className="">- Thanh toán tiện lợi</span> với COD,
                      thẻ, ví điện tử
                    </li>
                  </ul>
                </div>

                <div className="mt-4">
                  <button
                    onClick={toggleDropdown}
                    className="w-full flex justify-between items-center text-gray-700 py-2 focus:outline-none"
                  >
                    <span className="font-semibold text-sm">
                      Chính sách chất lượng
                    </span>
                    {isOpen ? (
                      <FaMinus className="text-sm text-gray-500 transition-transform" />
                    ) : (
                      <FaPlus className="text-sm text-gray-500 transition-transform" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-2 text-xs text-gray-600 p-3 rounded-md transition-all duration-300">
                      <p className="font-medium">Cam kết chất lượng:</p>
                      <ul className="list-disc ml-4 mt-1 space-y-1">
                        <li>Nguyên liệu tươi ngon, được chọn lọc kỹ lưỡng.</li>
                        <li>
                          Đổi trả miễn phí nếu đồ uống không đạt chất lượng.
                        </li>
                        <li>
                          Bảo đảm vệ sinh an toàn thực phẩm theo tiêu chuẩn.
                        </li>
                        <li>Giao hàng đúng giờ, giữ nhiệt độ thích hợp.</li>
                      </ul>
                      <p className="mt-2">
                        Liên hệ hotline{' '}
                        <span className="font-bold">1900 PRIME</span> để được hỗ
                        trợ.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
