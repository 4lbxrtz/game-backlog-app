import './Dashboard.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import NavigationHeaderModal from '../components/NavigationHeaderModal'
import SettingsModal from '../components/SettingsModal'
import { Footer } from '../components/Footer'


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
    wishlist: Game[]
    completed: Game[]
}

function Dashboard() {
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()
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
                <NavigationHeaderModal />
                <div className="user-section">
                    <button className="add-button" onClick={() => navigate('/search')}>Añadir juego</button>
                    <SettingsModal />
                </div>
            </header>

            <div className="greeting">
                <div className="greeting-text">Hola {data.user.username},</div>
                <div className="greeting-subtext">¿qué título te gustaría explorar?</div>
            </div>

            <div className="stats-container">
                <div className="stats-bar">
                    {/* ... (Tus items de estadísticas se mantienen igual) ... */}
                     <div className="stat-item clickable" onClick={() => navigate('/status/played')}>
                        <div className="stat-label">Completados</div>
                        <div className="stat-value">{data.stats.completed}</div>
                    </div>
                    <div className="stat-item clickable" onClick={() => navigate('/status/playing')}>
                        <div className="stat-label">Jugando</div>
                        <div className="stat-value">{data.stats.playing}</div>
                    </div>
                    <div className="stat-item clickable" onClick={() => navigate('/status/backlog')}>
                        <div className="stat-label">Backlog</div>
                        <div className="stat-value">{data.stats.backlog}</div>
                    </div>
                    <div className="stat-item clickable" onClick={() => navigate('/status/wishlist')}>
                        <div className="stat-label">Wishlist</div>
                        <div className="stat-value">{data.stats.wishlist}</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Puntuación media</div>
                        <div className="stat-value">{data.stats.averageRating}</div>
                    </div>
                </div>
            </div>

            {/* --- AQUÍ EMPIEZA EL CAMBIO DE ESTRUCTURA --- */}
            
            <div className="main-content">
                {/* COLUMNA IZQUIERDA (Agrupa Jugando y Completados) */}
                <div className="dashboard-left-column">
                    
                    {/* 1. JUGANDO (Limit 5) */}
                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">Jugando actualmente</h2>
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/status/Playing'); }} className="view-all">Ver todos →</a>
                        </div>
                        <div className="game-grid">
                            {data.currentlyPlaying.length > 0 ? (
                                data.currentlyPlaying.slice(0, 5).map(game => (
                                    <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                                        <div className="game-cover" style={{backgroundImage: game.cover_url ? `url(${game.cover_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                                            {!game.cover_url && 'Sin portada'}
                                        </div>
                                        <div className="game-title">{game.title}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', color: '#666' }}>No hay juegos en progreso. <a href="/search">Añade uno!</a></div>
                            )}
                        </div>
                    </div>

                    {/* 2. COMPLETADOS (Limit 5 - MOVIDO AQUÍ) */}
                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">Completados recientemente</h2>
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/status/Played'); }} className="view-all">Ver todos →</a>
                        </div>
                        <div className="game-grid">
                            {data.completed.length > 0 ? (
                                data.completed.slice(0, 5).map(game => (
                                    <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                                        <div className="game-cover" style={{backgroundImage: game.cover_url ? `url(${game.cover_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                                            {!game.cover_url && 'Sin portada'}
                                        </div>
                                        <div className="game-title">{game.title}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '20px', color: '#666' }}>Aún no has completado juegos.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA (Listas - Limit 4) */}
                <div className="lists-section">
                    <div className="section-header">
                        <h2 className="section-title">Mis listas</h2>
                        <a href="/list" className="view-all">Ver todas →</a>
                    </div>
                    <div className="custom-lists">
                        {data.lists.length > 0 ? (
                            [...data.lists]
                            .sort((a, b) => b.game_count - a.game_count)
                            .slice(0, 4)
                            .map(list => (
                                <div key={list.id} className="list-item" onClick={() => navigate(`/list/${list.id}`)}>
                                    <div className="list-name"><span>📋</span><span>{list.name}</span></div>
                                    <div className="list-count">{list.game_count} juegos</div>
                                </div>
                            ))
                        ) : (
                            <div style={{ padding: '20px', color: '#666' }}>No tienes listas personalizadas todavía.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* SECCIONES INFERIORES (Backlog y Wishlist - Limit 10) */}
            
            {/* 3. BACKLOG */}
            <div className="section backlog-section">
                <div className="section-header">
                    <h2 className="section-title">Backlog</h2>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/status/backlog'); }} className="view-all">Ver todos →</a>
                </div>
                <div className="game-grid">
                    {data.backlog.length > 0 ? (
                        data.backlog.slice(0, 10).map(game => (
                            <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                                <div className="game-cover" style={{backgroundImage: game.cover_url ? `url(${game.cover_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                                    {!game.cover_url && 'Sin portada'}
                                </div>
                                <div className="game-title">{game.title}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', color: '#666' }}>Tu backlog está vacío. <a href="/search">Añade juegos!</a></div>
                    )}
                </div>
            </div>

            {/* 4. WISHLIST */}
            <div className="section">
                <div className="section-header">
                    <h2 className="section-title">Lista de deseados</h2>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/status/Wishlist'); }} className="view-all">Ver todos →</a>
                </div>
                <div className="game-grid">
                    {data.wishlist.length > 0 ? (
                        data.wishlist.slice(0, 10).map(game => (
                            <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                                <div className="game-cover" style={{backgroundImage: game.cover_url ? `url(${game.cover_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                                    {!game.cover_url && 'Sin portada'}
                                </div>
                                <div className="game-title">{game.title}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', color: '#666' }}>Tu wishlist está vacía. <a href="/search">Añade uno!</a></div>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    )
}

export default Dashboard