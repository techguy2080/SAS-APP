import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

// SVG icon replacements
const MenuFoldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M3 6h18M3 12h12M3 18h18" />
  </svg>
);
const MenuUnfoldIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M3 6h18M3 12h6M3 18h18" />
  </svg>
);
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a7.5 7.5 0 0113 0" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
    <path d="M3 21V3" />
  </svg>
);
const SettingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09A1.65 1.65 0 008.91 3H9a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const Header = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-[#0052CC] shadow">
      {/* Left: Sidebar toggle and App Title */}
      <div className="flex items-center space-x-4">
        <button
          className="text-white text-xl focus:outline-none"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <MenuUnfoldIcon /> : <MenuFoldIcon />}
        </button>
        <span className="text-white font-bold text-lg tracking-wide">
          Kidega Apartments
        </span>
      </div>

      {/* Right: User info, dropdown, and logout */}
      <div className="relative flex items-center space-x-3" ref={menuRef}>
        <span className="text-white font-medium">{user?.first_name}</span>
        <button
          className="w-10 h-10 rounded-full bg-white text-[#0052CC] flex items-center justify-center shadow focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="User menu"
        >
          <UserIcon />
        </button>
        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-0 top-12 w-44 bg-white rounded shadow-lg z-50 py-2">
            <button
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              <UserIcon /> <span className="ml-2">Profile</span>
            </button>
            <button
              className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setMenuOpen(false)}
            >
              <SettingIcon /> <span className="ml-2">Settings</span>
            </button>
            <div className="border-t my-1" />
            <button
              className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-gray-100"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              <LogoutIcon /> <span className="ml-2">Logout</span>
            </button>
          </div>
        )}
        {/* Always visible logout button */}
        <button
          className="flex items-center px-3 py-1 rounded bg-white text-[#0052CC] font-semibold ml-2 hover:bg-gray-100 transition"
          onClick={logout}
        >
          <LogoutIcon /> <span className="ml-1">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;