import React from 'react';
import LoadingLocal from '~/components/loading/LoadingLocal';
import { useGetBlogByIdQuery } from '~/services/blog/blog.services';
import { useParams } from 'react-router-dom';
import { FaClock, FaEye, FaHeart, FaTags } from 'react-icons/fa';

const BlogDetailManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: blog, isLoading, isError } = useGetBlogByIdQuery(id!);

  if (isLoading) {
    return <LoadingLocal />;
  }

  if (isError || !blog?.data) {
    return (
      <div className="text-center py-12 text-red-500 text-lg">
        Đã xảy ra lỗi khi tải dữ liệu hoặc bài viết không tồn tại
      </div>
    );
  }

  const blogData = blog.data;

  return (
    <div className=" min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="relative">
            <img
              src={blogData.image || 'https://via.placeholder.com/800x400'}
              alt={blogData.title}
              className="w-full h-96 object-cover"
            />
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {blogData.category}
            </div>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              {blogData.title}
            </h1>

            <div className="flex items-center flex-wrap gap-4 text-gray-600 mb-6">
              <div className="flex items-center">
                <img
                  src={
                    typeof blogData.author === 'object'
                      ? blogData.author.image
                      : blogData.authorPic || 'https://via.placeholder.com/40'
                  }
                  alt={
                    typeof blogData.author === 'object'
                      ? blogData.author.full_name
                      : 'Author'
                  }
                  className="w-10 h-10 rounded-full mr-3 border-2 border-gray-200"
                />
                <span className="font-semibold">
                  {typeof blogData.author === 'object'
                    ? blogData.author.full_name
                    : 'Unknown Author'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center">
                  <FaClock className="mr-1" /> {blogData.reading_time || 'N/A'}
                </span>
                <span className="flex items-center">
                  <FaEye className="mr-1" /> {blogData.viewCount || 0}
                </span>
                <span className="flex items-center">
                  <FaHeart className="mr-1" /> {blogData.likeCount || 0}
                </span>
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              Ngày đăng:{' '}
              {new Date(blogData.published_date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
              {blogData.updatedAt && (
                <span className="ml-4">
                  • Cập nhật:{' '}
                  {new Date(blogData.updatedAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            {Array.isArray(blogData.tags) && blogData.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <FaTags className="text-gray-600" />
                {blogData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {blogData.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Thông Tin Bổ Sung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">ID Bài viết:</span>{' '}
                  {blogData._id}
                </div>
                <div>
                  <span className="font-medium">Ngày tạo:</span>{' '}
                  {new Date(
                    blogData.createdAt || blogData.published_date,
                  ).toLocaleString('vi-VN')}
                </div>
                {blogData.updatedAt && (
                  <div>
                    <span className="font-medium">Ngày cập nhật:</span>{' '}
                    {new Date(blogData.updatedAt).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailManagement;
