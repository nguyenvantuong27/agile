import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-daisyui';
import Header from '~/components/header/Header';
import Footer from '~/components/footer/Footer';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { useGetFavoritesByUserIdQuery } from '~/services/favorite/favorite.services';
import {
  useGetCartByUserIdQuery,
  useCreateCartMutation,
} from '~/services/cart/cart.services';
import { useAddProductToCartMutation } from '~/services/cart-details/cart-details.services';
import { Toastify } from '~/helpers/Toastify';
import { stockProduct } from '~/interfaces/enum/product.enum';

const FavoritesManagement: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  const { data: favoritesData, isLoading: favoritesLoading } =
    useGetFavoritesByUserIdQuery(auth?._id || '', { skip: !auth?._id });
  const {
    data: cartData,
    isLoading: cartLoading,
    refetch: refetchCart,
  } = useGetCartByUserIdQuery(auth?._id || '', { skip: !auth?._id });
  const [createCart, { isLoading: isCreatingCart }] = useCreateCartMutation();
  const [addProductToCart, { isLoading: isAddingProduct }] =
    useAddProductToCartMutation();

  const handleAddToCart = async (productId: string) => {
    if (!auth?._id) {
      Toastify('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 400);
      navigate('/auth/login');
      return;
    }

    try {
      await refetchCart();

      let cartId: string;
      if (!cartData?.data) {
        const newCart = await createCart({
          user_id: auth._id,
          total: 0,
        }).unwrap();
        const cartData = newCart.data as { _id: string } | { _id: string }[];
        cartId = Array.isArray(cartData)
          ? cartData[0]?._id || ''
          : cartData._id || '';
      } else {
        cartId = cartData.data._id || '';
      }

      await addProductToCart({
        cart_id: cartId,
        product_id: productId,
        quantity: 1,
      }).unwrap();
      Toastify('Đã thêm sản phẩm vào giỏ hàng', 201);
      await refetchCart();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  if (favoritesLoading || cartLoading) return <LoadingLocal />;
  if (!auth?._id) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="text-gray-800 min-h-screen font-roboto">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Sản phẩm yêu thích ({favoritesData?.data.length})
        </h1>
        {favoritesData?.data.length === 0 ? (
          <p className="text-gray-600">Bạn chưa có sản phẩm yêu thích nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoritesData?.data.map((favorite) => {
              const hasDiscount =
                favorite.product_id.price_sale != null &&
                favorite.product_id.price_sale > 0 &&
                favorite.product_id.price_sale < favorite.product_id.price;
              const discountPercent = hasDiscount
                ? Math.floor(
                    ((favorite.product_id.price -
                      favorite.product_id.price_sale!) /
                      favorite.product_id.price) *
                      100 *
                      100,
                  ) / 100
                : 0;

              const isInStock =
                favorite.product_id.status === stockProduct.IN_STOCK;

              return (
                <div
                  key={favorite._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 relative"
                >
                  <div className="relative">
                    <img
                      alt={favorite.product_id.name}
                      className="w-full h-48 object-cover"
                      src={favorite.product_id.image}
                    />
                    {hasDiscount ? (
                      <div className="absolute z-10 top-2 left-2 bg-yellow-400 text-black text-sm font-bold px-2 py-1 rounded">
                        Giảm {discountPercent}%
                      </div>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="text-lg line-clamp-1 font-semibold text-gray-800 mb-2">
                      {favorite.product_id.name}
                    </p>
                    <div className="mb-2">
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-red-500">
                            {favorite.product_id.price_sale!.toLocaleString(
                              'vi-VN',
                              {
                                style: 'currency',
                                currency: 'VND',
                              },
                            )}
                          </p>
                          <p className="text-sm text-gray-500 line-through">
                            {favorite.product_id.price.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-gray-800">
                          {favorite.product_id.price.toLocaleString('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Trạng thái: {isInStock ? 'còn hàng' : 'hết hàng'}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                        onClick={() =>
                          navigate(`/product_detail/${favorite.product_id._id}`)
                        }
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        className="flex-1 py-2 bg-primary text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400"
                        onClick={() => handleAddToCart(favorite.product_id._id)}
                        disabled={
                          isCreatingCart || isAddingProduct || !isInStock
                        }
                      >
                        {isCreatingCart || isAddingProduct
                          ? 'Đang thêm...'
                          : 'Thêm vào giỏ'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default FavoritesManagement;
