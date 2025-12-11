import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listService, type CustomList, type ListGame } from '../services/listService';
import { CreateListModal } from '../components/CreateListModal';
import '../views/ListDetail.css';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';

export function ListDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [list, setList] = useState<CustomList | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('Orden del usuario');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchList();
    }, [id]);

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

    // --- LÓGICA DE EDICIÓN ---
    const handleUpdateList = async (name: string, description: string) => {
        if (!list) return;
        try {
            // 1. Llamar al backend
            await listService.updateList(list.id, name, description);
            
            // 2. Actualizar estado local (para verlo reflejado sin recargar)
            setList({ ...list, name, description });
        } catch (error) {
            console.error("Error al actualizar la lista:", error);
            alert("Error al actualizar la lista");
        }
    };

    // --- LÓGICA DE ELIMINAR JUEGO ---
    const handleRemoveGame = async (e: React.MouseEvent, gameId: number) => {
        // stopPropagation evita que al hacer click en la papelera nos lleve al detalle del juego
        e.stopPropagation(); 
        
        if (!list || !window.confirm("¿Quitar este juego de la lista?")) return;

        try {
            await listService.removeGameFromList(list.id, gameId);
            
            // Actualizar UI quitando el juego del array localmente
            setList({
                ...list,
                games: list.games?.filter(g => g.id !== gameId)
            });
        } catch (error) {
            console.error("Error eliminando juego:", error);
            alert("No se pudo eliminar el juego");
        }
    };

    // --- CÁLCULOS DE ESTADÍSTICAS ---
    const games = list?.games || [];
    const totalGames = games.length;
    const completedGames = games.filter(g => g.status === 'Completed').length;
    const percentage = totalGames > 0 ? Math.round((completedGames / totalGames) * 100) : 0;
    
    // UPDATED SVG Config (Smaller size)
    const size = 80; // Total width/height
    const center = size / 2; // 40
    const strokeWidth = 6;
    const radius = 32; // Smaller radius
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // --- ORDENACIÓN ---
    const getSortedGames = (): ListGame[] => {
        const sorted = [...games];
        switch (sortBy) {
            case 'Nombre A-Z': return sorted.sort((a, b) => a.title.localeCompare(b.title));
            case 'Nombre Z-A': return sorted.sort((a, b) => b.title.localeCompare(a.title));
            case 'Valoración': return sorted.sort((a, b) => (b.personal_rating || 0) - (a.personal_rating || 0));
            case 'Orden del usuario': default: return sorted; 
        }
    };

    if (loading) return <div className="container" style={{paddingTop:'100px', textAlign:'center'}}>Cargando...</div>;
    if (!list) return <div className="container" style={{paddingTop:'100px', textAlign:'center'}}>Lista no encontrada</div>;

    return (
        <div className="container">
            <Navbar />

            <div className="list-hero">
                <div className="list-main-info">
                    <div className="list-header-row">
                        <h1 className="list-title">{list.name}</h1>
                    </div>
                    <p className="list-description">{list.description || "Sin descripción."}</p>
                    <div className="list-meta-row">
                         {/* ... (Meta items iguales) ... */}
                    </div>
                    
                </div>

                <div className="list-sidebar">
                    <div className="sidebar-card compact-sidebar"> {/* Added 'compact-sidebar' class */}
                        <button className="btn-edit" onClick={() => setIsEditModalOpen(true)}>
                            Editar Lista
                        </button>
                        
                        <div className="stats-section horizontal-stats"> {/* Added 'horizontal-stats' class */}
                            
                            <div className="stats-info">
                                <div className="stats-title">Progreso</div>
                                <div className="stats-label">
                                    <span style={{color: '#fff', fontSize: '1.2rem', fontWeight: '500'}}>
                                        {completedGames}/{totalGames}
                                    </span> 
                                    <span style={{fontSize: '0.9rem', marginLeft: '4px'}}>juegos</span>
                                </div>
                            </div>
                            
                            <div className="progress-circle compact">
                                <svg className="progress-ring" width={size} height={size}>
                                    <circle 
                                        className="progress-ring-circle" 
                                        stroke="#333" 
                                        strokeWidth={strokeWidth} 
                                        fill="transparent"
                                        cx={center} 
                                        cy={center} 
                                        r={radius}
                                    />
                                    <circle 
                                        className="progress-ring-circle-fill" 
                                        stroke="#ff4d6d" 
                                        strokeWidth={strokeWidth} 
                                        fill="transparent"
                                        cx={center} 
                                        cy={center} 
                                        r={radius}
                                        strokeDasharray={`${circumference} ${circumference}`}
                                        style={{ strokeDashoffset }} 
                                        strokeLinecap="round"
                                        transform={`rotate(-90 ${center} ${center})`} 
                                    />
                                </svg>
                                <div className="progress-text compact-text">{percentage}%</div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div className="controls-bar">
                <div className="games-count">{totalGames} juegos</div>
                <div className="controls-right">
                    {/* ... (Toggles y Selects iguales) ... */}
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option>Orden del usuario</option>
                        <option>Nombre A-Z</option>
                        <option>Valoración</option>
                    </select>
                </div>
            </div>

            {/* GRID DE JUEGOS */}
            <div className={`games-grid ${viewMode === 'list' ? 'view-list' : ''}`}>
                {getSortedGames().map(game => (
                    <div 
                        key={game.id} 
                        className="game-card"
                        onClick={() => navigate(`/game/${game.id}`)}
                    >
                        {/* Botón de Eliminar (Papelera) */}
                        <button 
                            className="delete-game-btn"
                            title="Quitar de la lista"
                            onClick={(e) => handleRemoveGame(e, game.id)}
                        >
                            🗑️
                        </button>

                        <div className="game-cover">
                            {game.cover_url ? (
                                <img src={game.cover_url} alt={game.title}/>
                            ) : (
                                <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'#333'}}>🎮</div>
                            )}
                            
                            {/* Status Badge */}
                            {game.status && (
                                <div className="status-badge">
                                    {game.status === 'Completed' ? '✓' : game.status === 'Playing' ? '🎮' : game.status === 'Wishlist' ? '📋' : '📚'}
                                </div>
                            )}
                        </div>
                        <div className="game-title">{game.title}</div>
                    </div>
                ))}
                <div 
                    className="game-card add-game-placeholder"
                    onClick={() => navigate('/search')}
                    title="Añadir un juego nuevo a esta lista"
                >
                    <div className="game-cover add-game-cover-content">
                        <span className="plus-icon">+</span>
                    </div>
                    <div className="game-title" style={{color: '#888'}}>Añadir juego</div>
                </div>
            </div>

            {/* MODAL CONFIGURADO PARA EDICIÓN */}
            <CreateListModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleUpdateList}
                // PASAMOS LOS DATOS ACTUALES PARA QUE SE RELLENEN
                initialData={{ name: list.name, description: list.description || '' }}
            />
            <span style={{ display: 'block', height: '20px' }}></span>
            <Footer />
        </div>
    );
}