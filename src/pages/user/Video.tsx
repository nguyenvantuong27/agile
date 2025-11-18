import React, { useState } from 'react';
import axios from 'axios';
import Header from '~/components/header/Header';
import { Button } from 'react-daisyui';

const Video: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  interface Video {
    thumbnail: string;
    title: string;
    channel: string;
    publishedDate: string;
    link?: string;
  }

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const demoPrompts = [
    {
      title: 'Cách Pha Chế Đồ Uống',
      query: 'cách pha chế cocktail và đồ uống ngon tại nhà',
    },
    {
      title: 'Tìm Quán Bar Uy Tín',
      query: 'quán bar và cafe uy tín ở gần tôi',
    },
    {
      title: 'Chi Phí Đồ Uống',
      query: 'giá đồ uống tại các quán bar cao cấp',
    },
    {
      title: 'Kỹ Thuật Barista',
      query: 'kỹ thuật pha chế cà phê và đồ uống chuyên nghiệp',
    },
    {
      title: 'Công Thức Cocktail',
      query: 'các công thức cocktail phổ biến dễ làm',
    },
  ];

  const extractVideoId = (link: string | undefined): string => {
    if (!link) return '';
    const regex = /(?:v=)([a-zA-Z0-9_-]{11})/;
    const match = link.match(regex);
    return match ? match[1] : '';
  };

  const fetchVideos = async () => {
    if (!searchQuery.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm!');
      return;
    }

    setLoading(true);
    setError('');
    setVideos([]);

    try {
      const response = await axios.get(
        'https://api-tatto-management.vercel.app/api/v1/ai/generate-video',
        {
          params: { query: searchQuery },
        },
      );

      const videoResults = response.data.videos || [];
      if (videoResults.length === 0) {
        setError('Không tìm thấy video nào!');
      } else {
        setVideos(videoResults);
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm video:', err);
      setError('Có lỗi xảy ra khi tìm kiếm video. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchVideos();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setError('');
    setVideos([]);
    setSelectedVideo(null);
  };

  const handleDemoPromptClick = (query: string) => {
    setSearchQuery(query);
    setError('');
  };

  const openVideoModal = (link: string | undefined) => {
    const videoId = extractVideoId(link);
    if (videoId) {
      setSelectedVideo(videoId);
    } else {
      setError('Không thể mở video do liên kết không hợp lệ!');
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto p-6">
        <h2 className="text-center mb-6">Tìm kiếm video YouTube</h2>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập từ khóa (ví dụ: cocktail recipes, barista techniques)"
              className="flex-1 p-2 border rounded"
              disabled={loading}
            />
            <Button
              onClick={fetchVideos}
              color="primary"
              className="text-white"
              disabled={loading}
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
            <Button
              onClick={clearSearch}
              color="secondary"
              className="text-white"
              disabled={loading || !searchQuery}
            >
              Xóa
            </Button>
          </div>

          {/* Demo Prompts Section */}
          <div className="mt-2">
            <h3 className="text-lg font-semibold mb-2">
              Gợi ý tìm kiếm video đồ uống
            </h3>
            <div className="flex flex-wrap gap-2">
              {demoPrompts.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoPromptClick(demo.query)}
                  className="btn btn-sm btn-outline btn-accent"
                >
                  {demo.title}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {videos.length > 0 && !error && (
            <p className="text-sm text-gray-600">
              Tìm thấy {videos.length} video
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-60 object-cover rounded-t-lg"
                onError={(e) =>
                  (e.currentTarget.src = 'https://via.placeholder.com/320x180')
                }
              />
              <div className="p-4">
                <p className="text-sm font-semibold truncate">{video.title}</p>
                <p className="text-xs text-gray-600">{video.channel}</p>
                <p className="text-xs text-gray-500">{video.publishedDate}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => openVideoModal(video.link)}
                    color="primary"
                    className="px-4 py-2 text-white rounded"
                    disabled={!video.link}
                  >
                    Xem video
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="bg-white p-4 rounded-lg max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${selectedVideo}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="flex justify-between mt-4">
                <div className=""></div>
                <Button
                  onClick={() => setSelectedVideo(null)}
                  color="primary"
                  className="text-white"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Video;
