import './Dashboard.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

interface Stats {
    completed: number
    playing: number
    backlog: number
    wishlist: number
    averageRating: string
}

interface Game {
    id: number
    title: string
    cover_url?: string
}

interface CustomList {
    id: number
    name: string
    description?: string
    game_count: number
}

interface DashboardData {
    user: {
        id: number
        username: string
        email: string
    }
    stats: Stats
    currentlyPlaying: Game[]
    backlog: Game[]
    lists: CustomList[]
}

function Dashboard() {
    const navigate = useNavigate()

    const { user, loading: authLoading, logout } = useAuth()


    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [authLoading, user, navigate])

    // Load dashboard when user is available
    useEffect(() => {
        if (user) loadDashboard()
    }, [user])

    async function loadDashboard() {
        try {
            setLoading(true)
            const dashboardData = await authService.getDashboard()
            setData(dashboardData)
        } catch (err) {
            console.error('Error loading dashboard:', err)
            setError('Error al cargar el dashboard')
        } finally {
            setLoading(false)
        }
    }

    function handleLogout() {
        logout()
        navigate('/login')
    }

    // Get user initials for avatar
    function getUserInitials(username: string): string {
        return username
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    if (loading) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div>Cargando dashboard...</div>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="container">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <div>{error || 'Error al cargar datos'}</div>
                    <button onClick={loadDashboard}>Reintentar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <header>
                <div className="logo">
                    <span className="logo-icon">🎮</span>
                    <span>GameTracker</span>
                </div>
                <div className="user-section">
                    <button className="add-button" onClick={() => navigate('/search')}>
                        Añadir juego
                    </button>
                    <div className="avatar" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Cerrar sesión">
                        {getUserInitials(data.user.username)}
                    </div>
                </div>
            </header>

            <div className="greeting">
                <div className="greeting-text">Qué tal todo, {data.user.username}?</div>
                <div className="greeting-subtext">Preparado para jugar algo?</div>
            </div>

            <div className="stats-container">
                <div className="stats-bar">
                    <div className="stat-item">
                        <div className="stat-label">Completados</div>
                        <div className="stat-value">{data.stats.completed}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Jugando</div>
                        <div className="stat-value">{data.stats.playing}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Backlog</div>
                        <div className="stat-value">{data.stats.backlog}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Wishlist</div>
                        <div className="stat-value">{data.stats.wishlist}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Puntuación media</div>
                        <div className="stat-value">{data.stats.averageRating}</div>
                    </div>
                </div>
            </div>

            <div className="main-content">
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Jugando actualmente</h2>
                        <a href="#" className="view-all">Ver todos →</a>
                    </div>
                    <div className="game-grid">
                        {data.currentlyPlaying.length > 0 ? (
                            data.currentlyPlaying.map(game => (
                                <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                                    <div className="game-cover" style={{
                                        backgroundImage: game.cover_url ? `url(${game.cover_url})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}>
                                        {!game.cover_url && 'Sin portada'}
                                    </div>
                                    <div className="game-title">{game.title}</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '20px', color: '#666' }}>
                                No hay juegos en progreso. <a href="/search">Añade uno!</a>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lists-section">
                    <div className="section-header">
                        <h2 className="section-title">Mis listas</h2>
                        <a href="#" className="view-all">+ Nueva</a>
                    </div>
                    <div className="custom-lists">
                        {data.lists.length > 0 ? (
                            data.lists.map(list => (
                                <div key={list.id} className="list-item" onClick={() => navigate(`/list/${list.id}`)}>
                                    <div className="list-name">
                                        <span>📋</span>
                                        <span>{list.name}</span>
                                    </div>
                                    <div className="list-count">{list.game_count} juegos</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '20px', color: '#666' }}>
                                No tienes listas personalizadas todavía.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="section backlog-section">
                <div className="section-header">
                    <h2 className="section-title">Backlog</h2>
                    <a href="#" className="view-all">Ver todos →</a>
                </div>
                <div className="game-grid">
                    {data.backlog.length > 0 ? (
                        data.backlog.map(game => (
                            <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                                <div className="game-cover" style={{
                                    backgroundImage: game.cover_url ? `url(${game.cover_url})` : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}>
                                    {!game.cover_url && 'Sin portada'}
                                </div>
                                <div className="game-title">{game.title}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', color: '#666' }}>
                            Tu backlog está vacío. <a href="/search">Añade juegos!</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Dashboard