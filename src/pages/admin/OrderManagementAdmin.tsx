import React, { useState, useMemo } from 'react';
import { FaEye, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from '~/services/order/order.services';
import { Button, Modal } from 'react-daisyui';
import { IOrder } from '~/domain/types/order/order.model';
import { OrderStatus } from '~/interfaces/enum/order.enum';
import { Toastify } from '~/helpers/Toastify';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { useGetOrderDetailsByOrderIdQuery } from '~/services/order-details/order-details.services';
import { IOrderDetail } from '~/domain/types/order-details/order-details.model';
import * as XLSX from 'xlsx';

const ITEMS_PER_PAGE = 6;

const OrderManagementAdmin: React.FC = () => {
  const { data: ordersData, isLoading, refetch } = useGetOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortCriteria, setSortCriteria] = useState<string>('createdAt'); // Mặc định sắp xếp theo ngày tạo
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Mặc định giảm dần
  const [paymentFilter, setPaymentFilter] = useState<string>('all'); // Bộ lọc phương thức thanh toán

  const { data: orderDetailsData, isLoading: detailsLoading } =
    useGetOrderDetailsByOrderIdQuery(selectedOrder?._id ?? '', {
      skip: !selectedOrder || !showDetailsModal,
    });

  const filteredOrders = useMemo(() => {
    if (!ordersData?.data) return [];
    const filteredOrders = [...ordersData.data].filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (order._id?.toLowerCase() ?? '').includes(searchLower) ||
        (typeof order.user_id === 'object' &&
          order.user_id?.full_name?.toLowerCase().includes(searchLower)) ||
        order.phone?.toLowerCase().includes(searchLower) ||
        order.address?.toLowerCase().includes(searchLower) ||
        (order.voucherCode?.toLowerCase() ?? '').includes(searchLower) ||
        order.status?.toLowerCase().includes(searchLower);

      const matchesStatus =
        filterStatus === 'all' || order.status === filterStatus;

      // Lọc theo phương thức thanh toán
      const matchesPayment =
        paymentFilter === 'all' || order.paymentMethod === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });

    // Logic sắp xếp
    filteredOrders.sort((a, b) => {
      if (sortCriteria === 'paymentMethod') {
        const paymentA = a.paymentMethod ?? '';
        const paymentB = b.paymentMethod ?? '';
        return sortOrder === 'asc'
          ? paymentA.localeCompare(paymentB)
          : paymentB.localeCompare(paymentA);
      } else {
        // Mặc định sắp xếp theo ngày tạo
        return sortOrder === 'asc'
          ? new Date(a.createdAt ?? 0).getTime() -
              new Date(b.createdAt ?? 0).getTime()
          : new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime();
      }
    });

    return filteredOrders;
  }, [
    ordersData,
    searchTerm,
    filterStatus,
    sortCriteria,
    sortOrder,
    paymentFilter,
  ]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const statistics = useMemo(() => {
    if (!ordersData?.data) return { totalOrders: 0, totalRevenue: 0 };
    const totalOrders = ordersData.data.length;
    const totalRevenue = ordersData.data.reduce(
      (sum, order) =>
        sum +
        (order.finalTotal !== undefined && order.finalTotal !== null
          ? order.finalTotal
          : (order.total ?? 0)),
      0,
    );
    return { totalOrders, totalRevenue };
  }, [ordersData]);

  const handleShowDetails = (order: IOrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleApproveOrder = async (id: string, currentStatus: string) => {
    if (currentStatus !== OrderStatus.PENDING) {
      Toastify('Chỉ có thể duyệt đơn hàng ở trạng thái PENDING', 403);
      return;
    }
    try {
      await updateOrderStatus({
        id,
        status: OrderStatus.CONFIRMED,
      }).unwrap();
      Toastify('Duyệt đơn hàng thành công', 200);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleCancelOrder = async (id: string, currentStatus: string) => {
    if (currentStatus !== OrderStatus.PENDING) {
      Toastify('Chỉ có thể hủy đơn hàng ở trạng thái PENDING', 403);
      return;
    }
    try {
      await updateOrderStatus({
        id,
        status: OrderStatus.CANCELED,
      }).unwrap();
      Toastify('Hủy đơn hàng thành công', 200);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const getValidNextStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
      case OrderStatus.PAID:
        return [OrderStatus.CONFIRMED, OrderStatus.CANCELED];
      case OrderStatus.CONFIRMED:
        return [OrderStatus.SHIPPING, OrderStatus.CANCELED];
      case OrderStatus.SHIPPING:
        return [OrderStatus.DELIVERED, OrderStatus.RETURNED];
      case OrderStatus.DELIVERED:
      case OrderStatus.CANCELED:
      case OrderStatus.RETURNED:
        return [];
      default:
        return [];
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (selectedOrder) {
      try {
        if (selectedOrder._id) {
          await updateOrderStatus({
            id: selectedOrder._id,
            status: newStatus,
          }).unwrap();
          Toastify('Cập nhật trạng thái đơn hàng thành công', 200);
          setShowStatusModal(false);
          refetch();
        }
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Đã có lỗi xảy ra!';
        Toastify(errorMessage, 400);
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredOrders.map((order) => ({
      'Mã đơn hàng': order._id,
      'Khách hàng':
        typeof order.user_id === 'object'
          ? order.user_id?.full_name
          : 'Không rõ',
      'Số điện thoại': order.phone,
      'Địa chỉ': order.address,
      'Tổng tiền trước giảm giá': (order.total ?? 0).toLocaleString() + ' VND',
      'Giảm giá': (order.discount ?? 0).toLocaleString() + ' VND',
      'Tổng tiền cuối cùng':
        (order.finalTotal !== undefined && order.finalTotal !== null
          ? order.finalTotal
          : (order.total ?? 0)
        ).toLocaleString() + ' VND',
      'Phương thức thanh toán': order.paymentMethod ?? 'N/A',
      'Mã giảm giá': order.voucherCode ?? 'Không có',
      'Trạng thái': order.status,
      'Ngày đặt': order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('vi-VN')
        : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'Danh_sach_don_hang.xlsx');
    Toastify('Xuất dữ liệu thành công', 200);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPING:
        return 'bg-orange-100 text-orange-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELED:
        return 'bg-red-100 text-red-800';
      case OrderStatus.PAID:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.RETURNED:
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) return <LoadingLocal />;

  return (
    <div className="p-6 min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">
        Quản lý Đơn Hàng
      </h1>

      {/* Thống kê */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600">Tổng số đơn hàng</p>
          <p className="text-2xl font-bold text-gray-800">
            {statistics.totalOrders}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-gray-600">Tổng tiền tất cả đơn</p>
          <p className="text-2xl font-bold text-green-600">
            {statistics.totalRevenue.toLocaleString()} VND
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, khách hàng, số điện thoại, địa chỉ, mã giảm giá, trạng thái..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.values(OrderStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => {
            setPaymentFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả phương thức</option>
          <option value="COD">Thanh toán khi nhận hàng (COD)</option>
          <option value="VNPAY">Thanh toán online (VNPAY)</option>
        </select>
        <select
          value={sortCriteria}
          onChange={(e) => {
            setSortCriteria(e.target.value);
            setCurrentPage(1);
          }}
          className="p-2 hidden border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="createdAt">Sắp xếp theo ngày đặt</option>
          <option value="paymentMethod">
            Sắp xếp theo phương thức thanh toán
          </option>
        </select>
        <Button
          className={`p-2 border   text-white border-gray-300 rounded-md ${sortOrder === 'asc' ? 'bg-blue-500' : 'bg-gray-200 '}`}
          onClick={() => {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
            setCurrentPage(1);
          }}
        >
          {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
        </Button>
        <Button
          className="bg-green-500 text-white hover:bg-green-600"
          onClick={handleExport}
        >
          Xuất Excel
        </Button>
      </div>

      {filteredOrders.length ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex flex-wrap justify-between items-center border-b pb-3 mb-3">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">
                      Mã đơn: {order._id ?? 'N/A'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Khách hàng:{' '}
                      {typeof order.user_id === 'object'
                        ? order.user_id?.full_name
                        : 'Không rõ'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex mt-2 items-center px-2.5 py-0.5 text-sm font-medium ${getStatusBadgeClass(
                      order.status ?? '',
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <span className="font-medium text-sm">
                      Tổng tiền trước giảm giá:
                    </span>{' '}
                    <span className="text-sm font-semibold text-gray-600">
                      {(order.total ?? 0).toLocaleString()} VND
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-sm">Giảm giá:</span>{' '}
                    <span className="text-sm font-semibold text-red-600">
                      {(order.discount ?? 0).toLocaleString()} VND
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Tổng tiền cuối cùng:</span>{' '}
                    <span className="text-sm font-semibold text-green-600">
                      {(order.finalTotal !== undefined &&
                      order.finalTotal !== null
                        ? order.finalTotal
                        : (order.total ?? 0)
                      ).toLocaleString()}{' '}
                      VND
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-sm">Số điện thoại:</span>{' '}
                    {order.phone}
                  </p>
                  <p className="truncate">
                    <span className="font-medium text-sm">Địa chỉ:</span>{' '}
                    {order.address}
                  </p>
                  <p>
                    <span className="font-medium text-sm">
                      Phương thức thanh toán:
                    </span>{' '}
                    {order.paymentMethod === 'COD'
                      ? 'Thanh toán khi nhận hàng'
                      : order.paymentMethod === 'VNPAY'
                        ? 'Thanh toán online (VNPAY)'
                        : (order.paymentMethod ?? 'N/A')}
                  </p>
                  <p>
                    <span className="font-medium text-sm">Mã giảm giá:</span>{' '}
                    {order.voucherCode ?? 'Không có'}
                  </p>
                  <p>
                    <span className="font-medium text-sm">Ngày đặt:</span>{' '}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    size="sm"
                    className="bg-black text-white"
                    onClick={() => handleShowDetails(order)}
                  >
                    <FaEye /> Chi tiết
                  </Button>
                  {order.status !== OrderStatus.PENDING && (
                    <Button
                      color="success"
                      size="sm"
                      className="text-white"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowStatusModal(true);
                      }}
                    >
                      Cập nhật
                    </Button>
                  )}
                  {order.status === OrderStatus.PENDING && (
                    <>
                      <Button
                        color="primary"
                        size="sm"
                        className="text-white"
                        onClick={() =>
                          handleApproveOrder(
                            order._id ?? '',
                            order.status ?? '',
                          )
                        }
                      >
                        <FaCheck /> Duyệt
                      </Button>
                      <Button
                        color="error"
                        size="sm"
                        className="text-white"
                        onClick={() =>
                          handleCancelOrder(order._id ?? '', order.status ?? '')
                        }
                      >
                        <FaTimes /> Hủy
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-4">
              <Button
                className="px-4 py-2 bg-primary text-white hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-black">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                className="px-4 py-2 bg-primary text-white hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
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
          Không tìm thấy đơn hàng nào.
        </p>
      )}

      {showStatusModal && selectedOrder && (
        <Modal open={showStatusModal}>
          <Modal.Header className="font-bold text-sm bg-gradient-to-r from-blue-500 to-blue-700 text-white p-4 rounded-t-lg">
            Cập nhật trạng thái đơn hàng:{' '}
            {selectedOrder._id?.slice(0, 8) ?? 'N/A'}...
          </Modal.Header>
          <Modal.Body className="p-6">
            <div className="space-y-6">
              <div>
                <label className="label text-gray-700 font-medium">
                  Trạng thái hiện tại: {selectedOrder.status}
                </label>
                <div className="flex flex-wrap gap-3">
                  {getValidNextStatuses(selectedOrder.status ?? '').map(
                    (status) => (
                      <Button
                        key={status}
                        color={
                          status === OrderStatus.CANCELED ||
                          status === OrderStatus.RETURNED
                            ? 'error'
                            : 'primary'
                        }
                        className="text-white shadow-md"
                        onClick={() => handleStatusUpdate(status)}
                      >
                        {status === OrderStatus.CONFIRMED && 'Duyệt đơn'}
                        {status === OrderStatus.SHIPPING && 'Gửi hàng'}
                        {status === OrderStatus.DELIVERED &&
                          'Giao hàng thành công'}
                        {status === OrderStatus.CANCELED && 'Hủy đơn'}
                        {status === OrderStatus.RETURNED && 'Khách không nhận'}
                      </Button>
                    ),
                  )}
                  {getValidNextStatuses(selectedOrder.status ?? '').length ===
                    0 && (
                    <p className="text-gray-600">
                      Không thể cập nhật trạng thái từ trạng thái hiện tại.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowStatusModal(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {showDetailsModal && selectedOrder && (
        <Modal open={showDetailsModal}>
          <Modal.Header className="font-bold text-sm bg-gradient-to-r from-green-500 to-green-700 text-white p-4 rounded-t-lg">
            Chi tiết đơn hàng: {selectedOrder._id?.slice(0, 8) ?? 'N/A'}...
          </Modal.Header>
          <Modal.Body className="p-6">
            {detailsLoading ? (
              <LoadingLocal />
            ) : !orderDetailsData?.data?.length ? (
              <p className="text-gray-600 text-center">
                Không có sản phẩm trong đơn hàng này.
              </p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p>
                      <span className="font-medium">Khách hàng:</span>{' '}
                      {typeof selectedOrder.user_id === 'object'
                        ? selectedOrder.user_id?.full_name
                        : 'Không rõ'}
                    </p>
                    <p>
                      <span className="font-medium">Số điện thoại:</span>{' '}
                      {selectedOrder.phone}
                    </p>
                    <p>
                      <span className="font-medium">Địa chỉ:</span>{' '}
                      {selectedOrder.address}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">
                        Tổng tiền trước giảm giá:
                      </span>{' '}
                      <span className="text-gray-600 font-semibold">
                        {(selectedOrder.total ?? 0).toLocaleString()} VND
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Giảm giá:</span>{' '}
                      <span className="text-red-600 font-semibold">
                        {(selectedOrder.discount ?? 0).toLocaleString()} VND
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Tổng tiền cuối cùng:</span>{' '}
                      <span className="text-green-600 font-semibold">
                        {(selectedOrder.finalTotal !== undefined &&
                        selectedOrder.finalTotal !== null
                          ? selectedOrder.finalTotal
                          : (selectedOrder.total ?? 0)
                        ).toLocaleString()}{' '}
                        VND
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">
                        Phương thức thanh toán:
                      </span>{' '}
                      {selectedOrder.paymentMethod === 'COD'
                        ? 'Thanh toán khi nhận hàng'
                        : selectedOrder.paymentMethod === 'VNPAY'
                          ? 'Thanh toán online (VNPAY)'
                          : (selectedOrder.paymentMethod ?? 'N/A')}
                    </p>
                    <p>
                      <span className="font-medium">Mã giảm giá:</span>{' '}
                      {selectedOrder.voucherCode ?? 'Không có'}
                    </p>
                    <p>
                      <span className="font-medium">Ngày đặt:</span>{' '}
                      {selectedOrder.createdAt
                        ? new Date(selectedOrder.createdAt).toLocaleDateString(
                            'vi-VN',
                          )
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <h3 className="font-semibold text-xl text-gray-800">
                  Sản phẩm
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {orderDetailsData.data.map((detail: IOrderDetail) => (
                    <div
                      key={detail._id}
                      className="flex justify-between items-center p-4 rounded-lg shadow-sm hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <img
                          src={
                            typeof detail.product_id === 'object' &&
                            detail.product_id?.image
                              ? detail.product_id.image
                              : 'https://via.placeholder.com/64'
                          }
                          alt={
                            typeof detail.product_id === 'object' &&
                            detail.product_id?.name
                              ? detail.product_id.name
                              : 'Sản phẩm'
                          }
                          className="w-16 h-16 object-cover rounded-lg mr-4"
                        />
                        <div>
                          <p className="text-gray-800 font-medium">
                            {typeof detail.product_id === 'object' &&
                            detail.product_id?.name
                              ? detail.product_id.name
                              : 'Không tên'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Số lượng:{' '}
                            <span className="font-medium">
                              {detail.quantity}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-800 font-semibold">
                          {detail.price.toLocaleString()} VND
                        </p>
                        <p className="text-sm text-gray-600">
                          Tổng:{' '}
                          {(detail.price * detail.quantity).toLocaleString()}{' '}
                          VND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default OrderManagementAdmin;
