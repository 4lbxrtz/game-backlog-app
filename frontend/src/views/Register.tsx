import './Register.css'
import '../components/forms/forms.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TextInput from '../components/forms/TextInput'
import PasswordInput from '../components/forms/PasswordInput'
import { useAuth } from '../hooks/useAuth' // <--- Import Hook
import { authService } from '../services/authService' // <--- Import Service

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errors, setErrors] = useState<Record<string, string | null>>({})
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate()

    const { loginAction } = useAuth();

    function validate() {
        const e: Record<string, string> = {}
        if (!username || username.trim().length < 3) {
            e.username = 'Nombre de usuario mínimo 3 caracteres'
        }
        if (username.trim().length > 50) {
            e.username = 'Nombre de usuario máximo 50 caracteres'
        }
        if (!email || !validateEmail(email)) {
            e.email = 'Introduce un email válido'
        }
        if (!password || password.length < 8) {
            e.password = 'La contraseña debe tener al menos 8 caracteres'
        }
        if (password !== confirmPassword) {
            e.confirmPassword = 'Las contraseñas no coinciden'
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
            const response = await authService.register(username.trim(), email.trim(), password)
            
            // 2. Update Global State via Hook (Fixes the logout bug)
            if (response.token && response.user) {
                loginAction(response.token, response.user); // <--- USE CONTEXT ACTION
                navigate('/dashboard');
            }
            
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            // Error handling tailored to the service response structure
            const errorData = err.response?.data
            
            if (errorData) {
                if (errorData.error) {
                    // Check for specific keywords in the error message to highlight fields
                    const msg = errorData.error;
                    if (msg.includes('email') || msg.includes('Email')) setErrors({ email: msg });
                    else if (msg.includes('user')) setErrors({ username: msg });
                    else setErrors({ general: msg });
                } else if (errorData.errors) {
                    setErrors(errorData.errors)
                } else {
                    setErrors({ general: 'Error al crear la cuenta.' })
                }
            } else {
                setErrors({ general: 'Error de conexión.' })
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
                    <span>GameBacklog</span>
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
                    
                    {errors.terms && <div className="form-error" role="alert">{errors.terms}</div>}
                    {errors.general && <div className="form-error" role="alert">{errors.general}</div>}

                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <p className="login-prompt">
                    ¿Ya tienes una cuenta? <a href="/login" className="login-link">Inicia sesión</a>
                </p>
            </div>
        </div>
    )
}