import React, { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaClock, FaEye } from 'react-icons/fa';
import { BiLike } from 'react-icons/bi';
import Header from '~/components/header/Header';
import Footer from '~/components/footer/Footer';
import LoadingLocal from '~/components/loading/LoadingLocal';
import bg_customer_reviews from '../../assets/img_bg_home/bg.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import 'aos/dist/aos.css';
import { IReview } from '~/domain/types/review/review.model';
import { IProduct } from '~/domain/types/product/product.model';
import { IBlog } from '~/domain/types/blog/blog.model';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'react-daisyui';
import { useGetProductsQuery } from '~/services/product/product.services';
import { useGetBlogsQuery } from '~/services/blog/blog.services';
import { RootState } from '~/redux/storage/store';
import { useAppSelector } from '~/hooks/HookRouter';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  // Get dynamic data from APIs
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery();
  const {
    data: blogsData,
    isLoading: blogsLoading,
    error: blogsError,
  } = useGetBlogsQuery();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reviews, setReviews] = useState<IReview[]>([]);

  // Static images for slider
  const images = [
    {
      img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Modern Bar Experience',
    },
    {
      img: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Premium Coffee Culture',
    },
    {
      img: 'https://images.unsplash.com/photo-1543007631-283050bb3e8c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      title: 'Expert Barista Craft',
    },
  ];

  // Dynamic products data
  const products = productsData?.data || [];
  const itemsPerPage = 4;
  const totalSlides = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(
    currentSlide * itemsPerPage,
    (currentSlide + 1) * itemsPerPage,
  );

  useEffect(() => {
    setIsPopupOpen(true);
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          'https://api-tatto-management.vercel.app/api/v1/reviews',
        );
        const data = await response.json();
        setReviews(data.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const handleSpinWheelClick = () => {
    navigate('/spin-wheel');
    setIsPopupOpen(false);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="font-roboto">
      <Header />
      <section className="relative bg-white overflow-hidden">
        <Swiper
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          loop
          modules={[Autoplay, Pagination, Navigation]}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="w-full h-96 relative">
                <img
                  src={image.img}
                  alt={`Prime Drink ${image.title} ${index + 1}`}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">{image.title}</h2>
                    <p className="text-xl">
                      Prime Drink - Khám phá hương vị đặc biệt
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="py-12 bg-gray-45">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:bg-black transition duration-300 group">
              <h3 className="text-xl font-bold mb-2 group-hover:text-white">
                Đặt Hàng Dễ Dàng
              </h3>
              <p className="text-gray-600 mb-4 text-xl group-hover:text-white">
                Đặt online nhanh gọn hoặc ghé quầy để tận hưởng không khí sôi
                động!
              </p>
              <a
                className="text-red-500 font-semibold border border-red-500 px-4 py-2 rounded-md hover:bg-primary hover:text-red transition duration-300 group-hover:bg-white"
                href="#"
              >
                Tìm hiểu thêm
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:bg-black transition duration-300 group">
              <h3 className="text-xl font-bold mb-2 group-hover:text-white">
                Giao Hàng Siêu Tốc
              </h3>
              <p className="text-gray-600 mb-4 text-xl group-hover:text-white">
                Nhận ngay đồ uống tươi ngon với dịch vụ giao hàng nhanh chóng.
              </p>
              <a
                className="text-red-500 font-semibold border border-red-500 px-4 py-2 rounded-md hover:bg-primary hover:text-red transition duration-300 group-hover:bg-white"
                href="#"
              >
                Tìm hiểu thêm
              </a>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center hover:bg-black transition duration-300 group">
              <h3 className="text-xl font-bold mb-2 group-hover:text-white">
                Kết Nối Cùng Prime
              </h3>
              <p className="text-gray-600 mb-4 text-xl group-hover:text-white">
                Đồng hành khám phá những hương vị độc đáo, làm mới bản thân.
              </p>
              <a
                className="text-red-500 font-semibold border border-red-500 px-4 py-2 rounded-md hover:bg-primary hover:text-red transition duration-300 group-hover:bg-white"
                href="#"
              >
                Tìm hiểu thêm
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 mx-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 relative">
              <img
                src="https://images.unsplash.com/photo-1470337458703-46ad1756a187"
                alt="Professional barista making drinks"
                className="rounded-lg shadow-lg w-full opacity-80"
              />
            </div>
            <div className="md:w-1/2 md:pl-12 mt-8 md:mt-0">
              <h2 className="text-3xl font-bold text-red-500 mb-4">
                KHƠI DẬY HƯƠNG VỊ, KỂ NHỮNG CÂU CHUYỆN ĐỘC ĐÁO
              </h2>
              <p className="text-black mb-4 text-md">
                Chào mừng bạn đến với Prime – nơi mỗi ly nước giải khát là một
                câu chuyện, hòa quyện sáng tạo và đam mê!
              </p>
              <Link to="/contact">
                <Button
                  color="primary"
                  className="text-white rounded-lg font-semibold"
                >
                  Liên hệ với chúng tôi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-45">
        <div className="container mx-auto px-4">
          <div className="relative text-center mb-8">
            <h2 className="text-2xl font-bold inline-block bg-white px-4 relative z-10">
              Mới nhất
            </h2>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black z-0"></div>
          </div>
          <div className="relative">
            {products.length > itemsPerPage && (
              <>
                <button
                  onClick={goToPrevSlide}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-70"
                >
                  <FaChevronLeft className="text-xl font-bold" />
                </button>
                <button
                  onClick={goToNextSlide}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10 hover:bg-opacity-70"
                >
                  <FaChevronRight className="text-xl font-bold" />
                </button>
              </>
            )}
            <div className="flex justify-center items-center overflow-x-hidden py-2">
              {productsLoading ? (
                <LoadingLocal />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 px-6">
                  {currentProducts.map((product: IProduct) => {
                    const hasDiscount =
                      product.price_sale && product.price_sale < product.price;
                    const effectivePrice = hasDiscount
                      ? product.price_sale
                      : product.price;

                    return (
                      <Link
                        to={`/product_detail/${product._id}`}
                        key={product._id}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out"
                      >
                        <div className="relative overflow-hidden rounded-t-xl">
                          <img
                            src={
                              product.image ||
                              'https://via.placeholder.com/300x200?text=No+Image'
                            }
                            alt={product.name}
                            className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                          />
                          {hasDiscount && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              Giảm{' '}
                              {Math.round(
                                ((product.price - product.price_sale!) /
                                  product.price) *
                                  100,
                              )}
                              %
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">
                            {effectivePrice?.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {typeof product.category_id === 'object' &&
                            product.category_id?.name
                              ? `Danh mục: ${product.category_id.name}`
                              : 'Sản phẩm chất lượng cao'}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-12 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg_customer_reviews})` }}
      >
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center bg-black text-transparent bg-clip-text">
            Nhận xét của khách hàng
          </h2>
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-2">
              {reviews
                .filter((review) => review.rating >= 4)
                .map((review, index) => (
                  <div
                    key={review._id}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out"
                  >
                    <div className="flex items-center mb-4">
                      <Link
                        to={`/user-detail/${typeof review.user_id === 'object' && '_id' in review.user_id ? review.user_id._id : ''}`}
                      >
                        <img
                          src={
                            typeof review.user_id === 'object' &&
                            'image' in review.user_id &&
                            review.user_id.image
                              ? review.user_id.image
                              : 'https://via.placeholder.com/150?text=User'
                          }
                          alt={`Customer ${index + 1}`}
                          className="w-14 h-14 rounded-full hover:scale-105 mr-4 object-cover border-2 border-primary"
                        />
                      </Link>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {review.user_id &&
                          typeof review.user_id === 'object' &&
                          ('name' in review.user_id ||
                            'full_name' in review.user_id)
                            ? review?.user_id?.full_name
                            : 'Khách hàng ẩn danh'}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString(
                                'vi-VN',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                },
                              )
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center bg-yellow-100 rounded-full px-2 py-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <svg
                            key={i}
                            className="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.784.57-1.84-.197-1.54-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.098 10.1c-.784-.57-.381-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.518-4.674z" />
                          </svg>
                        ))}
                        <span className="ml-1 text-sm text-yellow-700">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-base line-clamp-3">
                      {review.comments || 'Không có nhận xét'}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-45">
        <div className="container mx-auto px-4">
          <div className="relative text-center mb-8">
            <h2 className="text-2xl font-bold inline-block bg-white px-4 relative z-10">
              Tin tức
            </h2>
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black z-0"></div>
          </div>
          {blogsLoading ? (
            <div className="flex justify-center">
              <LoadingLocal />
            </div>
          ) : blogsError ? (
            <p className="text-center text-red-500">Lỗi khi tải tin tức</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogsData?.data?.slice(0, 3).map((blog: IBlog) => (
                <Link
                  to={`/news/${blog._id}`}
                  key={blog._id}
                  className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    alt={blog.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    src={
                      blog.image ||
                      'https://via.placeholder.com/600x400?text=No+Image'
                    }
                  />
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">
                    {blog.title}
                  </h3>
                  <p className="text-gray-700 line-clamp-2">{blog.content}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="flex items-center">
                      <Link
                        to={`/user-detail/${typeof blog.author === 'object' && '_id' in blog.author ? blog.author._id : ''}`}
                      >
                        <img
                          src={
                            typeof blog.author === 'object' &&
                            'image' in blog.author &&
                            blog.author.image
                              ? blog.author.image
                              : 'https://via.placeholder.com/150?text=User'
                          }
                          alt="Author"
                          className="w-8 h-8 rounded-full mr-2 object-cover"
                        />
                      </Link>
                      <span className="flex items-center text-sm text-gray-600">
                        <FaClock className="mr-1" />
                        {blog.reading_time || 'Chưa có thời gian đọc'}
                      </span>
                    </span>
                    <span className="flex items-center text-sm text-gray-600">
                      <BiLike className="mr-1" /> {blog.likeCount || 0}
                    </span>
                    <span className="flex items-center text-sm text-gray-600">
                      <FaEye className="mr-1" /> {blog.viewCount || 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {auth?._id && (
        <div>
          {isPopupOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={handleClosePopup}
            >
              <div
                className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-red-500 mb-4">
                  Tham gia vòng quay may mắn!
                </h2>
                <p className="text-gray-600 mb-4">
                  Quay vòng quay để nhận ngay voucher giảm giá hấp dẫn cho dịch
                  vụ mua sắm tại Prime Drink!
                </p>
                <div className="flex justify-center">
                  <img
                    className="w-80 h-80 cursor-pointer rounded-lg shadow-lg"
                    src="https://i.ibb.co/mFq7WJLs/z6629399144389-2ce796f8e1d3f25d3ea6353d95055e91-3.jpg"
                    onClick={handleSpinWheelClick}
                    alt="Lucky Wheel - Prime Drink"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default HomePage;
