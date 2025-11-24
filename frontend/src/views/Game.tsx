import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { gameService } from '../services/gameService'
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
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchGame() {
            if (!id) {
                setLoading(false)
                return
            }

            try {
                const gameData = await gameService.getById(Number(id))
                setGame(gameData)
            } catch (error) {
                console.error('Error loading game data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchGame()
    }, [id])

    if (loading) {
        return <div>Cargando...</div>
    }

    if (!game) {
        return <div>Juego no encontrado.</div>
    }

    async function handleAddToCollection(estado: string) {
        try {
            if (game === null) {
                throw new Error('Juego no disponible.')
            }
            await gameService.addToCollection(game.id, estado)
            alert(`Juego añadido a tu colección como "${estado}".`)
        } catch (error) {
            console.error('Error añadiendo juego a la colección:', error)
            alert('Error al añadir el juego a la colección.')
        }
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
                <div className="my-rating-box">
                    <div className="rating-display">
                        <div className="rating-label">Tu valoración</div>
                        <div className="rating-value">5.0</div>
                        <div className="stars">★★★★★</div>
                    </div>
                    <div className="status-selector">
                        <div className="status-option" onClick={() => handleAddToCollection('Wishlist')}>
                            <div className="status-icon">📋</div>
                            <div className="status-label">Wishlist</div>
                        </div>
                        <div className="status-option" onClick={() => handleAddToCollection('Backlog')}>
                            <div className="status-icon">📚</div>
                            <div className="status-label">Backlog</div>
                        </div>
                        <div className="status-option active" onClick={() => handleAddToCollection('Playing')}>
                            <div className="status-icon">🎮</div>
                            <div className="status-label">Jugando</div>
                        </div>
                        <div className="status-option" onClick={() => handleAddToCollection('Completed')}>
                            <div className="status-icon">✓</div>
                            <div className="status-label">Completado</div>
                        </div>
                    </div>
                </div>
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
                    <button className="btn-primary">+ Añadir log</button>
                    <button className="btn-secondary">Editar estado</button>
                    <button className="btn-secondary">Añadir a lista</button>
                </div>
            </div>
        </div>

        <div className="section">
            <div className="section-header">
                <h2 className="section-title">Mis pasadas</h2>
            </div>
            <div className="logs-container">
                <div className="log-card">
                    <div className="log-header">
                        <div>
                            <div className="log-title">Primera pasada - 112% completado</div>
                            <div className="log-date">Enero 2024 - Marzo 2024</div>
                        </div>
                        <div className="log-rating">
                            <div className="log-rating-value">5.0</div>
                            <div className="stars">★★★★★</div>
                        </div>
                    </div>
                    <div className="log-details">
                        <div className="log-detail-item">
                            <span className="log-detail-label">Plataforma</span>
                            <span className="log-detail-value">Nintendo Switch</span>
                        </div>
                        <div className="log-detail-item">
                            <span className="log-detail-label">Tiempo jugado</span>
                            <span className="log-detail-value">~65 horas</span>
                        </div>
                        <div className="log-detail-item">
                            <span className="log-detail-label">Estado</span>
                            <span className="log-detail-value">Completado</span>
                        </div>
                    </div>
                    <div className="log-review">
                        Una obra maestra absoluta. El diseño de niveles es impecable, cada zona tiene su propia identidad y secretos por descubrir. Los combates contra jefes son desafiantes pero justos, y la sensación de progresión es increíble. La atmósfera y la banda sonora crean una experiencia inolvidable. Conseguir el 112% fue un viaje largo pero gratificante.
                    </div>
                    <div className="log-tags">
                        <span className="tag">Desafiante</span>
                        <span className="tag">Atmósfera única</span>
                        <span className="tag">Obra maestra</span>
                    </div>
                </div>

                <div className="log-card">
                    <div className="log-header">
                        <div>
                            <div className="log-title">Speedrun casual</div>
                            <div className="log-date">Agosto 2024</div>
                        </div>
                        <div className="log-rating">
                            <div className="log-rating-value">4.5</div>
                            <div className="stars">★★★★★</div>
                        </div>
                    </div>
                    <div className="log-details">
                        <div className="log-detail-item">
                            <span className="log-detail-label">Plataforma</span>
                            <span className="log-detail-value">PC</span>
                        </div>
                        <div className="log-detail-item">
                            <span className="log-detail-label">Tiempo jugado</span>
                            <span className="log-detail-value">~12 horas</span>
                        </div>
                        <div className="log-detail-item">
                            <span className="log-detail-label">Estado</span>
                            <span className="log-detail-value">Completado</span>
                        </div>
                    </div>
                    <div className="log-review">
                        Decidí hacer una pasada rápida para volver a experimentar el juego. Increíble cómo conociendo el mapa y las mecánicas todo fluye de manera diferente. Una experiencia totalmente distinta a la primera vez.
                    </div>
                    <div className="log-tags">
                        <span className="tag">Speedrun</span>
                        <span className="tag">Rejugabilidad</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}

export default Game