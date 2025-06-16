import React from 'react';
import { Form, Input as AntInput } from 'antd';

/**
 * Reusable Input component for forms
 * @param {object} props
 * @param {string} props.label - Label for the input
 * @param {string} props.name - Name for the form field
 * @param {string} [props.type] - Input type (text, password, email, etc.)
 * @param {boolean} [props.required] - Whether the field is required
 * @param {string} [props.placeholder] - Placeholder text
 * @param {object} [props.inputProps] - Additional props for Ant Input
 */
const Input = ({
  label,
  name,
  type = 'text',
  required = false,
  placeholder = '',
  inputProps = {},
}) => (
  <Form.Item
    label={label}
    name={name}
    rules={[
      { required, message: `${label} is required` }
    ]}
  >
    <AntInput
      type={type}
      placeholder={placeholder}
      {...inputProps}
    />
  </Form.Item>
);

export default Input;