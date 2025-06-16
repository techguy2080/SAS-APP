import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Define colors as constants for consistency
const baseStyles = {
  primary: "bg-[#0052CC] text-white border border-[#0052CC] hover:bg-[#0066FF] hover:border-[#0066FF] active:scale-95 shadow transition-all duration-150",
  secondary: "bg-white text-[#0052CC] border border-[#0052CC] hover:bg-blue-50 hover:border-[#0066FF] active:scale-95 transition-all duration-150",
  ghost: "bg-transparent text-[#0052CC] border border-[#0052CC] hover:bg-blue-50 hover:border-[#0066FF] active:scale-95 transition-all duration-150",
  link: "bg-transparent text-[#0052CC] underline hover:text-[#0066FF] active:scale-95 transition-all duration-150 border-none shadow-none px-0 py-0",
  danger: "bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:border-red-600 active:scale-95 transition-all duration-150",
  default: "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 active:scale-95 transition-all duration-150",
};

const sizeStyles = {
  small: "px-3 py-1 text-sm rounded",
  middle: "px-4 py-2 text-base rounded-md",
  large: "px-6 py-3 text-lg rounded-lg",
};

const Button = ({
  type = 'default',
  size = 'middle',
  block = false,
  icon,
  loading = false,
  disabled = false,
  onClick,
  htmlType = 'button',
  className = '',
  style = {},
  children,
  ...rest
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 120);
    if (onClick) onClick(e);
  };

  return (
    <button
      type={htmlType}
      disabled={disabled || loading}
      onClick={handleClick}
      style={style}
      className={`
        inline-flex items-center justify-center font-medium
        ${baseStyles[type] || baseStyles.default}
        ${sizeStyles[size] || sizeStyles.middle}
        ${block ? 'w-full' : ''}
        ${loading || disabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${isClicked ? 'scale-95' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 mr-2 text-current" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

Button.propTypes = {
  type: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'link', 'danger', 'default']),
  size: PropTypes.oneOf(['small', 'middle', 'large']),
  block: PropTypes.bool,
  icon: PropTypes.node,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
};

export default Button;