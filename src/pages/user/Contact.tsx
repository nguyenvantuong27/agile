import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import 'react-toastify/dist/ReactToastify.css';
import img_contact from '../../assets/img_contact/img_contact.png';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useCreateContactMutation } from '~/services/contacts/contact.services';
import { IContact } from '~/domain/types/contact/contact.model';
import { Toastify } from '~/helpers/Toastify';

const Contact: React.FC = () => {
  const [createContact, { isLoading }] = useCreateContactMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IContact>({
    defaultValues: {
      name: '',
      email: '',
      content: '',
    },
  });

  const onSubmit: SubmitHandler<IContact> = async (data) => {
    try {
      const contactData: IContact = {
        name: data.name,
        email: data.email,
        content: data.content,
      };

      await createContact(contactData).unwrap();
      reset();
      Toastify('Tin nhắn của bạn đã được gửi thành công!', 200);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  return (
    <div className="font-roboto min-h-screen">
      <Header />
      <section className="bg-gradient-to-r from-red-600 to-black text-white py-16">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Chúng tôi rất mong nhận được ý kiến đóng góp của bạn để cải thiện
            dịch vụ mỗi ngày!
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Gửi Tin Nhắn Cho Chúng Tôi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="font-bold text-gray-700">Địa chỉ</p>
                  <p className="text-gray-600">
                    123 Đường Lê Lợi, TP. Hồ Chí Minh
                  </p>
                </div>
                <div>
                  <p className="font-bold text-gray-700">Số điện thoại</p>
                  <p className="text-gray-600">0123 456 789</p>
                </div>
                <div>
                  <p className="font-bold text-gray-700">Email</p>
                  <p className="text-gray-600">sink@gmail.com</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Tên của bạn
                  </label>
                  <input
                    className={`w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="Vui lòng nhập tên tài khoản"
                    type="text"
                    {...register('name', {
                      required: 'Tên không được để trống',
                      minLength: {
                        value: 2,
                        message: 'Tên phải có ít nhất 2 ký tự',
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email của bạn
                  </label>
                  <input
                    className={`w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                    placeholder="Vui lòng nhập email"
                    type="email"
                    {...register('email', {
                      required: 'Email không được để trống',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email không hợp lệ',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nội dung
                  </label>
                  <textarea
                    className={`w-full border border-gray-300 p-3 rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                      errors.content ? 'border-red-500' : ''
                    }`}
                    placeholder="Nội dung ý kiến của bạn"
                    {...register('content', {
                      required: 'Nội dung không được để trống',
                      minLength: {
                        value: 10,
                        message: 'Nội dung phải có ít nhất 10 ký tự',
                      },
                    })}
                  ></textarea>
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition duration-300 disabled:bg-gray-400"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi Liên Hệ'}
                </button>
              </form>

              <p className="text-center text-gray-600 mt-6 text-sm">
                Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ. Cảm ơn bạn đã đóng
                góp ý kiến!
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <img
                  alt="A red card with a white snake logo and the text 's-Ink'"
                  className="rounded-lg shadow-md max-w-full h-auto"
                  src={img_contact}
                />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Vị trí của chúng tôi
                </h3>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.669576!2d106.698!3d10.775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f747e0e9%3A0x25e8e8e8e8e8e8e8!2sHo%20Chi%20Minh%20City!5e0!3m2!1sen!2s!4v1634567890123!5m2!1sen!2s"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
