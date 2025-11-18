import { useState } from 'react';
import { FaUserPlus, FaTrash, FaEdit, FaExpandArrowsAlt } from 'react-icons/fa';
import {
  useGetAppointmentCategoriesQuery,
  useCreateAppointmentCategoryMutation,
  usePartialUpdateAppointmentCategoryMutation,
  useDeleteAppointmentCategoryMutation,
  useSearchAppointmentCategoriesByNameQuery,
} from '../../services/appointment_categories/appointment_categories.services';
import { IAppointmentCategory } from '~/domain/types/appointment_categories/appointment_categories.model';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminAppointmentCategoryManagement = () => {
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<IAppointmentCategory | null>(null);
  const [searchQuery] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const {
    data: categoriesData,
    isLoading,
    refetch: refetchCategories,
  } = useGetAppointmentCategoriesQuery();
  const { data: searchData, refetch: refetchSearch } =
    useSearchAppointmentCategoriesByNameQuery(searchQuery, {
      skip: !searchQuery,
    });
  const [createCategory] = useCreateAppointmentCategoryMutation();
  const [updateCategory] = usePartialUpdateAppointmentCategoryMutation();
  const [deleteCategory] = useDeleteAppointmentCategoryMutation();

  const categories = searchQuery
    ? searchData?.data || []
    : categoriesData?.data || [];

  const handleAddCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newCategory = {
      name: formData.get('name') as string,
    };
    try {
      await createCategory(newCategory).unwrap();
      setShowAddPopup(false);
      toast.success('Thêm danh mục thành công!');
      refetchCategories();
      if (searchQuery) refetchSearch();
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Thêm danh mục thất bại!');
    }
  };

  const handleEditClick = (category: IAppointmentCategory) => {
    setEditingCategory(category);
    setShowEditPopup(true);
  };

  const handleUpdateCategory = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!editingCategory) return;
    const formData = new FormData(event.currentTarget);
    const updatedData = {
      name: formData.get('name') as string,
    };
    try {
      if (!editingCategory._id) {
        throw new Error('Category ID is missing');
      }
      await updateCategory({
        id: editingCategory._id,
        data: updatedData,
      }).unwrap();
      setShowEditPopup(false);
      toast.success('Cập nhật danh mục thành công!');
      refetchCategories();
      if (searchQuery) refetchSearch();
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Cập nhật danh mục thất bại!');
    }
  };

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id);
    setShowConfirmPopup(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete).unwrap();
      setShowConfirmPopup(false);
      toast.success('Xóa danh mục thành công!');
      refetchCategories();
      if (searchQuery) refetchSearch();
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Xóa danh mục thất bại!');
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả danh mục không?')) {
      try {
        await Promise.all(
          categories
            .filter((category) => typeof category._id === 'string')
            .map((category) => deleteCategory(category._id as string).unwrap()),
        );
        toast.success('Xóa tất cả danh mục thành công!');
        refetchCategories();
        if (searchQuery) refetchSearch();
      } catch (error) {
        console.error('Failed to delete all categories:', error);
        toast.error('Xóa tất cả danh mục thất bại!');
      }
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6 relative z-10">
      <h1 className="text-2xl font-bold mb-4">Quản lí danh mục đồ uống</h1>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddPopup(true)}
            className="bg-black text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaUserPlus className="mr-2" /> Thêm danh mục
          </button>
        </div>
      </div>

      <div className="bg-primary text-white rounded-lg overflow-hidden">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr className="bg-primary text-white h-[50px]">
              <th className="px-3 py-3">Tên danh mục ↑↓</th>
              <th className="px-3 py-3">Hành động ↑↓</th>
            </tr>
          </thead>
          <tbody className="bg-white text-black">
            {categories.map((category) => (
              <tr key={category._id} className="border-t h-[60px]">
                <td className="px-4 py-3">{category.name}</td>
                <td className="px-4 py-3 flex items-center justify-center space-x-2">
                  <button
                    onClick={() =>
                      category._id && handleDeleteClick(category._id)
                    }
                    className="bg-red-600 hidden text-white px-3 py-1 rounded flex items-center"
                  >
                    <FaTrash className="mr-1" /> Xóa
                  </button>
                  <button
                    onClick={() => handleEditClick(category)}
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
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-10"
      >
        Xóa tất cả
      </button>

      {showAddPopup && (
        <form
          onSubmit={handleAddCategory}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Thêm danh mục lịch hẹn</h2>
            <input
              type="text"
              name="name"
              placeholder="Tên danh mục"
              className="w-full mb-2 p-2 border rounded"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddPopup(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Thêm
              </button>
            </div>
          </div>
        </form>
      )}

      {showEditPopup && editingCategory && (
        <form
          onSubmit={handleUpdateCategory}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">
              Chỉnh sửa danh mục lịch hẹn
            </h2>
            <input
              type="text"
              name="name"
              defaultValue={editingCategory.name}
              className="w-full mb-2 p-2 border rounded"
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowEditPopup(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded"
              >
                Lưu
              </button>
            </div>
          </div>
        </form>
      )}

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
    </div>
  );
};

export default AdminAppointmentCategoryManagement;
