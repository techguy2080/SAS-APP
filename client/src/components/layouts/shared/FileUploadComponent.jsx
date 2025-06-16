import React, { useRef } from 'react';

const FileUploadComponent = ({
  value = [],
  onChange,
  buttonText = 'Select File',
  icon,
  accept,
  maxCount = 1,
  disabled = false,
  ...rest
}) => {
  const inputRef = useRef();

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    // If maxCount is 1, only keep the first file
    const fileList = maxCount === 1 ? files.slice(0, 1) : files.slice(0, maxCount);
    if (onChange) onChange(fileList);
  };

  const handleButtonClick = () => {
    if (!disabled) inputRef.current.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={`inline-flex items-center px-4 py-2 rounded bg-[#0052CC] hover:bg-[#0066FF] text-white font-medium transition disabled:opacity-60 disabled:cursor-not-allowed`}
        onClick={handleButtonClick}
        disabled={disabled}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {buttonText}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxCount > 1}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
        {...rest}
      />
      {/* Show selected files */}
      {value && value.length > 0 && (
        <ul className="mt-1 text-sm text-gray-700 space-y-1">
          {value.map((file, idx) => (
            <li key={file.name + idx} className="flex items-center gap-2">
              <span className="truncate">{file.name}</span>
              <span className="text-gray-400 text-xs">({Math.round(file.size / 1024)} KB)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileUploadComponent;