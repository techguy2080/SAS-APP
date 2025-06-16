import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { layoutConfig } from '../../../config/layoutConfig';

// Replace Ant Design icons with SVGs or your own icons
const getMenuIcon = (icon) => {
  const icons = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75" />
      </svg>
    ),
    documents: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" />
      </svg>
    ),
    maintenance: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M22 19.58V22h-2.42l-7.1-7.1a6 6 0 01-7.07-7.07l7.1 7.1z" />
      </svg>
    ),
    properties: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M3 9.75V19a2 2 0 002 2h3v-7h4v7h3a2 2 0 002-2V9.75M9 22V12h6v10" />
      </svg>
    ),
    payments: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      </svg>
    ),
    help: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 115.82 0c0 1.5-1.5 2.25-2.25 2.25S12 13.5 12 15" />
        <circle cx="12" cy="17" r="1" />
      </svg>
    ),
  };
  return icons[icon] || icons.dashboard;
};

const Sidebar = ({ collapsed, onCollapse, role }) => {
  const location = useLocation();
  const config = layoutConfig[role] || layoutConfig.admin;

  return (
    <aside
      className={`flex flex-col h-full bg-gradient-to-b from-[#f8fafd] to-white shadow-md transition-all duration-200
        ${collapsed ? 'w-16' : 'w-56'} z-20`}
    >
      {/* Collapse/Expand Button */}
      <button
        className="mt-4 mb-2 mx-auto flex items-center justify-center w-10 h-10 rounded-full hover:bg-blue-100 transition"
        onClick={() => onCollapse(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 space-y-1">
        {config.navigation.map(item => {
          const selected = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-2 rounded-lg my-1
                transition font-medium
                ${selected
                  ? 'bg-blue-100 text-[#0052CC] font-semibold'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-[#0052CC]'
                }
                ${collapsed ? 'justify-center px-2' : ''}
              `}
            >
              <span className="text-lg">{getMenuIcon(item.icon)}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Help & Support Button */}
      {!collapsed && (
        <div className="mt-auto px-4 py-4 border-t border-gray-100">
          <button
            className="flex items-center w-full text-blue-700 hover:text-blue-900 font-medium gap-2 py-2 px-3 rounded transition hover:bg-blue-50"
            onClick={() => alert('Help & Support coming soon!')}
          >
            <span className="text-lg">{getMenuIcon('help')}</span>
            <span>Help & Support</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;