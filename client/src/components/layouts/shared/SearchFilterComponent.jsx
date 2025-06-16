// SearchFilterComponent.jsx
import React from 'react';

const SearchFilter = ({
  searchText,
  onSearchChange,
  placeholder = "Search...",
  filters = [],
  filterValues = {},
  onFilterChange,
  style = {},
}) => {
  return (
    <form
      className="flex flex-col md:flex-row md:items-center gap-4 w-full"
      style={style}
      onSubmit={e => e.preventDefault()}
    >
      {filters.length > 0 && (
        <div className={`flex flex-1 gap-2`}>
          {filters.map(filter => (
            <select
              key={filter.name}
              className="min-w-[120px] flex-1 rounded border border-gray-300 px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterValues[filter.name] || ''}
              onChange={e => onFilterChange(filter.name, e.target.value)}
            >
              <option value="">{filter.placeholder}</option>
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
            value={searchText}
            onChange={e => onSearchChange(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {/* Search icon SVG */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-2-2" />
            </svg>
          </span>
        </div>
      </div>
    </form>
  );
};

export default SearchFilter;