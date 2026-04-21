import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] p-2 md:p-4">
      {/* Outer dark padding -> inner light rounded container */}
      <div className="app-frame flex flex-col relative w-full h-full max-w-[1400px] mx-auto">
        <Navbar />
        <main className="flex-1 w-full pt-20 px-4 md:px-8 pb-10">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
