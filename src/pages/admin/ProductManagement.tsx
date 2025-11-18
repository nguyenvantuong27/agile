import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '~/services/product/product.services';
import { useGetCategoriesMenuQuery } from '~/services/categories_menu/categories_menu.services';
import { useGetListProductsQuery } from '~/services/list_product/list_product.services';
import { Button } from 'react-daisyui';
import { IProduct } from '~/domain/types/product/product.model';
import { Toastify } from '~/helpers/Toastify';
import { IListProduct } from '~/domain/types/list_product/list_product.model';
import { stockProduct } from '~/interfaces/enum/product.enum';

const ProductManagement: React.FC = () => {
  const { data: productsData, isLoading, refetch } = useGetProductsQuery();
  const { data: listProductsData } = useGetListProductsQuery();
  const { data: categoriesData } = useGetCategoriesMenuQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedListProducts, setSelectedListProducts] = useState<string[]>(
    [],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IProduct>({
    defaultValues: {
      status: stockProduct.IN_STOCK,
    },
  });

  const handleEditProduct = (product: IProduct) => {
    setSelectedProduct(product);
    setValue('name', product.name);
    setValue('price', product.price);
    setValue('price_sale', product.price_sale);
    setValue('description', product.description);
    setValue('image', product.image);
    setValue(
      'category_id',
      typeof product.category_id === 'object'
        ? product.category_id._id || ''
        : '',
    );
    setValue('status', product.status);
    setSelectedListProducts(
      product.list_product_id?.map((item) =>
        typeof item === 'object' ? item._id : item,
      ) || [],
    );
    setShowModal(true);
  };

  const handleCheckboxChange = (productId: string) => {
    setSelectedListProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId],
    );
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      Toastify('Xóa sản phẩm thành công', 201);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const onSubmit = async (data: IProduct) => {
    if (data.price_sale && data.price_sale >= data.price) {
      Toastify('Giá khuyến mãi phải nhỏ hơn giá gốc', 400);
      return;
    }
    const finalData = { ...data, list_product_id: selectedListProducts };
    try {
      if (selectedProduct) {
        await updateProduct({
          id: selectedProduct._id!,
          data: finalData,
        }).unwrap();
        Toastify('Cập nhật sản phẩm thành công', 201);
      } else {
        await createProduct(finalData).unwrap();
        Toastify('Thêm sản phẩm thành công', 201);
      }
      reset();
      setSelectedListProducts([]);
      setShowModal(false);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
        <Button
          color="primary"
          onClick={() => {
            setSelectedProduct(null);
            setSelectedListProducts([]);
            reset();
            setShowModal(true);
          }}
          className="flex items-center space-x-2"
        >
          <FaPlus /> <span>Thêm sản phẩm</span>
        </Button>
      </div>

      {/* Danh sách sản phẩm dạng card */}
      {isLoading ? (
        <div className="text-center text-gray-500">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsData?.data?.map((product: IProduct) => (
            <div
              key={product._id}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Giá:</span>{' '}
                  {product.price.toLocaleString('vi-VN')} VNĐ
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Giá khuyến mãi:</span>{' '}
                  {product.price_sale
                    ? `${product.price_sale.toLocaleString('vi-VN')} VNĐ`
                    : 'Không có'}
                </p>
                <p
                  className={`text-sm badge mt-2 text-white ${
                    product.status === stockProduct.IN_STOCK
                      ? 'badge-success'
                      : 'badge-error'
                  }`}
                >
                  {product.status === stockProduct.IN_STOCK
                    ? 'Còn hàng'
                    : 'Hết hàng'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Mô tả:</span>{' '}
                  {product.description && product.description.length > 50
                    ? `${product.description.substring(0, 50)}...`
                    : product.description || 'Không có mô tả'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Danh mục:</span>{' '}
                  {typeof product.category_id === 'object'
                    ? product.category_id.name
                    : 'Không xác định'}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Sản phẩm liên quan:</span>{' '}
                  {product.list_product_id?.length > 0
                    ? product.list_product_id
                        .map((item) =>
                          typeof item === 'object' ? item.name : item,
                        )
                        .join(', ')
                    : 'Không có'}
                </p>
              </div>
              <div className="p-4 flex space-x-2 border-t border-gray-200">
                <Button
                  color="success"
                  className="flex-1 flex items-center justify-center text-white"
                  onClick={() => handleEditProduct(product)}
                >
                  <FaEdit className="mr-1" /> Sửa
                </Button>
                <Button
                  color="error"
                  className="flex-1 flex items-center justify-center text-white hidden"
                  onClick={() => handleDeleteProduct(product._id!)}
                >
                  <FaTrash className="mr-1" /> Xóa
                </Button>
              </div>
            </div>
          ))}
          {!productsData?.data?.length && (
            <div className="col-span-full text-center text-gray-500">
              Không có sản phẩm
            </div>
          )}
        </div>
      )}

      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="text-lg font-bold">
              {selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="label">Tên sản phẩm</label>
                <input
                  {...register('name', {
                    required: 'Tên sản phẩm là bắt buộc',
                  })}
                  type="text"
                  placeholder="Nhập tên sản phẩm"
                  className="input input-bordered w-full"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm ">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="label">Giá</label>
                <input
                  {...register('price', {
                    required: 'Giá là bắt buộc',
                    min: { value: 0, message: 'Giá phải lớn hơn 0' },
                  })}
                  type="number"
                  placeholder="Nhập giá sản phẩm"
                  className="input input-bordered w-full"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm">{errors.price.message}</p>
                )}
              </div>
              <div>
                <label className="label">Giá khuyến mãi</label>
                <input
                  {...register('price_sale')}
                  type="number"
                  placeholder="Nhập giá khuyến mãi (nếu có)"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">Mô tả</label>
                <textarea
                  {...register('description', {
                    required: 'Mô tả là bắt buộc',
                  })}
                  placeholder="Nhập mô tả sản phẩm"
                  className="textarea textarea-bordered w-full"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">URL hình ảnh</label>
                <input
                  {...register('image')}
                  type="text"
                  placeholder="Nhập URL hình ảnh"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">Danh mục</label>
                <select
                  {...register('category_id', {
                    required: 'Danh mục là bắt buộc',
                  })}
                  className="select select-bordered w-full"
                >
                  <option value="">Chọn danh mục</option>
                  {categoriesData?.data?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-red-500 text-sm">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Trạng thái</label>
                <select
                  {...register('status', {
                    required: 'Trạng thái là bắt buộc',
                  })}
                  className="select select-bordered w-full"
                >
                  <option value={stockProduct.IN_STOCK}>Còn hàng</option>
                  <option value={stockProduct.OUT_OF_STOCK}>Hết hàng</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm">
                    {errors.status.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label font-bold">Sản phẩm liên quan</label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
                  {listProductsData?.data?.map((product: IListProduct) => (
                    <div key={product._id} className="flex items-center my-1">
                      <input
                        type="checkbox"
                        checked={selectedListProducts.includes(product._id)}
                        onChange={() => handleCheckboxChange(product._id)}
                        className="checkbox checkbox-sm checkbox-primary mr-2"
                      />
                      <span className="text-sm">{product.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-action">
                <Button type="submit" color="primary">
                  {selectedProduct ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ProductManagement;
