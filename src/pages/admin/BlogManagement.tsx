import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { Button, Modal } from 'react-daisyui';
import { Toastify } from '~/helpers/Toastify';
import LoadingLocal from '~/components/loading/LoadingLocal';
import {
  useGetBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} from '~/services/blog/blog.services';
import { IBlog } from '~/domain/types/blog/blog.model';
import { RootState } from '~/redux/storage/store';
import { useAppSelector } from '~/hooks/HookRouter';
import { Link } from 'react-router-dom';

const BlogManagement: React.FC = () => {
  const auth = useAppSelector((state: RootState) => state.auth.currentUser);
  const { data: blogs, isLoading, refetch } = useGetBlogsQuery();
  const [createBlog, { isLoading: isCreateBlog }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdateBlog }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [selectedBlog, setSelectedBlog] = useState<IBlog | null>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IBlog>({
    defaultValues: {
      reading_time: '5 phút',
    },
  });

  const handleEditBlog = (blog: IBlog) => {
    setSelectedBlog(blog);
    setValue('title', blog.title);
    setValue('content', blog.content);
    setValue('category', blog.category);
    setValue('image', blog.image);
    setValue('tags', blog.tags);
    setValue('reading_time', blog.reading_time);
    setShowModal(true);
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        await deleteBlog(id).unwrap();
        Toastify('Xóa bài viết thành công', 201);
        refetch();
      } catch (error) {
        const errorMessage =
          (error as { data?: { message?: string } })?.data?.message ||
          'Đã có lỗi xảy ra!';
        Toastify(errorMessage, 400);
      }
    }
  };

  const onSubmit = async (formData: IBlog) => {
    try {
      const publishDate = new Date().toISOString();
      const data: IBlog = {
        ...formData,
        published_date: publishDate,
        reading_time: formData.reading_time || '5 phút',
        author: auth?._id || '',
        authorPic: auth?.image || '',
        tags:
          typeof formData.tags === 'string'
            ? formData.tags.split(',').map((tag: string) => tag.trim())
            : formData.tags || [],
      };

      if (selectedBlog) {
        await updateBlog({ id: selectedBlog._id!, data }).unwrap();
        Toastify('Cập nhật bài viết thành công', 201);
      } else {
        await createBlog(data).unwrap();
        Toastify('Thêm bài viết thành công', 201);
      }
      reset();
      setShowModal(false);
      setSelectedBlog(null);
      refetch();
    } catch {
      Toastify('Có lỗi xảy ra, vui lòng thử lại', 400);
    }
  };

  if (isLoading) return <LoadingLocal />;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quản Lý Bài Viết</h1>
          <Button
            color="primary"
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedBlog(null);
              reset();
              setShowModal(true);
            }}
          >
            <FaPlus /> Thêm Bài Viết
          </Button>
        </div>

        {blogs?.data?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.data.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold line-clamp-1 text-gray-800">
                    {blog.title}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      Tác giả:{' '}
                      {typeof blog.author === 'object'
                        ? blog.author.full_name
                        : ''}
                    </p>
                    <p>
                      Ngày đăng:{' '}
                      {new Date(blog.published_date).toLocaleDateString()}
                    </p>
                    <p>Danh mục: {blog.category}</p>
                    <p className="line-clamp-2">Nội dung: {blog.content}</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span>Lượt xem: {blog.viewCount}</span> •{' '}
                      <span>Lượt thích: {blog.likeCount}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 ">
                    <Button
                      size="sm"
                      color="success"
                      onClick={() => handleEditBlog(blog)}
                      className="flex items-center gap-1 text-white"
                    >
                      <FaEdit /> Sửa
                    </Button>
                    <Button
                      size="sm"
                      color="error"
                      onClick={() => handleDeleteBlog(blog._id!)}
                      className="flex items-center gap-1 text-white"
                    >
                      <FaTrash /> Xóa
                    </Button>
                    <Link
                      to={`/admin/blog-management/${blog._id}`}
                      className="btn btn-sm btn-warning flex items-center gap-1 text-white"
                    >
                      <FaEye /> Xem
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg py-12">
            Không tìm thấy bài viết nào
          </p>
        )}

        {showModal && (
          <Modal open={showModal}>
            <Modal.Header className="text-xl font-bold text-gray-800 mb-4">
              {selectedBlog ? 'Chỉnh Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
            </Modal.Header>
            <Modal.Body>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('title', { required: 'Tiêu đề là bắt buộc' })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề bài viết"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hình ảnh <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('image', { required: 'Hình ảnh là bắt buộc' })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="URL hình ảnh"
                  />
                  {errors.image && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.image.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category', {
                      required: 'Danh mục là bắt buộc',
                    })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="Sức khỏe">Sức khỏe</option>
                    <option value="Thời trang">Thời trang</option>
                    <option value="Công nghệ">Công nghệ</option>
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian đọc
                  </label>
                  <input
                    {...register('reading_time')}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ví dụ: 5 phút"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (phân cách bằng dấu phẩy){' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('tags', { required: 'Tags là bắt buộc' })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                  {errors.tags && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.tags.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('content', {
                      required: 'Nội dung là bắt buộc',
                    })}
                    className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập nội dung bài viết"
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.content.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={() => setShowModal(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isCreateBlog || isUpdateBlog}
                    className="flex items-center gap-2"
                  >
                    {isCreateBlog || isUpdateBlog
                      ? 'Đang xử lý...'
                      : selectedBlog
                        ? 'Cập nhật'
                        : 'Thêm'}
                  </Button>
                </div>
              </form>
            </Modal.Body>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
