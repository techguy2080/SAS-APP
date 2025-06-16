import React from 'react';

const ExclamationIcon = ({ className = "w-6 h-6 text-red-500" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
  </svg>
);

const ConfirmDialog = ({
  visible,
  onCancel,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  itemName,
  loading = false,
  confirmText = "Delete",
  cancelText = "Cancel"
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <ExclamationIcon />
          <h3 className="text-lg font-semibold m-0">{title}</h3>
        </div>
        {/* Message */}
        <div className="text-gray-700 mb-4">{message}</div>
        {/* Item name highlight */}
        {itemName && (
          <div className="my-4 px-3 py-2 bg-gray-50 border-l-4 border-red-500 rounded">
            <span className="font-semibold">{itemName}</span>
          </div>
        )}
        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60 flex items-center"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
        {/* Close overlay click */}
        <button
          type="button"
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;