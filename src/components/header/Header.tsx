import { Button, Modal, Input } from 'react-daisyui';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '~/assets/images';
import { IoIosCloseCircle, IoIosGift } from 'react-icons/io';
import { Toastify } from '~/helpers/Toastify';
import { useAppSelector } from '~/hooks/HookRouter';
import { useLogoutHandler } from '~/hooks/useLogoutHandler';
import { ILogoutError } from '~/interfaces/types/auth/auth';
import { RootState } from '~/redux/storage/store';
import { useLogoutMutation } from '~/services/auth/logout.services';
import { useForm } from 'react-hook-form';
import { useCreateAppointmentMutation } from '~/services/appointments/appointments.services';
import { useGetTimeslotsQuery } from '~/services/timeslots/timeslots.services';
import { useGetBranchesQuery } from '~/services/branches/branches.services';
import {
  useGetAllUsersQuery,
  usePatchUserMutation,
} from '~/services/users/user.services';
import { IAppointment } from '~/domain/types/appointments/appointment.model';
import { IUser } from '~/domain/types/user/user.model';
import { useGetCartByUserIdQuery } from '~/services/cart/cart.services';
import { useGetCartDetailsByCartIdQuery } from '~/services/cart-details/cart-details.services';
import {
  FaUser,
  FaCalendarAlt,
  FaShoppingCart,
  FaHeart,
  FaSignOutAlt,
  FaComments,
  FaImage,
} from 'react-icons/fa';
import axios from 'axios';
import { useState, useMemo } from 'react';
import { IoTrashOutline } from 'react-icons/io5';

const daysOfWeekMap = [
  { value: 'monday', label: 'Thứ Hai' },
  { value: 'tuesday', label: 'Thứ Ba' },
  { value: 'wednesday', label: 'Thứ Tư' },
  { value: 'thursday', label: 'Thứ Năm' },
  { value: 'friday', label: 'Thứ Sáu' },
  { value: 'saturday', label: 'Thứ Bảy' },
  { value: 'sunday', label: 'Chủ Nhật' },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { user: string; bot: string }[]
  >([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const { handleLogout: logoutHandle } = useLogoutHandler();
  const refreshToken = useAppSelector(
    (state: RootState) => state.auth.currentUser?.refreshToken,
  );
  const [patchUser, { isLoading: isUpdatingProfile }] = usePatchUserMutation();
  const { data: branchesData } = useGetBranchesQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: usersData, isFetching: isFetchingUsers } =
    useGetAllUsersQuery();
  const { data: timeslotsData, isFetching: isFetchingTimeslots } =
    useGetTimeslotsQuery();
  const [createAppointment, { isLoading: isCreating }] =
    useCreateAppointmentMutation();

  const { data: cartData } = useGetCartByUserIdQuery(auth?._id || '', {
    skip: !auth?._id,
  });
  const { data: cartDetailsData } = useGetCartDetailsByCartIdQuery(
    cartData?.data?._id || '',
    { skip: !cartData?.data?._id },
  );

  const cartItemCount =
    cartDetailsData?.data?.reduce((total, item) => total + item.quantity, 0) ||
    0;

  const artists =
    usersData?.data?.filter(
      (user) =>
        user.role === 'artist' &&
        user.status === 1 &&
        user.verificationCode === null &&
        timeslotsData?.data?.some(
          (timeslot) =>
            typeof timeslot.user_id === 'object' &&
            timeslot.user_id?._id === user._id &&
            timeslot.max_appointment > 0,
        ),
    ) || [];

  const {
    register: registerAppointment,
    handleSubmit: handleSubmitAppointment,
    reset: resetAppointment,
    setValue: setValueAppointment,
    formState: { errors: appointmentErrors },
  } = useForm<IAppointment>();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<Partial<IUser>>({
    defaultValues: {
      full_name: auth?.full_name,
      email: auth?.email,
      phone: auth?.phone,
      sex: auth?.sex,
      image: auth?.image,
    },
  });

  const handleAvatarClick = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = async () => {
    try {
      await logout({ refreshToken });
      logoutHandle();
      Toastify('Đăng xuất thành công', 201);
      navigate('/auth/login', { replace: true });
    } catch (error) {
      const err = error as ILogoutError;
      if (err.data?.message === 'Không tìm thấy session để xóa') {
        logoutHandle();
      } else {
        Toastify('Đăng xuất thất bại', 400);
      }
    }
  };

  const menuItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/shop', label: 'Cửa hàng' },
    { path: '/about_us', label: 'Giới thiệu' },
    { path: '/news', label: 'Tin tức' },
    { path: '/video', label: 'Video' },
    { path: '/contact', label: 'Liên hệ' },
  ];

  const availableDaysOfWeek = useMemo(() => {
    if (!selectedBranch || !usersData?.data || !timeslotsData?.data) {
      return [];
    }

    const validDays = new Set<string>();
    const validArtists = usersData.data.filter(
      (user) =>
        user.branch_id?._id === selectedBranch &&
        user.role === 'artist' &&
        user.status === 1 &&
        user.verificationCode === null,
    );

    timeslotsData.data.forEach((timeslot) => {
      if (
        typeof timeslot.user_id === 'object' &&
        timeslot.max_appointment > 0 &&
        validArtists.some(
          (artist) =>
            typeof timeslot.user_id === 'object' &&
            artist._id === timeslot.user_id._id,
        )
      ) {
        validDays.add(timeslot.day_of_week.toLowerCase());
      }
    });

    return daysOfWeekMap.filter((day) => validDays.has(day.value));
  }, [selectedBranch, usersData, timeslotsData]);

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
      const dates = calculateFutureDatesFromDayOfWeek(selectedDayOfWeek);
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
      Toastify('Đặt lịch xăm thành công', 201);
      setShowAppointmentModal(false);
      resetAppointment();
      setAvailableDates([]);
      setSelectedBranch('');
      setSelectedDayOfWeek('');
      setSelectedUser('');
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const onProfileSubmit = async (data: Partial<IUser>) => {
    if (!auth?._id) return;
    try {
      await patchUser({ id: auth._id, data }).unwrap();
      Toastify('Cập nhật thông tin cá nhân thành công', 200);
      setShowProfileModal(false);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const filteredUsers =
    usersData?.data?.filter(
      (user) =>
        user.branch_id?._id === selectedBranch &&
        user.role === 'artist' &&
        user.status === 1 &&
        user.verificationCode === null &&
        timeslotsData?.data?.some(
          (timeslot) =>
            typeof timeslot.user_id === 'object' &&
            timeslot.user_id?._id === user._id &&
            timeslot.day_of_week.toLowerCase() ===
              selectedDayOfWeek.toLowerCase() &&
            timeslot.max_appointment > 0,
        ),
    ) || [];

  const filteredTimeslots =
    timeslotsData?.data?.filter(
      (timeslot) =>
        typeof timeslot.user_id === 'object' &&
        timeslot.user_id?._id === selectedUser &&
        timeslot.day_of_week.toLowerCase() ===
          selectedDayOfWeek.toLowerCase() &&
        timeslot.max_appointment > 0,
    ) || [];

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newMessage = { user: chatInput, bot: 'Đang trả lời...' };
    const newMessages = [...chatMessages, newMessage];
    setChatMessages(newMessages);
    setChatInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'deepseek/deepseek-r1:free',
          messages: [{ role: 'user', content: chatInput }],
        },
        {
          headers: {
            Authorization:
              'Bearer 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',
            'Content-Type': 'application/json',
          },
        },
      );

      let botReply = response.data.choices[0].message.content;

      if (selectedArtist) {
        const artist = artists.find((a) => a._id === selectedArtist);
        botReply = `Bạn đang chat với ${artist?.full_name}. ${botReply}`;
      }

      setChatMessages([
        ...newMessages.slice(0, -1),
        { user: chatInput, bot: botReply },
      ]);
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      setChatMessages([
        ...newMessages.slice(0, -1),
        { user: chatInput, bot: 'Có lỗi xảy ra! Vui lòng thử lại.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const deleteMessage = (index: number) => {
    setChatMessages(chatMessages.filter((_, i) => i !== index));
  };

  return (
    <nav className="relative bg-white shadow dark:bg-gray-800">
      <div className="container px-6 py-4 mx-auto">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex items-center justify-between">
            <Link to="/">
              <img className="h-[70px] w-[100px]" src={Logo} alt="Logo" />
            </Link>
            <div className="flex lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none"
                aria-label="toggle menu"
              >
                {!isOpen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div
            className={`absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent lg:w-auto lg:flex lg:items-center ${isOpen ? 'translate-x-0 opacity-100' : 'opacity-0 -translate-x-full lg:opacity-100 lg:translate-x-0'}`}
          >
            <div className="flex flex-col -mx-6 lg:flex-row lg:items-center lg:mx-8 gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${location.pathname === item.path ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-200'} hover:text-primary`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link to="/cart" className="mr-4 relative flex items-center">
              <FaShoppingCart className="text-xl text-gray-600 hover:text-primary transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <div className="flex items-center mt-4 lg:mt-0">
              {auth?._id ? (
                <div className="relative">
                  <div
                    className="h-11 w-11 cursor-pointer rounded-full bg-cover bg-center sm:ml-2 relative"
                    onClick={handleAvatarClick}
                  >
                    <img
                      src={`${auth.image}`}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        auth.isOnline ? 'bg-green-500' : 'bg-green-500'
                      }`}
                    ></span>
                  </div>

                  {dropdownVisible && (
                    <div className="absolute right-0 top-12 z-20 w-56 mt-2 rounded-lg shadow-xl bg-white overflow-hidden">
                      <div className="py-1">
                        <Link to="/account">
                          <Button className="flex w-full items-center justify-start px-4 py-2 text-sm text-gray-700 ">
                            <FaUser className="mr-2" />
                            <span>Thông tin tài khoản</span>
                          </Button>
                        </Link>
                        <Link to="/appointment-list">
                          <Button className="flex w-full items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-150">
                            <FaCalendarAlt className="mr-2" />
                            <span>Quản lý lịch đặt bàn</span>
                          </Button>
                        </Link>
                        <Link to="/order-management">
                          <Button className="flex w-full items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-150">
                            <FaShoppingCart className="mr-2" />
                            <span>Quản lý đơn hàng</span>
                          </Button>
                        </Link>
                        <Link to="/favorites-management">
                          <Button className="flex w-full items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-150">
                            <FaHeart className="mr-2" />
                            <span>Sản phẩm yêu thích</span>
                          </Button>
                        </Link>
                        <Link to="/spin-wheel">
                          <Button className="flex w-full items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-150">
                            <IoIosGift className="mr-2" />
                            <span>Vòng quay may mắn</span>
                          </Button>
                        </Link>
                        <Link to="/create-image">
                          <Button className="flex w-full items-center justify-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors duration-150">
                            <FaImage className="mr-2" />
                            <span>Tạo hình ảnh đồ uống AI</span>
                          </Button>
                        </Link>
                        <Button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex w-full items-center justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-150"
                        >
                          <FaSignOutAlt className="mr-2" />
                          <span>
                            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth/login">
                  <Button color="primary" className="flex w-full text-white">
                    <FaSignOutAlt className="mr-2 text-base" />
                    <p>Đăng nhập</p>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAppointmentModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              type="button"
              onClick={() => setShowAppointmentModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <IoIosCloseCircle className="w-8 h-8" />
            </button>
            <div className="relative flex justify-center items-center">
              <div className="relative z-10">
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-12"
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-4">Đặt lịch xăm</h2>
            <form
              onSubmit={handleSubmitAppointment(onAppointmentSubmit)}
              className="space-y-4"
            >
              {!auth?._id && (
                <>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
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
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    {appointmentErrors.phone && (
                      <p className="text-red-500 text-sm">
                        {appointmentErrors.phone.message}
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
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    />
                    {appointmentErrors.email && (
                      <p className="text-red-500 text-sm">
                        {appointmentErrors.email.message}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="branch_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Chi nhánh
                  </label>
                  <select
                    {...registerAppointment('branch_id', {
                      required: 'Vui lòng chọn chi nhánh',
                    })}
                    id="branch_id"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    onChange={(e) => {
                      setSelectedBranch(e.target.value);
                      setSelectedDayOfWeek('');
                      setSelectedUser('');
                      setAvailableDates([]);
                    }}
                  >
                    <option value="">Chọn chi nhánh</option>
                    {branchesData?.data.map((branch) => (
                      <option key={branch._id} value={branch._id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  {appointmentErrors.branch_id && (
                    <p className="text-red-500 text-sm">
                      {appointmentErrors.branch_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="day_of_week"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ngày trong tuần
                  </label>
                  <select
                    id="day_of_week"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    onChange={(e) => {
                      setSelectedDayOfWeek(e.target.value);
                      setSelectedUser('');
                      setAvailableDates([]);
                    }}
                    value={selectedDayOfWeek}
                    disabled={!selectedBranch || !availableDaysOfWeek.length}
                  >
                    <option value="">
                      {availableDaysOfWeek.length
                        ? 'Chọn ngày'
                        : 'Không có ngày khả dụng'}
                    </option>
                    {availableDaysOfWeek.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="user_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Thợ xăm
                  </label>
                  <select
                    {...registerAppointment('user_id', {
                      required: 'Vui lòng chọn nghệ sĩ',
                    })}
                    id="user_id"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    onChange={(e) => {
                      setSelectedUser(e.target.value);
                      setAvailableDates([]);
                    }}
                    disabled={
                      !selectedBranch ||
                      !selectedDayOfWeek ||
                      isFetchingUsers ||
                      !filteredUsers.length
                    }
                  >
                    <option value="">Chọn nghệ sĩ</option>
                    {isFetchingUsers ? (
                      <option>Đang tải nghệ sĩ...</option>
                    ) : filteredUsers.length ? (
                      filteredUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.full_name}
                        </option>
                      ))
                    ) : (
                      <option>Không có nghệ sĩ khả dụng</option>
                    )}
                  </select>
                  {appointmentErrors.user_id && (
                    <p className="text-red-500 text-sm">
                      {appointmentErrors.user_id.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="timeslot_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Khung giờ
                  </label>
                  <select
                    {...registerAppointment('timeslot_id', {
                      required: 'Vui lòng chọn khung giờ',
                    })}
                    id="timeslot_id"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    disabled={
                      !selectedUser ||
                      isFetchingTimeslots ||
                      !filteredTimeslots.length
                    }
                    onChange={handleTimeslotChange}
                  >
                    <option value="">Chọn khung giờ</option>
                    {isFetchingTimeslots ? (
                      <option>Đang tải khung giờ...</option>
                    ) : filteredTimeslots.length ? (
                      filteredTimeslots.map((timeslot) => (
                        <option key={timeslot._id} value={timeslot._id}>
                          {timeslot.startTime} - {timeslot.endTime} -{' '}
                          {timeslot.max_appointment} lượt
                        </option>
                      ))
                    ) : (
                      <option>Không có khung giờ khả dụng</option>
                    )}
                  </select>
                  {appointmentErrors.timeslot_id && (
                    <p className="text-red-500 text-sm">
                      {appointmentErrors.timeslot_id.message}
                    </p>
                  )}
                </div>
                <div className="">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ngày
                  </label>
                  <select
                    {...registerAppointment('date', {
                      required: 'Vui lòng chọn ngày',
                    })}
                    id="date"
                    className="mt-1 w-[100%] px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
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
                    <p className="text-red-500 text-sm">
                      {appointmentErrors.date.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mô tả yêu cầu xăm
                </label>
                <input
                  {...registerAppointment('description', {
                    required: 'Vui lòng nhập mô tả',
                  })}
                  type="text"
                  id="description"
                  placeholder="Mô tả yêu cầu xăm"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
                {appointmentErrors.description && (
                  <p className="text-red-500 text-sm">
                    {appointmentErrors.description.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  color="error"
                  onClick={() => setShowAppointmentModal(false)}
                  className="text-white"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
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

      {showProfileModal && (
        <Modal
          open={showProfileModal}
          className="rounded-xl shadow-2xl max-w-md w-full bg-white"
        >
          <Modal.Header className="font-bold text-2xl text-gray-800 border-b pb-4 flex items-center justify-between">
            <span>Cập nhật thông tin cá nhân</span>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <IoIosCloseCircle className="w-6 h-6" />
            </button>
          </Modal.Header>
          <Modal.Body className="p-6">
            <form
              onSubmit={handleSubmitProfile(onProfileSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <Input
                  {...registerProfile('full_name', {
                    required: 'Vui lòng nhập họ và tên',
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nhập họ và tên"
                  disabled={isUpdatingProfile}
                />
                {profileErrors.full_name && (
                  <p className="text-red-500 text-sm">
                    {profileErrors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  {...registerProfile('email', {
                    required: 'Vui lòng nhập email',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Email không hợp lệ',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nhập email"
                  disabled={isUpdatingProfile}
                />
                {profileErrors.email && (
                  <p className="text-red-500 text-sm">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <Input
                  {...registerProfile('phone', {
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Số điện thoại phải là 10 chữ số',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nhập số điện thoại"
                  disabled={isUpdatingProfile}
                />
                {profileErrors.phone && (
                  <p className="text-red-500 text-sm">
                    {profileErrors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Giới tính
                </label>
                <select
                  {...registerProfile('sex', {
                    required: 'Vui lòng chọn giới tính',
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-700"
                  disabled={isUpdatingProfile}
                >
                  <option value="">Chọn giới tính</option>
                  <option value={0}>Nam</option>
                  <option value={1}>Nữ</option>
                </select>
                {profileErrors.sex && (
                  <p className="text-red-500 text-sm">
                    {profileErrors.sex.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Link ảnh đại diện
                </label>
                <Input
                  type="text"
                  {...registerProfile('image', {
                    pattern: {
                      value: /^https?:\/\/.+$/i,
                      message: 'Vui lòng nhập URL hợp lệ',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Nhập URL ảnh đại diện (https://...)"
                  disabled={isUpdatingProfile}
                />
                {profileErrors.image && (
                  <p className="text-red-500 text-sm">
                    {profileErrors.image.message}
                  </p>
                )}
                {auth?.image && (
                  <div className="mt-3 flex items-center gap-4">
                    <img
                      src={auth.image}
                      alt="Current Avatar"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                    />
                    <span className="text-sm text-gray-500">Ảnh hiện tại</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => setShowProfileModal((p) => !p)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isUpdatingProfile}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  className="px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Đang xử lý...' : 'Cập nhật'}
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      )}

      <div className="fixed bottom-5 right-5 z-50">
        <Button
          color="primary"
          className="rounded-full p-3 shadow-lg"
          onClick={() => setIsChatbotOpen(true)}
        >
          <FaComments className="text-xl" />
        </Button>
      </div>

      {isChatbotOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-80 bg-white rounded-lg shadow-xl border">
          <div className="flex justify-between items-center p-3 border-b bg-primary">
            <h3 className="font-bold text-lg text-white">
              Trò chuyện với nhân viên
            </h3>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="text-white hover:text-gray-200"
                title="Xóa toàn bộ chat"
                disabled={isLoading || chatMessages.length === 0}
              >
                <IoTrashOutline className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsChatbotOpen(false)}
                className="text-white hover:text-gray-200"
              >
                <IoIosCloseCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="p-3 border-b">
            <select
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              <option value="">Chat chung</option>
              {artists.map((artist) => (
                <option key={artist._id} value={artist._id}>
                  {artist.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="h-64 overflow-y-auto p-3">
            {chatMessages.length === 0 && !isLoading && (
              <p className="text-gray-500 text-center">Chưa có tin nhắn nào</p>
            )}
            {chatMessages.map((msg, index) => (
              <div key={index} className="mb-3 relative group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-right text-blue-600">
                      <strong>Bạn:</strong> {msg.user}
                    </p>
                    <p className="text-left text-gray-700">
                      <strong>Nhân viên:</strong> {msg.bot}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMessage(index)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition ml-2"
                    title="Xóa tin nhắn"
                    disabled={isLoading}
                  >
                    <IoTrashOutline className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                color="primary"
                onClick={handleSendMessage}
                disabled={isLoading || !chatInput.trim()}
              >
                {isLoading ? 'Chờ...' : 'Gửi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
