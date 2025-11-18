import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { useGetProductsQuery } from '~/services/product/product.services';
import { useGetCategoriesMenuQuery } from '~/services/categories_menu/categories_menu.services';
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from '~/services/favorite/favorite.services';
import { useAddProductToCartMutation } from '~/services/cart-details/cart-details.services';
import {
  useGetCartByUserIdQuery,
  useCreateCartMutation,
} from '~/services/cart/cart.services';
import { IProduct } from '~/domain/types/product/product.model';
import { ICategoriesMenu } from '~/domain/types/categories_menu/categories_menu.model';
import { stockProduct } from '~/interfaces/enum/product.enum';
import { FaEye, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { Button } from 'react-daisyui';
import { Toastify } from '~/helpers/Toastify';

const ITEMS_PER_PAGE = 9;

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAppSelector((state: RootState) => state.auth);

  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesMenuQuery();
  const { data: cartData } = useGetCartByUserIdQuery(
    auth?.currentUser?._id || '',
    {
      skip: !auth?.currentUser?._id,
    },
  );
  const [createCart] = useCreateCartMutation();
  const [addToFavorites] = useAddToFavoritesMutation();
  const [removeFromFavorites] = useRemoveFromFavoritesMutation();
  const [addProductToCart, { isLoading: isAddingToCart }] =
    useAddProductToCartMutation();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'best-selling' | 'price'>(
    'newest',
  );
  const [priceSortDirection, setPriceSortDirection] = useState<'asc' | 'desc'>(
    'asc',
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [addingProductStatus, setAddingProductStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const maxPrice = useMemo(() => {
    if (!productsData?.data) return 10000000;
    return Math.max(...productsData.data.map((p: IProduct) => p.price));
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    if (!productsData?.data) return [];
    return productsData.data.filter((product: IProduct) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        (product.category_id &&
          typeof product.category_id !== 'string' &&
          selectedCategories.includes(product.category_id._id || ''));
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const effectivePrice =
        product.price_sale && product.price_sale < product.price
          ? product.price_sale
          : product.price;
      const matchesPrice =
        effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [productsData, selectedCategories, searchTerm, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === 'best-selling') {
        return (b.sold || 0) - (a.sold || 0);
      } else if (sortBy === 'price') {
        const priceA =
          a.price_sale && a.price_sale < a.price ? a.price_sale : a.price;
        const priceB =
          b.price_sale && b.price_sale < b.price ? b.price_sale : b.price;
        return priceSortDirection === 'asc' ? priceA - priceB : priceB - priceA;
      }
      return 0;
    });
  }, [filteredProducts, sortBy, priceSortDirection]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  }, [sortedProducts]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = Number(event.target.value);
    const [min, max] = priceRange;
    if (event.target.name === 'min') {
      setPriceRange([Math.min(value, max), max]);
    } else {
      setPriceRange([min, Math.max(value, min)]);
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!auth?.currentUser?._id) {
      Toastify('Vui lòng đăng nhập để thêm vào danh sách yêu thích', 400);
      navigate('/auth/login');
      return;
    }

    try {
      // Try to add to favorites first
      await addToFavorites({
        user_id: auth.currentUser._id,
        product_id: productId,
      }).unwrap();
      Toastify('Đã thêm vào danh sách yêu thích', 200);
    } catch (error: unknown) {
      // If adding fails (maybe already exists), try removing
      try {
        await removeFromFavorites({
          user_id: auth.currentUser._id,
          product_id: productId,
        }).unwrap();
        Toastify('Đã xóa khỏi danh sách yêu thích', 200);
      } catch (removeError: unknown) {
        console.error('Favorite error:', error, removeError);
        Toastify('Có lỗi xảy ra khi thao tác yêu thích', 400);
      }
    }
  };

  const handleAddToCart = async (product: IProduct) => {
    if (!auth?.currentUser?._id) {
      Toastify('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng', 400);
      navigate('/auth/login');
      return;
    }

    setAddingProductStatus((prev) => ({ ...prev, [product._id]: true }));

    try {
      let currentCartId = cartData?.data?._id;

      // If user doesn't have a cart, create one
      if (!currentCartId) {
        const newCart = await createCart({
          user_id: auth.currentUser._id,
          total: 0,
        }).unwrap();
        const cartData = newCart.data as { _id: string } | { _id: string }[];
        currentCartId = Array.isArray(cartData)
          ? cartData[0]?._id || ''
          : cartData._id || '';
      }

      // Add product to cart
      await addProductToCart({
        cart_id: currentCartId,
        product_id: product._id,
        quantity: 1,
      }).unwrap();

      Toastify('Đã thêm vào giỏ hàng', 200);
    } catch (error: unknown) {
      console.error('Add to cart error:', error);
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Có lỗi xảy ra khi thêm vào giỏ hàng';
      Toastify(errorMessage, 400);
    } finally {
      setAddingProductStatus((prev) => ({ ...prev, [product._id]: false }));
    }
  };
  if (productsLoading || categoriesLoading) return <LoadingLocal />;

  return (
    <div className="bg-white text-gray-800 min-h-screen font-roboto">
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 p-4">
            <h2 className="text-xl font-bold mb-4">Bộ lọc</h2>
            <div className="mb-4">
              <input
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Tìm kiếm sản phẩm"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="mb-6">
              <h3 className="font-bold mb-2">Danh mục</h3>
              <ul>
                {categoriesData?.data.map((category: ICategoriesMenu) => (
                  <li key={category._id} className="mb-2">
                    <input
                      id={category._id}
                      type="checkbox"
                      checked={selectedCategories.includes(category._id || '')}
                      onChange={() => handleCategoryChange(category._id || '')}
                    />
                    <label className="ml-2" htmlFor={category._id}>
                      {category.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="font-bold mb-2">Khoảng giá</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{priceRange[0].toLocaleString('vi-VN')}đ</span>
                  <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
                </div>
                <input
                  type="range"
                  name="min"
                  min={0}
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={handlePriceRangeChange}
                  className="w-full"
                />
                <input
                  type="range"
                  name="max"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={handlePriceRangeChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="w-full md:w-3/4 p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-bold">Sắp xếp theo</h2>
                <div className="flex space-x-2">
                  <button
                    className={`px-4 py-2 rounded ${sortBy === 'newest' ? 'bg-black text-white' : 'bg-gray-200'}`}
                    onClick={() => {
                      setSortBy('newest');
                      setCurrentPage(1);
                    }}
                  >
                    Mới nhất
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${sortBy === 'best-selling' ? 'bg-black text-white' : 'bg-gray-200'}`}
                    onClick={() => {
                      setSortBy('best-selling');
                      setCurrentPage(1);
                    }}
                  >
                    Bán chạy
                  </button>
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded"
                  value={priceSortDirection}
                  onChange={(e) => {
                    setSortBy('price');
                    setPriceSortDirection(e.target.value as 'asc' | 'desc');
                    setCurrentPage(1);
                  }}
                >
                  <option value="asc">Giá: Thấp đến cao</option>
                  <option value="desc">Giá: Cao đến thấp</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProducts.map((product) => {
                const hasDiscount =
                  product.price_sale && product.price_sale < product.price;
                const discountPercent = hasDiscount
                  ? Math.floor(
                      ((product.price - product.price_sale!) / product.price) *
                        100 *
                        100,
                    ) / 100
                  : 0;

                const isFavorite = false; // Simplified for now - you can implement proper favorite checking logic later

                return (
                  <div
                    key={product._id}
                    className="border p-4 rounded product-card relative"
                  >
                    <div className="relative">
                      <img
                        alt={product.name}
                        className="w-full h-60 object-cover mb-4"
                        src={product.image}
                      />
                      {hasDiscount ? (
                        <div className="absolute top-2 left-2 bg-yellow-400 text-black text-sm font-bold px-2 py-1 rounded">
                          Giảm {discountPercent}%
                        </div>
                      ) : null}

                      <div
                        onClick={() => handleToggleFavorite(product._id)}
                        className={`absolute top-2 right-2 cursor-pointer ${isFavorite ? 'text-primary' : 'text-gray-50'} shadow-md rounded-full py-1 px-2 bg-white hover:bg-gray-700 transition duration-300`}
                      >
                        <FaHeart className="inline" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-red-500 font-bold mb-2">
                        {typeof product.category_id === 'object'
                          ? product.category_id.name
                          : 'Không có danh mục'}
                      </h3>
                      <p className="text-lg font-semibold mb-2 line-clamp-1">
                        {product.name}
                      </p>
                      <div className="mb-2">
                        {hasDiscount ? (
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-bold text-red-500">
                              {product.price_sale!.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              })}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              {product.price.toLocaleString('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              })}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold">
                            {product.price.toLocaleString('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            })}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Trạng thái:{' '}
                        {product.status === stockProduct.IN_STOCK
                          ? 'còn hàng'
                          : 'hết hàng'}
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-2 w-full">
                      <Button
                        className="flex-1 bg-black text-white hover:bg-gray-800"
                        onClick={() =>
                          navigate(`/product_detail/${product._id}`)
                        }
                      >
                        <FaEye />
                      </Button>
                      <Button
                        color="primary"
                        onClick={() => handleAddToCart(product)}
                        disabled={
                          addingProductStatus[product._id] ||
                          isAddingToCart ||
                          product.status === stockProduct.OUT_OF_STOCK
                        }
                      >
                        <FaShoppingCart className="inline mr-2" />
                        {addingProductStatus[product._id]
                          ? 'Đang thêm...'
                          : 'Thêm vào giỏ'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <ul className="flex space-x-2">
                  <li>
                    <button
                      className={`px-3 py-1 border rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {'<'}
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li key={page}>
                        <button
                          className={`px-3 py-1 border rounded ${
                            currentPage === page
                              ? 'bg-black text-white'
                              : 'bg-white text-black'
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ),
                  )}
                  <li>
                    <button
                      className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {'>'}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
