import './Profile.css'
import NavigationHeaderModal from '../components/NavigationHeaderModal'
import SettingsModal from '../components/SettingsModal'
import { useNavigate } from 'react-router-dom'

import { Footer } from '../components/Footer'

export function Profile() {
    const navigate = useNavigate()

    return (
        <div className="container">
        <header>
            <NavigationHeaderModal />
            <button className="back-button" type="button" onClick={() => navigate(-1)}> ← Volver </button>
            <SettingsModal />
        </header>

        <div className="profile-hero">
            <div className="profile-sidebar">
                <div className="profile-avatar">Avatar</div>
                <div>
                    <h1 className="profile-username">
                        4lbxrtz
                        <span className="username-icon">🔗</span>
                    </h1>
                    <button className="btn-edit-profile">Editar Perfil</button>
                </div>
                <div className="rating-distribution">
                    <h3 className="rating-title">Valoraciones Personales</h3>
                    <div className="rating-bars">
                        <div className="rating-row">
                            <span className="rating-label">1★</span>
                            <div className="rating-bar">
                                <div className="rating-bar-fill" style={{width: "5%"}}></div>
                            </div>
                        </div>
                        <div className="rating-row">
                            <span className="rating-label">2★</span>
                            <div className="rating-bar">
                                <div className="rating-bar-fill" style={{width: "15%"}}></div>
                            </div>
                        </div>
                        <div className="rating-row">
                            <span className="rating-label">3★</span>
                            <div className="rating-bar">
                                <div className="rating-bar-fill" style={{width: "25%"}}></div>
                            </div>
                        </div>
                        <div className="rating-row">
                            <span className="rating-label">4★</span>
                            <div className="rating-bar">
                                <div className="rating-bar-fill" style={{width: "35%"}}></div>
                            </div>
                        </div>
                        <div className="rating-row">
                            <span className="rating-label">5★</span>
                            <div className="rating-bar">
                                <div className="rating-bar-fill" style={{width: "80%"}}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-main">
                <div className="stats-overview">
                    <div className="stat-box">
                        <div className="stat-number">010</div>
                        <div className="stat-label">Total Games Played</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">000</div>
                        <div className="stat-label">Played in 2025</div>
                    </div>
                    <div className="stat-box">
                        <div className="stat-number">026</div>
                        <div className="stat-label">Games Backloggd</div>
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Recently Played</h2>
                        <a href="#" className="view-all-link">Ver todos</a>
                    </div>
                    <div className="games-row">
                        <div className="game-card">
                            <div className="game-cover">Portada</div>
                            <div className="game-date">Oct 16</div>
                            <div className="game-title">Blasphemous</div>
                        </div>
                        <div className="game-card">
                            <div className="game-cover">Portada</div>
                            <div className="game-date">Sep 24</div>
                            <div className="game-title">Hollow Knight</div>
                        </div>
                        <div className="game-card">
                            <div className="game-cover">Portada</div>
                            <div className="game-date">Aug 12</div>
                            <div className="game-title">Celeste</div>
                        </div>
                        <div className="game-card">
                            <div className="game-cover">Portada</div>
                            <div className="game-date">Jul 30</div>
                            <div className="game-title">Hades</div>
                        </div>
                        <div className="game-card">
                            <div className="game-cover">Portada</div>
                            <div className="game-date">Jun 18</div>
                            <div className="game-title">Ori and the Blind Forest</div>
                        </div>
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Statistics</h2>
                    </div>
                    <div className="statistics-grid">
                        <div className="stat-card">
                            <h3 className="stat-card-title">Géneros más jugados</h3>
                            <div className="genre-list">
                                <div className="genre-item">
                                    <span className="genre-name">Acción</span>
                                    <span className="genre-count">24 juegos</span>
                                </div>
                                <div className="genre-item">
                                    <span className="genre-name">RPG</span>
                                    <span className="genre-count">18 juegos</span>
                                </div>
                                <div className="genre-item">
                                    <span className="genre-name">Plataformas</span>
                                    <span className="genre-count">15 juegos</span>
                                </div>
                                <div className="genre-item">
                                    <span className="genre-name">Aventura</span>
                                    <span className="genre-count">12 juegos</span>
                                </div>
                                <div className="genre-item">
                                    <span className="genre-name">Indie</span>
                                    <span className="genre-count">10 juegos</span>
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <h3 className="stat-card-title">Plataformas utilizadas</h3>
                            <div className="platform-list">
                                <span className="platform-tag">PC</span>
                                <span className="platform-tag">Nintendo Switch</span>
                                <span className="platform-tag">PlayStation 5</span>
                                <span className="platform-tag">Xbox Series X</span>
                                <span className="platform-tag">Steam Deck</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <h3 className="stat-card-title">Juegos por año</h3>
                            <div className="year-chart">
                                <div className="year-bar-container">
                                    <div className="year-bar" style={{height: "40%"}}></div>
                                    <span className="year-label">2021</span>
                                </div>
                                <div className="year-bar-container">
                                    <div className="year-bar" style={{height: "60%"}}></div>
                                    <span className="year-label">2022</span>
                                </div>
                                <div className="year-bar-container">
                                    <div className="year-bar" style={{height: "85%"}}></div>
                                    <span className="year-label">2023</span>
                                </div>
                                <div className="year-bar-container">
                                    <div className="year-bar" style={{height: "100%"}}></div>
                                    <span className="year-label">2024</span>
                                </div>
                                <div className="year-bar-container">
                                    <div className="year-bar" style={{height: "20%"}}></div>
                                    <span className="year-label">2025</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>

    )
}