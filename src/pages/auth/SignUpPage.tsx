import React, { useState } from 'react';
import { Button, Input, Select } from 'react-daisyui';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { LabelForm, ServiceForm } from '~/components/auth';
import { gioitinh, role } from '~/constants';
import {
  useRegisterMutation,
  useVerifyCodeMutation,
} from '~/services/auth/auth.services';
import { useGetBranchesQuery } from '~/services/branches/branches.services';
import { IBranch } from '~/domain/types/branches/branches.model';
import { IUser } from '~/domain/types/user/user.model';
import { Toastify } from '~/helpers/Toastify';
import { isIErrorResponse } from '~/interfaces/types/error/error';
import { Logo } from '~/assets/images';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [registers] = useRegisterMutation();
  const [verifyCode] = useVerifyCodeMutation();
  const { data } = useGetBranchesQuery();
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IUser>();

  const onSubmit: SubmitHandler<IUser> = async function (formData) {
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('full_name', formData.full_name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('password', formData.password);
      data.append('branch_id', formData.branch_id.toString());
      data.append('sex', formData.sex.toString());
      data.append('role', formData.role);
      data.append('status', formData.status.toString());
      if (formData.image && formData.image[0]) {
        data.append('image', formData.image[0]);
      }

      const result = await registers(data).unwrap();
      console.log('Register response:', result);

      const id = result.data?._id || result.data?.userId;
      if (id) {
        setUserId(id);
        Toastify(
          'Đăng ký thành công. Vui lòng kiểm tra email để nhập mã xác nhận.',
          201,
        );
      } else {
        Toastify(
          'Đăng ký thất bại: Không nhận được ID người dùng từ server.',
          400,
        );
      }
    } catch (error: unknown) {
      const errorMessage = isIErrorResponse(error)
        ? error.data?.message
        : 'Đã xảy ra lỗi không xác định';
      Toastify(`Đăng ký tài khoản thất bại: ${errorMessage}`, 400);
      console.error('Register error:', error); // Debug lỗi
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
      console.log('VerifyCode response:', result);
      Toastify(result.message, 200);
      navigate('/auth/login');
    } catch {
      Toastify('Xác nhận mã thất bại', 400);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[390px] flex-col gap-[48px] p-[32px] sm:max-w-[504px]">
      <div className="mx-auto flex flex-col items-center gap-[16px] sm:mx-0 sm:max-w-full sm:gap-[28px]">
        <div className="flex items-center justify-center gap-4">
          <img width={160} src={Logo} alt="" />
        </div>
        <p className="block text-[16px] font-[400] leading-[25.6px] sm:hidden">
          Đăng kí tài khoản nhân viên
        </p>
      </div>
      <div className="mx-0 flex w-full min-w-0 flex-col gap-[24px] sm:mx-auto sm:max-w-[388px] sm:gap-[48px]">
        {!userId ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex w-full flex-col gap-[24px]">
              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Nhập tên đăng nhập" />
                <Input
                  type="text"
                  {...register('username', {
                    required: 'Tên đăng nhập không được để trống',
                  })}
                  placeholder="Nhập tên đăng nhập"
                  name="username"
                />
                {errors?.username && (
                  <div className="text-[#e53e3e]">
                    {errors?.username?.message}
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Nhập họ và tên" />
                <Input
                  type="text"
                  {...register('full_name', {
                    required: 'Họ và tên không được để trống',
                  })}
                  placeholder="Nhập họ và tên"
                  name="full_name"
                />
                {errors?.full_name && (
                  <div className="text-[#e53e3e]">
                    {errors?.full_name?.message}
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Nhập email" />
                <Input
                  type="email"
                  {...register('email', {
                    required: 'Email không được để trống',
                  })}
                  placeholder="Nhập email"
                  name="email"
                />
                {errors?.email && (
                  <div className="text-[#e53e3e]">{errors?.email?.message}</div>
                )}
              </div>

              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Nhập số điện thoại" />
                <Input
                  type="text"
                  {...register('phone', {
                    required: 'Số điện thoại không được để trống',
                  })}
                  placeholder="Nhập số điện thoại"
                  name="phone"
                />
                {errors?.phone && (
                  <div className="text-[#e53e3e]">{errors?.phone?.message}</div>
                )}
              </div>

              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Nhập mật khẩu" />
                <Input
                  type="password"
                  {...register('password', {
                    required: 'Mật khẩu không được để trống',
                  })}
                  placeholder="Nhập mật khẩu"
                  name="password"
                />
                {errors?.password && (
                  <div className="text-[#e53e3e]">
                    {errors?.password?.message}
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Chọn chi nhánh làm việc" />
                <Select
                  {...register('branch_id', {
                    required: 'Chi nhánh không được bỏ trống',
                  })}
                >
                  <option hidden defaultValue="" value="">
                    Chọn chi nhánh làm việc
                  </option>
                  {data ? (
                    data.data.map((e: IBranch, index: number) => (
                      <option value={e._id} key={index}>
                        {e.name} - {e.address}
                      </option>
                    ))
                  ) : (
                    <option hidden defaultValue="" value="">
                      Hiện tại không có
                    </option>
                  )}
                </Select>
                {errors?.branch_id && (
                  <div className="text-[#e53e3e]">
                    {errors?.branch_id?.message}
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Chọn giới tính" />
                <Select
                  {...register('sex', {
                    required: 'Giới tính không được bỏ trống',
                  })}
                >
                  <option hidden defaultValue="" value="">
                    Chọn giới tính
                  </option>
                  {gioitinh.map((e, index: number) => (
                    <option key={index} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </Select>
                {errors?.sex && (
                  <div className="text-[#e53e3e]">{errors?.sex?.message}</div>
                )}
              </div>

              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Chọn vai trò" />
                <Select
                  {...register('role', {
                    required: 'Vai trò không được bỏ trống',
                  })}
                  defaultValue=""
                >
                  <option hidden value="">
                    Chọn vai trò
                  </option>
                  {role.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name === 'employee' ? 'Nhân viên' : e.name}
                    </option>
                  ))}
                </Select>
                {errors?.role && (
                  <div className="text-[#e53e3e]">{errors?.role?.message}</div>
                )}
              </div>

              <input type="hidden" {...register('status')} value={0} />

              <div className="flex w-full flex-col gap-[8px]">
                <LabelForm title="Chọn ảnh đại diện" />
                <Input
                  type="file"
                  {...register('image', {
                    required: 'Ảnh đại diện không được để trống',
                  })}
                  name="image"
                  className="p-[7px]"
                />
                {errors?.image && (
                  <div className="text-[#e53e3e]">{errors?.image?.message}</div>
                )}
              </div>

              <Button type="submit" color="primary" className="text-white">
                Đăng ký
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex w-full flex-col gap-[24px]">
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
        )}

        <ServiceForm />
        <p className="text-center leading-[28.8px] md:text-xl">
          Bạn đã có tài khoản{' '}
          <Link className="text-primary" to="/auth/login">
            Đăng nhập
          </Link>{' '}
          hoặc
          <Link className="text-primary" to="/">
            {' '}
            Quay lại
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
