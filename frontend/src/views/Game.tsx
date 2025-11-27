import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { gameService } from '../services/gameService'
import StatusSelector from '../components/status'
import { logService, type Log } from '../services/logService'
import { LogModal } from '../components/LogModal'
import { ListSelectorModal } from '../components/ListSelectorModal';
import './Game.css'

interface Game {
    id: number
    title: string
    cover_url?: string
    genres: { id?: number; name: string }[]
    platforms: { id?: number; name: string }[]
    release_year: number
    release_date?: string
    description: string
    global_rating: number
    rating_count: number
}


function Game() {
    const navigate = useNavigate()

    const { id } = useParams<{ id?: string }>()

    const [game, setGame] = useState<Game | null>(null)
    const [logs, setLogs] = useState<Log[]>([]) // State for Logs
    const [userStatus, setUserStatus] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isLogModalOpen, setIsLogModalOpen] = useState(false) // State for Modal
    const [isListModalOpen, setIsListModalOpen] = useState(false); // <--- New State


    // Helper to format dates (e.g., "2024-01-15" -> "Enero 2024")
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    }

    // Helper to format date range
    const renderDateRange = (start?: string, end?: string) => {
        if (!start && !end) return '';
        if (start && !end) return `Desde ${formatDate(start)}`;
        if (!start && end) return `Finalizado en ${formatDate(end)}`;
        return `${formatDate(start)} - ${formatDate(end)}`;
    }

    useEffect(() => {
        async function fetchData() {
            if (!id) {
                setLoading(false)
                return
            }

            try {
                // 1. Fetch Game
                const gameData = await gameService.getById(Number(id))
                setGame(gameData)
                // 2. Fetch Logs (Only if game exists)
                const logsData = await logService.getByGameId(Number(id))
                setLogs(logsData)

                // 3. Fetch User Status (Try/Catch in case it's not in collection yet)
                try {
                    const status = await gameService.getStatus(Number(id))
                    setUserStatus(status)
                    console.log('User status fetched:', status)
                } catch (error) {
                    // If 404 or error, it usually means game is not in collection
                    console.log('Game not in user collection yet.', error)
                    setUserStatus(null) 
                }
            } catch (error) {
                console.error('Error loading game data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    // Handle creating a new log
    const handleCreateLog = async (logData: any) => {
        if (!game) return;
        
        // Add gameId to payload
        await logService.create({
            ...logData,
            gameId: game.id
        });

        // Refresh logs list
        const updatedLogs = await logService.getByGameId(game.id);
        setLogs(updatedLogs);
    }

    
    if (loading) {
        return <div>Cargando...</div>
    }

    if (!game) {
        return <div>Juego no encontrado.</div>
    }

    return (
    <div className="container">
        <header>
            <a href="#" className="logo">
                <span className="logo-icon">🎮</span>
                <span>GameTracker</span>
            </a>
            <button className="back-button" onClick={() => navigate('/dashboard')}>← Volver</button>
        </header>

        <div className="game-hero">
            <div className="cover-section">
                <div className="game-cover"><img src={game?.cover_url} alt={game?.title} /></div>
                <div className="rating-display">
                        <div className="rating-label">Tu valoración</div>
                        <div className="rating-value">5.0</div>
                        <div className="stars">★★★★★</div>
                    </div>
                <StatusSelector gameId={game.id} currentStatus={userStatus} onStatusChange={(newStatus) => {setUserStatus(newStatus)}} />
            </div>
            <div className="game-info">
                <h1 className="game-title-main">{game?.title}</h1>
                <div className="game-meta">
                    <span className="meta-item">{game?.genres.map((genre) => genre.name).join(', ')}</span>
                    <span className="meta-item">{game?.platforms.map((platform) => platform.name).join(', ')}</span>
                    <span className="meta-item">{game?.release_date}</span>
                </div>
                <p className="game-description">
                    {game?.description}
                </p>
                <div className="ratings-section">
                    <div className="global-rating-header">
                        <div className="rating-label">Valoración global</div>
                        <div className="rating-value">4.6</div>
                        <div className="stars">★★★★★</div>
                        <div className="rating-count">Basado en 1,247 valoraciones</div>
                    </div>
                    <div className="rating-bars">
                        <div className="rating-bar-row">
                            <span className="rating-bar-label">5★</span>
                            <div className="rating-bar-track">
                                <div className="rating-bar-fill"></div>
                            </div>
                            <span className="rating-bar-count">847</span>
                        </div>
                        <div className="rating-bar-row">
                            <span className="rating-bar-label">4★</span>
                            <div className="rating-bar-track">
                                <div className="rating-bar-fill"></div>
                            </div>
                            <span className="rating-bar-count">274</span>
                        </div>
                        <div className="rating-bar-row">
                            <span className="rating-bar-label">3★</span>
                            <div className="rating-bar-track">
                                <div className="rating-bar-fill"></div>
                            </div>
                            <span className="rating-bar-count">87</span>
                        </div>
                        <div className="rating-bar-row">
                            <span className="rating-bar-label">2★</span>
                            <div className="rating-bar-track">
                                <div className="rating-bar-fill"></div>
                            </div>
                            <span className="rating-bar-count">25</span>
                        </div>
                        <div className="rating-bar-row">
                            <span className="rating-bar-label">1★</span>
                            <div className="rating-bar-track">
                                <div className="rating-bar-fill"></div>
                            </div>
                            <span className="rating-bar-count">14</span>
                        </div>
                    </div>
                </div>
                <div className="action-buttons">
                        <button className="btn-primary" onClick={() => setIsLogModalOpen(true)}>
                            + Añadir log
                        </button>
                        <button className="btn-secondary">Editar estado</button>
                        
                        {/* CONNECT THE BUTTON */}
                        <button 
                            className="btn-secondary"
                            onClick={() => setIsListModalOpen(true)}
                        >
                            Añadir a lista
                        </button>
                    </div>
            </div>
        </div>

        <div className="section">
                <div className="section-header">
                    <h2 className="section-title">Mis pasadas ({logs.length})</h2>
                </div>
                
                <div className="logs-container">
                    {logs.length === 0 ? (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>No has registrado ninguna partida aún.</p>
                    ) : (
                        logs.map(log => (
                            <div className="log-card" key={log.id}>
                                <div className="log-header">
                                    <div>
                                        <div className="log-title">{log.title}</div>
                                        <div className="log-date">
                                            {renderDateRange(log.start_date, log.end_date)}
                                        </div>
                                    </div>
                                    {/* Removed Rating per log as per schema update */}
                                </div>
                                
                                <div className="log-details">
                                    {log.platform_name && (
                                        <div className="log-detail-item">
                                            <span className="log-detail-label">Plataforma</span>
                                            <span className="log-detail-value">{log.platform_name}</span>
                                        </div>
                                    )}
                                    {log.time_played ? (
                                        <div className="log-detail-item">
                                            <span className="log-detail-label">Tiempo jugado</span>
                                            {/* Convert minutes back to hours for display */}
                                            <span className="log-detail-value">~{(log.time_played / 60).toFixed(1)} horas</span>
                                        </div>
                                    ) : null}
                                </div>
                                
                                {log.review && (
                                    <div className="log-review">
                                        {log.review}
                                    </div>
                                )}
                                
                            </div>
                        ))
                    )}
                </div>
            </div>
            {/* Modal Component */}
            <LogModal 
                isOpen={isLogModalOpen} 
                onClose={() => setIsLogModalOpen(false)}
                onSubmit={handleCreateLog}
                platforms={game.platforms} // Pass game platforms to dropdown
            />
            <ListSelectorModal
                isOpen={isListModalOpen}
                onClose={() => setIsListModalOpen(false)}
                gameId={game.id}
            />
    </div>
    )
}

export default Game