import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Button, Input } from 'react-daisyui';
import { useResetPasswordMutation } from '~/services/auth/auth.services';
import { Toastify } from '~/helpers/Toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Logo } from '~/assets/images';

interface IResetPasswordForm {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IResetPasswordForm>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onSubmit: SubmitHandler<IResetPasswordForm> = async (data) => {
    if (!token) {
      Toastify('Token không hợp lệ hoặc bị thiếu', 400);
      return;
    }

    if (data.password !== data.confirmPassword) {
      Toastify('Mật khẩu không khớp', 400);
      return;
    }

    try {
      await resetPassword({ token, newPassword: data.password }).unwrap();
      Toastify('Đặt lại mật khẩu thành công', 200);
    } catch {
      Toastify('Đặt lại mật khẩu thất bại', 400);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-[48px] p-[32px] sm:max-w-[504px]">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mx-auto flex max-w-[342px] flex-col items-center gap-[16px] sm:mx-0 sm:max-w-full sm:items-start sm:gap-[28px]">
          <div className="flex items-center justify-center gap-4">
            <img width={160} src={Logo} alt="" />
            <h1 className="hidden text-[36px] font-[600] leading-[36px] text-primary sm:block">
              Đặt Lại Mật Khẩu
            </h1>
          </div>
          <h1 className="block text-center text-[24px] font-[600] leading-[24px] text-primary sm:hidden">
            Xin Chào
          </h1>
        </div>
        <div className="mt-10 flex w-full flex-col gap-[24px]">
          <div className="flex w-full flex-col gap-[8px]">
            <label htmlFor="password">Mật Khẩu Mới</label>
            <Input
              placeholder="Nhập mật khẩu mới"
              {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
              type="password"
              name="password"
            />
            {errors.password && (
              <div className="text-[#e53e3e]">{errors.password.message}</div>
            )}
          </div>
          <div className="flex w-full flex-col gap-[8px]">
            <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
            <Input
              placeholder="Xác nhận mật khẩu mới"
              {...register('confirmPassword', {
                required: 'Vui lòng xác nhận mật khẩu',
              })}
              type="password"
              name="confirmPassword"
            />
            {errors.confirmPassword && (
              <div className="text-[#e53e3e]">
                {errors.confirmPassword.message}
              </div>
            )}
          </div>
          <Button
            type="submit"
            color="primary"
            className="text-white"
            disabled={isLoading}
          >
            Đặt Lại Mật Khẩu
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
