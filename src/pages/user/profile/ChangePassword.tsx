import React, { useState } from 'react';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { Toastify } from '~/helpers/Toastify';
import Header from '~/components/header/Header';
import Footer from '~/components/footer/Footer';
import { Button } from 'react-daisyui';
import { useChangePasswordMutation } from '~/services/auth/auth.services';

const ChangePassword: React.FC = () => {
  // Gọi tất cả các hook ở cấp cao nhất
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  if (!auth) {
    return null;
  }

  console.log('auth', auth._id);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      Toastify('Mật khẩu mới và mật khẩu nhập lại không khớp!', 303);
      return;
    }
    if (!oldPassword || !newPassword) {
      Toastify('Vui lòng nhập đầy đủ thông tin!', 303);
      return;
    }

    try {
      const response = await changePassword({
        oldPassword,
        newPassword,
      }).unwrap();
      Toastify(response.message, 200);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        <div className="w-full px-6 py-8">
          <div className="w-full max-w-2xl mx-auto bg-white shadow-md rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-3 mb-6">
              Đổi mật khẩu
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mật khẩu cũ
                  </label>
                  <input
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    type="password"
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nhập lại mật khẩu mới
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  color="primary"
                  type="submit"
                  className="px-6 py-2 text-white transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChangePassword;
