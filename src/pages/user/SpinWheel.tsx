import React, { useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import { Button, Modal, Table } from 'react-daisyui';
import Header from '~/components/header/Header';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { IVoucher } from '~/domain/types/voucher/voucher.model';
import { Toastify } from '~/helpers/Toastify';
import {
  useGetSpinVouchersQuery,
  useSpinWheelMutation,
  useGetUserVouchersQuery,
  useDeleteUsedUserVoucherMutation,
} from '~/services/voucher/voucher.services';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const calculateProbability = (voucher: IVoucher): number => {
  const { discountType, discountValue, usageLimit, expirationDate } = voucher;

  const daysUntilExpiration = Math.ceil(
    (new Date(expirationDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const expirationFactor = daysUntilExpiration <= 7 ? 1.5 : 1;

  const usageFactor = usageLimit <= 10 ? 0.8 : 1;

  let baseProbability: number;

  if (discountType === 'percentage') {
    if (discountValue >= 30) {
      baseProbability = 0.05;
    } else if (discountValue >= 20) {
      baseProbability = 0.1;
    } else if (discountValue >= 10) {
      baseProbability = 0.2;
    } else {
      baseProbability = 0.35;
    }
  } else {
    if (discountValue >= 100000) {
      baseProbability = 0.05;
    } else if (discountValue >= 50000) {
      baseProbability = 0.1;
    } else if (discountValue >= 20000) {
      baseProbability = 0.2;
    } else {
      baseProbability = 0.35;
    }
  }

  return baseProbability * expirationFactor * usageFactor;
};

const SpinWheel: React.FC = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

  const { data: vouchersData, isLoading: vouchersLoading } =
    useGetSpinVouchersQuery();
  const [spinWheel, { isLoading: spinLoading }] = useSpinWheelMutation();
  const {
    data: userVouchersData,
    isLoading: userVouchersLoading,
    refetch,
  } = useGetUserVouchersQuery();
  const [deleteUsedUserVoucher, { isLoading: deleteLoading }] =
    useDeleteUsedUserVoucherMutation();

  const wheelData =
    vouchersData?.data
      .map((voucher) => ({
        option: `${voucher.code} (${
          voucher.discountType === 'percentage'
            ? `${voucher.discountValue}%`
            : `${voucher.discountValue.toLocaleString('vi-VN')}đ`
        })`,
        style: {
          backgroundColor: getRandomColor(),
          textColor: '#fff',
        },
      }))
      .concat({
        option: 'Không trúng',
        style: {
          backgroundColor: '#4B4B4B',
          textColor: '#fff',
        },
      }) || [];

  const spinOptions = [
    ...(vouchersData?.data.map((voucher) => ({
      voucher,
      probability: calculateProbability(voucher),
    })) || []),
    { voucher: null, probability: 0.25 },
  ];

  const totalProbability = spinOptions.reduce(
    (sum, opt) => sum + opt.probability,
    0,
  );
  const normalizedSpinOptions = spinOptions.map((option) => ({
    ...option,
    probability: totalProbability
      ? (option.probability / totalProbability) * 100
      : 0,
  }));

  const handleSpinClick = async () => {
    if (mustSpin || spinLoading || !wheelData.length) return;

    try {
      const result = await spinWheel().unwrap();
      let voucherCode: string | null = null;
      if (result.data.voucherId) {
        voucherCode =
          typeof result.data.voucherId === 'object' &&
          'code' in result.data.voucherId
            ? result.data.voucherId.code
            : result.data.voucherId;
      }

      const prizeIndex = wheelData.findIndex((item) =>
        voucherCode
          ? item.option.includes(voucherCode)
          : item.option === 'Không trúng',
      );

      setPrizeNumber(prizeIndex !== -1 ? prizeIndex : 0);
      setSpinResult(voucherCode);
      setMustSpin(true);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleDeleteVoucher = async (userVoucherId: string) => {
    try {
      await deleteUsedUserVoucher(userVoucherId).unwrap();
      Toastify('Xóa voucher thành công!', 200);
      refetch();
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Lỗi khi xóa voucher!';
      Toastify(errorMessage, 400);
    }
  };

  const onStopSpinning = () => {
    setMustSpin(false);
    setIsResultModalOpen(true);
    refetch();
  };

  const closeResultModal = () => {
    setIsResultModalOpen(false);
    setSpinResult(null);
  };

  const openExplainModal = () => {
    setIsExplainModalOpen(true);
  };

  const closeExplainModal = () => {
    setIsExplainModalOpen(false);
  };

  if (vouchersLoading || userVouchersLoading) {
    return (
      <div className="text-center">
        <LoadingLocal />
      </div>
    );
  }

  if (!wheelData.length) {
    return (
      <div className="text-center text-gray-500">
        Không có voucher nào để quay!
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="p-6 w-full mx-auto">
        <div className="flex items-center gap-2 justify-center">
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Vòng quay Voucher may mắn
          </h2>
          <div
            onClick={openExplainModal}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
          >
            <img
              className="w-10 h-10"
              src="https://cdn-icons-png.flaticon.com/512/1454/1454977.png"
              alt=""
            />
          </div>
        </div>
        <div className="flex justify-center mb-6 gap-20">
          <div className="bg-white rounded-2xl p-6">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={onStopSpinning}
              backgroundColors={['#3e3e3e', '#df3428']}
              textColors={['#ffffff']}
              outerBorderColor="#000"
              radiusLineColor="#000"
              radiusLineWidth={1}
              spinDuration={1}
              fontSize={14}
            />
            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSpinClick}
                disabled={spinLoading || mustSpin}
                className={`w-full py-3 rounded-lg text-white font-semibold ${
                  spinLoading || mustSpin
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-primary'
                } transition-all duration-300`}
              >
                {spinLoading ? 'Đang quay...' : 'Quay ngay'}
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Voucher Của Bạn
            </h3>
            {Array.isArray(userVouchersData?.data) &&
            userVouchersData.data.length ? (
              <div className="grid grid-cols-2 gap-2 w-full">
                {userVouchersData.data.map((voucher) => (
                  <div
                    key={voucher._id}
                    className={`relative bg-white rounded-lg shadow-md p-4 flex items-center justify-between border-l-4 ${
                      voucher.usedCount > 0
                        ? 'border-gray-400 opacity-60'
                        : 'border-green-500'
                    } transform transition-transform hover:scale-105`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-800 mr-2">
                          {voucher.voucherId.code}
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            voucher.usedCount > 0
                              ? 'bg-gray-200 text-gray-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {voucher.usedCount > 0
                            ? 'Đã sử dụng'
                            : 'Chưa sử dụng'}
                        </span>
                      </div>
                      <p className="text-2xl font-semibold text-primary mt-1">
                        {voucher.voucherId.discountType === 'percentage'
                          ? `${voucher.voucherId.discountValue}%`
                          : `${voucher.voucherId.discountValue.toLocaleString('vi-VN')}đ`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Hết hạn:{' '}
                        {new Date(
                          voucher.voucherId.expirationDate,
                        ).toLocaleDateString('vi-VN')}
                      </p>
                      {voucher.voucherId.minOrderValue && (
                        <p className="text-xs text-gray-400">
                          Đơn tối thiểu:{' '}
                          {voucher.voucherId.minOrderValue.toLocaleString(
                            'vi-VN',
                          )}
                          đ
                        </p>
                      )}
                    </div>
                    {voucher.usedCount > 0 && (
                      <div
                        onClick={() => handleDeleteVoucher(voucher._id)}
                        className="top-0 right-0 z-10 absolute py-1 px-2 cursor-pointer bg-red-500 text-white rounded-tr-lg text-sm hover:bg-red-600"
                      >
                        {deleteLoading ? 'x' : 'x'}
                      </div>
                    )}
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-gray-100 rounded-r-lg flex items-center justify-center">
                      <span className="text-gray-300 text-4xl font-bold opacity-50 transform -rotate-45">
                        OFF
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 w-80">
                Bạn chưa có voucher nào.
              </p>
            )}
          </div>
        </div>
      </div>

      <Modal open={isResultModalOpen}>
        <Modal.Header
          className={`font-bold text-2xl text-center ${
            spinResult ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {spinResult ? 'Chúc mừng!' : 'Rất tiếc!'}
        </Modal.Header>
        <Modal.Body className="text-center">
          {spinResult ? (
            <>
              <p className="text-lg">
                Bạn đã nhận được voucher{' '}
                <span className="font-bold">{spinResult}</span>!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Voucher đã được thêm vào danh sách của bạn.
              </p>
              <img
                className="w-40 h-40 absolute top-0 right-0"
                src="https://media0.giphy.com/media/UzJMLZ7E2p8JdYsKSJ/giphy.gif?cid=6c09b952lxie840taiod30p639ev6ton9rg9b2gr67y56dfs&ep=v1_stickers_search&rid=giphy.gif&ct=s"
                alt="Celebration"
              />
            </>
          ) : (
            <>
              <p className="text-lg">Chúc bạn may mắn lần sau!</p>
              <p className="text-sm text-gray-500 mt-2">
                Hãy quay lại vào ngày mai để thử vận may của bạn!
              </p>
              <img
                className="w-40 h-40 absolute top-0 right-0"
                src="https://media.giphy.com/media/3o7bu8sRnYp0kAvaA0/giphy.gif"
                alt="Try again"
              />
            </>
          )}
        </Modal.Body>
        <Modal.Actions className="flex justify-center">
          <Button
            onClick={closeResultModal}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Đóng
          </Button>
        </Modal.Actions>
      </Modal>

      <Modal open={isExplainModalOpen}>
        <Modal.Header className="font-bold text-2xl text-center text-primary">
          Giải đáp Vòng quay May mắn
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="text-lg mb-4">
            Vòng quay được thiết kế để mang lại cơ hội nhận voucher hấp dẫn.
            Dưới đây là chi tiết về tỷ lệ trúng:
          </p>
          <Table className="w-full mx-auto mb-6">
            <Table.Head>
              <span>Voucher</span>
              <span>Tỷ lệ trúng (%)</span>
            </Table.Head>
            <Table.Body>
              {normalizedSpinOptions.map((option, index) => (
                <Table.Row key={index}>
                  <span>
                    {option.voucher
                      ? `${option.voucher.code} (${
                          option.voucher.discountType === 'percentage'
                            ? `${option.voucher.discountValue}%`
                            : `${option.voucher.discountValue.toLocaleString('vi-VN')}đ`
                        })`
                      : 'Không trúng'}
                  </span>
                  <span>{option.probability.toFixed(2)}%</span>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          <div className="text-left text-sm text-gray-600">
            <p className="font-semibold mb-2">Cách tính tỷ lệ trúng:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Giá trị voucher</strong>: Voucher có giá trị cao (≥ 30%
                hoặc ≥ 100,000đ) có tỷ lệ trúng thấp hơn để tăng tính thử thách.
              </li>
              <li>
                <strong>Thời hạn voucher</strong>: Voucher sắp hết hạn (≤ 7
                ngày) có tỷ lệ trúng cao hơn để khuyến khích sử dụng sớm.
              </li>
              <li>
                <strong>Số lượt sử dụng</strong>: Voucher còn ít lượt sử dụng (≤
                10) có tỷ lệ trúng thấp hơn để bảo vệ số lượng.
              </li>
              <li>
                Tất cả tỷ lệ được chuẩn hóa để tổng bằng 100%, đảm bảo công bằng
                cho mọi người chơi.
              </li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Actions className="flex justify-end">
          <Button onClick={closeExplainModal} color="primary" className="">
            Đóng
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default SpinWheel;
