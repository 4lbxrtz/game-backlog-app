import './Register.css'
import '../components/forms/forms.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import TextInput from '../components/forms/TextInput'
import PasswordInput from '../components/forms/PasswordInput'

const IP_BACKEND = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function Register() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [errors, setErrors] = useState<Record<string, string | null>>({})
    const [loading, setLoading] = useState(false)
    
    const navigate = useNavigate()

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
        if (!termsAccepted) {
            e.terms = 'Debes aceptar los términos y condiciones'
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
            
            // Registro
            const payload = { 
                username: username.trim(), 
                email: email.trim(), 
                password 
            }
            
            const response = await axios.post(`${IP_BACKEND}/auth/register`, payload)
            
            // Guardar token en localStorage
            const { token, user } = response.data
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            
            // Configurar axios para futuras peticiones
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            // Redirigir al dashboard
            navigate('/dashboard')
            
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const errorData = err.response?.data
                
                if (errorData && typeof errorData === 'object') {
                    const errorObj = errorData as Record<string, unknown>
                    
                    // Manejar errores específicos del backend
                    if (typeof errorObj.error === 'string') {
                        const errorMsg = errorObj.error
                        
                        // Mapear errores específicos a campos
                        if (errorMsg.includes('email') || errorMsg.includes('Email')) {
                            setErrors({ email: errorMsg })
                        } else if (errorMsg.includes('username') || errorMsg.includes('Username')) {
                            setErrors({ username: errorMsg })
                        } else if (errorMsg.includes('password') || errorMsg.includes('Password')) {
                            setErrors({ password: errorMsg })
                        } else {
                            setErrors({ general: errorMsg })
                        }
                    } else if (errorObj.errors && typeof errorObj.errors === 'object') {
                        // Si el backend devuelve múltiples errores
                        setErrors(errorObj.errors as Record<string, string>)
                    } else {
                        setErrors({ general: 'Error al crear la cuenta. Inténtalo de nuevo.' })
                    }
                } else {
                    setErrors({ general: 'Error al crear la cuenta. Inténtalo de nuevo.' })
                }
            } else {
                setErrors({ general: 'Error de conexión. Verifica tu conexión a internet.' })
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
                        <input 
                            type="checkbox" 
                            id="terms" 
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            disabled={loading}
                        />
                        <span className="checkbox-label">
                            Acepto los <a href="/terms" target="_blank">términos y condiciones</a> y la{' '}
                            <a href="/privacy" target="_blank">política de privacidad</a>
                        </span>
                    </label>
                    
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