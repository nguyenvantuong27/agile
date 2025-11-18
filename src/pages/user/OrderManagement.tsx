import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import {
  useGetOrdersByUserIdQuery,
  useDeleteOrderMutation,
} from '~/services/order/order.services';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { IOrder } from '~/domain/types/order/order.model';
import { useGetOrderDetailsByOrderIdQuery } from '~/services/order-details/order-details.services';
import { Toastify } from '~/helpers/Toastify';
import { FaSearch, FaSort, FaInfoCircle, FaEnvelope } from 'react-icons/fa';
import { IProduct } from '~/domain/types/product/product.model';
import { IOrderDetail } from '~/domain/types/order-details/order-details.model';

const OrderManagement: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const { orderId } = state || {};

  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch,
  } = useGetOrdersByUserIdQuery(auth?._id || '', { skip: !auth?._id });

  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<
    'createdAt' | 'finalTotal' | 'status'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (orderId) {
      setExpandedOrder(orderId);
    }
  }, [orderId]);

  const filteredAndSortedOrders = useMemo(() => {
    const userOrders = ordersData?.data || [];
    let filtered = [...userOrders];

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.voucherCode?.toLowerCase() ?? '').includes(
            searchTerm.toLowerCase(),
          ) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Lọc theo trạng thái
    if (filterStatus !== 'all') {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // Sắp xếp
    filtered.sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortField === 'createdAt') {
        return (
          multiplier *
          (new Date(a.createdAt || '').getTime() -
            new Date(b.createdAt || '').getTime())
        );
      } else if (sortField === 'finalTotal') {
        const aValue =
          a.finalTotal !== undefined && a.finalTotal !== null
            ? a.finalTotal
            : (a.total ?? 0);
        const bValue =
          b.finalTotal !== undefined && b.finalTotal !== null
            ? b.finalTotal
            : (b.total ?? 0);
        return multiplier * (aValue - bValue);
      } else if (sortField === 'status') {
        return multiplier * (a.status || '').localeCompare(b.status || '');
      }
      return 0;
    });

    return filtered;
  }, [ordersData, searchTerm, filterStatus, sortField, sortOrder]);

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleDeleteOrder = async (orderId: string, currentStatus: string) => {
    if (currentStatus !== 'PENDING') {
      Toastify('Chỉ có thể hủy đơn hàng ở trạng thái PENDING', 403);
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await deleteOrder(orderId).unwrap();
        refetch();
        Toastify('Hủy đơn hàng thành công!', 200);
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Đã có lỗi xảy ra!';
        Toastify(errorMessage, 400);
      }
    }
  };

  const handleSort = (field: 'createdAt' | 'finalTotal' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Đơn hàng đang chờ xử lý';
      case 'PAID':
        return 'Đơn hàng đã thanh toán online';
      case 'CONFIRMED':
        return 'Đơn hàng đã được xác nhận';
      case 'SHIPPING':
        return 'Đơn hàng đang được giao';
      case 'DELIVERED':
        return 'Đơn hàng đã giao thành công';
      case 'CANCELED':
        return 'Đơn hàng đã bị hủy';
      case 'RETURNED':
        return 'Đơn hàng đã trả lại do khách không nhận';
      default:
        return 'Trạng thái không xác định';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-purple-100 text-purple-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPING':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      case 'RETURNED':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleContactSupport = (orderId: string) => {
    window.location.href = `mailto:support@example.com?subject=Hỗ trợ đơn hàng ${orderId}`;
  };

  if (ordersLoading) {
    return <LoadingLocal />;
  }

  if (!auth?._id) {
    navigate('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen text-gray-800 font-roboto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Quản lý đơn hàng{' '}
          {filteredAndSortedOrders.length > 0
            ? `(${filteredAndSortedOrders.length})`
            : ''}
        </h1>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, địa chỉ, mã giảm giá, trạng thái..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            {[
              'PENDING',
              'PAID',
              'CONFIRMED',
              'SHIPPING',
              'DELIVERED',
              'CANCELED',
              'RETURNED',
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => handleSort('createdAt')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${sortField === 'createdAt' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}
            >
              <FaSort />
              Sắp xếp theo ngày
            </button>
            <button
              onClick={() => handleSort('finalTotal')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${sortField === 'finalTotal' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}
            >
              <FaSort />
              Tổng tiền
            </button>
            <button
              onClick={() => handleSort('status')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${sortField === 'status' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-300'}`}
            >
              <FaSort />
              Trạng thái
            </button>
          </div>
        </div>

        {filteredAndSortedOrders.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">Không tìm thấy đơn hàng nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAndSortedOrders.map((order: IOrder) => (
              <div
                key={order._id}
                className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${
                  order._id === orderId ? 'border-l-4 border-green-500' : ''
                }`}
              >
                <div className="grid grid-cols-1 sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Mã đơn hàng:{' '}
                      <span className="font-medium">{order._id}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng tiền trước giảm giá:{' '}
                      <span className="font-medium">
                        {(order.total ?? 0).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </span>
                    </p>
                    <p className="text-sm text-red-600">
                      Giảm giá:{' '}
                      <span className="font-medium">
                        {(order.discount ?? 0).toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </span>
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      Tổng tiền cuối cùng:{' '}
                      {(order.finalTotal !== undefined &&
                      order.finalTotal !== null
                        ? order.finalTotal
                        : (order.total ?? 0)
                      ).toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </p>
                    <div className="relative inline-block">
                      <p
                        className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${getStatusBadgeClass(
                          order.status || '',
                        )}`}
                      >
                        {order.status}
                        <FaInfoCircle
                          className="inline-block ml-1 text-gray-500 cursor-help"
                          title={getStatusDescription(order.status || '')}
                        />
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Phương thức thanh toán:{' '}
                      <span className="font-medium">
                        {order.paymentMethod ?? 'N/A'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Mã giảm giá:{' '}
                      <span className="font-medium">
                        {order.voucherCode ?? 'Không có'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Địa chỉ: {order.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ngày đặt:{' '}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                    {order.status === 'RETURNED' && (
                      <p className="text-sm text-pink-600">
                        Ghi chú: Đơn hàng đã trả lại do không nhận. Vui lòng
                        liên hệ hỗ trợ để biết thêm chi tiết.
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      onClick={() => order._id && toggleOrderDetails(order._id)}
                    >
                      {expandedOrder === order._id
                        ? 'Ẩn chi tiết'
                        : 'Xem chi tiết'}
                    </button>
                    {order.status === 'PENDING' && (
                      <button
                        className="text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50"
                        onClick={() =>
                          order._id &&
                          handleDeleteOrder(order._id, order.status || '')
                        }
                        disabled={isDeleting}
                      >
                        Hủy đơn
                      </button>
                    )}
                    {(order.status === 'DELIVERED' ||
                      order.status === 'CANCELED' ||
                      order.status === 'RETURNED') && (
                      <button
                        className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                        onClick={() =>
                          order._id && handleContactSupport(order._id)
                        }
                      >
                        <FaEnvelope className="inline-block mr-1" /> Liên hệ hỗ
                        trợ
                      </button>
                    )}
                  </div>
                </div>
                {expandedOrder === order._id && (
                  <div className="mt-4">
                    <OrderDetails orderId={order._id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderDetails: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { data: orderDetailsData, isLoading: detailsLoading } =
    useGetOrderDetailsByOrderIdQuery(orderId);

  if (detailsLoading)
    return <div className="text-gray-600">Đang tải chi tiết...</div>;
  if (!orderDetailsData?.data?.length)
    return (
      <div className="text-gray-600">Không có sản phẩm trong đơn hàng này.</div>
    );

  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Chi tiết đơn hàng
      </h3>
      <div className="space-y-4">
        {orderDetailsData.data.map((detail: IOrderDetail) => {
          const product: IProduct | object =
            typeof detail.product_id === 'object' ? detail.product_id : {};
          const effectivePrice =
            detail.price ||
            ('price_sale' in product &&
            product.price_sale &&
            product.price_sale < product.price
              ? product.price_sale
              : 'price' in product
                ? product.price
                : 0);
          const hasDiscount =
            'price_sale' in product &&
            product.price_sale &&
            product.price_sale < product.price;
          const discountPercent = hasDiscount
            ? Math.round(
                ((product.price - product.price_sale!) / product.price) * 100,
              )
            : 0;

          return (
            <div
              key={detail._id}
              className="flex items-center justify-between p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={
                      'image' in product && product.image
                        ? product.image
                        : 'https://via.placeholder.com/150'
                    }
                    alt={'name' in product ? product.name : 'Sản phẩm'}
                    className="w-20 h-16 object-cover rounded-md border"
                  />
                  {hasDiscount ? (
                    <div className="absolute top-0 left-0 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded">
                      Giảm {discountPercent}%
                    </div>
                  ) : null}
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    {'name' in product ? product.name : 'Sản phẩm'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Số lượng: {detail.quantity}
                  </p>
                  {hasDiscount ? (
                    <p className="text-sm text-gray-500 line-through">
                      {product.price.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-800 font-medium">
                  {effectivePrice.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  Tổng:{' '}
                  {(effectivePrice * detail.quantity).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderManagement;
