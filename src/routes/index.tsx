import { Route, Routes } from 'react-router-dom';
import { lazy } from 'react';
import DefaultLayout from '../layouts/DefaultLayout';

// Lazy loading pages

// Admin
import { NotLoggedMiddleware } from './private/middleware/MiddlewareRoute';
import PrivateRoute from './private/PrivateRoute/PrivateRoute';
import { ROLE } from '~/constants';
import UserLayout from '~/layouts/pages/user/UserLayout';

//employee
const EmployeeLayout = lazy(
  () => import('../layouts/pages/employee/EmployeeLayout'),
);
const EmployeeAppointments = lazy(
  () => import('../pages/employee/Appoinments'),
);
const EmployeeProfile = lazy(() => import('../pages/employee/Profile'));
//landing page
// const LandingPage = lazy(() => import('../pages/LandingPage'));

//home
const HomePage = lazy(() => import('../pages/home/HomePage'));

//auth
const Auth = lazy(() => import('../pages/auth/Auth'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('../pages/auth/SignUpPage'));
const SignUpCustomerPage = lazy(
  () => import('../pages/auth/SignUpCustomerPage'),
);
const RequestPasswordReset = lazy(
  () => import('~/pages/auth/RequestPasswordReset'),
);
const ResetPasswordPage = lazy(() => import('~/pages/auth/ResetPasswordPage'));

//admin
const AdminLayout = lazy(() => import('../layouts/pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('../pages/admin/Dashboard'));
const WebsiteConfig = lazy(() => import('../pages/admin/WebsiteConfig'));
const AdminProduct = lazy(() => import('../pages/admin/ProductTattoo'));
const AdminCategorysTatto = lazy(() => import('../pages/admin/CategoryTattoo'));
const AdminCategorysTattoProduct = lazy(
  () => import('../pages/admin/CategorysProduct'),
);
const Profile = lazy(() => import('../pages/admin/Profile'));
const ApproveUser = lazy(() => import('../pages/admin/ApproveUser'));
const AllUser = lazy(() => import('../pages/admin/AllUser'));
const BranchesManagement = lazy(
  () => import('../pages/admin/BranchesManagement'),
);
const ListProductManagement = lazy(
  () => import('../pages/admin/ListProductManagement'),
);
const ProductManagement = lazy(
  () => import('../pages/admin/ProductManagement'),
);
const ReviewManagement = lazy(() => import('../pages/admin/ReviewManagement'));
const TimeSlotsManagement = lazy(
  () => import('../pages/admin/TimeSlotsManagement'),
);
// const TattooManagement = lazy(() => import('../pages/admin/BookManagement'));
const DescriptionManagement = lazy(
  () => import('../pages/admin/DescriptionManagement'),
);

const AppointmentManagement = lazy(
  () => import('../pages/admin/AppointmentManagement'),
);
const PaymentAppointment = lazy(
  () => import('../pages/admin/PaymentAppointment'),
);
const OrderManagementAdmin = lazy(
  () => import('../pages/admin/OrderManagementAdmin'),
);
const CustomerManagement = lazy(
  () => import('../pages/admin/CustomerManagement'),
);
const BlogManagement = lazy(() => import('../pages/admin/BlogManagement'));
const BlogDetailManagement = lazy(
  () => import('../pages/admin/BlogDetailManagement'),
);

const AdminAppointmentCategoryManagement = lazy(
  () => import('../pages/admin/AdminAppointmentCategoryManagement'),
);

//user

const About_Us = lazy(() => import('../pages/user/About_Us'));
const Service = lazy(() => import('../pages/user/Service'));
const News = lazy(() => import('../pages/user/News'));
const NewsDetail = lazy(() => import('../pages/user/NewsDetail'));
const Service_detail = lazy(() => import('../pages/user/Service_detail'));
const Shop = lazy(() => import('../pages/user/Shop'));
const Product_detail = lazy(() => import('../pages/user/Product_detail'));
const Login = lazy(() => import('../pages/user/Login'));
const Signup = lazy(() => import('../pages/user/Signup'));
const Forget = lazy(() => import('../pages/user/Forget'));
const Form_Service = lazy(() => import('../pages/user/Form_Service'));
const Cart = lazy(() => import('../pages/user/Cart'));
const Check_Cart = lazy(() => import('../pages/user/Check_Cart'));
const Cart_Successful = lazy(() => import('../pages/user/Cart_Successful'));
const Cart_Error = lazy(() => import('../pages/user/Cart_Error'));
const Contact = lazy(() => import('../pages/user/Contact'));
const AppointmentList = lazy(() => import('../pages/user/AppointmentList'));
const OrderManagement = lazy(() => import('../pages/user/OrderManagement'));
const Account = lazy(() => import('../pages/user/profile/Account'));
const Edit_Account = lazy(() => import('../pages/user/profile/Edit_Account'));
const ChangePassword = lazy(
  () => import('../pages/user/profile/ChangePassword'),
);
const Video = lazy(() => import('../pages/user/Video'));

const Artists = lazy(() => import('../pages/user/Artists'));

const VnpayReturn = lazy(() => import('../pages/user/VnpayReturn'));
const PaymentFailure = lazy(() => import('../pages/user/PaymentFailure'));
const PaymentSuccess = lazy(() => import('../pages/user/PaymentSuccess'));
const FavoritesManagement = lazy(
  () => import('../pages/user/FavoritesManagement'),
);
const UserDetail = lazy(() => import('../pages/user/UserDetail'));
const VoucherManagement = lazy(
  () => import('../pages/admin/VoucherManagement'),
);
const ContactManagement = lazy(
  () => import('../pages/admin/ContactManagement'),
);
const FriendsList = lazy(() => import('../pages/user/FriendsList'));
const SpinWheel = lazy(() => import('../pages/user/SpinWheel'));
const CreateImage = lazy(() => import('../pages/user/CreateImage'));

// import routes of "artist"
const ArtistLayout = lazy(() => import('../layouts/pages/Booker/layout'));
// const ArtistDashboard = lazy(() => import('../pages/artists/dashboard'));
const ArtistSetting = lazy(() => import('../pages/Emplooyee-ad/settings'));
const ArtistSchedule = lazy(() => import('../pages/Emplooyee-ad/schedule'));
const ArtisAddSchedule = lazy(
  () => import('../pages/Emplooyee-ad/add-schedule'),
);
const ArtistHistory = lazy(() => import('../pages/Emplooyee-ad/history'));
const ArtistProfile = lazy(() => import('../pages/Emplooyee-ad/profile'));
const ScanImage = lazy(() => import('../pages/user/ScanImage'));

//artist
// const BookingPage = lazy(() => import('../pages/artist/BookingPage'));
// const Customerlookup = lazy(() => import('../pages/artist/Customerlookup'));

//404
const NotFound = lazy(() => import('~/pages/404/NotFound'));

export default function AppRoutes() {
  return (
    <Routes>
      {/* landing page */}
      <Route element={<DefaultLayout />}>
        <Route index path="/" element={<HomePage />} />
      </Route>

      {/* user */}
      <Route element={<DefaultLayout />}>
        <Route path="/About_Us" element={<About_Us />} />
        <Route path="/Service" element={<Service />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Service_detail/:id" element={<Service_detail />} />
        <Route path="/Shop" element={<Shop />} />
        <Route path="/Product_detail/:id" element={<Product_detail />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Forget" element={<Forget />} />
        <Route path="/about-us" element={<About_Us />} />
        <Route path="/service" element={<Service />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/service/:id" element={<Service_detail />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/Product_detail/:id" element={<Product_detail />} />
        <Route path="/form-service" element={<Form_Service />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/check-cart" element={<Check_Cart />} />
        <Route path="/cart-successful" element={<Cart_Successful />} />
        <Route path="/cart-error" element={<Cart_Error />} />
        <Route path="/account" element={<Account />} />
        <Route path="/edit_account" element={<Edit_Account />} />
        <Route path="/reset_password" element={<ChangePassword />} />
        <Route path="/artists" element={<Artists />} />

        <Route path="/vnpay_return" element={<VnpayReturn />} />
        <Route path="/failture" element={<PaymentFailure />} />
        <Route path="/success" element={<PaymentSuccess />} />
        <Route path="/favorites-management" element={<FavoritesManagement />} />
        <Route path="/user-detail/:userId" element={<UserDetail />} />
        <Route path="/friends-list" element={<FriendsList />} />
        <Route path="/spin-wheel" element={<SpinWheel />} />
        <Route path="create-image" element={<CreateImage />} />
        <Route path="/video" element={<Video />} />
        <Route path="/scan-image" element={<ScanImage />} />
      </Route>

      {/* home */}
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      {/* Auth  */}
      <Route element={<DefaultLayout />}>
        <Route element={<NotLoggedMiddleware />}>
          <Route element={<DefaultLayout />}>
            <Route path="/auth" element={<Auth />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<SignUpPage />} />
              <Route
                path="register/customer"
                element={<SignUpCustomerPage />}
              />
              <Route
                path="request-password-reset"
                element={<RequestPasswordReset />}
              />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      {/* admin */}
      <Route element={<DefaultLayout />}>
        <Route
          path="/admin"
          element={<PrivateRoute allowedRoles={[ROLE.ADMIN]} />}
        >
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="Website-Config" element={<WebsiteConfig />} />
            <Route path="product-tattoos" element={<AdminProduct />} />
            <Route
              path="categorys-products"
              element={<AdminCategorysTatto />}
            />
            <Route
              path="categorysProduct"
              element={<AdminCategorysTattoProduct />}
            />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="approve-user" element={<ApproveUser />} />
            <Route path="all-user" element={<AllUser />} />
            <Route path="branches" element={<BranchesManagement />} />

            <Route path="list-product" element={<ListProductManagement />} />
            <Route path="product-management" element={<ProductManagement />} />
            <Route path="review-management" element={<ReviewManagement />} />
            <Route path="timeslots" element={<TimeSlotsManagement />} />
            {/* <Route path="tattoos" element={<TattooManagement />} /> */}
            <Route path="description" element={<DescriptionManagement />} />
            <Route path="appointment" element={<AppointmentManagement />} />
            <Route
              path="payment-appointment"
              element={<PaymentAppointment />}
            />
            <Route path="order-management" element={<OrderManagementAdmin />} />
            <Route
              path="customer-management"
              element={<CustomerManagement />}
            />
            <Route path="blog-management" element={<BlogManagement />} />
            <Route
              path="blog-management/:id"
              element={<BlogDetailManagement />}
            />
            <Route path="voucher-management" element={<VoucherManagement />} />
            <Route path="contact-management" element={<ContactManagement />} />
            <Route
              path="category-tattoo"
              element={<AdminAppointmentCategoryManagement />}
            />
          </Route>
        </Route>
      </Route>

      {/* Artist */}
      <Route element={<DefaultLayout />}>
        <Route
          path="/artist"
          element={<PrivateRoute allowedRoles={[ROLE.ARTIST]} />}
        >
          <Route element={<ArtistLayout />}>
            <Route path="schedules" element={<ArtistSchedule />} />
            <Route path="add-schedule" element={<ArtisAddSchedule />} />
            <Route path="setting" element={<ArtistSetting />} />
            <Route path="history" element={<ArtistHistory />} />
            <Route path="profile/:id" element={<ArtistProfile />} />
          </Route>
        </Route>
      </Route>

      {/* employee */}
      <Route element={<DefaultLayout />}>
        <Route
          path="/employee"
          element={<PrivateRoute allowedRoles={[ROLE.EMPLOYEE]} />}
        >
          <Route element={<EmployeeLayout />}>
            <Route index element={<EmployeeAppointments />} />
            <Route path="appointments" element={<EmployeeAppointments />} />
            <Route path="profile" element={<EmployeeProfile />} />
          </Route>
        </Route>
      </Route>

      {/* user */}
      <Route element={<UserLayout />}>
        <Route path="/appointment-list" element={<AppointmentList />} />
        <Route path="/order-management" element={<OrderManagement />} />
      </Route>

      {/* 404 not found */}
      <Route element={<DefaultLayout />}>
        <Route errorElement={<NotFound />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/404" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
