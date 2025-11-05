
export default function UserPage() {

    return (
        <div>
            <div className="container">
                <header>
                    <div className="logo">
                        <span className="logo-icon">🎮</span>
                <span>GameTracker</span>
            </div>
            <div className="user-section">
                <button className="add-button">Añadir juego</button>
                <div className="avatar">JD</div>
            </div>
        </header>

        <div className="greeting">
            <div className="greeting-text">Qué tal todo, Juan?</div>
            <div className="greeting-subtext">Preparado para jugar algo?</div>
        </div>

        <div className="stats-container">
            <div className="stats-bar">
                <div className="stat-item">
                    <div className="stat-label">Completados</div>
                    <div className="stat-value">47</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Jugando</div>
                    <div className="stat-value">3</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Backlog</div>
                    <div className="stat-value">23</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Wishlist</div>
                    <div className="stat-value">15</div>
                </div>
                <div className="stat-item">
                    <div className="stat-label">Puntuación media</div>
                    <div className="stat-value">4.2</div>
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
                    <div className="game-card">
                        <div className="game-cover">Portada</div>
                        <div className="game-title">The Legend of Zelda: Tears of the Kingdom</div>
                    </div>
                    <div className="game-card">
                        <div className="game-cover">Portada</div>
                        <div className="game-title">Baldur's Gate 3</div>
                    </div>
                    <div className="game-card">
                        <div className="game-cover">Portada</div>
                        <div className="game-title">Persona 5 Royal</div>
                    </div>
                </div>
            </div>

            <div className="lists-section">
                <div className="section-header">
                    <h2 className="section-title">Mis listas</h2>
                    <a href="#" className="view-all">+ Nueva</a>
                </div>
                <div className="custom-lists">
                    <div className="list-item">
                        <div className="list-name">
                            <span>🌟</span>
                            <span>Favoritos de 2025</span>
                        </div>
                        <div className="list-count">8 juegos</div>
                    </div>
                    <div className="list-item">
                        <div className="list-name">
                            <span>🎭</span>
                            <span>RPGs por jugar</span>
                        </div>
                        <div className="list-count">15 juegos</div>
                    </div>
                    <div className="list-item">
                        <div className="list-name">
                            <span>☕</span>
                            <span>Cozy Games</span>
                        </div>
                        <div className="list-count">12 juegos</div>
                    </div>
                    <div className="list-item">
                        <div className="list-name">
                            <span>⚔️</span>
                            <span>Souls-like Challenge</span>
                        </div>
                        <div className="list-count">6 juegos</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="section backlog-section">
            <div className="section-header">
                <h2 className="section-title">Backlog</h2>
                <a href="#" className="view-all">Ver todos →</a>
            </div>
            <div className="game-grid">
                <div className="game-card">
                    <div className="game-cover">Portada</div>
                    <div className="game-title">Elden Ring</div>
                </div>
                <div className="game-card">
                    <div className="game-cover">Portada</div>
                    <div className="game-title">Red Dead Redemption 2</div>
                </div>
                <div className="game-card">
                    <div className="game-cover">Portada</div>
                    <div className="game-title">Hollow Knight</div>
                </div>
                <div className="game-card">
                    <div className="game-cover">Portada</div>
                    <div className="game-title">Disco Elysium</div>
                </div>
                <div className="game-card">
                    <div className="game-cover">Portada</div>
                    <div className="game-title">Hades</div>
                </div>
                <div className="game-card">
                    <div className="game-cover">Portada</div>
                    <div className="game-title">Stardew Valley</div>
                </div>
            </div>
        </div>
    </div>
</div>
    );
}