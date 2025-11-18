import React from 'react';
import Nav from './Nav';
import Header from '~/components/header/Header';
import Footer from '~/components/footer/Footer';
import { useAppSelector } from '~/hooks/HookRouter';
import { RootState } from '~/redux/storage/store';
import { usePatchUserMutation } from '~/services/users/user.services';
import { useNavigate } from 'react-router-dom';
import { Toastify } from '~/helpers/Toastify';
import { IUser } from '~/domain/types/user/user.model';
import { Button, Input } from 'react-daisyui';
import { useForm } from 'react-hook-form';

const Edit_account: React.FC<object> = () => {
  const [patchUser, { isLoading: isUpdatingProfile }] = usePatchUserMutation();
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);

  const navigate = useNavigate();

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<Partial<IUser>>({
    defaultValues: {
      full_name: auth?.full_name,
      email: auth?.email,
      phone: auth?.phone,
      sex: auth?.sex,
      image: auth?.image,
    },
  });

  const onProfileSubmit = async (data: Partial<IUser>) => {
    if (!auth?._id) return;
    try {
      await patchUser({ id: auth._id, data }).unwrap();
      Toastify('Cập nhật thông tin cá nhân thành công', 200);
      navigate('/account');
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  return (
    <div>
      <Header></Header>
      <div className="flex">
        <Nav></Nav>
        <div className="px-14 py-6 w-full">
          <div className="h-50 shadow-[0.5px_0_4px_rgba(0,0,0,0.1)] mb-6 px-10">
            <div className="py-4">
              <div className="font-bold text-lg">
                Cập nhật thông tin cá nhân
              </div>

              <form
                onSubmit={handleSubmitProfile(onProfileSubmit)}
                className="space-y-4"
              >
                <div className="flex justify-between ">
                  <div className="w-full pr-6">
                    <label className="label">Họ và tên</label>
                    <Input
                      {...registerProfile('full_name', {
                        required: 'Vui lòng nhập họ và tên',
                      })}
                      className="w-full"
                      placeholder="Nhập họ và tên"
                      disabled={isUpdatingProfile}
                    />
                    {profileErrors.full_name && (
                      <p className="text-red-500 text-sm">
                        {profileErrors.full_name.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full pl-6">
                    <label className="label">Email</label>
                    <Input
                      {...registerProfile('email', {
                        required: 'Vui lòng nhập email',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Email không hợp lệ',
                        },
                      })}
                      className="w-full"
                      placeholder="Nhập email"
                      disabled={isUpdatingProfile}
                    />
                    {profileErrors.email && (
                      <p className="text-red-500 text-sm">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between ">
                  <div className="w-full pr-6">
                    <label className="label">Số điện thoại</label>
                    <Input
                      {...registerProfile('phone', {
                        required: 'Vui lòng nhập số điện thoại',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Số điện thoại phải là 10 chữ số',
                        },
                      })}
                      className="w-full"
                      placeholder="Nhập số điện thoại"
                      disabled={isUpdatingProfile}
                    />
                    {profileErrors.phone && (
                      <p className="text-red-500 text-sm">
                        {profileErrors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="w-full pl-6">
                    <label className="label">Giới tính</label>
                    <select
                      {...registerProfile('sex', {
                        required: 'Vui lòng chọn giới tính',
                      })}
                      className="select select-bordered w-full"
                      disabled={isUpdatingProfile}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value={0}>Nam</option>
                      <option value={1}>Nữ</option>
                    </select>
                    {profileErrors.sex && (
                      <p className="text-red-500 text-sm">
                        {profileErrors.sex.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label">Link ảnh đại diện</label>
                  <Input
                    type="text"
                    {...registerProfile('image', {
                      pattern: {
                        value: /^https?:\/\/.+$/i,
                        message: 'Vui lòng nhập URL hợp lệ',
                      },
                    })}
                    className="w-full"
                    placeholder="Nhập URL ảnh đại diện (https://...)"
                    disabled={isUpdatingProfile}
                  />
                  {profileErrors.image && (
                    <p className="text-red-500 text-sm">
                      {profileErrors.image.message}
                    </p>
                  )}
                  {auth?.image && (
                    <div className="mt-2">
                      <img
                        src={auth.image}
                        alt="Current Avatar"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? 'Đang xử lý...' : 'Cập nhật'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Edit_account;
