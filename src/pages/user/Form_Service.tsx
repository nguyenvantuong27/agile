import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { IoIosCloseCircle } from 'react-icons/io';
import logoImg from '../../assets/img_logo/logo.png';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const Form_Service: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white font-rotobo">
      <Header />
      <div className="container mx-auto p-4 flex flex-col md:flex-row items-start md:items-center">
        <div className="w-full md:w-1/2">
          <img
            alt="Ly sinh tố xoài tươi ngon với kem và lá bạc hà trang trí đẹp mắt"
            className="w-full h-auto"
            src="https://images.unsplash.com/photo-1505252585461-04db1eb84625?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
          />
        </div>
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:ml-8">
          <h1 className="text-3xl font-bold mb-2">Sinh tố xoài đặc biệt</h1>
          <div className="flex items-center mb-4">
            <FaStar className="text-yellow-500 text-xl" />
            <FaStar className="text-yellow-500 text-xl" />
            <FaStar className="text-yellow-500 text-xl" />
            <FaStar className="text-yellow-500 text-xl" />
            <FaStar className="text-yellow-500 text-xl" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
          <p className="mb-4">
            Sinh tố xoài đặc biệt với xoài tươi ngon được chọn lọc kỹ càng, kết
            hợp với sữa chua Hy Lạp và kem tươi, tạo nên hương vị thơm ngon khó
            cưỡng. Được trang trí với lá bạc hà tươi và hạt chia bổ dưỡng.
          </p>
          <h2 className="text-xl font-semibold mb-2">Thành phần</h2>
          <ul className="list-disc list-inside mb-4">
            <li>Xoài tươi ngon từ Đồng Tháp: Ngọt tự nhiên, giàu vitamin.</li>
            <li>Sữa chua Hy Lạp: Bổ sung protein và men vi sinh.</li>
            <li>Kem tươi organic: Tạo độ béo ngậy hoàn hảo.</li>
            <li>Lá bạc hà tươi: Mang lại cảm giác mát lạnh sảng khoái.</li>
          </ul>
          <p className="text-sm text-gray-500 mb-4">
            Đảm bảo an toàn vệ sinh thực phẩm và chất lượng nguyên liệu tươi
            ngon.
            <span className="text-red-500">
              {' '}
              Nếu cần hỗ trợ hoặc có dị ứng, vui lòng liên hệ với chúng tôi!
            </span>
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white py-2 px-4 rounded"
          >
            Đặt bàn
          </button>
        </div>
      </div>
      {/* Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <IoIosCloseCircle className="w-8 h-8" />
            </button>

            <div className="relative flex justify-center items-center">
              <div className="absolute bg-primary rounded-full w-24 h-24 transform scale-75 rotate-30"></div>

              <div className="relative z-10">
                <img
                  src={logoImg}
                  alt="Logo Prime Drink với biểu tượng đồ uống tươi mát"
                  className="h-12"
                  width="30"
                  height="75"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4">Đặt bàn</h2>

            <form className="space-y-4">
              {/* <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tên tài khoản
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Vui lòng nhập tên tài khoản"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Vui lòng nhập Email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                />
              </div> */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="branch"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Chi nhánh
                  </label>
                  <select
                    id="branch"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-red-600 text-white"
                  >
                    <option>Chi nhánh</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="bartender"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Barista phục vụ
                  </label>
                  <select
                    id="bartender"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-red-600 text-white"
                  >
                    <option>Barista phục vụ</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Ngày
                  </label>
                  <select
                    id="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-red-600 text-white"
                  >
                    <option>Ngày</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Giờ
                  </label>
                  <select
                    id="time"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm bg-red-600 text-white"
                  >
                    <option>Giờ</option>
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nội dung
                </label>
                <textarea
                  id="content"
                  placeholder="Ghi chú đặc biệt (ví dụ: ít đường, không đá, dị ứng...)"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                ></textarea>
              </div>
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-black text-white py-2 px-4 rounded w-full"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drink Gallery Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">Đồ uống cùng loại</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <img
              alt="Cocktail Mojito tươi mát với lá bạc hà"
              className="w-full h-48 object-cover"
              src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Mojito Classic</h3>
              <div className="flex items-center mb-4">
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
              </div>
              <button className="bg-black text-white py-2 px-4 rounded">
                xem thêm
              </button>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <img
              alt="Trà sữa trân châu đường đen thơm ngon"
              className="w-full h-48 object-cover"
              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Trà sữa trân châu</h3>
              <div className="flex items-center mb-4">
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
              </div>
              <button className="bg-black text-white py-2 px-4 rounded">
                xem thêm
              </button>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <img
              alt="Whiskey Sour cocktail cổ điển"
              className="w-full h-48 object-cover"
              src="https://images.unsplash.com/photo-1546171753-97d7676e4602?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Whiskey Sour</h3>
              <div className="flex items-center mb-4">
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
              </div>
              <button className="bg-black text-white py-2 px-4 rounded">
                xem thêm
              </button>
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <img
              alt="Cà phê latte nghệ thuật foam"
              className="w-full h-48 object-cover"
              src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Latte Art Special</h3>
              <div className="flex items-center mb-4">
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
                <FaStar className="text-yellow-500 text-xl" />
              </div>
              <button className="bg-black text-white py-2 px-4 rounded">
                xem thêm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Bình luận (2)</h2>
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg mb-4"
          placeholder="Viết bình luận..."
        ></textarea>
        <div className="flex items-center mb-4">
          <span className="mr-2">5</span>
          <FaStar className="text-yellow-500 mr-2" />
          <span className="mr-2">4</span>
          <FaStar className="text-yellow-500 mr-2" />
          <span className="mr-2">3</span>
          <FaStar className="text-yellow-500 mr-2" />
          <span className="mr-2">2</span>
          <FaStar className="text-yellow-500 mr-2" />
          <span className="mr-2">1</span>
          <FaStar className="text-yellow-500" />
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg">
          Đăng bình luận
        </button>
        <div className="mt-6">
          <div className="flex items-start mb-6">
            <img
              alt="User avatar"
              className="w-12 h-12 rounded-full mr-4"
              src="https://storage.googleapis.com/a1aa/image/yZZZykthVogk_67V_JvailrcP6FasASYIGeeWpfT1D4.jpg"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Minh</h3>
                <span className="text-gray-500 text-sm">01/11/2025</span>
              </div>
              <div className="flex items-center mb-2">
                <FaStar className="text-yellow-500 mr-1" />
                <FaStar className="text-yellow-500 mr-1" />
                <FaStar className="text-yellow-500 mr-1" />
                <FaStar className="text-yellow-500 mr-1" />
                <FaStar className="text-yellow-500" />
              </div>
              <p className="text-gray-700 mb-2">
                Tôi đã có một trải nghiệm thưởng thức đồ uống rất tuyệt vời tại
                Prime Drink. Không chỉ ấn tượng bởi hương vị đậm đà và cách pha
                chế khéo léo của các barista, tôi còn hoàn toàn yên tâm với quy
                trình đảm bảo vệ sinh an toàn thực phẩm.
              </p>
              <a className="text-blue-500 text-sm" href="#">
                Phản hồi
              </a>
            </div>
          </div>
          <hr className="mb-6" />
          <div className="flex items-start">
            <img
              alt="User avatar"
              className="w-12 h-12 rounded-full mr-4"
              src="https://storage.googleapis.com/a1aa/image/yZZZykthVogk_67V_JvailrcP6FasASYIGeeWpfT1D4.jpg"
            />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Thu</h3>
                <span className="text-gray-500 text-sm">01/11/2025</span>
              </div>
              <div className="flex items-center mb-2">
                <FaStar className="text-yellow-500 mr-1" />
                <FaStar className="text-yellow-500 mr-1" />
                <FaStar className="text-yellow-500 mr-1" />
                <FaStar className="text-yellow-500 mr-1" />
                <FaStar className="text-yellow-500" />
              </div>
              <p className="text-gray-700 mb-2">
                Cảm ơn bạn đã chia sẻ, mình cũng rất hài lòng với chất lượng đồ
                uống và dịch vụ tại đây. Sinh tố xoài đặc biệt thực sự rất ngon!
              </p>
              <a className="text-blue-500 text-sm" href="#">
                Phản hồi
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Form_Service;
