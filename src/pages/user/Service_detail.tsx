import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useGetTattoosQuery } from '~/services/tattoos/tattoos.services';
import { useGetTimeslotsQuery } from '~/services/timeslots/timeslots.services';
import { useCreateAppointmentMutation } from '~/services/appointments/appointments.services';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { IAppointment } from '~/domain/types/appointments/appointment.model';
import { ITattoo } from '~/domain/types/tattoo/tattoo.model';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { Toastify } from '~/helpers/Toastify';
import { Button } from 'react-daisyui';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { IoIosCloseCircle } from 'react-icons/io';
import { Logo } from '~/assets/images';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { IUser } from '~/domain/types/user/user.model';

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: tattoosData, error: tattoosError } = useGetTattoosQuery();
  const { data: timeslotsData, isFetching: isFetchingTimeslots } =
    useGetTimeslotsQuery();
  const [createAppointment, { isLoading: isCreating }] =
    useCreateAppointmentMutation();

  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  const tattoo = tattoosData?.data.find((tattoo) => tattoo._id === id);

  const [showModal, setShowModal] = useState(false);
  const [selectedTattoo, setSelectedTattoo] = useState<ITattoo | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IAppointment>();

  const selectedUser = watch('user_id');

  useEffect(() => {
    if (selectedTattoo && typeof selectedTattoo.artist_id === 'object') {
      if (selectedTattoo.artist_id.branch_id?._id) {
        setValue('branch_id', selectedTattoo.artist_id.branch_id._id);
      }
      if (selectedTattoo.artist_id._id) {
        setValue('user_id', selectedTattoo.artist_id._id);
      }
      setValue('tattoo_id', selectedTattoo._id);
    }
  }, [selectedTattoo, setValue]);

  const filteredTattoos =
    tattoosData?.data.filter((t) => {
      if (t._id === tattoo?._id) return false;
      const matchesArtistStatus =
        typeof t.artist_id === 'object' &&
        t.artist_id &&
        t.artist_id.status === 1 &&
        t.artist_id.verificationCode === null;

      const artistTimeslots = timeslotsData?.data?.filter(
        (timeslot) =>
          typeof timeslot.user_id === 'object' &&
          timeslot.user_id?._id ===
            (typeof t.artist_id === 'object' && t.artist_id
              ? t.artist_id._id
              : undefined) &&
          timeslot.max_appointment > 0,
      );
      const hasAvailableTimeslots =
        artistTimeslots && artistTimeslots.length > 0;

      return matchesArtistStatus && hasAvailableTimeslots;
    }) || [];

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredTattoos.length / itemsPerPage);

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTattoos = filteredTattoos.slice(startIndex, endIndex);

  const isValidTattoo =
    tattoo &&
    typeof tattoo.artist_id === 'object' &&
    tattoo.artist_id &&
    tattoo.artist_id.status === 1 &&
    tattoo.artist_id.verificationCode === null &&
    timeslotsData?.data?.some(
      (timeslot) =>
        typeof timeslot.user_id === 'object' &&
        timeslot.user_id?._id ===
          (typeof tattoo.artist_id === 'object' && tattoo.artist_id
            ? tattoo.artist_id._id
            : undefined) &&
        timeslot.max_appointment > 0,
    );

  const calculateFutureDatesFromDayOfWeek = (dayOfWeek: string) => {
    const daysOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const today = new Date();
    const currentDayIndex = today.getDay();
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
    const diff = targetDayIndex - currentDayIndex;

    const futureDates: string[] = [];
    const startDate = new Date(today);

    if (diff < 0) {
      startDate.setDate(today.getDate() + (7 + diff));
    } else {
      startDate.setDate(today.getDate() + diff);
    }

    for (let i = 0; i < 4; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + i * 7);
      futureDates.push(nextDate.toISOString().split('T')[0]);
    }

    return futureDates;
  };

  const handleTimeslotChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTimeslotId = e.target.value;
    const selectedTimeslot = filteredTimeslots?.find(
      (timeslot) => timeslot._id === selectedTimeslotId,
    );
    if (selectedTimeslot) {
      const dates = calculateFutureDatesFromDayOfWeek(
        selectedTimeslot.day_of_week,
      );
      setAvailableDates(dates);
      setValue('date', dates[0]);
    }
  };

  const onSubmit = async (data: IAppointment) => {
    try {
      if (auth?._id) {
        data.customer_id = auth._id;
      } else {
        if (!data.phone || !data.email) {
          Toastify(
            'Vui lòng nhập số điện thoại và email khi chưa đăng nhập',
            400,
          );
          return;
        }
      }

      await createAppointment(data).unwrap();
      Toastify('Đặt bàn thành công', 201);
      setShowModal(false);
      reset();
      setAvailableDates([]);
      setSelectedTattoo(null);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const filteredTimeslots = timeslotsData?.data?.filter(
    (timeslot) =>
      typeof timeslot.user_id === 'object' &&
      timeslot.user_id?._id === selectedUser &&
      timeslot.max_appointment > 0,
  );

  const handleBookTattoo = () => {
    if (isValidTattoo && tattoo) {
      setSelectedTattoo(tattoo);
      setShowModal(true);
    } else {
      Toastify('Sản phẩm này hiện không khả dụng để đặt bàn', 400);
    }
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  if (tattoosError) return <p>Lỗi tải đồ uống</p>;
  if (!tattoo)
    return (
      <p>
        <LoadingLocal />
      </p>
    );

  // If tattoo is not valid, show a message
  if (!isValidTattoo) {
    return (
      <div className="bg-white font-roboto">
        <Header />
        <div className="container mx-auto p-4 text-center">
          <p className="text-gray-500">
            Đồ uống này hiện không khả dụng do barista không có lịch làm việc
            hoặc đã hết lượt đặt bàn.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white font-roboto">
      <Header />
      <div className="container mx-auto p-4 flex flex-col md:flex-row items-start mt-4">
        <div className="w-full md:w-1/2">
          <img
            alt={tattoo.title}
            className="w-full h-auto rounded-lg shadow-md"
            src={tattoo.image || 'default-image.jpg'}
          />
        </div>
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:ml-8 ">
          <h1 className="text-3xl font-bold mb-2">{tattoo.title}</h1>
          <p className="text-gray-700">
            Barista phục vụ:{' '}
            {tattoo?.artist_id && typeof tattoo.artist_id === 'object'
              ? `${(tattoo.artist_id as IUser).full_name || 'N/A'} - ${(tattoo.artist_id as IUser)?.branch_id?.name || 'N/A'} - ${(tattoo.artist_id as IUser)?.branch_id?.address || 'N/A'}`
              : 'Không có'}
          </p>
          <p>
            Danh mục:{' '}
            {tattoo?.category_appointment &&
            typeof tattoo.category_appointment === 'object'
              ? (tattoo.category_appointment as { name: string }).name
              : 'Không có'}
          </p>
          <h2 className="text-xl font-semibold mb-2 mt-4">Giá:</h2>
          <p className="mb-4 font-bold text-primary text-lg">
            {tattoo.price.toLocaleString()}đ
          </p>
          <h2 className="text-xl font-semibold mb-2">Mô tả:</h2>
          <p className="mb-4">{tattoo.description || 'Chưa có mô tả'}</p>
          <h2 className="text-xl font-semibold mb-2">Thành phần đặc biệt:</h2>
          {tattoo.suggested_positions &&
          tattoo.suggested_positions.length > 0 ? (
            <ul className="list-disc list-inside mb-4">
              {tattoo.suggested_positions.map((position, index) => (
                <li key={index}>{position}</li>
              ))}
            </ul>
          ) : (
            <p className="mb-4">Chưa có thông tin thành phần đặc biệt</p>
          )}
          <p className="text-sm text-gray-500 mb-4">
            Đảm bảo an toàn vệ sinh thực phẩm và chất lượng nguyên liệu.
            <span className="text-red-500">
              {' '}
              Nếu cần hỗ trợ hoặc có dị ứng thực phẩm, vui lòng liên hệ với
              chúng tôi!
            </span>
          </p>
          <Button color="primary" onClick={handleBookTattoo}>
            Đặt bàn tại đây
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Đồ uống khác</h2>
          {filteredTattoos.length > itemsPerPage && (
            <div className="flex justify-end mt-4">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className={`p-2 rounded-full ${currentPage === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className={`p-2 rounded-full ${currentPage === totalPages - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {currentTattoos.length > 0 ? (
              currentTattoos.map((tattoo) => (
                <div
                  key={tattoo._id}
                  className="bg-white shadow-md rounded-lg overflow-hidden"
                >
                  <img
                    alt={tattoo.title}
                    className="w-full h-48 object-cover"
                    src={tattoo.image || 'default-image.jpg'}
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {tattoo.title}
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Barista phục vụ:{' '}
                      {tattoo?.artist_id && typeof tattoo.artist_id === 'object'
                        ? `${(tattoo.artist_id as IUser).full_name || 'N/A'} - ${(tattoo.artist_id as IUser)?.branch_id?.name || 'N/A'} - ${(tattoo.artist_id as IUser)?.branch_id?.address || 'N/A'}`
                        : 'Không có'}
                    </p>
                    <p className="text-primary font-semibold mb-2">
                      Giá: {tattoo.price.toLocaleString()}đ
                    </p>
                    <p className="text-gray-700 mb-2 line-clamp-1">
                      Mô tả: {tattoo.description || 'Chưa có mô tả'}
                    </p>
                    <Link to={`/service/${tattoo._id}`} className="">
                      <Button className="w-full mt-4 bg-black text-white hover:bg-gray-800">
                        Xem thêm
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Không có đồ uống liên quan nào.</p>
            )}
          </div>
        </div>
      </div>

      {showModal && selectedTattoo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <IoIosCloseCircle className="w-8 h-8" />
            </button>

            <div className="relative flex justify-center items-center mb-4">
              <img
                src={Logo}
                alt="Logo"
                className="h-12 w-12"
                width="100%"
                height="100%"
              />
            </div>

            <h2 className="text-xl font-bold mb-4">
              Đặt bàn: {selectedTattoo.title}
            </h2>

            <img
              src={selectedTattoo.image}
              alt={selectedTattoo.title}
              className="w-full h-12 w-12 object-cover mb-4"
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Ghi chú đặc biệt
                </label>
                <input
                  {...register('description', {
                    required: 'Vui lòng nhập ghi chú',
                  })}
                  type="text"
                  id="description"
                  placeholder="Ví dụ: ít đường, không đá, dị ứng thực phẩm..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="branch_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Chi nhánh
                  </label>
                  <select
                    {...register('branch_id', {
                      required: 'Vui lòng chọn chi nhánh',
                    })}
                    id="branch_id"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-black"
                    disabled
                  >
                    <option
                      value={
                        typeof selectedTattoo.artist_id === 'object' &&
                        selectedTattoo.artist_id?.branch_id
                          ? selectedTattoo.artist_id.branch_id._id
                          : ''
                      }
                    >
                      {typeof selectedTattoo.artist_id === 'object' &&
                      selectedTattoo.artist_id?.branch_id
                        ? selectedTattoo.artist_id.branch_id.name
                        : 'Không xác định'}
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="user_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Barista phục vụ
                  </label>
                  <select
                    {...register('user_id', {
                      required: 'Vui lòng chọn Barista phục vụ',
                    })}
                    id="user_id"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-black"
                    disabled
                  >
                    <option
                      value={
                        typeof selectedTattoo.artist_id === 'object' &&
                        selectedTattoo.artist_id?._id
                          ? selectedTattoo.artist_id._id
                          : ''
                      }
                    >
                      {typeof selectedTattoo.artist_id === 'object' &&
                      selectedTattoo.artist_id?.full_name
                        ? selectedTattoo.artist_id.full_name
                        : 'Không xác định'}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="timeslot_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Khung giờ
                  </label>
                  <select
                    {...register('timeslot_id', {
                      required: 'Vui lòng chọn khung giờ',
                    })}
                    id="timeslot_id"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-black"
                    disabled={
                      isFetchingTimeslots ||
                      !selectedUser ||
                      !filteredTimeslots?.length
                    }
                    onChange={handleTimeslotChange}
                  >
                    <option value="">Chọn khung giờ</option>
                    {isFetchingTimeslots ? (
                      <option>Đang tải khung giờ...</option>
                    ) : filteredTimeslots?.length ? (
                      filteredTimeslots.map((timeslot) => (
                        <option key={timeslot._id} value={timeslot._id}>
                          {timeslot.startTime} - {timeslot.endTime} -{' '}
                          {timeslot.day_of_week} - {timeslot.max_appointment}{' '}
                          lượt
                        </option>
                      ))
                    ) : (
                      <option>Không có khung giờ khả dụng</option>
                    )}
                  </select>
                  {errors.timeslot_id && (
                    <p className="text-red-500 text-sm">
                      {errors.timeslot_id.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ngày
                  </label>
                  <select
                    {...register('date', { required: 'Vui lòng chọn ngày' })}
                    id="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm text-black"
                    disabled={!availableDates.length}
                  >
                    <option value="">Chọn ngày</option>
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('vi-VN', {
                          timeZone: 'Asia/Ho_Chi_Minh',
                        })}
                      </option>
                    ))}
                  </select>
                  {errors.date && (
                    <p className="text-red-500 text-sm">
                      {errors.date.message}
                    </p>
                  )}
                </div>
              </div>

              {!auth?._id && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Số điện thoại
                    </label>
                    <input
                      {...register('phone', {
                        required: 'Vui lòng nhập số điện thoại',
                        pattern: {
                          value: /^\d{10,11}$/,
                          message: 'Số điện thoại không hợp lệ',
                        },
                      })}
                      type="text"
                      id="phone"
                      placeholder="Nhập số điện thoại"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      {...register('email', {
                        required: 'Vui lòng nhập email',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Email không hợp lệ',
                        },
                      })}
                      type="email"
                      id="email"
                      placeholder="Nhập email"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end w-full gap-4">
                <Button
                  color="error"
                  onClick={() => setShowModal(false)}
                  className="text-white"
                >
                  Hủy
                </Button>
                <Button
                  color="success"
                  className="text-white"
                  disabled={isCreating}
                >
                  {isCreating ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ServiceDetail;
