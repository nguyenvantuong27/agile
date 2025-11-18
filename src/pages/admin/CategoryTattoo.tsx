import { useState } from 'react';
import { FaSearch, FaUserPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { nanoid } from '@reduxjs/toolkit';
import {
  useGetCategoriesMenuQuery,
  useCreateCategoriesMenuMutation,
  usePartialUpdateCategoriesMenuMutation,
  useDeleteCategoriesMenuMutation,
} from '~/services/categories_menu/categories_menu.services';
import { ICategoriesMenu } from '~/domain/types/categories_menu/categories_menu.model';
import { RootState } from '~/redux/storage/store';
import { useAppSelector } from '~/hooks/HookRouter';
import { Button } from 'react-daisyui';
import { IUser } from '~/domain/types/user/user.model';
import { Toastify } from '~/helpers/Toastify';

const AdminCategorysTatto = () => {
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ICategoriesMenu | null>(null);
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const [addingCategory, setAddingCategory] = useState<ICategoriesMenu>({
    name: '',
    create_by: (auth._id as unknown as IUser) || null,
  });
  const [categoryDeletedId, setCategoryDeletedId] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const {
    data: categoriesData,
    isLoading,
    refetch,
  } = useGetCategoriesMenuQuery();
  const [createCategory] = useCreateCategoriesMenuMutation();
  const [updateCategory] = usePartialUpdateCategoriesMenuMutation();
  const [deleteCategory] = useDeleteCategoriesMenuMutation();

  const handleEditClick = (category: ICategoriesMenu) => {
    setEditingCategory(category);
    setShowEditPopup(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    if (editingCategory._id) {
      await updateCategory({ id: editingCategory._id, data: editingCategory });
    }
    Toastify('Cập nhật danh mục thành công', 201);
    setShowEditPopup(false);
    refetch();
  };

  const addNewCategory = async () => {
    await createCategory(addingCategory);
    setShowAddPopup(false);
    Toastify('Thêm danh mục thành công', 201);
    refetch();
  };

  const handleDeleteClick = (id: string) => {
    setCategoryDeletedId(id);
    setShowConfirmPopup(true);
  };

  const handleDelete = async () => {
    await deleteCategory(categoryDeletedId);
    Toastify('Xóa danh mục thành công', 201);
    setShowConfirmPopup(false);
    refetch();
  };

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">QUẢN LÝ DANH SÁCH SẢN PHẨM</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-80"
          />
          <FaSearch className="absolute top-3 right-3 text-gray-500" />
        </div>
        <button
          onClick={() => setShowAddPopup(true)}
          className="btn btn-primary flex items-center"
        >
          <FaUserPlus className="mr-2" /> Thêm danh mục
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              categoriesData?.data?.map((category) => (
                <tr key={nanoid()}>
                  <td>{category._id}</td>
                  <td>{category.name}</td>
                  <td>
                    <Button
                      onClick={() => handleEditClick(category)}
                      color="success"
                      className="text-white"
                    >
                      <FaEdit /> Sửa
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(category._id || '')}
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
      </div>

      {/* Modal Thêm Danh Mục */}
      {showAddPopup && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Thêm danh mục</h3>
            <input
              type="text"
              placeholder="Tên danh mục"
              className="input input-bordered w-full my-3"
              value={addingCategory.name}
              onChange={(e) =>
                setAddingCategory({ ...addingCategory, name: e.target.value })
              }
            />
            <div className="modal-action">
              <button className="btn btn-success" onClick={addNewCategory}>
                Thêm
              </button>
              <button className="btn" onClick={() => setShowAddPopup(false)}>
                Hủy
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Modal Chỉnh Sửa */}
      {showEditPopup && editingCategory && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Chỉnh sửa danh mục</h3>
            <input
              type="text"
              className="input input-bordered w-full my-3"
              value={editingCategory.name}
              onChange={(e) =>
                setEditingCategory({ ...editingCategory, name: e.target.value })
              }
            />
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={handleUpdateCategory}
              >
                Cập nhật
              </button>
              <button className="btn" onClick={() => setShowEditPopup(false)}>
                Hủy
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Modal Xóa */}
      {showConfirmPopup && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Xác nhận xóa?</h3>
            <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleDelete}>
                Xóa
              </button>
              <button
                className="btn"
                onClick={() => setShowConfirmPopup(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default AdminCategorysTatto;
