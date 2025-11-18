// src/pages/CauHinhWebsite.tsx
import {
  FaImage,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaPhotoVideo,
} from 'react-icons/fa';
import { useState } from 'react';

const CauHinhWebsite = () => {
  const [canLeTuDong, setCanLeTuDong] = useState(true);
  const [tuDongXoa, setTuDongXoa] = useState(false);
  const [tuyChon1, setTuyChon1] = useState(false);
  const [tuyChon2, setTuyChon2] = useState(false);

  const handleSave = () => {
    alert('Đã lưu thay đổi cấu hình!');
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-semibold mb-2">Cài đặt</h1>
        <p className="text-gray-500 mb-8">Cấu hình thông báo</p>

        <div className="grid grid-cols-5 gap-10">
          {/* Sidebar trái */}
          <div className="col-span-1 text-sm space-y-6">
            <div className="font-semibold text-gray-900">Tài khoản</div>
            <ul className="space-y-2 text-blue-600">
              <li className="font-bold">Mục đang chọn</li>
              <li>Tài khoản Google</li>
            </ul>

            <div className="font-semibold text-gray-900 mt-6">Thay đổi</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <FaImage className="text-primary" /> LOGO
              </li>
              <li className="flex items-center gap-2">
                <FaPhotoVideo className="text-primary" /> BANNER
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-primary" /> MAIL
              </li>
              <li className="flex items-center gap-2">
                <FaPhoneAlt className="text-primary" /> SĐT
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-primary" /> ĐỊA CHỈ
              </li>
            </ul>

            <div className="font-semibold text-gray-900 mt-6">Tùy chọn</div>
            <ul className="space-y-2">
              <li>Giao diện người dùng</li>
              <li>Email nhắc lịch</li>
            </ul>

            <div className="font-semibold text-gray-900 mt-6">Bảo mật</div>
            <ul className="space-y-2">
              <li>Đổi mật khẩu</li>
              <li>Xác minh đăng nhập</li>
              <li>Thiết bị</li>
            </ul>
          </div>

          {/* Nội dung bên phải */}
          <div className="col-span-4">
            <h2 className="text-lg font-semibold mb-2">CÀI ĐẶT CHÍNH</h2>
            <div className="space-y-4 mb-6">
              <DongCaiDat
                tieuDe="Tùy chọn bị tắt"
                moTa="Mô tả tại đây về chức năng"
                trangThai={tuyChon1}
                onChange={setTuyChon1}
              />
              <DongCaiDat
                tieuDe="Căn lề văn bản tự động"
                moTa="Tính năng thử nghiệm không quan trọng"
                trangThai={canLeTuDong}
                onChange={setCanLeTuDong}
              />
            </div>

            <h2 className="text-lg font-semibold mb-2">TÙY CHỌN PHỤ</h2>
            <div className="space-y-4">
              <DongCaiDat
                tieuDe="Tùy chọn bị tắt"
                moTa="Đây là nội dung được chọn"
                trangThai={tuyChon2}
                onChange={setTuyChon2}
              />
              <DongCaiDat
                tieuDe="Tự động xóa dữ liệu"
                moTa="Xóa dữ liệu rác và làm việc tiếp"
                trangThai={tuDongXoa}
                onChange={setTuDongXoa}
              />
            </div>

            <button
              className="mt-10 w-full bg-green-600 text-white py-3 rounded-lg text-lg hover:bg-green-700 transition"
              onClick={handleSave}
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Thành phần dòng cài đặt
type DongCaiDatProps = {
  tieuDe: string;
  moTa: string;
  trangThai: boolean;
  onChange: (value: boolean) => void;
};

const DongCaiDat = ({ tieuDe, moTa, trangThai, onChange }: DongCaiDatProps) => (
  <div
    className={`p-4 border rounded-xl flex items-center justify-between ${trangThai ? 'bg-green-50' : 'bg-gray-50'}`}
  >
    <div>
      <p className="font-medium">{tieuDe}</p>
      <p className="text-sm text-gray-500">{moTa}</p>
    </div>
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={trangThai}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-200 peer-checked:bg-green-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-green-400 transition duration-300"></div>
    </label>
  </div>
);

export default CauHinhWebsite;
