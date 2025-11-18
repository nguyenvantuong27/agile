import React, { useState, useEffect } from 'react';
import { Button } from 'react-daisyui';
import { useForm } from 'react-hook-form';
import { FaMapMarkedAlt } from 'react-icons/fa';
import { IoIosCloseCircle } from 'react-icons/io';
import { Link } from 'react-router-dom';
import { Logo } from '~/assets/images';
import Footer from '~/components/footer/Footer';
import Header from '~/components/header/Header';
import LoadingPage from '~/components/loading/LoadingPage';
import { IAppointment } from '~/domain/types/appointments/appointment.model';
import { IUser } from '~/domain/types/user/user.model';
import { Toastify } from '~/helpers/Toastify';
import { useAppSelector } from '~/hooks/HookRouter';
import { useCreateAppointmentMutation } from '~/services/appointments/appointments.services';
import { useGetTimeslotsQuery } from '~/services/timeslots/timeslots.services';
import {
  useGetAllUsersQuery,
  useGetEmployeeByIdQuery,
} from '~/services/users/user.services';

const Artists: React.FC<object> = () => {
  const { data: allUsers, isLoading } = useGetAllUsersQuery();
  const { data: timeslotsData, isFetching: isFetchingTimeslots } =
    useGetTimeslotsQuery();
  const [createAppointment, { isLoading: isCreating }] =
    useCreateAppointmentMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('');

  // Lọc baristas dựa trên role, status, verificationCode, và timeslots
  const artists = allUsers?.data.filter(
    (user) =>
      (user.role === 'artist' || user.role === 'employee') &&
      user.status === 1 &&
      user.verificationCode === null &&
      timeslotsData?.data?.some(
        (timeslot) =>
          typeof timeslot.user_id === 'object' &&
          timeslot.user_id?._id === user._id &&
          timeslot.max_appointment > 0,
      ),
  );

  const branches = Array.from(
    new Set(artists?.map((artist) => artist.branch_id.name)),
  );

  // Lọc artists dựa trên các bộ lọc tìm kiếm
  const filteredArtists = artists?.filter((artist) => {
    const matchesSearch = artist.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGender = selectedGender
      ? artist.sex === (selectedGender === '0' ? 0 : 1)
      : true;
    const matchesBranch = selectedBranchFilter
      ? artist.branch_id.name === selectedBranchFilter
      : true;
    return matchesSearch && matchesGender && matchesBranch;
  });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const auth = useAppSelector((state) => state.auth.currentUser);
  const { data: user } = useGetEmployeeByIdQuery(selectedUserId, {
    skip: !selectedUserId,
  });

  const {
    register: registerAppointment,
    handleSubmit: handleSubmitAppointment,
    reset: resetAppointment,
    setValue: setValueAppointment,
    formState: { errors: appointmentErrors },
  } = useForm<IAppointment>();

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
      setValueAppointment('date', dates[0]);
    } else {
      setAvailableDates([]);
      setValueAppointment('date', '');
    }
  };

  const onAppointmentSubmit = async (data: IAppointment) => {
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
      data.user_id = selectedUser;
      data.branch_id = selectedBranch;

      await createAppointment(data).unwrap();
      Toastify('Đặt bàn thành công', 201);
      setShowAppointmentModal(false);
      resetAppointment();
      setAvailableDates([]);
      setSelectedBranch('');
      setSelectedUser('');
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  // Lọc timeslots để chỉ hiển thị những timeslot có max_appointment > 0
  const filteredTimeslots = timeslotsData?.data?.filter(
    (timeslot) =>
      typeof timeslot.user_id === 'object' &&
      timeslot.user_id?._id === selectedUser &&
      timeslot.max_appointment > 0,
  );

  useEffect(() => {
    if (selectedUserId && user?.data) {
      setSelectedUser(user.data._id ?? '');
      setSelectedBranch(user.data.branch_id?._id ?? '');
      setValueAppointment('user_id', user.data._id ?? '');
      setValueAppointment('branch_id', user.data.branch_id._id ?? '');
    }
  }, [selectedUserId, user, setValueAppointment]);

  if (isLoading) {
    return <LoadingPage loading />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4 px-2 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Lọc barista
            </h2>
            <div className="space-y-3">
              <div>
                <input
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  placeholder="Tìm kiếm theo tên barista"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="0">Nam</option>
                  <option value="1">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chi nhánh
                </label>
                <select
                  className="w-full px-2 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                >
                  <option value="">Tất cả</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          <div className="w-full md:w-3/4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredArtists ?? []).length > 0 ? (
                (filteredArtists ?? []).map((artist: IUser) => (
                  <div
                    key={artist._id}
                    className="relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative w-full h-64 overflow-hidden">
                      <Link to={`/user-detail/${artist._id}`}>
                        <img
                          src={artist.image}
                          alt={artist.full_name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </Link>
                      <span
                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium text-white ${
                          artist.sex === 0 ? 'bg-blue-500' : 'bg-pink-500'
                        }`}
                      >
                        {artist.sex === 0 ? 'Nam' : 'Nữ'}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Link
                          to={`/user-detail/${artist._id}`}
                          className="hover:underline"
                        >
                          <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
                            {artist.full_name}
                          </h3>
                        </Link>
                      </div>
                      <div className="flex items-center text-gray-600 text-sm mb-4">
                        <FaMapMarkedAlt className="text-red-500 mr-2" />
                        <span className="line-clamp-1">
                          {artist.branch_id.name} - {artist.branch_id.address}
                        </span>
                      </div>
                      <Button
                        color="primary"
                        onClick={() => {
                          setSelectedUserId(artist._id ?? '');
                          setShowAppointmentModal(true);
                        }}
                        className="w-full text-white font-medium"
                      >
                        Đặt bàn ngay
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  Không tìm thấy barista nào phù hợp
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
            <button
              type="button"
              onClick={() => setShowAppointmentModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <IoIosCloseCircle className="w-8 h-8" />
            </button>
            <div className="flex justify-center mb-6">
              <img
                src={Logo}
                alt="Logo"
                className="h-12"
                width="auto"
                height="auto"
              />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Đặt Bàn
            </h2>
            <form
              onSubmit={handleSubmitAppointment(onAppointmentSubmit)}
              className="space-y-6"
            >
              {!auth?._id && (
                <>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Số điện thoại
                    </label>
                    <input
                      {...registerAppointment('phone', {
                        required: 'Vui lòng nhập số điện thoại',
                        pattern: {
                          value: /^\d{10,11}$/,
                          message: 'Số điện thoại không hợp lệ',
                        },
                      })}
                      type="text"
                      id="phone"
                      placeholder="Nhập số điện thoại"
                      className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    />
                    {appointmentErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {appointmentErrors.phone.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      {...registerAppointment('email', {
                        required: 'Vui lòng nhập email',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Email không hợp lệ',
                        },
                      })}
                      type="email"
                      id="email"
                      placeholder="Nhập email"
                      className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    />
                    {appointmentErrors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {appointmentErrors.email.message}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="branch_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Chi nhánh
                  </label>
                  <select
                    {...registerAppointment('branch_id', {
                      required: 'Vui lòng chọn chi nhánh',
                    })}
                    id="branch_id"
                    className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white text-gray-800"
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    value={selectedBranch}
                    disabled
                  >
                    <option value={user?.data.branch_id._id}>
                      {user?.data.branch_id.name}
                    </option>
                  </select>
                  {appointmentErrors.branch_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {appointmentErrors.branch_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="user_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Barista phục vụ
                  </label>
                  <select
                    {...registerAppointment('user_id', {
                      required: 'Vui lòng chọn barista',
                    })}
                    id="user_id"
                    className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white text-gray-800"
                    onChange={(e) => {
                      setSelectedUser(e.target.value);
                      setAvailableDates([]);
                    }}
                    value={selectedUser}
                    disabled
                  >
                    <option value={user?.data._id}>
                      {user?.data.full_name}
                    </option>
                  </select>
                  {appointmentErrors.user_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {appointmentErrors.user_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="timeslot_id"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Khung giờ
                  </label>
                  <select
                    {...registerAppointment('timeslot_id', {
                      required: 'Vui lòng chọn khung giờ',
                    })}
                    id="timeslot_id"
                    className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white text-gray-800"
                    disabled={
                      !selectedUser ||
                      isFetchingTimeslots ||
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
                          {timeslot.startTime} - {timeslot.endTime} (
                          {timeslot.day_of_week}) - {timeslot.max_appointment}{' '}
                          bàn
                        </option>
                      ))
                    ) : (
                      <option>Không có khung giờ khả dụng</option>
                    )}
                  </select>
                  {appointmentErrors.timeslot_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {appointmentErrors.timeslot_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ngày
                  </label>
                  <select
                    {...registerAppointment('date', {
                      required: 'Vui lòng chọn ngày',
                    })}
                    id="date"
                    className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition bg-white text-gray-800"
                    disabled={!availableDates.length}
                  >
                    <option value="">Chọn ngày</option>
                    {availableDates.map((date) => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('vi-VN')}
                      </option>
                    ))}
                  </select>
                  {appointmentErrors.date && (
                    <p className="text-red-500 text-sm mt-1">
                      {appointmentErrors.date.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Yêu cầu đặc biệt
                </label>
                <input
                  {...registerAppointment('description', {
                    required: 'Vui lòng nhập yêu cầu đặc biệt',
                  })}
                  type="text"
                  id="description"
                  placeholder="Yêu cầu đặc biệt (số người, vị trí ngồi...)"
                  className="w-full p-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                {appointmentErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {appointmentErrors.description.message}
                  </p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-colors font-medium"
                  disabled={isCreating}
                >
                  {isCreating ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Artists;
