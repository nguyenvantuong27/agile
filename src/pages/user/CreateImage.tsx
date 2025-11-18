import React, { useState } from 'react';
import { Button } from 'react-daisyui';
import Header from '~/components/header/Header';

interface ImageData {
  url: string;
  description?: string;
  prompt?: string;
  style?: string;
  origin?: string;
}

const CreateImage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

  // Demo prompts for drink designs
  const demoPrompts = [
    {
      title: 'Sinh tố xoài',
      description: 'sinh tố xoài tươi ngon với kem và lá bạc hà',
    },
    {
      title: 'Cà phê đá',
      description: 'cà phê đen đá trong ly thủy tinh với hạt cà phê xung quanh',
    },
    {
      title: 'Trà sữa trân châu',
      description: 'trà sữa trân châu đen trong cốc nhựa với ống hút to',
    },
    {
      title: 'Nước ép cam',
      description: 'nước ép cam tươi trong ly cao với lát cam trang trí',
    },
    {
      title: 'Milkshake dâu',
      description: 'milkshake dâu tây với kem tươi và quả dâu trên đỉnh',
    },
    {
      title: 'Trà đào',
      description: 'trà đào cam sả với đá viên và lát đào tươi',
    },
    {
      title: 'Coconut Water',
      description: 'nước dừa tươi trong quả dừa với ống hút',
    },
    {
      title: 'Green Tea Latte',
      description: 'trà xanh latte nóng với bọt sữa hình lá',
    },
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Vui lòng nhập mô tả trước khi tạo ảnh!');
      return;
    }

    setLoading(true);
    setImages([]);
    setError('');

    try {
      // Sử dụng Pollinations AI - API miễn phí để tạo ảnh
      const enhancedPrompt = `Professional beverage photography of ${prompt}, high quality, commercial style, appetizing, colorful, well-lit, studio lighting`;

      // Tạo nhiều ảnh với các seed khác nhau để có sự đa dạng
      const seeds = [
        Math.floor(Math.random() * 1000000),
        Math.floor(Math.random() * 1000000),
        Math.floor(Math.random() * 1000000),
        Math.floor(Math.random() * 1000000),
      ];

      const imagePromises = seeds.map((seed) => {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&seed=${seed}&nologo=true`;
        return { url: imageUrl };
      });

      setImages(imagePromises);
    } catch (err) {
      console.error('Lỗi khi tạo ảnh:', err);
      setError('Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.');
    }

    setLoading(false);
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-generated-drink-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearPrompt = () => {
    setPrompt('');
    setError('');
  };

  const handleDemoPromptClick = (demoPrompt: string) => {
    setPrompt(demoPrompt);
    setError('');
  };

  return (
    <div className="">
      <Header />
      <h2 className="text-2xl font-bold text-gray-800 text-center my-6">
        Tạo ảnh đồ uống AI từ mô tả
      </h2>

      <div className="flex flex-col gap-4 px-6 mb-4 container mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ví dụ: sinh tố xoài tươi ngon với kem và lá bạc hà"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="border p-2 flex-1 rounded"
          />
          <Button
            onClick={generateImage}
            color="primary"
            className="text-white"
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo ảnh'}
          </Button>
          <Button
            onClick={clearPrompt}
            color="secondary"
            className="text-white"
            disabled={loading || !prompt}
          >
            Xóa
          </Button>
        </div>

        {/* Demo Prompts Section */}
        <div className="mt-2">
          <h3 className="text-lg font-semibold mb-2">Mẫu gợi ý đồ uống</h3>
          <div className="flex flex-wrap gap-2">
            {demoPrompts.map((demo, index) => (
              <button
                key={index}
                onClick={() => handleDemoPromptClick(demo.description)}
                className="btn btn-sm btn-outline btn-accent"
              >
                {demo.title}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {images.length > 0 && (
          <p className="text-sm text-gray-600">Đã tạo {images.length} ảnh</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 px-6 mx-auto container">
        {images.map((img, index) => (
          <div
            key={index}
            className="relative group border rounded shadow hover:scale-105 transition-transform cursor-pointer"
          >
            <img
              src={img.url}
              alt={`Đồ uống ${index + 1}`}
              onClick={() => setSelectedImage(img)}
              className="w-full h-auto object-cover rounded"
              onError={() => {
                console.log('Lỗi tải ảnh:', img.url);
                setError('Không thể tải một số ảnh');
              }}
            />
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(img.url);
                }}
                className="bg-white text-sm px-2 py-1 rounded shadow"
              >
                ⬇ Tải
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white p-4 rounded shadow max-w-3xl w-full max-h-[90vh] overflow-auto">
            <img
              src={selectedImage.url}
              alt="Xem lớn"
              className="w-full h-auto rounded mb-4"
            />
            {selectedImage.description && (
              <p className="text-sm text-gray-600">
                {selectedImage.description}
              </p>
            )}
            <div className="flex justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(selectedImage.url);
                }}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Tải xuống
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateImage;
