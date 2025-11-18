import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import {
  useGetListProductsQuery,
  useCreateListProductMutation,
  usePatchListProductMutation,
  useDeleteListProductMutation,
} from '~/services/list_product/list_product.services';
import { Button } from 'react-daisyui';
import { IListProduct } from '~/domain/types/list_product/list_product.model';
import { Toastify } from '~/helpers/Toastify';

const ListProductManagement: React.FC = () => {
  const {
    data: listProductData,
    isLoading,
    refetch,
  } = useGetListProductsQuery();
  const [createListProduct] = useCreateListProductMutation();
  const [updateListProduct] = usePatchListProductMutation();
  const [deleteListProduct] = useDeleteListProductMutation();

  const [selectedProduct, setSelectedProduct] = useState<IListProduct | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<IListProduct>();

  const handleEditProduct = (product: IListProduct) => {
    setSelectedProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteListProduct(id);
    Toastify('Xóa sản phẩm thành công', 201);
    refetch();
  };

  const onSubmit = async (data: IListProduct) => {
    if (selectedProduct) {
      await updateListProduct({ id: selectedProduct._id!, data });
      Toastify('Cập nhật sản phẩm thành công', 201);
    } else {
      await createListProduct(data);
      Toastify('Thêm sản phẩm thành công', 201);
    }
    reset();
    setShowModal(false);
    refetch();
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">Quản lý danh sách sản phẩm</h1>
      <Button
        color="primary"
        onClick={() => {
          setSelectedProduct(null);
          setShowModal(true);
        }}
      >
        <FaPlus /> Thêm danh sách sản phẩm
      </Button>

      <table className="table table-zebra w-full mt-4">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Mô tả</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            listProductData?.data?.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td className="flex items-center">
                  <Button
                    color="success"
                    onClick={() => handleEditProduct(product)}
                  >
                    <FaEdit /> Sửa
                  </Button>
                  <Button
                    onClick={() => handleDeleteProduct(product._id!)}
                    color="error"
                    className="ml-2 hidden"
                  >
                    <FaTrash /> Xóa
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Modal Thêm/Sửa Sản Phẩm */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">
              {selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input
                {...register('name')}
                type="text"
                placeholder="Tên danh sách sản phẩm"
                className="input input-bordered w-full my-2"
              />
              <input
                {...register('description')}
                type="text"
                placeholder="Mô tả của danh sách sản phẩm"
                className="input input-bordered w-full my-2"
              />

              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {selectedProduct ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ListProductManagement;
