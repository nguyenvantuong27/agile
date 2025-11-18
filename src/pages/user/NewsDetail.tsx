import React, { useState, useMemo } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import LoadingLocal from '~/components/loading/LoadingLocal';
import {
  useGetBlogByIdQuery,
  useGetBlogsQuery,
  useLikeBlogMutation,
  useUnlikeBlogMutation,
  useGetLikesByBlogQuery,
} from '~/services/blog/blog.services';
import {
  useGetCommentsByBlogQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from '~/services/comment-blog/comment_blogs.services';
import { useParams, Link } from 'react-router-dom';
import {
  FaEye,
  FaClock,
  FaTags,
  FaEdit,
  FaTrash,
  FaPaperPlane,
} from 'react-icons/fa';
import { BiLike } from 'react-icons/bi';
import { RootState } from '~/redux/storage/store';
import { useAppSelector } from '~/hooks/HookRouter';
import { Toastify } from '~/helpers/Toastify';
import { NewsItem } from './NewsItem';
import { Button } from 'react-daisyui';
import { IBlogLike } from '~/domain/types/blog_like/blog_like.model';
import { ICommentBlog } from '~/domain/types/comment-blogs/comment_blogs.model';
import { IBlog } from '~/domain/types/blog/blog.model';
import { IUserLogin } from '~/domain/types/user/user.model';

const NewsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: blogs } = useGetBlogsQuery();
  const { data: blog, isLoading, isError } = useGetBlogByIdQuery(id!);
  const [likeBlog] = useLikeBlogMutation();
  const [unlikeBlog] = useUnlikeBlogMutation();
  const { data: likesData, isLoading: likesLoading } = useGetLikesByBlogQuery(
    id!,
  );
  const { data: commentsData, isLoading: commentsLoading } =
    useGetCommentsByBlogQuery(id!);
  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const auth = useAppSelector(
    (state: RootState) => state.auth?.currentUser as IUserLogin | null,
  );
  const userId = auth?._id ?? '';

  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const hasLiked = useMemo(() => {
    return likesData?.data?.some(
      (like: IBlogLike) => like.user_id?._id === userId,
    );
  }, [likesData, userId]);

  const handleLike = async (blogId: string) => {
    if (!userId) {
      Toastify('Vui lòng đăng nhập để thích bài viết!', 300);
      return;
    }
    try {
      const response = await likeBlog({ userId, blogId }).unwrap();
      console.log(response);
      Toastify('Đã thích bài viết!', 200);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleUnlike = async (blogId: string) => {
    if (!userId) {
      Toastify('Vui lòng đăng nhập để bỏ thích bài viết!', 300);
      return;
    }
    try {
      const response = await unlikeBlog({ userId, blogId }).unwrap();
      console.log(response);
      Toastify('Đã bỏ thích bài viết!', 200);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleCreateComment = async () => {
    if (!userId) {
      Toastify('Vui lòng đăng nhập để bình luận!', 300);
      return;
    }
    if (!newComment.trim()) {
      Toastify('Vui lòng nhập nội dung bình luận!', 300);
      return;
    }

    try {
      await createComment({
        blog_id: id!,
        user_id: userId,
        content: newComment,
      }).unwrap();
      setNewComment('');
      Toastify('Bình luận đã được thêm!', 300);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditedContent(currentContent);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editedContent.trim()) {
      Toastify('Vui lòng nhập nội dung bình luận!', 300);
      return;
    }

    try {
      await updateComment({
        id: commentId,
        data: { content: editedContent, blog_id: id!, user_id: userId },
      }).unwrap();
      setEditingCommentId(null);
      Toastify('Bình luận đã được cập nhật!', 300);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId).unwrap();
      Toastify('Bình luận đã được xóa!', 200);
    } catch (error) {
      const errorMessage =
        (error as { data?: { message?: string } })?.data?.message ||
        'Đã có lỗi xảy ra!';
      Toastify(errorMessage, 400);
    }
  };

  if (isLoading || commentsLoading) return <LoadingLocal />;
  if (isError)
    return (
      <div className="text-center py-8 text-red-500">
        Đã xảy ra lỗi khi tải dữ liệu
      </div>
    );

  const extraBlogs = blogs?.data
    ? blogs.data
        .filter(
          (b: IBlog) =>
            b._id && b._id !== id && b.category === blog?.data?.category,
        )
        .slice(0, 3)
    : [];

  if (!blog?.data) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không tìm thấy bài viết
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <img
              src={blog.data.image ?? ''}
              alt={blog.data.title}
              className="w-full h-96 object-cover"
            />
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm inline-block">
                  {blog.data.category}
                </div>
                <div>
                  {Array.isArray(blog.data.tags) &&
                    blog.data.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <FaTags className="text-black" />
                        {blog.data.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-white px-2 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                {blog.data.title}
              </h1>
              <div className="flex items-center text-sm text-gray-600 mb-6">
                <Link
                  to={`/user-detail/${
                    typeof blog.data.author === 'object'
                      ? (blog.data.author?._id ?? '')
                      : ''
                  }`}
                  className="flex items-center"
                >
                  <img
                    src={
                      typeof blog.data.author === 'object'
                        ? (blog.data.author?.image ?? '')
                        : (blog.data.authorPic ?? '')
                    }
                    alt={
                      typeof blog.data.author === 'object'
                        ? (blog.data.author?.full_name ?? '')
                        : ''
                    }
                    className="w-10 h-10 rounded-full mr-3"
                  />
                </Link>
                <div>
                  <span className="font-semibold">
                    {typeof blog.data.author === 'object'
                      ? (blog.data.author?.full_name ?? 'Unknown')
                      : 'Unknown'}
                  </span>
                  <div className="flex gap-4 mt-1">
                    <span className="flex items-center">
                      <FaClock className="mr-1" /> {blog.data.reading_time} đọc
                    </span>
                    <span className="flex items-center">
                      <FaEye className="mr-1" /> {blog.data.viewCount ?? 0}
                    </span>
                    <button
                      onClick={() =>
                        hasLiked
                          ? handleUnlike(blog.data?._id ?? '')
                          : handleLike(blog.data?._id ?? '')
                      }
                      className={`flex items-center ${
                        hasLiked ? 'text-red-600' : 'hover:text-blue-600'
                      }`}
                      disabled={!userId || !blog.data?._id}
                    >
                      <BiLike className="mr-1" /> {blog.data.likeCount ?? 0}{' '}
                      {hasLiked ? '(Unlike)' : '(Like)'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {blog.data.content}
              </div>
              {likesLoading ? (
                <p>Đang tải danh sách người like...</p>
              ) : (
                (likesData?.data?.length ?? 0) > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Người đã thích ({likesData?.totalLikes ?? 0}):
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {likesData?.data?.map((like: IBlogLike) => (
                        <Link
                          key={like._id}
                          to={`/user-detail/${like.user_id?._id ?? ''}`}
                          className="flex items-center hover:opacity-80 transition"
                        >
                          <img
                            src={
                              like.user_id?.image ??
                              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQE3ZDzDMCVd3SLoMtv7olOIa6qsDCczvngSA&s'
                            }
                            alt={like.user_id?.full_name ?? 'User'}
                            className="w-8 h-8 rounded-full object-cover mr-2"
                            title={like.user_id?.full_name ?? 'Ẩn danh'}
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              )}
              <div className="mt-6 flex gap-2 items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Ngày đăng bài:
                </h3>
                <p className="text-gray-600">
                  {blog.data.createdAt
                    ? new Date(blog.data.createdAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Bình luận ({commentsData?.data?.length ?? 0})
            </h2>
            {(commentsData?.data?.length ?? 0) > 0 ? (
              <div className="space-y-4">
                {commentsData?.data?.map((comment: ICommentBlog) => (
                  <div
                    key={comment._id}
                    className="bg-white p-4 rounded-lg flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/user-detail/${
                            typeof comment.user_id === 'object'
                              ? (comment.user_id?._id ?? '')
                              : ''
                          }`}
                        >
                          <img
                            src={
                              typeof comment.user_id === 'object'
                                ? (comment.user_id?.image ??
                                  'https://via.placeholder.com/150')
                                : 'https://via.placeholder.com/150'
                            }
                            alt={
                              typeof comment.user_id === 'object'
                                ? (comment.user_id?.full_name ?? 'User')
                                : 'User'
                            }
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </Link>
                        <div>
                          <span className="font-semibold text-gray-800">
                            {typeof comment.user_id === 'object'
                              ? (comment.user_id?.full_name ?? 'Unknown')
                              : 'Unknown'}
                          </span>
                          <p className="text-gray-500 text-sm">
                            {comment.createdAt
                              ? new Date(comment.createdAt).toLocaleString()
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {typeof comment.user_id === 'object' &&
                        userId === comment.user_id?._id && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="ghost"
                              onClick={() =>
                                handleEditComment(
                                  comment._id ?? '',
                                  comment.content,
                                )
                              }
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              color="ghost"
                              onClick={() =>
                                handleDeleteComment(comment._id ?? '')
                              }
                              className="text-red-600 hover:bg-red-100"
                              disabled={isDeleting}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        )}
                    </div>
                    {editingCommentId === comment._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            onClick={() =>
                              handleUpdateComment(comment._id ?? '')
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Đang lưu...' : 'Lưu'}
                          </Button>
                          <Button
                            size="sm"
                            color="ghost"
                            onClick={() => setEditingCommentId(null)}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-2">{comment.content}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            )}
            {userId && (
              <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleCreateComment}
                  color="primary"
                  className="mt-2 flex items-center gap-2"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <FaPaperPlane /> Gửi bình luận
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {extraBlogs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Bài viết liên quan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {extraBlogs.map((blog: IBlog) => (
                  <NewsItem key={blog._id} blog={blog} onLike={handleLike} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NewsDetail;
