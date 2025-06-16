import React from 'react';

/**
 * Reusable Card component using Tailwind CSS
 * @param {object} props
 * @param {string} [props.title] - Card title
 * @param {React.ReactNode} [props.extra] - Extra content in the top right
 * @param {React.ReactNode} [props.children] - Card content
 * @param {boolean} [props.bordered] - Show border
 * @param {string} [props.className] - Additional class name
 * @param {object} [props.style] - Custom styles
 */
const Card = ({
  title,
  extra,
  children,
  bordered = true,
  className = '',
  style = {},
}) => (
  <div
    className={`
      bg-white rounded-xl shadow
      ${bordered ? 'border border-gray-200' : ''}
      ${className}
    `}
    style={style}
  >
    {(title || extra) && (
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        {title && <h3 className="text-lg font-semibold m-0">{title}</h3>}
        {extra && <div>{extra}</div>}
      </div>
    )}
    <div className="px-6 py-4">{children}</div>
  </div>
);

export default Card;