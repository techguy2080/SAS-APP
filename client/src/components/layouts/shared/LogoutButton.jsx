import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

/**
 * Logout SVG Icon (replaces Ant Design icon)
 */
const LogoutIcon = ({ className = "w-5 h-5 mr-2" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
  </svg>
);

const baseStyles = {
  primary: "bg-[#0052CC] hover:bg-[#0066FF] text-white",
  secondary: "bg-white border border-[#0052CC] text-[#0052CC] hover:bg-blue-50",
  ghost: "bg-transparent text-[#0052CC] hover:bg-blue-50",
  link: "bg-transparent text-[#0052CC] underline hover:text-[#0066FF]",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  default: "bg-gray-100 hover:bg-gray-200 text-gray-700"
};

const sizeStyles = {
  small: "px-3 py-1 text-sm rounded",
  middle: "px-4 py-2 text-base rounded-md",
  large: "px-6 py-3 text-lg rounded-lg"
};

/**
 * Specialized button for handling logout functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Button type (primary, secondary, etc.)
 * @param {string} props.size - Button size
 * @param {boolean} props.showIcon - Whether to show the logout icon
 * @param {string} props.redirectTo - Path to redirect after logout
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.className - Additional CSS classes
 */
const LogoutButton = ({
  type = 'primary',
  size = 'middle',
  showIcon = true,
  redirectTo = '/login',
  style = {},
  className = '',
  children = 'Logout',
  ...rest
}) => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setTimeout(() => {
        localStorage.removeItem('user');
        sessionStorage.clear();
        if (caches && window.location.protocol === 'https:') {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
        navigate(redirectTo, { replace: true });
      }, 300);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      style={style}
      className={`
        flex items-center justify-center font-medium transition
        ${baseStyles[type] || baseStyles.primary}
        ${sizeStyles[size] || sizeStyles.middle}
        ${loading ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 mr-2 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : showIcon ? (
        <LogoutIcon />
      ) : null}
      {children}
    </button>
  );
};

LogoutButton.propTypes = {
  type: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'link', 'danger', 'default']),
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  showIcon: PropTypes.bool,
  redirectTo: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  children: PropTypes.node,
};

export default LogoutButton;