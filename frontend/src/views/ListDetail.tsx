import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listService, type CustomList, type ListGame } from '../services/listService';
import { CreateListModal } from '../components/CreateListModal'; // Reuse this for Editing
import NavigationHeaderModal from '../components/NavigationHeaderModal';
import '../views/ListDetail.css';

export function ListDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // State
    const [list, setList] = useState<CustomList | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('Orden del usuario');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch Data on Load
    useEffect(() => {
        async function fetchList() {
            if (!id) return;
            try {
                const data = await listService.getListById(Number(id));
                setList(data);
            } catch (error) {
                console.error("Error fetching list:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchList();
    }, [id]);

    // Handle Editing (Updating name/description)
    const handleUpdateList = async (name: string, description: string) => {
        if (!list) return;
        try {
            // Note: Ensure listService has an updateList method, or add it similarly to createList
            // await listService.updateList(list.id, name, description);
            
            // Optimistic update for UI
            setList({ ...list, name, description });
            alert("Lista actualizada (Simulación - Implementar updateList en service)");
        } catch (error) {
            console.error(error);
        }
    };

    // --- LOGIC: Progress Circle Math ---
    const games = list?.games || [];
    const totalGames = games.length;
    const completedGames = games.filter(g => g.status === 'Completed').length;
    
    // Calculate percentage (0 if no games)
    const percentage = totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;
    
    // Circle SVG configuration
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // --- LOGIC: Sorting ---
    const getSortedGames = (): ListGame[] => {
        const sorted = [...games];
        switch (sortBy) {
            case 'Nombre A-Z':
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'Nombre Z-A':
                return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'Valoración':
                return sorted.sort((a, b) => (b.personal_rating || 0) - (a.personal_rating || 0));
            case 'Fecha añadido':
                // Assuming newer IDs are added later (or use a real date field if available)
                return sorted.sort((a, b) => b.id - a.id);
            case 'Orden del usuario':
            default:
                return sorted; 
        }
    };

    if (loading) return <div className="container" style={{paddingTop: '100px', textAlign: 'center'}}>Cargando...</div>;
    if (!list) return <div className="container" style={{paddingTop: '100px', textAlign: 'center'}}>Lista no encontrada</div>;

    return (
        <div className="container">
            <header>
                <NavigationHeaderModal />
                <button className="back-button" onClick={() => navigate('/list')}>
                    ← Volver a Listas
                </button>
            </header>

            <div className="list-hero">
                <div className="list-main-info">
                    <div className="list-header-row">
                        <h1 className="list-title">{list.name}</h1>
                    </div>
                    <p className="list-description">
                        {list.description || "Sin descripción."}
                    </p>
                    <div className="list-meta-row">
                        <div className="meta-item">
                            <span>📅</span>
                            <span>{totalGames} juegos en total</span>
                        </div>
                    </div>
                </div>

                <div className="list-sidebar">
                    <div className="sidebar-card">
                        <button className="btn-edit" onClick={() => setIsEditModalOpen(true)}>
                            Editar Lista
                        </button>
                        
                        <div className="stats-section">
                            <div className="stats-title">Has jugado</div>
                            <div className="progress-circle">
                                <svg className="progress-ring" width="120" height="120">
                                    {/* Background Circle */}
                                    <circle 
                                        className="progress-ring-circle" 
                                        stroke="#333" strokeWidth="8" fill="transparent"
                                        cx="60" cy="60" r={radius}
                                    ></circle>
                                    {/* Foreground Dynamic Circle */}
                                    <circle 
                                        className="progress-ring-circle-fill" 
                                        stroke="#ff4d6d" strokeWidth="8" fill="transparent"
                                        strokeDasharray={`${circumference} ${circumference}`}
                                        style={{ strokeDashoffset }}
                                        strokeLinecap="round"
                                        transform="rotate(-90 60 60)"
                                        cx="60" cy="60" r={radius}
                                    ></circle>
                                </svg>
                                <div className="progress-text">{percentage}%</div>
                            </div>
                            <div className="stats-label">{completedGames} / {totalGames} juegos</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="controls-bar">
                <div className="games-count">{totalGames} juegos</div>
                <div className="controls-right">
                    <div className="display-toggle">
                        <button 
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            🔲 Grid
                        </button>
                        <button 
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            📋 Lista
                        </button>
                    </div>
                    <select 
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option>Orden del usuario</option>
                        <option>Nombre A-Z</option>
                        <option>Nombre Z-A</option>
                        <option>Fecha añadido</option>
                        <option>Valoración</option>
                    </select>
                </div>
            </div>

            {/* DYNAMIC GAMES GRID */}
            <div className={`games-grid ${viewMode === 'list' ? 'view-list' : ''}`}>
                {getSortedGames().map(game => (
                    <div 
                        key={game.id} 
                        className="game-card"
                        onClick={() => navigate(`/game/${game.id}`)} // Navigate to Game Details
                    >
                        <div className="game-cover">
                            {game.cover_url ? (
                                <img src={game.cover_url} alt={game.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                                <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#333'}}>
                                    🎮
                                </div>
                            )}
                            
                            {/* Optional: Show status badge if available */}
                            {game.status && (
                                <div className="status-badge" style={{
                                    position: 'absolute', top: 5, right: 5, 
                                    background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px'
                                }}>
                                    {game.status === 'Completed' ? '✓' : 
                                     game.status === 'Playing' ? '▶' :
                                     game.status === "Backlog" ? '📚' : '📋'}
                                </div>
                            )}
                        </div>
                        <div className="game-title">{game.title}</div>
                    </div>
                ))}
            </div>

            {/* Reuse the Create Modal for Editing (you might want to modify the modal to accept initial values) */}
            <CreateListModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateList}
            />
        </div>
    );
}