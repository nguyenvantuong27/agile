import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import {
  useGetBranchesQuery,
  useCreateBranchMutation,
  usePatchBranchMutation,
  useDeleteBranchMutation,
} from '~/services/branches/branches.services';
import { useGetListProductsQuery } from '~/services/list_product/list_product.services';
import { Button, Modal } from 'react-daisyui';
import { IBranch } from '~/domain/types/branches/branches.model';
import { IListProduct } from '~/domain/types/list_product/list_product.model';
import { Toastify } from '~/helpers/Toastify';
import * as XLSX from 'xlsx';
import LoadingLocal from '~/components/loading/LoadingLocal';

const ITEMS_PER_PAGE = 5; // Số lượng chi nhánh mỗi trang

const BranchesManagement: React.FC = () => {
  const { data: branchesData, isLoading, refetch } = useGetBranchesQuery();
  const { data: productData } = useGetListProductsQuery();
  const [createBranch] = useCreateBranchMutation();
  const [updateBranch] = usePatchBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();

  const [selectedBranch, setSelectedBranch] = useState<IBranch | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(''); // Tìm kiếm
  const [filterStatus, setFilterStatus] = useState<string>('all'); // Lọc trạng thái
  const [currentPage, setCurrentPage] = useState<number>(1); // Trang hiện tại

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IBranch>();

  const filteredBranches = useMemo(() => {
    if (!branchesData?.data) return [];
    return branchesData.data.filter((branch) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        branch.name.toLowerCase().includes(searchLower) ||
        branch.address.toLowerCase().includes(searchLower) ||
        branch.phone.toString().toLowerCase().includes(searchLower) ||
        (branch._id ?? '').toLowerCase().includes(searchLower);

      const matchesStatus =
        filterStatus === 'all' || branch.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [branchesData, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredBranches.length / ITEMS_PER_PAGE);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const statistics = useMemo(() => {
    if (!branchesData?.data) return { totalBranches: 0, activeBranches: 0 };
    const totalBranches = branchesData.data.length;
    const activeBranches = branchesData.data.filter(
      (branch) => branch.status === 'open',
    ).length;
    return { totalBranches, activeBranches };
  }, [branchesData]);

  const handleEditBranch = (branch: IBranch) => {
    setSelectedBranch(branch);
    setValue('name', branch.name);
    setValue('address', branch.address);
    setValue('phone', branch.phone);
    setValue('status', branch.status);
    setValue('list_product_id', branch.list_product_id || null);
    setValue('description', branch.description);
    setShowModal(true);
  };

  const handleDeleteBranch = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa chi nhánh này?')) {
      try {
        await deleteBranch(id).unwrap();
        Toastify('Xóa chi nhánh thành công', 201);
        refetch();
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Đã có lỗi xảy ra!';
        Toastify(errorMessage, 400);
      }
    }
  };

  const onSubmit = async (data: IBranch) => {
    try {
      if (selectedBranch) {
        await updateBranch({ id: selectedBranch._id!, data }).unwrap();
        Toastify('Cập nhật chi nhánh thành công', 201);
      } else {
        await createBranch(data).unwrap();
        Toastify('Thêm chi nhánh thành công', 201);
      }
      reset();
      setShowModal(false);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleExport = () => {
    const exportData = filteredBranches.map((branch) => ({
      'Mã chi nhánh': branch._id,
      'Tên chi nhánh': branch.name,
      'Địa chỉ': branch.address,
      'Số điện thoại': branch.phone,
      'Trạng thái': branch.status === 'open' ? 'Hoạt động' : 'Không hoạt động',
      'Mô tả': branch.description || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Branches');
    XLSX.writeFile(workbook, 'Danh_sach_chi_nhanh.xlsx');
    Toastify('Xuất dữ liệu thành công', 200);
  };

  if (isLoading) return <LoadingLocal />;

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
        Quản lý Chi nhánh
      </h1>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600">Tổng số chi nhánh</p>
          <p className="text-2xl font-bold text-gray-800">
            {statistics.totalBranches}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600">Chi nhánh đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">
            {statistics.activeBranches}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại, mã..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="open">Hoạt động</option>
          <option value="close">Không hoạt động</option>
        </select>
        <Button
          className="bg-green-500 text-white hover:bg-green-600"
          onClick={handleExport}
        >
          Xuất Excel
        </Button>
        <Button
          color="primary"
          className="bg-primary text-white "
          onClick={() => {
            setSelectedBranch(null);
            reset();
            setShowModal(true);
          }}
        >
          <FaPlus className="mr-2" /> Thêm chi nhánh
        </Button>
      </div>

      {/* Danh sách chi nhánh */}
      {filteredBranches.length ? (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3">Mã</th>
                  <th className="p-3">Tên</th>
                  <th className="p-3">Địa chỉ</th>
                  <th className="p-3">Điện thoại</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBranches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-50">
                    <td className="p-3">{(branch._id ?? '').slice(0, 8)}...</td>
                    <td className="p-3">{branch.name}</td>
                    <td className="p-3">{branch.address}</td>
                    <td className="p-3">{branch.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          branch.status === 'open'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {branch.status === 'open'
                          ? 'Hoạt động'
                          : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <Button
                        size="sm"
                        color="success"
                        className="text-white"
                        onClick={() => handleEditBranch(branch)}
                      >
                        <FaEdit /> Sửa
                      </Button>
                      <Button
                        size="sm"
                        color="error"
                        className="hidden"
                        onClick={() => handleDeleteBranch(branch._id!)}
                      >
                        <FaTrash /> Xóa
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <Button
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-gray-800">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-500">
          Không tìm thấy chi nhánh nào.
        </p>
      )}

      {/* Modal thêm/sửa chi nhánh */}
      {showModal && (
        <Modal open={showModal}>
          <Modal.Header className="font-bold text-lg bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-4 rounded-t-lg">
            {selectedBranch ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh'}
          </Modal.Header>
          <Modal.Body className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tên chi nhánh
                </label>
                <input
                  {...register('name', {
                    required: 'Vui lòng nhập tên chi nhánh',
                  })}
                  type="text"
                  placeholder="Tên chi nhánh"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Địa chỉ
                </label>
                <input
                  {...register('address', {
                    required: 'Vui lòng nhập địa chỉ',
                  })}
                  type="text"
                  placeholder="Địa chỉ"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  {...register('phone', {
                    required: 'Vui lòng nhập số điện thoại',
                    pattern: {
                      value: /^\d{10,11}$/,
                      message: 'Số điện thoại không hợp lệ (10-11 số)',
                    },
                  })}
                  type="text"
                  placeholder="Số điện thoại"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mô tả
                </label>
                <input
                  {...register('description')}
                  type="text"
                  placeholder="Nhập mô tả chi nhánh"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  {...register('status', {
                    required: 'Vui lòng chọn trạng thái',
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="open">Hoạt động</option>
                  <option value="close">Không hoạt động</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm">
                    {errors.status.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Danh sách sản phẩm
                </label>
                <select
                  {...register('list_product_id')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Chọn sản phẩm</option>
                  {productData?.data?.map((product: IListProduct) => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="submit"
                  color="primary"
                  className="bg-primary text-white "
                >
                  {selectedBranch ? 'Cập nhật' : 'Thêm'}
                </Button>
                <Button
                  type="button"
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default BranchesManagement;
