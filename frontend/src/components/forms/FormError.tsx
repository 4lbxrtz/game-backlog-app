type Props = {
  id?: string
  message: string
}

export default function FormError({ id, message }: Props) {
  return (
    <div id={id} role="alert" className="form-error">
      {message}
    </div>
  )
}
