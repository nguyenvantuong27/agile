import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from 'react-daisyui';
import { useRequestPasswordResetMutation } from '~/services/auth/auth.services';
import { Toastify } from '~/helpers/Toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { Logo } from '~/assets/images';

interface IRequestPasswordResetForm {
  email: string;
}

const RequestPasswordReset: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IRequestPasswordResetForm>();
  const [requestPasswordReset, { isLoading, isSuccess, isError }] =
    useRequestPasswordResetMutation();

  const onSubmit = async (data: IRequestPasswordResetForm) => {
    try {
      await requestPasswordReset(data).unwrap();
      Toastify('Yêu cầu đặt lại mật khẩu đã được gửi', 200);
    } catch {
      Toastify('Yêu cầu đặt lại mật khẩu thất bại, không tìm thấy email', 400);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-[48px] p-[32px] sm:max-w-[504px]">
      <div className="mx-auto flex max-w-[342px] flex-col items-center gap-[16px] sm:mx-0 sm:max-w-full sm:items-start sm:gap-[28px]">
        <div className="flex items-center justify-center gap-4">
          <img width={160} src={Logo} alt="" />
          <h1 className="block text-center text-[24px] font-[600] leading-[24px] text-primary">
            Yêu cầu đặt lại mật khẩu
          </h1>
        </div>
        <p className="text-[16px] font-[400] leading-[25.6px] dark:text-white sm:text-[20px] sm:leading-[32px]">
          Vui lòng nhập email của bạn
        </p>
      </div>
      <div className="mx-0 flex w-full min-w-0 flex-col gap-[24px] sm:mx-auto sm:max-w-[388px] sm:gap-[48px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-full flex-col gap-[24px]">
            <div className="flex w-full flex-col gap-[8px]">
              <label className="text-[14px] font-[600] leading-[20px] text-gray-700">
                Email
              </label>
              <Input
                placeholder="Nhập email của bạn"
                {...register('email', { required: 'Email là bắt buộc' })}
                type="email"
                name="email"
              />
              {errors.email && (
                <div className="text-[#e53e3e]">{errors.email.message}</div>
              )}
            </div>
            <Button
              type="submit"
              color="primary"
              className="text-white"
              disabled={isLoading}
            >
              Gửi yêu cầu đặt lại mật khẩu
            </Button>
          </div>
        </form>
        {isSuccess && (
          <p className="text-center text-[#38a169]">
            Liên kết đặt lại mật khẩu đã được gửi
          </p>
        )}
        {isError && (
          <p className="text-center text-[#e53e3e]">
            Gửi yêu cầu thất bại, vui lòng thử lại
          </p>
        )}
      </div>
      <p className="text-center leading-[28.8px] md:text-xl">
        Đã có tài khoản?{' '}
        <Link className="text-primary" to="/auth/login">
          Đăng nhập tại đây
        </Link>
      </p>
    </div>
  );
};

export default RequestPasswordReset;
