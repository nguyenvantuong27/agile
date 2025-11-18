import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from '../admin/Header';

const ArtistLayout: React.FC = () => {
  return (
    <div className="flex h-screen ">
      <Sidebar />
      {/* Phần nội dung chính */}
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-4 mt-16 ml-64 min-h-screen">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ArtistLayout;
