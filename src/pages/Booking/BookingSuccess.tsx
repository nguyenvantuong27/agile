// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   FaCalendarAlt,
//   FaUser,
//   FaDatabase,
//   FaSignOutAlt,
//   FaChevronDown,
//   FaChevronUp,
//   FaCheckCircle,
// } from 'react-icons/fa';
// import { RiBarChartBoxFill } from 'react-icons/ri';

// const BookingSuccess: React.FC = () => {
//   const [isOpen, setIsOpen] = useState(true);
//   const navigate = useNavigate();

//   const handleGoBack = () => {
//     navigate('/admin/bookingpage');
//   };

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside className="w-1/5 bg-black text-white p-4">
//         <div className="text-center mb-6">
//           <img src="/logo.png" alt="Logo" className="mx-auto w-24" />
//         </div>

//         {/* Toggle Menu */}
//         <div
//           className="flex justify-between items-center cursor-pointer py-3 px-4 border-b border-gray-600"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           <span className="text-lg font-semibold flex items-center gap-2">
//             <RiBarChartBoxFill />
//             Tổng quan
//           </span>
//           {isOpen ? <FaChevronUp /> : <FaChevronDown />}
//         </div>

//         {/* Menu Items */}
//         {isOpen && (
//           <nav>
//             <ul className="space-y-1 mt-2">
//               <li className="py-3 px-6 flex items-center gap-3 border-b border-gray-600 cursor-pointer hover:bg-black">
//                 <FaCalendarAlt />
//                 <Link to="/admin/bookingpage">Đặt lịch cho khách hàng</Link>
//               </li>
//               <li className="py-3 px-6 flex items-center gap-3 border-b border-gray-600 cursor-pointer hover:bg-black">
//                 <FaUser />
//                 <Link to="/admin/employeeprofile">Thông tin cá nhân</Link>
//               </li>
//               <li className="py-3 px-6 flex items-center gap-3 border-b border-gray-600 cursor-pointer hover:bg-black">
//                 <FaDatabase />
//                 <Link to="/admin/customerlookup">Tra cứu khách hàng</Link>
//               </li>
//               <li className="py-3 px-6 flex items-center gap-3 cursor-pointer hover:bg-red-600">
//                 <FaSignOutAlt />
//                 <Link to="/logout">Đăng xuất</Link>
//               </li>
//             </ul>
//           </nav>
//         )}
//       </aside>

//       {/* Main Content */}
//       <main className="w-4/5 p-40 bg-white rounded-lg shadow-lg flex flex-col items-center">
//         <div className="flex flex-col items-center">
//           <FaCheckCircle size={50} className="text-green-500 mb-4" />
//           <h1 className="text-2xl font-bold mb-4">Đặt lịch thành công</h1>
//           <p className="text-gray-600 text-center mb-6">
//             Chân thành cảm ơn quý khách đã ủng hộ dịch vụ. <br />
//             Quý khách có thể theo dõi đơn hàng bằng cách đăng nhập và theo dõi
//             trên website của chúng tôi.
//           </p>
//         </div>
//         <div className="mt-10 w-full flex justify-end">
//           <Link
//             to="/BookingPage"
//             className="bg-blue-500 text-white font-bold px-6 py-2 rounded hover:bg-blue-600"
//           >
//             Quay về
//           </Link>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default BookingSuccess;
