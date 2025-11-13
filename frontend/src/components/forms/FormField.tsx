import React from 'react'

type Props = {
  children: React.ReactNode
}

export default function FormField({ children }: Props) {
  return <div className="form-field-wrapper">{children}</div>
}
