import React, { useState } from 'react'
import FormError from './FormError'

type Props = {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  error?: string | null
  autoComplete?: string
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}: Props) {
  const [show, setShow] = useState(false)

  return (
    <div className="form-field">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="password-wrapper">
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'has-error' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <FormError id={`${id}-error`} message={error} />}
    </div>
  )
}
