import './Login.css'

function Login() {
    
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

            <form>
                <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        className="form-input" 
                        placeholder="tu@email.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="password">Contraseña</label>
                    <input 
                        type="password" 
                        id="password" 
                        className="form-input" 
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="form-options">
                    <label className="checkbox-wrapper">
                        <input type="checkbox" id="remember" />
                        <span className="checkbox-label">Recordarme</span>
                    </label>
                    <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
                </div>

                <button type="submit" className="btn-login">Iniciar sesión</button>
            </form>

            <div className="divider">
                <div className="divider-line"></div>
                <span className="divider-text">o continuar con</span>
                <div className="divider-line"></div>
            </div>

            <div className="social-buttons">
                <button className="btn-social">
                    <span>🔵</span>
                    <span>Google</span>
                </button>
                <button className="btn-social">
                    <span>⚫</span>
                    <span>GitHub</span>
                </button>
            </div>

            <p className="register-prompt">
                ¿No tienes una cuenta? <a href="#" className="register-link">Regístrate</a>
            </p>
        </div>
    </div>
    )
}

export default Login;