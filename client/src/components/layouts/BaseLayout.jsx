import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from './shared/Footer';
import Sidebar from './dashboard/Sidebar';
import Header from './dashboard/Header';

const BaseLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Security check
  React.useEffect(() => {
    if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
      console.error(`SECURITY BREACH: ${user.role} accessed admin route: ${location.pathname}`);
    }
  }, [location.pathname, user.role]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <Header collapsed={collapsed} setCollapsed={setCollapsed} />
      {/* Search bar */}
      {searchVisible && (
        <div className="fixed top-14 left-0 right-0 z-40 bg-white shadow p-4 flex items-center border-b border-gray-100">
          {/* Replace SearchOutlined icon with a simple SVG */}
          <svg className="text-gray-500 mr-2" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
            placeholder="Search..."
            autoFocus
            onBlur={() => setSearchVisible(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setSearchVisible(false);
            }}
          />
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 bg-gray-50 min-h-0">
        {/* Sidebar */}
        <aside
          className={`relative z-20 transition-all duration-200 bg-gradient-to-b from-white to-gray-100 shadow-md ${
            collapsed ? 'w-16' : 'w-56'
          }`}
        >
          <Sidebar collapsed={collapsed} onCollapse={setCollapsed} role={user?.role} />
          {/* Fade overlay */}
          <div className="absolute top-0 right-0 w-6 h-full pointer-events-none bg-gradient-to-r from-gray-100/10 to-transparent" />
        </aside>
        {/* Content area */}
        <main className="flex-1 flex flex-col bg-gray-50 min-h-0">
          {/* Page title header */}
          <div className="sticky top-0 z-10 bg-white shadow px-6 py-4 border-b border-gray-100">
            <span className="font-semibold text-gray-800 text-lg">
              {location.pathname.split('/').pop().charAt(0).toUpperCase() +
                location.pathname.split('/').pop().slice(1)}
            </span>
          </div>
          {/* Main content - only this scrolls */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;