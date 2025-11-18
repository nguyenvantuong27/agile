import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaClock, FaComments } from 'react-icons/fa';
import { BiLike } from 'react-icons/bi';
import { IBlog } from '~/domain/types/blog/blog.model';
import { useGetCommentsByBlogQuery } from '~/services/comment-blog/comment_blogs.services';

interface NewsItemProps {
  blog: IBlog;
  onLike: (blogId: string) => void;
}

export const NewsItem: React.FC<NewsItemProps> = ({ blog, onLike }) => {
  const { data: commentsData, isLoading: commentsLoading } =
    useGetCommentsByBlogQuery(blog._id!);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg line-clamp-1 font-bold text-primary mb-2  transition-colors">
          {blog.title}
        </h3>
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <FaClock className="mr-1" />
          <span>{blog.reading_time} đọc</span>
        </div>
        <div className="text-gray-700 mb-4 line-clamp-2">{blog.content}</div>
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-gray-600">
            <span className="flex items-center">
              <FaEye className="mr-1" /> {blog.viewCount || 0}
            </span>
            <button
              onClick={() => onLike(blog._id!)}
              className="flex items-center hover:text-blue-600"
            >
              <BiLike className="mr-1" /> {blog.likeCount || 0}
            </button>
            <span className="flex items-center">
              <FaComments className="mr-1" />{' '}
              {commentsLoading ? 0 : commentsData?.data?.length || 0}
            </span>
          </div>
          <Link
            to={`/news/${blog._id}`}
            className="text-blue-600 font-semibold hover:underline"
          >
            Đọc thêm →
          </Link>
        </div>
      </div>
    </div>
  );
};
