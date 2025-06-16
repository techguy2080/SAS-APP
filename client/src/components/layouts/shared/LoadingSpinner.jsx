import React from 'react';

// Docker-like colors
const DEEP_BLUE = '#0052CC';
const DARK_TEXT = '#24292e';

// Map size string to Tailwind/inlined size
const sizeMap = {
  small: 6,
  default: 8,
  large: 12,
};

/**
 * A reusable loading spinner component with Docker-inspired styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.text - Optional text to display below spinner
 * @param {string} props.size - Size of the spinner: 'small', 'default', 'large'
 * @param {boolean} props.fullPage - Whether to display as a full page overlay
 * @param {string} props.color - Custom color for the spinner
 * @param {Object} props.style - Additional styles to apply
 */
const LoadingSpinner = ({
  text,
  size = 'default',
  fullPage = false,
  color = DEEP_BLUE,
  style = {},
}) => {
  const twSize = sizeMap[size] || sizeMap.default;

  const spinner = (
    <svg
      className={`animate-spin mx-auto text-blue-500`}
      style={{ color, width: `${twSize * 4}px`, height: `${twSize * 4}px` }}
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (fullPage) {
    return (
      <div
        className="fixed inset-0 bg-white/85 flex flex-col justify-center items-center z-[1000]"
        style={style}
      >
        {spinner}
        {text && (
          <div
            className="mt-4 text-center font-medium"
            style={{ color: DARK_TEXT, fontSize: size === 'large' ? 16 : 14 }}
          >
            {text}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-center items-center"
      style={{
        padding: text ? '24px 0' : '16px 0',
        ...style,
      }}
    >
      {spinner}
      {text && (
        <div
          className="mt-3 text-center font-medium"
          style={{ color: DARK_TEXT, fontSize: size === 'large' ? 16 : 14 }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;