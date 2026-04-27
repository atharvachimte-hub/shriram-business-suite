import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex bg-[#f3f4f6] min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-4 md:p-8 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
