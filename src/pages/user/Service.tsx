import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useGetTattoosQuery } from '~/services/tattoos/tattoos.services';
import { useCreateAppointmentMutation } from '~/services/appointments/appointments.services';
import { useGetTimeslotsQuery } from '~/services/timeslots/timeslots.services';
import { useForm } from 'react-hook-form';
import { IAppointment } from '~/domain/types/appointments/appointment.model';
import { ITattoo } from '~/domain/types/tattoo/tattoo.model';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { Toastify } from '~/helpers/Toastify';
import { Button } from 'react-daisyui';
import LoadingPage from '~/components/loading/LoadingPage';
import { Link } from 'react-router-dom';
import { IoIosCloseCircle } from 'react-icons/io';
import { Logo } from '~/assets/images';

const ITEMS_PER_PAGE = 9;

const Service: React.FC = () => {
  const {
    data: tattoosData,
    error: tattoosError,
    isLoading: isLoadingTattoos,
  } = useGetTattoosQuery();

  const { data: timeslotsData, isFetching: isFetchingTimeslots } =
    useGetTimeslotsQuery();
  const [createAppointment, { isLoading: isCreating }] =
    useCreateAppointmentMutation();

  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  const [showModal, setShowModal] = useState(false);
  const [selectedTattoo, setSelectedTattoo] = useState<ITattoo | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    branchId: '',
    artistId: '',
    categoryId: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

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
    if (
      selectedTattoo &&
      typeof selectedTattoo.artist_id === 'object' &&
      selectedTattoo.artist_id
    ) {
      if (selectedTattoo.artist_id.branch_id?._id) {
        setValue('branch_id', selectedTattoo.artist_id.branch_id._id);
      }
      if (selectedTattoo.artist_id._id) {
        setValue('user_id', selectedTattoo.artist_id._id);
      }
      setValue('tattoo_id', selectedTattoo._id);
    }
  }, [selectedTattoo, setValue]);

  const prices = tattoosData?.data?.map((tattoo) => tattoo.price) || [];
  const minPriceValue = prices.length ? Math.min(...prices) : 0;
  const maxPriceValue = prices.length ? Math.max(...prices) : 10000000000000;

  const uniqueCategories = Array.from(
    new Map(
      tattoosData?.data?.map((tattoo) => [
        typeof tattoo.category_appointment === 'object' &&
        tattoo.category_appointment?._id
          ? tattoo.category_appointment._id
          : undefined,
        typeof tattoo.category_appointment === 'object'
          ? tattoo.category_appointment
          : undefined,
      ]),
    ).values(),
  ).filter(Boolean);

  const filteredDrinks =
    tattoosData?.data?.filter((tattoo) => {
      const matchesSearch = tattoo.title
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase());
      const matchesMinPrice = filters.minPrice
        ? tattoo.price >= parseFloat(filters.minPrice)
        : true;
      const matchesMaxPrice = filters.maxPrice
        ? tattoo.price <= parseFloat(filters.maxPrice)
        : true;
      const matchesBranch = filters.branchId
        ? typeof tattoo.artist_id === 'object' &&
          tattoo.artist_id &&
          tattoo.artist_id.branch_id &&
          tattoo.artist_id.branch_id._id === filters.branchId
        : true;
      const matchesArtist = filters.artistId
        ? typeof tattoo.artist_id === 'object' &&
          tattoo.artist_id &&
          tattoo.artist_id._id === filters.artistId
        : true;
      const matchesCategory = filters.categoryId
        ? typeof tattoo.category_appointment === 'object' &&
          tattoo.category_appointment &&
          tattoo.category_appointment._id === filters.categoryId
        : true;
      const matchesArtistStatus =
        typeof tattoo.artist_id === 'object' &&
        tattoo.artist_id &&
        tattoo.artist_id.status === 1 &&
        tattoo.artist_id.verificationCode === null;

      const artistTimeslots = timeslotsData?.data?.filter(
        (timeslot) =>
          typeof timeslot.user_id === 'object' &&
          typeof tattoo.artist_id === 'object' &&
          timeslot.user_id?._id === tattoo.artist_id?._id &&
          timeslot.max_appointment > 0,
      );
      const hasAvailableTimeslots =
        artistTimeslots && artistTimeslots.length > 0;

      return (
        matchesSearch &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesBranch &&
        matchesArtist &&
        matchesCategory &&
        matchesArtistStatus &&
        hasAvailableTimeslots
      );
    }) || [];

  const totalItems = filteredDrinks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDrinks = filteredDrinks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const uniqueBranches = Array.from(
    new Map(
      tattoosData?.data?.map((tattoo) => [
        typeof tattoo.artist_id === 'object' && tattoo.artist_id?.branch_id
          ? tattoo.artist_id.branch_id._id
          : undefined,
        typeof tattoo.artist_id === 'object' && tattoo.artist_id?.branch_id
          ? tattoo.artist_id.branch_id
          : undefined,
      ]),
    ).values(),
  ).filter(Boolean);

  const uniqueArtists = Array.from(
    new Map(
      tattoosData?.data?.map((tattoo) => [
        typeof tattoo.artist_id === 'object' && tattoo.artist_id?._id
          ? tattoo.artist_id._id
          : undefined,
        typeof tattoo.artist_id === 'object' ? tattoo.artist_id : undefined,
      ]),
    ).values(),
  ).filter(Boolean);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      minPrice: '',
      maxPrice: '',
      branchId: '',
      artistId: '',
      categoryId: '',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
    const todayUTC7 = new Date(today.getTime());
    const currentDayIndex = today.getDay();
    const targetDayIndex = daysOfWeek.indexOf(dayOfWeek.toLowerCase());
    const diff = targetDayIndex - currentDayIndex;

    const futureDates: string[] = [];
    const startDate = new Date(todayUTC7);

    if (diff < 0) {
      startDate.setDate(todayUTC7.getDate() + (7 + diff));
    } else {
      startDate.setDate(todayUTC7.getDate() + diff);
    }

    for (let i = 0; i < 4; i++) {
      const nextDate = new Date(startDate);
      nextDate.setDate(startDate.getDate() + i * 7);
      const utc7Date = new Date(nextDate.getTime());
      const dateString = utc7Date.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
      });
      futureDates.push(dateString);
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
      timeslot.user_id?._id === selectedUser,
  );

  const handleBookDrink = (tattoo: ITattoo) => {
    setSelectedTattoo(tattoo);
    setShowModal(true);
  };

  if (isLoadingTattoos) {
    return (
      <div>
        <LoadingPage loading />
      </div>
    );
  }
  if (tattoosError || !tattoosData?.data) {
    return <p>Lỗi tải đồ uống hoặc dữ liệu không hợp lệ</p>;
  }

  return (
    <div className="bg-white text-gray-900 font-roboto">
      <Header />
      <main className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-1/4 p-4">
            <h2 className="text-xl font-bold mb-4">Bộ lọc</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Tìm kiếm</label>
                <input
                  name="searchTerm"
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Tìm kiếm đồ uống"
                  type="text"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <label className="label">
                  Giá: {(filters.minPrice || minPriceValue).toLocaleString()}đ -{' '}
                  {(filters.maxPrice || maxPriceValue).toLocaleString()}đ
                </label>
                <div className="space-y-2">
                  <input
                    name="minPrice"
                    type="range"
                    min={minPriceValue}
                    max={maxPriceValue}
                    value={filters.minPrice || minPriceValue}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                  <input
                    name="maxPrice"
                    type="range"
                    min={minPriceValue}
                    max={maxPriceValue}
                    value={filters.maxPrice || maxPriceValue}
                    onChange={handleFilterChange}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="label">Chi nhánh</label>
                <select
                  name="branchId"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={filters.branchId}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả chi nhánh</option>
                  {uniqueBranches.map((branch) =>
                    branch ? (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ) : null,
                  )}
                </select>
              </div>
              <div>
                <label className="label">Barista</label>
                <select
                  name="artistId"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={filters.artistId}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả barista</option>
                  {uniqueArtists.map((artist) =>
                    artist &&
                    typeof artist === 'object' &&
                    artist.status === 1 &&
                    artist.verificationCode === null ? (
                      <option key={artist._id} value={artist._id}>
                        {artist.full_name}
                      </option>
                    ) : null,
                  )}
                </select>
              </div>
              <div>
                <label className="label">Danh mục</label>
                <select
                  name="categoryId"
                  className="w-full p-2 border border-gray-300 rounded"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả danh mục</option>
                  {uniqueCategories.map((category) =>
                    category ? (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ) : null,
                  )}
                </select>
              </div>
              <Button
                color="primary"
                className="w-full text-white py-2"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </aside>

          <section className="w-full md:w-3/4 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedDrinks.map((tattoo) => (
                <div key={tattoo._id} className="border p-4 flex flex-col">
                  <img
                    alt={tattoo.title}
                    className="w-full h-48 object-cover mb-4"
                    src={tattoo.image}
                  />
                  <h3 className="text-lg font-bold mb-2 line-clamp-1">
                    {tattoo.title}
                  </h3>
                  <div className="flex items-center mb-2">
                    <span className="text-primary font-medium">
                      {tattoo.price.toLocaleString()}đ
                    </span>
                    <span className="text-sm text-gray-500 ml-2">/ ly</span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {tattoo.description}
                  </p>
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-500">
                      Barista phục vụ:{' '}
                      {tattoo?.artist_id && typeof tattoo.artist_id === 'object'
                        ? `${tattoo.artist_id.full_name || 'N/A'} - ${tattoo.artist_id?.branch_id?.name || 'N/A'} - ${tattoo.artist_id?.branch_id?.address || 'N/A'}`
                        : 'Không có'}
                    </span>
                  </div>
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-500">
                      Danh mục:{' '}
                      {tattoo?.category_appointment &&
                      typeof tattoo.category_appointment === 'object'
                        ? tattoo.category_appointment.name
                        : 'Không có'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Link to={`/service/${tattoo._id}`}>
                      <Button className="flex-1 bg-black text-white hover:bg-gray-800">
                        Xem chi tiết
                      </Button>
                    </Link>
                    <Button
                      color="primary"
                      className="flex-1 text-white"
                      onClick={() => handleBookDrink(tattoo)}
                    >
                      Đặt bàn
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex items-center space-x-2 p-2">
                  <button
                    className="px-3 py-2 rounded-md text-gray-600 hover:bg-red-500 hover:text-white disabled:bg-white disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>

                  {totalPages > 3 && currentPage > 3 && (
                    <>
                      <button
                        className="px-3 py-2 rounded-md text-gray-600 hover:bg-red-500 hover:text-white"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="px-3 py-2 text-gray-600">...</span>
                      )}
                    </>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page >= currentPage - 2 &&
                        page <= currentPage + 2 &&
                        page > 0 &&
                        page <= totalPages,
                    )
                    .map((page) => (
                      <button
                        key={page}
                        className={`px-3 py-2 rounded-md ${
                          currentPage === page
                            ? 'bg-red-500 text-white'
                            : 'text-gray-600 hover:bg-red-500 hover:text-white'
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}

                  {totalPages > 3 && currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-3 py-2 text-gray-600">...</span>
                      )}
                      <button
                        className="px-3 py-2 rounded-md text-gray-600 hover:bg-red-500 hover:text-white"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}

                  <button
                    className="px-3 py-2 rounded-md text-gray-600 hover:bg-red-500 hover:text-white disabled:bg-white disabled:text-gray-400 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    »
                  </button>
                </nav>
              </div>
            )}
            {filteredDrinks.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy đồ uống phù hợp</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />

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
                  placeholder="Ghi chú đặc biệt (dị ứng, sở thích đồ uống...)"
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
                      required: 'Vui lòng chọn barista phục vụ',
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
                    disabled={isFetchingTimeslots || !selectedUser}
                    onChange={handleTimeslotChange}
                  >
                    <option value="">Chọn khung giờ</option>
                    {isFetchingTimeslots ? (
                      <option>Đang tải khung giờ...</option>
                    ) : (
                      filteredTimeslots?.map((timeslot) => (
                        <option key={timeslot._id} value={timeslot._id}>
                          {timeslot.startTime} - {timeslot.endTime} -{' '}
                          {timeslot.day_of_week} - {timeslot.max_appointment}{' '}
                          {'lượt'}
                        </option>
                      ))
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
    </div>
  );
};

export default Service;
