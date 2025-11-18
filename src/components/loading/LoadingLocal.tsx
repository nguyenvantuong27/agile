import HashLoader from 'react-spinners/HashLoader';

const LoadingLocal: React.FC<object> = () => {
  return (
    <div className="flex items-center justify-center min-h-screen fixed top-0 left-0 right-0 bottom-0 bg-white z-[9999]">
      <HashLoader size={80} loading color="#F20231" />
    </div>
  );
};

export default LoadingLocal;
