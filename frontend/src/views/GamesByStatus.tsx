import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gameService } from '../services/gameService';
import './GamesByStatus.css';
import NavigationHeaderModal from '../components/NavigationHeaderModal'
import SettingsModal from '../components/SettingsModal'
import { Footer } from '../components/Footer';

// Definimos los tipos locales
interface UserGame {
    id: number;
    title: string;
    cover_url?: string;
    status: string;
    personal_rating?: number;
    release_date?: string;
    added_at?: string;
}

export function GamesByStatus() {
    const navigate = useNavigate();
    const { initialTab } = useParams<{ initialTab: string }>(); // <--- Leemos el parámetro
    
    // Mapeo de Tabs (Nombre Visual) -> Status DB
    const tabs = [
        { label: 'Played', dbStatus: 'completed' },
        { label: 'Playing', dbStatus: 'playing' },
        { label: 'Backlog', dbStatus: 'backlog' },
        { label: 'Wishlist', dbStatus: 'wishlist' },
        { label: 'Abandoned', dbStatus: 'abandoned' }
    ];

    // Inicializar el estado basándonos en la URL o por defecto 'Backlog'
    // Verificamos si initialTab existe en nuestros tabs, si no, fallback a Backlog
    const getInitialTab = () => {
        if (initialTab && tabs.some(t => t.label === initialTab)) {
            return initialTab;
        }
        return 'Backlog';
    };

    const [games, setGames] = useState<UserGame[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(getInitialTab()); // <--- Usamos la función
    const [viewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('Añadidos recientemente');

    useEffect(() => {
        fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]); // Recargar cuando cambia el tab

    async function fetchGames() {
        setLoading(true);
        try {
            // Buscamos el status de DB correspondiente al Tab activo
            const currentStatus = tabs.find(t => t.label === activeTab)?.dbStatus || 'Backlog';
            const data = await gameService.getUserGames(currentStatus);
            setGames(data);
        } catch (error) {
            console.error("Error fetching games:", error);
        } finally {
            setLoading(false);
        }
    }

    // Lógica de Ordenación
    const getSortedGames = () => {
        const sorted = [...games];
        switch (sortBy) {
            case 'Nombre A-Z':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'Nombre Z-A':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'Fecha de lanzamiento':
                return sorted.sort((a, b) => 
                    new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime()
                );
            case 'Valoración':
                return sorted.sort((a, b) => (b.personal_rating || 0) - (a.personal_rating || 0));
            case 'Añadidos recientemente':
            default:
                // Asumimos que added_at viene de la query SQL, o usamos ID como fallback
                return sorted.sort((a, b) => 
                    new Date(b.added_at || 0).getTime() - new Date(a.added_at || 0).getTime()
                );
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header>
                <NavigationHeaderModal />
                <button className="back-button" type="button" onClick={() => navigate(-1)}> ← Volver </button>
                <button className="add-button" onClick={() => navigate('/search')}>Añadir juego</button>
                <SettingsModal />
            </header>

            {/* Wrap the page content in a div that grows to fill space */}
            <div style={{ flex: 1 }}>
                <div className="page-header">
                    <div className="games-count">
                        {loading ? 'Cargando...' : `${games.length} juegos`}
                    </div>
                </div>

                {/* TABS */}
                <div className="tabs-container">
                    <div className="tabs">
                        {tabs.map((tab) => (
                            <button 
                                key={tab.label}
                                className={`tab ${activeTab === tab.label ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.label)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="controls-bar">
                    <div className="controls-right">
                        <select 
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="Añadidos recientemente">Ordenar por ▼ Añadidos recientemente</option>
                            <option value="Nombre A-Z">Nombre A-Z</option>
                            <option value="Nombre Z-A">Nombre Z-A</option>
                            <option value="Fecha de lanzamiento">Fecha de lanzamiento</option>
                            <option value="Valoración">Valoración</option>
                        </select>
                    </div>
                </div>

                {/* GRID DE JUEGOS */}
                {loading ? (
                    <div style={{textAlign: 'center', padding: '50px'}}>Cargando juegos...</div>
                ) : games.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
                        No tienes juegos en la categoría <strong>{activeTab}</strong>.
                    </div>
                ) : (
                    <div className={`games-grid ${viewMode === 'list' ? 'view-list' : ''}`}>
                        {getSortedGames().map(game => (
                            <div 
                                key={game.id} 
                                className="game-card"
                                onClick={() => navigate(`/game/${game.id}`)}
                                style={{cursor: 'pointer'}}
                            >
                                <div className="game-cover">
                                    {game.cover_url ? (
                                        <img 
                                            src={game.cover_url} 
                                            alt={game.title} 
                                            style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%', height: '100%', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            background: '#333'
                                        }}>
                                            🎮
                                        </div>
                                    )}
                                </div>
                                <div className="game-title">{game.title}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Insert Footer at the bottom */}
            <Footer />
        </div> 
    );
}