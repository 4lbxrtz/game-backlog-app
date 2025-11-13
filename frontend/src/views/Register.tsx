import './Register.css'
import '../components/forms/forms.css'
import { useState } from 'react'
import axios from 'axios'
import TextInput from '../components/forms/TextInput'
import PasswordInput from '../components/forms/PasswordInput'

const IP_BACKEND = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

function validateEmail(email: string) {
    // simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string | null>>({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)

    function validate() {
        const e: Record<string, string> = {}
        if (!username || username.trim().length < 3) e.username = 'Nombre de usuario mínimo 3 caracteres'
        if (!email || !validateEmail(email)) e.email = 'Introduce un email válido'
        if (!password || password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres'
        if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
        return e
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrors({})
        setSuccess(null)

        const eobj = validate()
        if (Object.keys(eobj).length > 0) {
            setErrors(eobj)
            return
        }

        try {
            setLoading(true)
            // Trim values to avoid accidental spaces
            const payload = { username: username.trim(), email: email.trim(), password }
            await axios.post(`${IP_BACKEND}/auth/register`, payload)
            setSuccess('Cuenta creada. Revisa tu correo o entra para iniciar sesión.')
            setUsername('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')
        } catch (err: unknown) {
            // Map server validation errors if provided
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data
                if (msg && typeof msg === 'object') {
                    const m = msg as Record<string, unknown>
                    if (m.errors && typeof m.errors === 'object') {
                        setErrors(m.errors as Record<string, string>)
                    } else if (typeof m.message === 'string') {
                        setErrors({ general: m.message })
                    } else {
                        setErrors({ general: 'Error al crear la cuenta' })
                    }
                } else {
                    setErrors({ general: 'Error al crear la cuenta' })
                }
            } else {
                setErrors({ general: 'Error al crear la cuenta' })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-container">
            <div className="logo-section">
                <div className="logo">
                    <span className="logo-icon">🎮</span>
                    <span>GameTracker</span>
                </div>
                <p className="logo-tagline">Organiza tu biblioteca de videojuegos</p>
            </div>

            <div className="register-card">
                <div className="card-header">
                    <h1 className="card-title">Crear cuenta</h1>
                    <p className="card-subtitle">Comienza a organizar tu backlog</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <TextInput
                        id="username"
                        label="Nombre de usuario"
                        value={username}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                        placeholder="juanperez"
                        error={errors.username ?? null}
                        autoComplete="username"
                    />

                    <TextInput
                        id="email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        error={errors.email ?? null}
                        autoComplete="email"
                    />

                    <PasswordInput
                        id="password"
                        label="Contraseña"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        error={errors.password ?? null}
                        autoComplete="new-password"
                    />

                    <PasswordInput
                        id="confirmPassword"
                        label="Confirmar contraseña"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la contraseña"
                        error={errors.confirmPassword ?? null}
                        autoComplete="new-password"
                    />

                    <label className="checkbox-wrapper">
                        <input type="checkbox" id="terms" required />
                        <span className="checkbox-label">
                            Acepto los <a href="#">términos y condiciones</a> y la{' '}
                            <a href="#">política de privacidad</a>
                        </span>
                    </label>

                    {errors.general && <div className="form-error" role="alert">{errors.general}</div>}

                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? 'Creando...' : 'Crear cuenta'}
                    </button>
                </form>

                {success && <div className="success-message">{success}</div>}

                <p className="login-prompt">
                    ¿Ya tienes una cuenta? <a href="#" className="login-link">Inicia sesión</a>
                </p>
            </div>
        </div>
    )
}