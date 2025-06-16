import React from 'react';

/**
 * Modern reusable Table component using Tailwind CSS
 * @param {object} props
 * @param {array} props.columns - Table columns definition [{title, dataIndex, render}]
 * @param {array} props.dataSource - Table data
 * @param {boolean} [props.loading] - Loading state
 * @param {string} [props.rowKey] - Unique row key (default: 'id' or '_id')
 * @param {object} [props.pagination] - Pagination config {pageSize, current, total, onChange}
 * @param {function} [props.onRow] - Row event handler
 */
const Tables = ({
  columns = [],
  dataSource = [],
  loading = false,
  rowKey = '_id',
  pagination = { pageSize: 10, current: 1, total: 0, onChange: () => {} },
  onRow,
}) => {
  // Ensure dataSource is always an array
  const safeDataSource = Array.isArray(dataSource) ? dataSource : [];
  const total = pagination.total || safeDataSource.length;
  const pageSize = pagination.pageSize || 10;
  const current = pagination.current || 1;
  const startIdx = (current - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageData = safeDataSource.slice(startIdx, endIdx);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (pagination.onChange) pagination.onChange(newPage, pageSize);
  };

  return (
    <div className="rounded-xl overflow-hidden shadow bg-white">
      {loading ? (
        <div className="py-16 text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#f8fafd]">
                <tr>
                  {columns.map((col, colIdx) => (
                    <th
                      key={col.dataIndex || col.key || colIdx}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataSource.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                      No data
                    </td>
                  </tr>
                ) : (
                  pageData.map((row, idx) => (
                    <tr
                      key={row[rowKey] || row._id || row.id || idx}
                      className={idx % 2 === 1 ? 'bg-[#f8fafd]' : ''}
                      onClick={onRow ? () => onRow(row) : undefined}
                      style={{ cursor: onRow ? 'pointer' : 'default' }}
                    >
                      {columns.map((col, colIdx) => (
                        <td key={`${col.dataIndex || col.key || colIdx}`} className="px-6 py-3 text-sm text-gray-700">
                          {col.render ? col.render(row[col.dataIndex], row, idx) : row[col.dataIndex]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {total > pageSize && (
            <div className="flex justify-end items-center gap-2 px-6 py-4 bg-white border-t border-gray-100">
              <button
                className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-blue-100"
                onClick={() => handlePageChange(current - 1)}
                disabled={current === 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                {startIdx + 1}-{Math.min(endIdx, total)} of {total} items
              </span>
              <button
                className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-blue-100"
                onClick={() => handlePageChange(current + 1)}
                disabled={endIdx >= total}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Tables;