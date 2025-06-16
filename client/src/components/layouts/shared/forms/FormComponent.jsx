import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * A reusable, modern, Tailwind-styled form component.
 */
const FormComponent = ({
  fields = [],
  sections = [],
  initialValues = {},
  onSubmit,
  onValuesChange,
  onReset,
  onCancel,
  submitText = 'Submit',
  resetText = 'Reset',
  cancelText = 'Cancel',
  loading = false,
  showResetButton = true,
  showCancelButton = false,
  style = {},
  className = '',
  isModal = false,
  title,
}) => {
  const [formValues, setFormValues] = useState(initialValues || {});
  const [formErrors, setFormErrors] = useState({});
  const [showForm] = useState(true); // Remove setShowForm

  // Handle input change
  const handleChange = (name, value) => {
    const newValues = { ...formValues, [name]: value };
    setFormValues(newValues);
    if (onValuesChange) onValuesChange({ [name]: value }, newValues);
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Validate required fields
  const validate = () => {
    let errors = {};
    const allFields = sections.length > 0
      ? sections.flatMap(section => section.fields)
      : fields;
    allFields.forEach(field => {
      if (field.rules?.some(r => r.required) && !formValues[field.name]) {
        errors[field.name] = field.rules.find(r => r.required)?.message || `${field.label || field.name} is required`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) onSubmit(formValues);
  };

  // Handle reset
  const handleReset = () => {
    setFormValues(initialValues || {});
    setFormErrors({});
    if (onReset) onReset();
  };

  // Render a single field
  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      placeholder,
      options = [],
      render,
      ...rest
    } = field;

    const error = formErrors[name];

    if (render) {
      return render({
        value: formValues[name],
        onChange: (val) => handleChange(name, val),
        error,
      });
    }

    switch (type) {
      case 'textarea':
        return (
          <div key={name} className="mb-4">
            {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
            <textarea
              name={name}
              value={formValues[name] || ''}
              onChange={e => handleChange(name, e.target.value)}
              placeholder={placeholder}
              className={`w-full rounded-lg border px-4 py-2 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              {...rest}
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
        );
      case 'select':
        return (
          <div key={name} className="mb-4">
            {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
            <select
              name={name}
              value={formValues[name] || ''}
              onChange={e => handleChange(name, e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              {...rest}
            >
              <option value="">Select {label}</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
        );
      case 'multiselect':
        return (
          <div key={name} className="mb-4">
            {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
            <select
              name={name}
              value={formValues[name] || []}
              onChange={e => handleChange(name, Array.from(e.target.selectedOptions, o => o.value))}
              multiple
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              {...rest}
            >
              {options.map(opt => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
        );
      case 'checkbox':
        return (
          <div key={name} className="mb-4 flex items-center">
            <input
              type="checkbox"
              name={name}
              checked={!!formValues[name]}
              onChange={e => handleChange(name, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              {...rest}
            />
            <label className="ml-2 text-gray-700">{label}</label>
            {error && <div className="text-xs text-red-500 ml-2">{error}</div>}
          </div>
        );
      case 'radio':
        return (
          <div key={name} className="mb-4">
            {label && <div className="block mb-1 font-medium text-gray-700">{label}</div>}
            <div className="flex flex-wrap gap-4">
              {options.map(opt => (
                <label key={opt.value} className="flex items-center">
                  <input
                    type="radio"
                    name={name}
                    value={opt.value}
                    checked={formValues[name] === opt.value}
                    onChange={e => handleChange(name, e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                    {...rest}
                  />
                  <span className="ml-2">{opt.label}</span>
                </label>
              ))}
            </div>
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
        );
      case 'number':
        return (
          <div key={name} className="mb-4">
            {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
            <input
              type="number"
              name={name}
              value={formValues[name] || ''}
              onChange={e => handleChange(name, e.target.value)}
              placeholder={placeholder}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              {...rest}
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
        );
      case 'date':
        return (
          <div key={name} className="mb-4">
            {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
            <input
              type="date"
              name={name}
              value={formValues[name] || ''}
              onChange={e => handleChange(name, e.target.value)}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              {...rest}
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
        );
      case 'password':
        return (
          <div key={name} className="mb-4">
            {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
            <input
              type="password"
              name={name}
              value={formValues[name] || ''}
              onChange={e => handleChange(name, e.target.value)}
              placeholder={placeholder}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              {...rest}
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
        );
      default:
        // text, email, url, phone, etc.
        return (
          <div key={name} className="mb-4">
            {label && <label className="block mb-1 font-medium text-gray-700">{label}</label>}
            <input
              type={type}
              name={name}
              value={formValues[name] || ''}
              onChange={e => handleChange(name, e.target.value)}
              placeholder={placeholder}
              className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
              {...rest}
            />
            {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          </div>
        );
    }
  };

  // Render all fields in a section or flat
  const renderFields = (fieldsArray) => (
    <div>
      {fieldsArray.map(field => renderField(field))}
    </div>
  );

  // Render sections if present
  const renderSections = () => (
    <div>
      {sections.map((section, idx) => (
        <div key={section.key || `section-${idx}`} className="mb-8">
          {section.title && (
            <h3 className="text-xl font-bold mb-2 text-[#0052CC]">{section.title}</h3>
          )}
          {section.description && (
            <div className="mb-3 text-gray-500">{section.description}</div>
          )}
          {renderFields(section.fields)}
          {idx < sections.length - 1 && <hr className="my-6 border-gray-200" />}
        </div>
      ))}
    </div>
  );

  // Render form action buttons
  const renderButtons = () => (
    <div className="flex gap-3 mt-6">
      <button
        type="submit"
        className="bg-[#0052CC] hover:bg-[#0066FF] text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-150 active:scale-95 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 inline-block mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        {submitText}
      </button>
      {showResetButton && (
        <button
          type="button"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition-all duration-150 active:scale-95 disabled:opacity-60"
          onClick={handleReset}
          disabled={loading}
        >
          {resetText}
        </button>
      )}
      {showCancelButton && (
        <button
          type="button"
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-150 active:scale-95 disabled:opacity-60"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelText}
        </button>
      )}
    </div>
  );

  // Main form content
  const formContent = (
    <form
      onSubmit={handleSubmit}
      style={style}
      className={`bg-white rounded-xl shadow-md p-8 ${className}`}
      autoComplete="off"
    >
      {sections.length > 0 ? renderSections() : renderFields(fields)}
      {renderButtons()}
    </form>
  );

  // Modal support (simple, pure Tailwind)
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-8 relative">
          <button
            type="button"
            className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          >
            &times;
          </button>
          {title && <h2 className="text-2xl font-bold mb-6 text-[#0052CC]">{title}</h2>}
          {formContent}
        </div>
      </div>
    );
  }

  // Standard form
  return (
    <>
      {showForm && (
        <div>
          {formContent}
        </div>
      )}
    </>
  );
};

FormComponent.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object),
  sections: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    key: PropTypes.string
  })),
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onValuesChange: PropTypes.func,
  onReset: PropTypes.func,
  onCancel: PropTypes.func,
  submitText: PropTypes.string,
  resetText: PropTypes.string,
  cancelText: PropTypes.string,
  loading: PropTypes.bool,
  showResetButton: PropTypes.bool,
  showCancelButton: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  isModal: PropTypes.bool,
  title: PropTypes.string,
};

export default FormComponent;