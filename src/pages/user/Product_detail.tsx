import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaChevronDown,
  FaChevronUp,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaShoppingCart,
} from 'react-icons/fa';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { IProduct } from '~/domain/types/product/product.model';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import {
  useGetCartByUserIdQuery,
  useCreateCartMutation,
} from '~/services/cart/cart.services';
import { useAddProductToCartMutation } from '~/services/cart-details/cart-details.services';
import {
  useGetCommentsByProductIdQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
} from '~/services/product/product.services';
import { Toastify } from '~/helpers/Toastify';
import { Button } from 'react-daisyui';
import {
  useAddToFavoritesMutation,
  useGetFavoritesByUserIdQuery,
  useRemoveFromFavoritesMutation,
} from '~/services/favorite/favorite.services';
import { stockProduct } from '~/interfaces/enum/product.enum';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const productsPerPage = 4;

  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const {
    data: cartData,
    isLoading: cartLoading,
    refetch: refetchCart,
  } = useGetCartByUserIdQuery(auth?._id || '', { skip: !auth?._id });
  const [createCart, { isLoading: isCreatingCart }] = useCreateCartMutation();
  const [addProductToCart, { isLoading: isAddingProduct }] =
    useAddProductToCartMutation();
  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useGetCommentsByProductIdQuery(id || '');
  const [createComment, { isLoading: isCreatingComment }] =
    useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdatingComment }] =
    useUpdateCommentMutation();
  const [addToFavorites, { isLoading: isAddingFavorite }] =
    useAddToFavoritesMutation();
  const [removeFromFavorites, { isLoading: isRemovingFavorite }] =
    useRemoveFromFavoritesMutation();
  const {
    data: favoritesData,
    isLoading: favoritesLoading,
    refetch: refetchFavorites,
  } = useGetFavoritesByUserIdQuery(auth?._id || '', { skip: !auth?._id });

  const isFavorite = favoritesData?.data.some(
    (fav) => fav.product_id?._id === id,
  );

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        const productRes = await fetch(
          `https://api-tatto-management.vercel.app/api/v1/products/${id}`,
        ).then((res) => res.json());
        setProduct(productRes.data);

        const relatedRes = await fetch(
          `https://api-tatto-management.vercel.app/api/v1/products?category=${productRes.data.category}`,
        ).then((res) => res.json());
        setRelatedProducts(relatedRes.data);

        setLoading(false);
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Đã có lỗi xảy ra!';
        Toastify(errorMessage, 400);
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  const handleAddToCart = async () => {
    if (!auth?._id) {
      Toastify('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 400);
      navigate('/auth/login');
      return;
    }

    if (!product) return;

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
        product_id: product._id,
        quantity: quantity,
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

  const handleCommentSubmit = async () => {
    if (!auth?._id) {
      Toastify('Vui lòng đăng nhập để bình luận', 400);
      navigate('/auth/login');
      return;
    }

    if (!newComment.trim()) {
      Toastify('Vui lòng nhập nội dung bình luận', 400);
      return;
    }

    try {
      await createComment({
        product_id: id || '',
        user_id: auth._id,
        content: newComment,
      }).unwrap();
      setNewComment('');
      Toastify('Đăng bình luận thành công', 201);
      await refetchComments();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleEditComment = (commentId: string, content: string) => {
    setEditingCommentId(commentId);
    setEditContent(content);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!auth?._id) {
      Toastify('Vui lòng đăng nhập để chỉnh sửa bình luận', 400);
      navigate('/auth/login');
      return;
    }

    if (!editContent.trim()) {
      Toastify('Vui lòng nhập nội dung bình luận', 400);
      return;
    }

    try {
      await updateComment({
        commentId,
        content: editContent,
        user_id: auth._id,
      }).unwrap();
      Toastify('Cập nhật bình luận thành công', 200);
      setEditingCommentId(null);
      setEditContent('');
      await refetchComments();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleToggleFavorite = async () => {
    if (!auth?._id) {
      Toastify('Vui lòng đăng nhập để thêm vào yêu thích', 400);
      navigate('/auth/login');
      return;
    }

    if (!id) return;

    try {
      if (isFavorite) {
        await removeFromFavorites({
          user_id: auth?._id,
          product_id: id,
        }).unwrap();
        Toastify('Đã xóa khỏi danh sách yêu thích', 200);
      } else {
        await addToFavorites({ user_id: auth?._id, product_id: id }).unwrap();
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

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    quantity > 1 && setQuantity((prev) => prev - 1);
  const nextPage = () =>
    (currentPage + 1) * productsPerPage < relatedProducts.length &&
    setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 0 && setCurrentPage(currentPage - 1);

  const filteredRelatedProducts = relatedProducts.filter(
    (relatedProduct) => relatedProduct._id !== product?._id,
  );
  const paginatedProducts = filteredRelatedProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage,
  );

  if (loading || cartLoading || commentsLoading || favoritesLoading)
    return <LoadingLocal />;
  if (!product)
    return <div className="text-center py-10">Không tìm thấy sản phẩm</div>;

  const hasDiscount = product.price_sale && product.price_sale < product.price;
  const discountPercent = hasDiscount
    ? Math.floor(
        ((product.price - product.price_sale!) / product.price) * 100 * 100,
      ) / 100
    : 0;

  return (
    <div className="text-gray-800 min-h-screen font-roboto">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-lg shadow-md p-6">
          <div className="w-full md:w-1/2 rounded-md overflow-hidden flex items-center relative">
            <img
              alt={product.name}
              className="w-full object-cover rounded-md h-full"
              src={product.image}
            />
            {hasDiscount ? (
              <div className="absolute top-2 left-2 bg-yellow-400 text-black text-sm font-bold px-2 py-1 rounded">
                Giảm {discountPercent}%
              </div>
            ) : null}
          </div>
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {product.name}
            </h1>
            <div className="mb-4">
              {hasDiscount ? (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-red-600">
                    {product.price_sale!.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </p>
                  <p className="text-lg text-gray-500 line-through">
                    {product.price.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    })}
                  </p>
                </div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {product.price.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
              )}
            </div>
            <h1 className="text-xl font-semibold text-gray-800 mb-4">Mô tả</h1>
            <p className="text-md text-gray-600 mb-4">{product.description}</p>
            <p className="text-sm text-gray-600 mb-4">
              Trạng thái:{' '}
              {product.status === stockProduct.IN_STOCK
                ? 'còn hàng'
                : 'hết hàng'}
            </p>
            <div className="flex items-center mb-6">
              <button
                onClick={decreaseQuantity}
                className="text-gray-800 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors"
                disabled={quantity === 1}
              >
                <FaChevronDown />
              </button>
              <span className="px-4 py-1 rounded-md text-black text-lg font-semibold">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                className="text-gray-800 px-3 py-1 rounded-r-md hover:bg-gray-300 transition-colors"
              >
                <FaChevronUp />
              </button>
            </div>
            <div className="flex gap-4 w-80">
              <Button
                color="primary"
                className=""
                onClick={handleAddToCart}
                disabled={
                  isAddingProduct ||
                  isCreatingCart ||
                  product.status === stockProduct.OUT_OF_STOCK
                }
              >
                <FaShoppingCart className="inline mr-2" />

                {isAddingProduct ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </Button>
              <Button
                onClick={handleToggleFavorite}
                color="success"
                className={`py-2 px-6  text-white  transition-colors`}
                disabled={isAddingFavorite || isRemovingFavorite}
              >
                <FaHeart className="inline mr-2" />
                {isAddingFavorite || isRemovingFavorite
                  ? 'Đang xử lý...'
                  : isFavorite
                    ? 'Xóa yêu thích'
                    : 'Yêu thích'}
              </Button>
            </div>
          </div>
        </div>

        {filteredRelatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Sản phẩm liên quan
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`p-2 rounded-full ${currentPage === 0 ? 'text-gray-400' : 'text-gray-800 hover:bg-gray-200'}`}
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={nextPage}
                  disabled={
                    (currentPage + 1) * productsPerPage >=
                    filteredRelatedProducts.length
                  }
                  className={`p-2 rounded-full ${(currentPage + 1) * productsPerPage >= filteredRelatedProducts.length ? 'text-gray-400' : 'text-gray-800 hover:bg-gray-200'}`}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((relatedProduct) => {
                const hasRelatedDiscount =
                  relatedProduct.price_sale &&
                  relatedProduct.price_sale < relatedProduct.price;
                const relatedDiscountPercent = hasRelatedDiscount
                  ? Math.floor(
                      ((relatedProduct.price - relatedProduct.price_sale!) /
                        relatedProduct.price) *
                        100 *
                        100,
                    ) / 100
                  : 0;

                return (
                  <div
                    key={relatedProduct._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="relative">
                      <img
                        alt={relatedProduct.name}
                        className="w-full h-48 object-cover"
                        src={relatedProduct.image}
                      />
                      {hasRelatedDiscount ? (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-black text-sm font-bold px-2 py-1 rounded">
                          Giảm {relatedDiscountPercent}%
                        </div>
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3 className="text-red-500 font-bold mb-2">
                        {typeof relatedProduct.category_id === 'object'
                          ? relatedProduct.category_id?.name
                          : 'Không có danh mục'}
                      </h3>
                      <p className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                        {relatedProduct.name}
                      </p>
                      <div className="mb-2">
                        {hasRelatedDiscount ? (
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-red-600">
                              {relatedProduct.price_sale!.toLocaleString(
                                'vi-VN',
                                {
                                  style: 'currency',
                                  currency: 'VND',
                                },
                              )}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              {relatedProduct.price.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              })}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-red-600">
                            {relatedProduct.price.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Trạng thái:{' '}
                        {relatedProduct.status === stockProduct.IN_STOCK
                          ? 'còn hàng'
                          : 'hết hàng'}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          className="flex-1 bg-black text-white hover:bg-gray-800 transition-colors"
                          onClick={() =>
                            navigate(`/product_detail/${relatedProduct._id}`)
                          }
                        >
                          Xem thêm
                        </Button>
                        <Button
                          color="primary"
                          className="flex-1 text-white disabled:bg-gray-400"
                          onClick={() => {
                            setProduct(relatedProduct);
                            setQuantity(1);
                            handleAddToCart();
                          }}
                          disabled={
                            isCreatingCart ||
                            isAddingProduct ||
                            relatedProduct.status === stockProduct.OUT_OF_STOCK
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
          </div>
        )}

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Bình luận ({commentsData?.data?.length || 0})
          </h2>
          {(commentsData?.data ?? []).length > 0 ? (
            <div className="space-y-4">
              {commentsData?.data?.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start gap-4 border-b pb-4"
                >
                  <Link to={`/user-detail/${comment.user_id?._id}`}>
                    <img
                      src={comment.user_id?.image || 'default-avatar.png'}
                      alt={comment.user_id?.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {comment.user_id?.full_name}
                    </p>
                    {editingCommentId === comment._id ? (
                      <div>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="mt-2 space-x-2">
                          <Button
                            onClick={() => handleUpdateComment(comment._id)}
                            className="bg-primary text-white py-1 px-4 rounded-md"
                            disabled={isUpdatingComment}
                          >
                            {isUpdatingComment ? 'Đang lưu...' : 'Lưu'}
                          </Button>
                          <Button
                            onClick={() => setEditingCommentId(null)}
                            className="bg-gray-300 text-black py-1 px-4 rounded-md"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-600">{comment.content}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </p>
                        {auth?._id === comment.user_id?._id && (
                          <button
                            onClick={() =>
                              handleEditComment(comment._id, comment.content)
                            }
                            className="text-blue-500 text-sm mt-1"
                          >
                            Chỉnh sửa
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Chưa có bình luận nào.</p>
          )}
          {auth?._id ? (
            <div className="mb-6">
              <textarea
                className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Viết bình luận của bạn..."
                rows={4}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button
                onClick={handleCommentSubmit}
                color="primary"
                className="mt-4 text-white"
                disabled={isCreatingComment}
              >
                {isCreatingComment ? 'Đang đăng...' : 'Đăng bình luận'}
              </Button>
            </div>
          ) : (
            <p className="text-gray-600 mb-4">
              Vui lòng{' '}
              <a href="/auth/login" className="text-blue-500">
                đăng nhập
              </a>{' '}
              để bình luận.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
