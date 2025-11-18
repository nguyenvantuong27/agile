import React, { useState } from 'react';
import {
  useGetVouchersQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
} from '~/services/voucher/voucher.services';
import { IVoucher } from '~/domain/types/voucher/voucher.model';
import { Button } from 'react-daisyui';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Toastify } from '~/helpers/Toastify';
import LoadingLocal from '~/components/loading/LoadingLocal';

const VoucherManagement: React.FC = () => {
  const { data: vouchersData, isLoading, refetch } = useGetVouchersQuery();
  const [createVoucher] = useCreateVoucherMutation();
  const [updateVoucher] = useUpdateVoucherMutation();
  const [deleteVoucher] = useDeleteVoucherMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountValue: 0,
    discountType: 'fixed' as 'percentage' | 'fixed',
    minOrderValue: 0,
    maxDiscount: null as number | null,
    expirationDate: '',
    usageLimit: 3,
    isActive: true,
  });

  const openModal = (voucher?: IVoucher) => {
    if (voucher) {
      setSelectedVoucher(voucher);
      setFormData({
        code: voucher.code,
        discountValue: voucher.discountValue,
        discountType: voucher.discountType,
        minOrderValue: voucher.minOrderValue || 0,
        maxDiscount: voucher.maxDiscount ?? null,
        expirationDate: voucher.expirationDate.split('T')[0],
        usageLimit: voucher.usageLimit,
        isActive: voucher.isActive,
      });
    } else {
      setSelectedVoucher(null);
      setFormData({
        code: '',
        discountValue: 0,
        discountType: 'fixed',
        minOrderValue: 0,
        maxDiscount: null,
        expirationDate: '',
        usageLimit: 3,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVoucher(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedVoucher) {
        await updateVoucher({
          id: selectedVoucher._id ?? '',
          data: formData,
        }).unwrap();
        Toastify('Cập nhật voucher thành công!', 200);
      } else {
        await createVoucher(formData).unwrap();
        Toastify('Tạo voucher thành công!', 200);
      }
      refetch();
      closeModal();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa voucher này?')) {
      try {
        await deleteVoucher(id).unwrap();
        Toastify('Xóa voucher thành công!', 200);
        refetch();
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Đã có lỗi xảy ra!';
        Toastify(errorMessage, 400);
      }
    }
  };

  if (isLoading)
    return (
      <div className="text-center">
        {' '}
        <LoadingLocal />
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Voucher</h1>

      <div className="mb-6">
        <Button
          color="primary"
          onClick={() => openModal()}
          className="flex items-center gap-2"
        >
          <FaPlus /> Thêm Voucher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchersData?.data.map((voucher) => (
          <div
            key={voucher._id}
            className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg shadow-md overflow-hidden border-2 border-dashed border-blue-300 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {/* Phần header với mã và giá trị giảm */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-extrabold text-blue-800 mb-2 tracking-wide">
                    {voucher.code}
                  </h3>
                  <div className="text-3xl font-bold text-orange-500 mb-2 drop-shadow-md">
                    {voucher.discountType === 'percentage'
                      ? `${voucher.discountValue}%`
                      : `${voucher.discountValue.toLocaleString()} VNĐ`}
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${
                    voucher.isActive
                      ? 'bg-green-200 text-green-800'
                      : 'bg-red-200 text-red-800'
                  }`}
                >
                  {voucher.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </div>

            {/* Phần thông tin chi tiết */}
            <div className="px-6 pb-6 bg-white bg-opacity-70">
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex justify-between">
                  <span>Đơn tối thiểu:</span>
                  <span className="font-semibold">
                    {(voucher.minOrderValue ?? 0).toLocaleString()} VNĐ
                  </span>
                </p>
                {voucher.maxDiscount && (
                  <p className="flex justify-between">
                    <span>Giảm tối đa:</span>
                    <span className="font-semibold">
                      {voucher.maxDiscount.toLocaleString()} VNĐ
                    </span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span>Hết hạn:</span>
                  <span className="font-semibold">
                    {new Date(voucher.expirationDate).toLocaleDateString()}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Lượt dùng:</span>
                  <span className="font-semibold">
                    {voucher.usedCount}/{voucher.usageLimit}
                  </span>
                </p>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end p-4 bg-gradient-to-r from-blue-100 to-green-100">
              <Button
                size="sm"
                color="ghost"
                onClick={() => openModal(voucher)}
                className="text-blue-600 hover:bg-blue-200 rounded-full p-2"
              >
                <FaEdit size={18} />
              </Button>
              <Button
                size="sm"
                color="ghost"
                onClick={() => handleDelete(voucher._id ?? '')}
                className="text-red-600 hover:bg-red-200 rounded-full p-2 hidden"
              >
                <FaTrash size={18} />
              </Button>
            </div>

            {/* Hiệu ứng vòng tròn trang trí */}
            <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-blue-300" />
            <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full border-2 border-blue-300" />
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white h-[90%] overflow-y-scroll p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {selectedVoucher ? 'Sửa Voucher' : 'Thêm Voucher'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mã Voucher
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giá trị giảm
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loại giảm giá
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as 'percentage' | 'fixed',
                    })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fixed">Cố định (VNĐ)</option>
                  <option value="percentage">Phần trăm (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giá trị đơn hàng tối thiểu
                </label>
                <input
                  type="number"
                  value={formData.minOrderValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderValue: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giảm tối đa (nếu là %)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscount: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày hết hạn
                </label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Giới hạn sử dụng
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: Number(e.target.value),
                    })
                  }
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Hoạt động</span>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  color="ghost"
                  onClick={closeModal}
                  className="text-gray-600"
                >
                  Hủy
                </Button>
                <Button type="submit" color="primary">
                  {selectedVoucher ? 'Cập nhật' : 'Tạo mới'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherManagement;
