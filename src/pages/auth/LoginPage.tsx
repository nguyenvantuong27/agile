import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, Input, Modal } from 'react-daisyui';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LabelForm, ServiceForm } from '~/components/auth/index';
import {
  useLoginMutation,
  useVerifyCodeMutation,
} from '~/services/auth/auth.services';
import { IRequestCredentials } from '~/interfaces/types/auth/auth';
import { Toastify } from '~/helpers/Toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isIErrorResponse } from '~/interfaces/types/error/error';
import { Logo } from '~/assets/images';

const LoginPage: React.FC<object> = () => {
  const [err, setErr] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const [verifyCode] = useVerifyCodeMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IRequestCredentials>();

  const onSubmit: SubmitHandler<IRequestCredentials> = async function (data) {
    const credentials = { username: data.username, password: data.password };
    try {
      const result = await login(credentials).unwrap();
      console.log(result);
      setErr(false);
      Toastify('Đăng nhập thành công', 200);
    } catch (error: unknown) {
      const errorData = isIErrorResponse(error) ? error.data : null;
      const errorMessage = errorData?.message || 'Đã xảy ra lỗi không xác định';

      if (
        errorMessage ===
        'Tài khoản chưa được xác nhận. Vui lòng nhập mã xác nhận từ email.'
      ) {
        const userIdFromError = errorData?.userId || null;
        setUserId(userIdFromError || credentials.username);
        setIsVerifyModalOpen(true);
      } else {
        Toastify(`Đăng nhập thất bại: ${errorMessage}`, 400);
        setErr(true);
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!userId || !verificationCode) {
      Toastify('Vui lòng nhập mã xác nhận', 400);
      return;
    }

    try {
      const result = await verifyCode({
        user_id: userId,
        code: verificationCode,
      }).unwrap();
      Toastify(result.message, 200);
      setIsVerifyModalOpen(false);
    } catch {
      Toastify('Xác nhận mã thất bại', 400);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-[48px] p-[32px] sm:max-w-[504px]">
      <div className="mx-auto flex max-w-[342px] flex-col items-center gap-[16px] sm:mx-0 sm:max-w-full sm:items-start sm:gap-[28px]">
        <div className="flex items-center justify-center gap-4">
          <img width={200} src={Logo} alt="" />
        </div>
        <h1 className="block text-center text-[24px] font-[600] leading-[24px] text-primary sm:hidden">
          Đăng nhập
        </h1>
        <p className="ml-8 text-[16px] font-[400] leading-[25.6px] dark:text-white sm:text-[20px] sm:leading-[32px]">
          Vui lòng đăng nhập để tiếp tục
        </p>
      </div>
      <div className="mx-0 flex w-full min-w-0 flex-col gap-[24px] sm:mx-auto sm:max-w-[388px] sm:gap-[48px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-full flex-col gap-[24px]">
            <div className="flex w-full flex-col gap-[8px]">
              <LabelForm title="Tên đăng nhập" />
              <Input
                placeholder="Nhập tên đăng nhập"
                {...register('username', {
                  required: 'Vui lòng nhập tên đăng nhập',
                })}
                type="text"
                name="username"
              />
              {errors?.username && (
                <div className="text-[#e53e3e]">
                  {errors?.username?.message}
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-[8px]">
              <LabelForm title="Mật khẩu" />
              <Input
                placeholder="Nhập mật khẩu"
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                })}
                type="password"
                name="password"
              />
              {errors?.password && (
                <div className="text-[#e53e3e]">
                  {errors?.password?.message}
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-[8px]">
              {err && (
                <div className="text-[#e53e3e]">
                  Sai tên đăng nhập hoặc mật khẩu
                </div>
              )}
            </div>

            <Link
              className="self-end text-lg leading-[16px] text-primary"
              to="/auth/request-password-reset"
            >
              Quên mật khẩu?
            </Link>
            <Button
              type="submit"
              color="primary"
              className="text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </div>
        </form>
        <ServiceForm />
        <p className="text-center text-xl leading-[28.8px] dark:text-white">
          Bạn chưa có tài khoản?{' '}
          <span
            className="text-primary cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            Đăng ký ngay
          </span>{' '}
          hoặc{' '}
          <NavLink className="text-primary" to="/">
            {' '}
            Quay lại
          </NavLink>
        </p>
      </div>

      {/* Modal chọn loại tài khoản */}
      <Modal open={isModalOpen}>
        <Modal.Header className="text-xl font-bold flex items-center justify-between">
          Chọn loại tài khoản
          <Modal.Actions>
            <Button
              className="bg-primary text-white absolute top-5"
              onClick={() => setIsModalOpen(false)}
            >
              X
            </Button>
          </Modal.Actions>
        </Modal.Header>
        <Modal.Body>
          <div className="">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/login-illustration-download-in-svg-png-gif-file-formats--select-an-account-join-the-forum-password-digital-marketing-pack-business-illustrations-8333958.png?f=webp"
              alt=""
              className="w-full h-60 object-cover my-6"
            />
            <div className="flex gap-4">
              <Button
                color="primary"
                onClick={() => navigate('/auth/register/customer')}
              >
                Đăng ký tài khoản khách hàng
              </Button>
              <Button
                color="success"
                className="text-white"
                onClick={() => navigate('/auth/register')}
              >
                Đăng ký tài khoản nhân viên
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal nhập mã xác nhận */}
      <Modal open={isVerifyModalOpen}>
        <Modal.Header className="text-xl font-bold flex items-center justify-between">
          Xác nhận mã từ email
          <Modal.Actions>
            <Button
              className="bg-primary text-white absolute top-5"
              onClick={() => setIsVerifyModalOpen(false)}
            >
              X
            </Button>
          </Modal.Actions>
        </Modal.Header>
        <Modal.Body>
          <div className="flex flex-col gap-4">
            <LabelForm title="Nhập mã xác nhận từ email" />
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Nhập mã xác nhận"
            />
            <Button
              onClick={handleVerifyCode}
              color="primary"
              className="text-white"
            >
              Xác nhận
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LoginPage;
