// PageLayout.jsx
import React from 'react';

const DARK_TEXT = '#24292e';

const PageLayout = ({
  title,
  actionButton,
  search,
  children,
  loading,
  empty,
  containerStyle = {}
}) => {
  return (
    <div
      className="max-w-5xl mx-auto"
      style={{
        background: 'var(--background, #f9fafb)',
        ...containerStyle
      }}
    >
      <div
        className="bg-white rounded-xl shadow-md mb-6"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          background: '#fff'
        }}
      >
        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-gray-100">
          <h3
            className="text-2xl font-semibold m-0"
            style={{ color: DARK_TEXT }}
          >
            {title}
          </h3>
          {actionButton && <div>{actionButton}</div>}
        </div>

        {/* Search bar */}
        {search && (
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            {search}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-6 bg-white">
          {loading ? (
            <div className="py-16 text-center">
              <svg className="mx-auto h-8 w-8 animate-spin text-gray-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : empty ? (
            <div className="py-16 text-center text-gray-400">{empty}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;