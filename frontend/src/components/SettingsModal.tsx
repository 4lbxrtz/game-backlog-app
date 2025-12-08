import { useState, useRef, useEffect } from 'react'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import './SettingsModal.css'

export default function SettingsModal() {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const { user } = useAuth()
    const navigate = useNavigate()

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleLogout = async () => {
        await authService.logout()
        navigate('/login')
    }

    const handleSettings = () => {
        navigate('/settings')
        setIsOpen(false)
    }

    const handleProfile = () => {
        navigate('/profile')
        setIsOpen(false)
    }

    return (
        <div className="settings-menu-wrapper" ref={menuRef}>
            <div
                className="avatar"
                onClick={() => setIsOpen(!isOpen)}
                title="Mostrar opciones de usuario"
            >
                {user ? user.username.charAt(0).toUpperCase() : '?'}
            </div>

            {isOpen && (
                <div className="settings-menu">
                    <div className="settings-menu__header">
                        <div className="settings-menu__username">{user?.username}</div>
                        <div className="settings-menu__email">{user?.email}</div>
                    </div>

                    <div className="settings-menu__items">
                        <button className="settings-menu__item" onClick={handleSettings}>
                            ⚙️ Configuración
                        </button>

                        <button className="settings-menu__item" onClick={handleProfile}>
                            👤 Perfil
                        </button>

                        <button className="settings-menu__item settings-menu__item--danger" onClick={handleLogout}>
                            🚪 Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}