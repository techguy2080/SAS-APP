import React from 'react';

const TEXT_COLOR = 'text-[#6b778c]';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-gray-100 h-14 flex items-center sticky bottom-0 z-10 px-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full">
        <span className={`${TEXT_COLOR} text-xs md:text-sm`}>
          © {currentYear} Kidega Apartments. All rights reserved.
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 md:mt-0">
          <a href="#" target="_blank" rel="noopener noreferrer" className={`${TEXT_COLOR} text-xs md:text-sm hover:underline`}>
            Terms of Service
          </a>
          <span className="hidden md:inline-block w-px h-4 bg-gray-200" />
          <a href="#" target="_blank" rel="noopener noreferrer" className={`${TEXT_COLOR} text-xs md:text-sm hover:underline`}>
            Privacy Policy
          </a>
          <span className="hidden md:inline-block w-px h-4 bg-gray-200" />
          <a href="#" target="_blank" rel="noopener noreferrer" className={`${TEXT_COLOR} text-xs md:text-sm flex items-center hover:underline`}>
            {/* Help icon SVG */}
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 115.82 0c0 1.657-1.343 3-3 3v2" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
            Help
          </a>
          <span className="hidden md:inline-block w-px h-4 bg-gray-200" />
          <span className={`${TEXT_COLOR} text-xs`}>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;