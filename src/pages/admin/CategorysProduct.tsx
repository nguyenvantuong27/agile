import { ChangeEvent, useState } from 'react';
import {
  FaSearch,
  FaFilter,
  FaBars,
  FaFileExport,
  FaUserPlus,
  FaTrash,
  FaEdit,
  FaExpandArrowsAlt,
} from 'react-icons/fa';

const AdminProductManagement = () => {
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    salePrice: number;
    description: string;
    image: string;
    status: string;
  }

  const [products, setProducts] = useState<Product[]>([]);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowEditPopup(true);
    setImagePreview(product.image);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    setProducts(
      products.map((p) =>
        p.name === editingProduct.name ? editingProduct : p,
      ),
    );

    setShowEditPopup(false);
  };

  const [imagePreview, setImagePreview] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmPopup(true);
  };

  const confirmDelete = () => {
    setShowConfirmPopup(false);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  const handleDeleteAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm không?')) {
      setProducts([]);
    }
  };
  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const objectUrl = URL.createObjectURL(file);

      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview(objectUrl);
    }
  }

  return (
    <div className="p-6 relative z-index position: fixed">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold mb-4">QUẢN LÝ DANH MỤC SẢN PHẨM </h1>
      {/* Thanh tìm kiếm & Bộ lọc */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-2 w-80 border rounded-lg bg-gray-200 text-gray-700"
          />
          <FaSearch className="absolute top-3 right-3 text-gray-500" />
        </div>

        <div className="flex items-center space-x-3">
          <FaFilter className="text-lg text-gray-600" />
          <span>Filter by</span>
          <select className="px-3 py-2 border rounded-lg bg-gray-300">
            <option>Model</option>
            <option>Category</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddPopup(true)}
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaUserPlus className="mr-2" /> Thêm danh mục
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center">
            <FaFileExport className="mr-2" /> Xuất file
          </button>
          <button className="bg-black text-white p-2 rounded-full">
            <FaBars />
          </button>
        </div>
      </div>
      {/* Bảng sản phẩm */}
      <div className="bg-black text-white rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="bg-black text-white h-[50px]">
              <th className="px-3 py-3">Ngày thêm ↑↓</th>
              <th className="px-3 py-3">id ↑↓</th>
              <th className="px-3 py-3">Name ↑↓</th>
              <th className="px-3 py-3">Ghi chú ↑↓</th>
              <th className="px-3 py-3">Trạng thái ↑↓</th>
              <th className="px-3 py-3">Hành động ↑↓</th>
            </tr>
          </thead>
          <tbody className="bg-white text-black">
            <tr className="border-t h-[60px]">
              <td className="px-4 py-3">8/15/17</td>
              <td className="px-4 py-3 font-bold">1</td>
              <td className="px-4 py-3">Detox Vibes</td>
              <td className="px-4 py-3">445/22/10, Nguyễn Thị Ki...</td>
              <td className="px-4 py-3 text-blue-600 font-bold">Hoạt động</td>
              <td className="px-4 py-3 flex items-center justify-center space-x-2">
                <button
                  onClick={handleDeleteClick}
                  className="bg-red-600 text-white px-3 py-1 rounded flex items-center"
                >
                  <FaTrash className="mr-1" /> Xóa
                </button>
                <button
                  onClick={() => handleEditClick(products[0])}
                  className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                >
                  <FaEdit className="mr-1" /> Sửa
                </button>

                <FaExpandArrowsAlt className="text-lg text-gray-600 cursor-pointer" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        onClick={handleDeleteAll}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-red-600 mt-10"
      >
        Xóa tất cả
      </button>
      {/* Popup thêm sản phẩm */}
      {showAddPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Thêm danh mục</h2>
            <td className="px-4 py-3">{new Date().toLocaleDateString()}</td>
            <input
              type="text"
              placeholder="Tên danh mục"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Giá"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Giá sale"
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              placeholder="Mô tả"
              className="w-full mb-2 p-2 border rounded"
            />
            <select className="w-full mb-4 p-2 border rounded">
              <option value="Còn hàng">Hoạt động</option>
              <option value="Hết hàng">Ngưng hoạt động</option>
            </select>
            <input
              type="file"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-32 object-cover mb-2"
              />
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddPopup(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Hủy
              </button>
              <button className="bg-black text-white px-4 py-2 rounded">
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditPopup && editingProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>
            <input
              type="text"
              value={editingProduct.name}
              className="w-full mb-2 p-2 border rounded"
              readOnly
            />
            <input
              type="text"
              value={editingProduct.category}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              value={editingProduct.price}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="number"
              value={editingProduct.salePrice}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="file"
              className="w-full mb-2 p-2 border rounded"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-32 object-cover mb-2"
              />
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEditPopup(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateProduct}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Popup xác nhận xóa */}
      {showConfirmPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Xác nhận xóa</h2>
            <p>Bạn có chắc chắn muốn xóa danh mục này không?</p>
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xóa thành công */}
      {showSuccessPopup && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
          Xóa thành công!
        </div>
      )}
    </div>
  );
};

export default AdminProductManagement;
