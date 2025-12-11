import './Login.css'
import '../components/forms/forms.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextInput from '../components/forms/TextInput'
import PasswordInput from '../components/forms/PasswordInput'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth' // <--- Import Hook

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [errors, setErrors] = useState<Record<string, string | null>>({})
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate()
    const { loginAction } = useAuth() // <--- Destructure login function

    function validate() {
        const e: Record<string, string> = {}
        if (!email || !validateEmail(email)) {
            e.email = 'Introduce un email válido'
        }
        if (!password) {
            e.password = 'La contraseña es requerida'
        }
        return e
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrors({})

        const eobj = validate()
        if (Object.keys(eobj).length > 0) {
            setErrors(eobj)
            return
        }

        try {
            setLoading(true)
            
            // 1. Call Service
            const { token, user } = await authService.login(email.trim(), password)
            
            // 2. Update Global State via Hook
            // This sets the axios header and localStorage, fixing the navigation bug
            loginAction(token, user);
            
            // 3. Navigate
            navigate('/dashboard')
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            const errorData = err.response?.data
            if (errorData && errorData.error) {
                setErrors({ general: 'Email o contraseña incorrectos' })
            } else {
                setErrors({ general: 'Error al iniciar sesión. Inténtalo de nuevo.' })
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
                    <h1 className="card-title">Iniciar sesión</h1>
                    <p className="card-subtitle">Bienvenido de vuelta</p>
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
                        placeholder="Tu contraseña"
                        error={errors.password ?? null}
                        autoComplete="current-password"
                    />

                    <div className="form-options">
                        <label className="checkbox-wrapper">
                            <input 
                                type="checkbox" 
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={loading}
                            />
                            <span className="checkbox-label">Recordarme</span>
                        </label>
                        
                        <a href="/forgot-password" className="forgot-link">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    {errors.general && <div className="form-error" role="alert">{errors.general}</div>}

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="register-prompt">
                    ¿No tienes una cuenta? <a href="/register" className="register-link">Regístrate</a>
                </p>
            </div>
        </div>
    )
}