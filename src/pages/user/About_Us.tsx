import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

import new1 from '../../assets/img_news/new1.png';
import new2 from '../../assets/img_news/new2.png';
import bg from '../../assets/img_news/bg_new.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import { FaSearch } from 'react-icons/fa';
import {
  useGetAppointmentByIdQuery,
  useCancelAppointmentByCustomerMutation,
} from '~/services/appointments/appointments.services';
import { Toastify } from '~/helpers/Toastify';

const AboutUs: React.FC = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

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

  const [ticketId, setTicketId] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showReturnForm, setShowReturnForm] = useState<boolean>(false);

  const {
    data: appointment,
    error,
    isFetching,
  } = useGetAppointmentByIdQuery(ticketId, { skip: !ticketId });

  const [cancelAppointment, { isLoading: isCanceling }] =
    useCancelAppointmentByCustomerMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketId.trim()) {
      setShowModal(true);
    } else {
      Toastify('Vui lòng nhập mã đặt bàn!', 400);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowReturnForm(false);
    setTicketId('');
    setEmail('');
    setPhone('');
  };

  const handleReturnTicket = async () => {
    if (!appointment?.data?._id || !email.trim()) {
      Toastify('Vui lòng nhập email!', 400);
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn hủy đặt bàn này?')) return;

    try {
      await cancelAppointment({
        id: appointment.data._id,
        email,
        phone: phone.trim() || undefined,
      }).unwrap();
      Toastify('Hủy đặt bàn thành công!', 200);
      handleCloseModal();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
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
      <div className="mt-6 flex items-center justify-center">
        <div className="">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Tra cứu mã đặt bàn (có thể hủy đặt bàn nếu bạn không thể đến)
          </h3>
          <form
            onSubmit={handleSearch}
            className="flex items-center justify-center gap-2"
          >
            <div className="relative flex items-center justify-center">
              <input
                type="text"
                placeholder="Nhập mã đặt bàn..."
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Tra cứu
            </button>
          </form>
        </div>
      </div>
      <section className="py-12 mx-40 bg-gray-40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-start gap-10">
          <div className="md:w-1/2" data-aos="fade-left">
            <img
              src={new1}
              alt="Tattoo artist working"
              className="rounded-lg shadow-xl w-full hover:opacity-90 transition-opacity duration-300"
            />
          </div>

          <div className="md:w-1/2" data-aos="fade-right">
            <h2 className="text-4xl font-extrabold text-red-500 mb-6">
              VỀ CHÚNG TÔI
            </h2>
            <p className="text-gray-800 text-lg leading-8 mb-6">
              Chào mừng bạn đến với Prime Drink. Chúng tôi tồn tại để kết nối
              những người yêu thích đồ uống chất lượng và không gian thư giãn
              tuyệt vời. Chúng ta cùng đam mê và trân trọng giá trị của từng ly
              đồ uống được pha chế tỉ mỉ. Dù khẩu vị và sở thích của mỗi khách
              hàng có khác biệt, chúng tôi đều chung một niềm tin: đồ uống là
              nơi hương vị và cảm xúc hòa quyện.
            </p>
            <p className="text-gray-800 text-lg leading-8 mb-6">
              Gia đình Prime Drink – gồm đội ngũ barista, khách hàng và những
              người yêu thích đồ uống – đã trở thành một cộng đồng lớn mạnh với
              hàng ngàn thành viên. Chúng tôi luôn giữ vững mục tiêu ban đầu:
              giúp bạn tận hưởng những khoảnh khắc tuyệt vời qua từng ly đồ uống
              tinh tế.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 mx-40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-start gap-8">
          <div className="md:w-1/2 md:pr-8" data-aos="fade-right">
            <h2 className="text-4xl font-bold text-red-500 mb-6">
              GIÁ TRỊ CỐT LÕI
            </h2>
            {[
              {
                title: 'Tôn Vinh Hương Vị Độc Đáo',
                content:
                  'Mỗi ly đồ uống là một trải nghiệm độc đáo về hương vị và cảm xúc...',
              },
              {
                title: 'Dám Sáng Tạo',
                content:
                  'Chúng tôi thách thức những công thức truyền thống để tạo ra những hương vị mới lạ...',
              },
              {
                title: 'Tạo Ra Kết Nối',
                content:
                  'Sứ mệnh của chúng tôi là tạo ra không gian gắn kết mọi người qua tình yêu đồ uống...',
              },
              {
                title: 'Chân Thành Trong Phục Vụ',
                content:
                  'Chúng tôi cam kết mang đến dịch vụ chân thành và chất lượng tốt nhất...',
              },
              {
                title: 'Đam Mê Với Nghề Pha Chế',
                content:
                  'Sự tận tâm trong việc pha chế những ly đồ uống hoàn hảo cho khách hàng...',
              },
            ].map((value, index) => (
              <div key={index} className="mb-4">
                <p className="text-xl font-bold text-gray-800">{value.title}</p>
                <p className="text-gray-700">{value.content}</p>
              </div>
            ))}
          </div>

          <div className="md:w-1/2" data-aos="fade-left">
            <img
              src={new2}
              alt="Tattoo artist working"
              className="rounded-lg shadow-xl w-full hover:opacity-90 transition-opacity duration-300"
            />
          </div>
        </div>
      </section>

      <section
        className="py-12 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            'Đội ngũ barista tài năng',
            'Nguyên liệu cao cấp',
            'Giá cả hợp lý',
          ].map((title, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-lg text-center hover:bg-black transition duration-300 group"
              data-aos="fade-up"
            >
              <h3 className="text-xl font-bold mb-2 group-hover:text-white">
                {title}
              </h3>
              <p className="text-gray-600 text-xl group-hover:text-white">
                {index === 0
                  ? 'Những barista giàu kinh nghiệm, pha chế mọi ly đồ uống theo sở thích của bạn.'
                  : index === 1
                    ? 'Chúng tôi sử dụng nguyên liệu cao cấp nhập khẩu, đảm bảo hương vị tuyệt hậu.'
                    : 'Phù hợp với mọi ngân sách mà vẫn đảm bảo chất lượng vượt trội.'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {showModal && (
        <dialog className="modal modal-open fixed inset-0 flex items-center justify-center">
          <div className="modal-box bg-transparent p-0 w-[400px] relative animate-in zoom-in-95 duration-300">
            <div className="relative bg-white shadow-2xl rounded-2xl border border-gray-100 flex flex-col min-h-[500px] overflow-hidden">
              <button
                className="absolute -top-4 -right-4 bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-110 focus:outline-none z-10"
                onClick={handleCloseModal}
                aria-label="Đóng"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>

              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-5 text-white">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold tracking-tight">
                    Đặt bàn #{appointment?.data?._id?.slice(-6) || 'Không có'}
                  </h3>
                  <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      appointment?.data?.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : appointment?.data?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment?.data?.status === 'customer_canceled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {appointment?.data?.status === 'approved'
                      ? 'Đã xác nhận'
                      : appointment?.data?.status === 'pending'
                        ? 'Chờ xác nhận'
                        : appointment?.data?.status === 'customer_canceled'
                          ? 'Khách đã hủy'
                          : 'Đã hủy'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col">
                {isFetching ? (
                  <div className="flex-1 flex items-center justify-center flex-col">
                    <svg
                      className="animate-spin h-10 w-10 text-indigo-500"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    <p className="text-gray-600 mt-3 font-medium">
                      Đang tải...
                    </p>
                  </div>
                ) : error ? (
                  <p className="text-center text-red-500 font-semibold flex-1 flex items-center justify-center">
                    {(error as { data?: { message?: string } })?.data
                      ?.message || 'Không tìm thấy đặt bàn với mã này!'}
                  </p>
                ) : appointment?.data ? (
                  showReturnForm ? (
                    <div className="space-y-4 flex-1">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Nhập thông tin để hủy đặt bàn
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Nhập email của bạn"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Nhập số điện thoại (tùy chọn)"
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex gap-2 mt-6">
                        <button
                          onClick={handleReturnTicket}
                          disabled={isCanceling}
                          className={`flex-1 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-[1.02] ${
                            isCanceling ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isCanceling
                            ? 'Đang xử lý...'
                            : 'Xác nhận hủy đặt bàn'}
                        </button>
                        <button
                          onClick={() => setShowReturnForm(false)}
                          className="flex-1 bg-gray-300 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-400 transition-all duration-200"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 flex-1">
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Yêu cầu đặc biệt:
                          </span>{' '}
                          {appointment.data.description ||
                            'Không có yêu cầu đặc biệt'}
                        </p>
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Đồ uống:
                          </span>{' '}
                          {typeof appointment.data.tattoo_id === 'object'
                            ? appointment.data.tattoo_id?.title
                            : 'Đồ uống theo yêu cầu'}
                        </p>
                        {appointment.data.tattoo_id ? (
                          <img
                            src={
                              typeof appointment.data.tattoo_id === 'object'
                                ? appointment.data.tattoo_id.image
                                : ''
                            }
                            alt="Drink"
                            className="w-full h-40 object-cover rounded-lg shadow-sm"
                          />
                        ) : (
                          <img
                            src="https://namdinh.edu.vn/App/images/no-image.jpg"
                            alt="Drink"
                            className="w-full h-40 rounded-lg shadow-sm"
                          />
                        )}
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Giá:
                          </span>{' '}
                          {typeof appointment.data.tattoo_id === 'object'
                            ? appointment.data.tattoo_id.price.toLocaleString(
                                'vi-VN',
                                {
                                  style: 'currency',
                                  currency: 'VND',
                                },
                              )
                            : 'Thỏa thuận khi đến quán'}
                        </p>
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Ngày:
                          </span>{' '}
                          {new Date(appointment.data.date).toLocaleDateString(
                            'vi-VN',
                          )}
                        </p>
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Khung giờ:
                          </span>{' '}
                          {typeof appointment.data.timeslot_id === 'object'
                            ? `${appointment.data.timeslot_id?.startTime} - ${appointment.data.timeslot_id?.endTime}`
                            : 'N/A'}
                        </p>
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Barista phục vụ:
                          </span>{' '}
                          {typeof appointment.data.user_id === 'object'
                            ? appointment.data.user_id?.full_name
                            : 'N/A'}
                        </p>
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Chi nhánh:
                          </span>{' '}
                          {typeof appointment.data.branch_id === 'object'
                            ? appointment.data.branch_id.name
                            : 'N/A'}
                        </p>
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Email:
                          </span>{' '}
                          {typeof appointment.data.customer_id === 'object'
                            ? appointment.data.customer_id?.email || 'N/A'
                            : appointment.data.email || 'N/A'}
                        </p>
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Số điện thoại:
                          </span>{' '}
                          {typeof appointment.data.customer_id === 'object'
                            ? appointment.data.customer_id?.phone || 'N/A'
                            : appointment.data.phone || 'N/A'}
                        </p>
                        <p className="text-gray-800 text-sm">
                          <span className="font-semibold text-indigo-600">
                            Ngày đặt bàn:
                          </span>{' '}
                          {new Date(appointment.data.createdAt).toLocaleString(
                            'vi-VN',
                          )}
                        </p>
                      </div>
                      {appointment.data.status === 'pending' && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={() => setShowReturnForm(true)}
                            className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-[1.02]"
                          >
                            Hủy đặt bàn
                          </button>
                        </div>
                      )}
                    </>
                  )
                ) : (
                  <p className="text-center text-gray-600 font-semibold flex-1 flex items-center justify-center">
                    Không có thông tin đặt bàn.
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-3 flex justify-between items-center text-white text-sm">
                <span className="font-medium">Prime Drink</span>
                <span className="font-medium">
                  Mã đặt bàn: {appointment?.data?._id || 'Không có'}
                </span>
              </div>
            </div>
          </div>
        </dialog>
      )}

      <Footer />
    </div>
  );
};

export default AboutUs;
