import { nanoid } from '@reduxjs/toolkit';
import { ChangeEvent, useEffect, useState } from 'react';
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
import { Category, ListProduct, Product } from '../../interfaces';

const AdminProductManagement = () => {
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [listProduct, setListProduct] = useState<ListProduct | null>();
  const [categories, setCategories] = useState<Array<Category>>([]);
  const [category, setCategory] = useState<Category | null>();
  const [addingProduct, setAddingProduct] = useState<Product>({
    name: '',
    price: '',
    price_sale: '',
    description: '',
    image: '',
    status: 'in_stock',
  });
  const [productDeleteId, setProductDeleteId] = useState('0');
  // const [productEditId, setProductEditId] = useState("0");
  // const userId = "";
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3Yjg5ZDFmOTY5MjQwNjUzNzY2NzFhMCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDE5MDExOSwiZXhwIjoxNzQwMTkzNzE5fQ.N86fo3XnxWYhS2f4nfdDSfuvNJJK7M5wCh1povtGbKw';

  const [editingProduct, setEditingProduct] = useState<Product>({
    _id: '',
    createdAt: '',
    name: '',
    price: '',
    price_sale: '',
    description: '',
    image: '',
    status: '',
  });

  const [products, setProducts] = useState<Product[]>([
    {
      _id: '',
      createdAt: '',
      name: '',
      price: '',
      price_sale: '',
      description: '',
      image: '',
      status: '',
    },
  ]);

  const [listProducts, setListProducts] = useState<Array<ListProduct>>([]);

  const [imagePreview, setImagePreview] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    console.log('fetch');

    const api = 'https://api-tatto-management.vercel.app/api/v1';

    // get products
    fetch(`${api}/products`, {
      headers: {
        Authorization: 'bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log('data: ', data.data);
        setProducts(data.data);
      })
      .catch((err) => console.log('err: ', err));

    // get list-product
    fetch(`${api}/list-product`, {
      headers: {
        Authorization: 'bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log('list-product: ', data.data);
        setListProducts(data.data);
        setListProduct(data.data[0]);
      })
      .catch((err) => console.log('err: ', err));

    // get list-product
    fetch(`${api}/categories`, {
      headers: {
        Authorization: 'bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.data);
        setCategory({
          ...data.data[0],
        });
      })
      .catch((err) => console.log('err: ', err));
  }, []);

  // add new product
  const addNewProduct = () => {
    const api = 'https://api-tatto-management.vercel.app/api/v1/products';
    const dataPayload: Product = {
      ...addingProduct,
      category_id: category!,
      list_product_id: listProduct!,
    };
    fetch(api, {
      method: 'POST',
      headers: {
        Authorization: 'bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataPayload),
    })
      .then((res) => res.json())
      .then((data) => {
        const product = data.data;
        setProducts([product, ...products]);
        setShowAddPopup(false);
      })
      .catch((err) => {
        console.log('err: ', err);
        setShowAddPopup(false);
      });
  };

  const handleEditClick = (product: Product) => {
    console.log('product: ===> ', product);
    setEditingProduct(product);
    setShowEditPopup(true);
    setImagePreview(product.image);
  };

  const handleUpdateProduct = () => {
    const api =
      'https://api-tatto-management.vercel.app/api/v1/products/' +
      editingProduct._id;
    console.log('editingProduct: ', editingProduct);
    fetch(api, {
      method: 'PATCH',
      headers: {
        Authorization: 'bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editingProduct),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('data: ', data);

        setProducts(
          products.map((p) =>
            p._id === editingProduct?._id ? editingProduct : p,
          ),
        );
        setShowEditPopup(false);
      })
      .catch((err) => {
        console.log('err: ', err);
        setShowEditPopup(false);
      });
  };

  const handleDeleteClick = (id: string) => {
    console.log('productDeleteId: ', productDeleteId);
    setProductDeleteId(id);
    setShowConfirmPopup(true);
  };

  const handleDelete = () => {
    const api =
      'https://api-tatto-management.vercel.app/api/v1/products/' +
      productDeleteId;
    fetch(api, {
      method: 'DELETE',
      headers: {
        Authorization: 'bearer ' + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('data: ', data);
        const afterDeletedproducts = products.filter(
          (p) => p._id != productDeleteId,
        );
        setProducts(afterDeletedproducts);
      })
      .catch((err) => {
        console.log('err:', err);
      });
  };

  const confirmDelete = () => {
    setShowConfirmPopup(false);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  const handleDeleteAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm không?')) {
      setProducts([]); // Xóa hết sản phẩm
    }
  };

  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImagePreview(URL.createObjectURL(file));
    }
  }

  // Change list-product when adding new product
  const addHandleChangeListProduct = (e: ChangeEvent<HTMLSelectElement>) => {
    const lp = listProducts.find((lp) => lp._id == e.target.value);
    if (lp) {
      setListProduct(lp);
    }
  };

  // Change list-product when adding new product
  const addHandleChangeCategories = (e: ChangeEvent<HTMLSelectElement>) => {
    const ct = categories.find((lp) => lp._id == e.target.value);
    // console.log('category: ', ct);
    if (ct) {
      setCategory(ct);
    }
  };

  return (
    <div className="p-6 relative">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold mb-4">QUẢN LÝ SẢN PHẨM</h1>
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
            <FaUserPlus className="mr-2" /> Thêm sản phẩm
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
              <th className="px-3 py-3">Name ↑↓</th>
              <th className="px-3 py-3">Danh mục ↑↓</th>
              <th className="px-3 py-3">Giá ↑↓</th>
              <th className="px-3 py-3">Sale ↑↓</th>
              <th className="px-3 py-3">Mô tả ↑↓</th>
              <th className="px-3 py-3">Hình ảnh ↑↓</th>
              <th className="px-3 py-3">Trạng thái ↑↓</th>
              <th className="px-3 py-3">Hành động ↑↓</th>
            </tr>
          </thead>
          <tbody className="bg-white text-black">
            {products.length >= 1 &&
              products.map((product) => (
                <tr className="border-t h-[60px]" key={nanoid()}>
                  <td className="px-4 py-3">
                    {product?.createdAt ?? new Date().toISOString()}
                  </td>
                  <td className="px-4 py-3 font-bold">{product.name ?? ''}</td>
                  <td className="px-4 py-3">
                    {product?.list_product_id?.name ?? ''}
                  </td>
                  <td className="px-4 py-3">{product.price}</td>
                  <td className="px-4 py-3">{product.price_sale}</td>
                  <td className="px-4 py-3">
                    {product.description.slice(0, 10) + '...'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src="../public/images/admin/logo.jpg"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-blue-600 font-bold">
                    {product.status}
                  </td>
                  <td className="px-4 py-3 flex items-center justify-center space-x-2 mt-2">
                    <button
                      onClick={() => handleDeleteClick(product._id!)}
                      className="bg-red-600 text-white px-3 py-1 rounded flex items-center"
                    >
                      <FaTrash className="mr-1" /> Xóa
                    </button>
                    <button
                      onClick={() => handleEditClick(product)}
                      className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
                    >
                      <FaEdit className="mr-1" /> Sửa
                    </button>
                    <FaExpandArrowsAlt className="text-lg text-gray-600 cursor-pointer" />
                  </td>
                </tr>
              ))}
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
            <h2 className="text-xl font-bold mb-4">Thêm sản phẩm</h2>
            {/* <td className="px-4 py-3">{new Date().toLocaleDateString()}</td> */}
            <label>Name</label>
            <input
              type="text"
              placeholder="Tên sản phẩm"
              className="w-full mb-2 p-2 border rounded"
              defaultValue={addingProduct?.name ?? ''}
              onChange={(e) =>
                setAddingProduct({
                  ...addingProduct,
                  name: e.target.value,
                })
              }
            />

            <label>List Product</label>
            <select
              className="w-full mb-2 p-2 border rounded"
              onChange={(e) => addHandleChangeListProduct(e)}
              value={listProduct?._id}
            >
              {listProducts.map((lp) => (
                <option value={lp._id} key={nanoid()}>
                  {lp.name}
                </option>
              ))}
            </select>

            <label>Categories</label>
            <select
              className="w-full mb-2 p-2 border rounded"
              onChange={(e) => addHandleChangeCategories(e)}
              value={category?._id}
            >
              {categories &&
                categories.length > 1 &&
                categories.map((category) => (
                  <option value={category._id} key={nanoid()}>
                    {category.name}
                  </option>
                ))}
            </select>

            <label>Price</label>
            <input
              type="number"
              placeholder="Giá"
              className="w-full mb-2 p-2 border rounded"
              defaultValue={addingProduct?.price ?? ''}
              onChange={(e) =>
                setAddingProduct({
                  ...addingProduct,
                  price: e.target.value,
                })
              }
            />
            <label>Price Sales</label>
            <input
              type="number"
              placeholder="Giá sale"
              className="w-full mb-2 p-2 border rounded"
              defaultValue={addingProduct?.price_sale ?? ''}
              onChange={(e) =>
                setAddingProduct({
                  ...addingProduct,
                  price_sale: e.target.value,
                })
              }
            />
            <label>Description</label>
            <textarea
              placeholder="Mô tả"
              className="w-full mb-2 p-2 border rounded"
              defaultValue={addingProduct?.description ?? ''}
              onChange={(e) =>
                setAddingProduct({
                  ...addingProduct,
                  description: e.target.value,
                })
              }
            />
            <label>Status</label>
            <select
              className="w-full mb-4 p-2 border rounded"
              onChange={(e) =>
                setAddingProduct({
                  ...addingProduct,
                  status: e.target.value,
                })
              }
            >
              <option value="in_stock">Còn hàng</option>
              <option value="out_stock">Hết hàng</option>
            </select>

            <label>Image</label>
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
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={addNewProduct}
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup sửa sản phẩm */}
      {showEditPopup && editingProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa sản phẩm</h2>
            <label>Name</label>
            <input
              type="text"
              value={editingProduct.name ?? ''}
              className="w-full mb-2 p-2 border rounded"
              // readOnly
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  name: e.target.value,
                })
              }
            />

            <label>categories</label>
            {/* <input 
              type="text" 
              value={editingProduct.category} 
              className="w-full mb-2 p-2 border rounded" 
              onChange={
                (e) => setEditingProduct({ ...editingProduct, category: e.target.value })
              } 
            /> */}
            <select className="w-full mb-2 p-2 border rounded">
              <option value="">Chọn danh mục</option>
              <option value="Danh mục A">Danh mục A</option>
              <option value="Danh mục B">Danh mục B</option>
            </select>

            <label>Price</label>
            <input
              type="number"
              value={editingProduct.price}
              className="w-full mb-2 p-2 border rounded"
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, price: e.target.value })
              }
            />
            <label htmlFor="">Price sale</label>
            <input
              type="number"
              value={editingProduct.price_sale}
              className="w-full mb-2 p-2 border rounded"
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  price_sale: e.target.value,
                })
              }
            />
            <label>Description</label>
            <textarea
              placeholder="Mô tả"
              className="w-full mb-2 p-2 border rounded"
              defaultValue={editingProduct?.description ?? ''}
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  description: e.target.value,
                })
              }
            />
            <label>Status</label>
            <select
              className="w-full mb-4 p-2 border rounded"
              onChange={(e) =>
                setAddingProduct({
                  ...editingProduct,
                  status: e.target.value,
                })
              }
            >
              <option value="in_stock">Còn hàng</option>
              <option value="out_stock">Hết hàng</option>
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
            <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => {
                  setShowConfirmPopup(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  confirmDelete();
                  handleDelete();
                }}
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
