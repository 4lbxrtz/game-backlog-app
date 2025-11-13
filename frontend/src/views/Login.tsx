import './Login.css'
import '../components/forms/forms.css'
import { useState } from 'react'
import axios from 'axios'
import TextInput from '../components/forms/TextInput'
import PasswordInput from '../components/forms/PasswordInput'

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [errors, setErrors] = useState<Record<string, string | null>>({})
    const [loading, setLoading] = useState(false)
    const [generalError, setGeneralError] = useState<string | null>(null)

    function validate() {
        const e: Record<string, string> = {}
        if (!email || !validateEmail(email)) e.email = 'Introduce un email válido'
        if (!password) e.password = 'Introduce la contraseña'
        return e
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrors({})
        setGeneralError(null)

        const eobj = validate()
        if (Object.keys(eobj).length > 0) {
            setErrors(eobj)
            return
        }

        try {
            setLoading(true)
            const payload = { email: email.trim(), password }
            // If remember is true, backend can set a longer-lived cookie
            await axios.post('/api/auth/login', payload)
            // on success, redirect or update auth state (not implemented here)
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data
                if (msg && typeof msg === 'object') {
                    const m = msg as Record<string, unknown>
                    if (typeof m.message === 'string') setGeneralError(m.message)
                    else setGeneralError('Error al iniciar sesión')
                } else {
                    setGeneralError('Error al iniciar sesión')
                }
            } else {
                setGeneralError('Error al iniciar sesión')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
        <div className="logo-section">
            <div className="logo">
                <span className="logo-icon">🎮</span>
                <span>GameTracker</span>
            </div>
            <p className="logo-tagline">Organiza tu biblioteca de videojuegos</p>
        </div>

        <div className="login-card">
            <div className="card-header">
                <h1 className="card-title">Bienvenido de nuevo</h1>
                <p className="card-subtitle">Inicia sesión para continuar</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
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
                    placeholder="••••••••"
                    error={errors.password ?? null}
                    autoComplete="current-password"
                />

                <div className="form-options">
                    <label className="checkbox-wrapper">
                        <input type="checkbox" id="remember" checked={remember} onChange={(ev) => setRemember(ev.target.checked)} />
                        <span className="checkbox-label">Recordarme</span>
                    </label>
                    <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>

                {generalError && <div className="form-error" role="alert">{generalError}</div>}

                <button type="submit" className="btn-login" disabled={loading}>
                    {loading ? 'Entrando...' : 'Iniciar sesión'}
                </button>
            </form>

            <p className="register-prompt">
                ¿No tienes una cuenta? <a href="#" className="register-link">Regístrate</a>
            </p>
        </div>
    </div>
    )
}

export default Login;