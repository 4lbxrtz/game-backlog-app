import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Asumo que tienes este hook
import { authService } from '../services/authService';
import './Settings.css';
import NavigationHeaderModal from '../components/NavigationHeaderModal';
import SettingsModal from '../components/SettingsModal';
import { Footer } from '../components/Footer';

export function Settings() {
    const { user, logout } = useAuth(); // Asumo que useAuth expone logout
    const navigate = useNavigate();

    // Estados para Perfil
    const [username, setUsername] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    
    // Estados para Contraseña
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        if (user) {
            setUsername(user.username);
        }
    }, [user]);

    // MANEJADOR: Actualizar Perfil
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await authService.updateProfile(username);
            alert("Perfil actualizado correctamente. Por favor, inicia sesión de nuevo para ver los cambios.");
            // Opcional: logout() para forzar recarga de token con nuevo nombre
        } catch (error: any) {
            alert(error.response?.data?.error || "Error al actualizar perfil");
        } finally {
            setProfileLoading(false);
        }
    };

    // MANEJADOR: Actualizar Contraseña
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            alert("Las nuevas contraseñas no coinciden");
            return;
        }

        setPasswordLoading(true);
        try {
            await authService.updatePassword(currentPassword, newPassword);
            alert("Contraseña actualizada correctamente");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            alert(error.response?.data?.error || "Error al actualizar contraseña");
        } finally {
            setPasswordLoading(false);
        }
    };

    // MANEJADOR: Eliminar Cuenta
    const handleDeleteAccount = async () => {
        const confirmText = prompt("Para confirmar, escribe 'eliminar' para borrar tu cuenta permanentemente:");
        
        if (confirmText === 'eliminar') {
            try {
                await authService.deleteAccount();
                logout(); // Limpiar token
                navigate('/login');
            } catch (error) {
                alert("Error al eliminar la cuenta");
            }
        }
    };

    if (!user) return <div className="container">Cargando...</div>;

    return (
        <div className="container">
            <header>
                <NavigationHeaderModal />
                <SettingsModal />
            </header>

            <div className="page-header">
                <h1 className="page-title">Configuración</h1>
                <p className="page-subtitle">Administra tu cuenta y preferencias</p>
            </div>

            <div className="settings-content">
                {/* SECCIÓN INFORMACIÓN DE CUENTA */}
                <div className="settings-section">
                    <h2 className="section-title">Información de cuenta</h2>
                    <p className="section-description">Tu información básica de cuenta</p>

                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                className="form-input" 
                                value={user.email} // Usar dato real
                                disabled
                                style={{ opacity: 0.7, cursor: 'not-allowed' }}
                            />
                            <p className="form-hint">El email no puede ser modificado</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="username">Nombre de usuario</label>
                            <input 
                                type="text" 
                                id="username" 
                                className="form-input" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Tu nombre de usuario"
                                minLength={3}
                            />
                            <p className="form-hint">Este nombre será visible públicamente</p>
                        </div>

                        <div className="button-group">
                            <button type="submit" className="btn-primary" disabled={profileLoading}>
                                {profileLoading ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                            {/* Botón cancelar opcional, podría resetear el estado al valor original */}
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => setUsername(user.username)}
                            >
                                Revertir
                            </button>
                        </div>
                    </form>
                </div>

                {/* SECCIÓN CAMBIAR CONTRASEÑA */}
                <div className="settings-section">
                    <h2 className="section-title">Cambiar contraseña</h2>
                    <p className="section-description">Actualiza tu contraseña para mantener tu cuenta segura</p>

                    <form onSubmit={handleUpdatePassword}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="current-password">Contraseña actual</label>
                            <input 
                                type="password" 
                                id="current-password" 
                                className="form-input" 
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="new-password">Nueva contraseña</label>
                            <input 
                                type="password" 
                                id="new-password" 
                                className="form-input" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                minLength={8}
                                required
                            />
                            <p className="form-hint">Mínimo 8 caracteres</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="confirm-password">Confirmar nueva contraseña</label>
                            <input 
                                type="password" 
                                id="confirm-password" 
                                className="form-input" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="btn-primary" disabled={passwordLoading}>
                                {passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={() => {
                                    setCurrentPassword('');
                                    setNewPassword('');
                                    setConfirmPassword('');
                                }}
                            >
                                Limpiar
                            </button>
                        </div>
                    </form>
                </div>

                {/* SECCIÓN ZONA DE PELIGRO */}
                <div className="settings-section danger-zone">
                    <h2 className="section-title">Zona de peligro</h2>
                    <p className="section-description">Acciones permanentes que no se pueden deshacer</p>

                    <div className="divider"></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '15px', color: '#e0e0e0', marginBottom: '5px', fontWeight: 500 }}>Eliminar cuenta</div>
                            <div style={{ fontSize: '13px', color: '#909090', fontWeight: 300 }}>Esta acción no se puede revertir. Se eliminarán todos tus datos.</div>
                        </div>
                        <button className="btn-danger" onClick={handleDeleteAccount}>
                            Eliminar cuenta
                        </button>
                    </div>
                </div>
            </div>
            <span style={{ display: 'block', height: '20px' }}></span>
            <Footer />
        </div>
    );
}