import React from 'react';

/**
 * Reusable Grid component using Tailwind CSS
 * @param {object} props
 * @param {string} [props.className] - Additional Tailwind classes for the grid row
 * @param {string} [props.gap] - Tailwind gap class (e.g., "gap-4")
 * @param {React.ReactNode} props.children - GridCol components or content
 */
const Grids = ({ className = '', gap = 'gap-4', children, ...rest }) => (
  <div className={`flex flex-wrap ${gap} ${className}`} {...rest}>
    {children}
  </div>
);

/**
 * GridCol component for column layout using Tailwind
 * @param {number|string} [props.span] - 1-12 for width fraction (like col-span-6)
 * @param {string} [props.className] - Additional Tailwind classes for the column
 * @param {React.ReactNode} props.children - Content
 */
export const GridCol = ({ span = 12, className = '', children, ...colProps }) => {
  // Convert span (1-12) to Tailwind width class
  const widthClass = span === 24
    ? 'w-full'
    : span === 12
    ? 'w-1/2'
    : span === 8
    ? 'w-1/3'
    : span === 6
    ? 'w-1/4'
    : span === 4
    ? 'w-1/6'
    : 'w-full';

  return (
    <div className={`${widthClass} ${className}`} {...colProps}>
      {children}
    </div>
  );
};

export default Grids;