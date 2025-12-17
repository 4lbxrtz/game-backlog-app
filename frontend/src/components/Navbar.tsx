import { useState, ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

export function Navbar({ leftSlot }: { leftSlot?: ReactNode }) {
    const { user, logoutAction } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logoutAction();
        navigate('/login');
    };

    // Helper to check active path (checks if current path starts with the link)
    const isActive = (path: string) => location.pathname.startsWith(path) ? 'active' : '';

    return (
        <>
            {/* TOP NAVBAR (Logo + User) */}
            <nav className="navbar">
                <div className="navbar-container">
                    {/* 1. LOGO */}
                    <Link to="/dashboard" className="navbar-logo">
                        <span className="logo-icon">🎮</span>
                        <span className="logo-text">GameBacklog</span>
                    </Link>

                    {/* 2. CENTER LINKS (Desktop Only - Hidden on Mobile via CSS) */}
                    <div className="navbar-links">
                        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                            Dashboard
                        </Link>
                        <Link to="/list" className={`nav-link ${isActive('/list')}`}>
                            Listas
                        </Link>
                        <Link to="/status/backlog" className={`nav-link ${location.pathname.includes('/status') ? 'active' : ''}`}>
                            Juegos
                        </Link>
                    </div>

                    {/* 3. USER SECTION */}
                    <div className="navbar-user">
                        {/* Optional left slot (e.g., back button) placed left of Add */}
                        {leftSlot && (
                            <div className="navbar-left-slot">
                                {leftSlot}
                            </div>
                        )}
                        {/* Add Button */}
                        <button className="nav-add-btn" onClick={() => navigate('/search')}>
                            <span className="plus-symbol">+</span> 
                            <span className="mobile-hidden">Añadir</span>
                        </button>

                        {/* User Avatar / Dropdown */}
                        <div className="user-dropdown-container">
                            <div 
                                className="nav-avatar" 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {user?.username.substring(0, 2).toUpperCase()}
                            </div>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">
                                        <span className="dropdown-username">{user?.username}</span>
                                        <span className="dropdown-email">{user?.email}</span>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                                        👤 Perfil
                                    </Link>
                                    <Link to="/settings" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                                        ⚙️ Configuración
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        🚪 Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {isMenuOpen && (
                            <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}></div>
                        )}
                    </div>
                </div>
            </nav>

            {/* MOBILE BOTTOM NAVBAR (Visible only on Mobile) */}
            <nav className="mobile-bottom-nav">
                <Link to="/dashboard" className={`mobile-nav-item ${isActive('/dashboard')}`}>
                    <span className="mobile-icon">📊</span>
                    <span className="mobile-label">Inicio</span>
                </Link>
                
                <Link to="/list" className={`mobile-nav-item ${isActive('/list')}`}>
                    <span className="mobile-icon">📚</span>
                    <span className="mobile-label">Listas</span>
                </Link>
                
                <Link to="/status/backlog" className={`mobile-nav-item ${location.pathname.includes('/status') ? 'active' : ''}`}>
                    <span className="mobile-icon">🎮</span>
                    <span className="mobile-label">Juegos</span>
                </Link>

                <Link to="/profile" className={`mobile-nav-item ${isActive('/profile')}`}>
                    <span className="mobile-icon">👤</span>
                    <span className="mobile-label">Perfil</span>
                </Link>
            </nav>
        </>
    );
}