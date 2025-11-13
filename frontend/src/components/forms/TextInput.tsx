import React from 'react'
import FormError from './FormError'

type Props = {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string | null
  autoComplete?: string
  type?: string
}

export default function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  type = 'text',
}: Props) {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input ${error ? 'has-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        autoComplete={autoComplete}
      />
      {error && <FormError id={`${id}-error`} message={error} />}
    </div>
  )
}
