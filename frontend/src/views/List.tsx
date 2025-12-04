import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listService, type CustomList } from '../services/listService';
import { CreateListModal } from '../components/CreateListModal';
import NavigationHeaderModal from '../components/NavigationHeaderModal';
import './List.css';

export function List() {
    const navigate = useNavigate();
    const [lists, setLists] = useState<CustomList[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Recientes');

    useEffect(() => {
        fetchLists();
    }, []);

    async function fetchLists() {
        try {
            const data = await listService.getMyLists();
            setLists(data);
        } catch (error) {
            console.error("Error loading lists", error);
        } finally {
            setLoading(false);
        }
    }

    const handleCreateList = async (name: string, description: string) => {
        await listService.createList(name, description);
        // Refresh lists after creation
        fetchLists();
    };

    // Sorting Logic
    const getSortedLists = () => {
        const sorted = [...lists];
        switch (sortBy) {
            case 'Nombre A-Z':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'Nombre Z-A':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'Más juegos':
                return sorted.sort((a, b) => (b.game_count || 0) - (a.game_count || 0));
            case 'Menos juegos':
                return sorted.sort((a, b) => (a.game_count || 0) - (b.game_count || 0));
            case 'Recientes':
            default:
                // Assuming ID represents creation order (descending)
                return sorted.sort((a, b) => b.id - a.id);
        }
    };

    // Helper to render the 5 preview slots
    const renderPreviews = (covers: string[] = []) => {
        const slots = Array(5).fill(null); // Create 5 empty slots
        
        return slots.map((_, index) => {
            const coverUrl = covers[index];
            return (
                <div key={index} className="preview-game">
                    {coverUrl ? (
                        <img 
                            src={coverUrl} 
                            alt="Cover" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                        />
                    ) : (
                        <span style={{ opacity: 0.3 }}>🎮</span>
                    )}
                </div>
            );
        });
    };

    if (loading) return <div className="container" style={{paddingTop: '100px', textAlign: 'center'}}>Cargando listas...</div>;

    return (
        <div className="container">
            <header>
                <NavigationHeaderModal />
                <div className="user-section">
                    <div className="avatar">JD</div>
                </div>
            </header>

            <div className="page-header">
                <h1 className="page-title">Mis Listas</h1>
                <p className="page-subtitle">Organiza tus juegos en colecciones personalizadas</p>
            </div>

            <div className="controls-bar">
                <div className="lists-count">{lists.length} listas</div>
                <div className="controls-right">
                    <button className="filter-button">
                        <span>⚙️</span>
                        <span>Filtros</span>
                    </button>
                    
                    <select 
                        className="sort-select" 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="Recientes">Recientes</option>
                        <option value="Nombre A-Z">Nombre A-Z</option>
                        <option value="Nombre Z-A">Nombre Z-A</option>
                        <option value="Más juegos">Más juegos</option>
                        <option value="Menos juegos">Menos juegos</option>
                    </select>
                    
                    <button 
                        className="btn-create"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        + Crear lista
                    </button>
                </div>
            </div>

            <div className="lists-grid">
                {lists.length === 0 ? (
                    <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#666'}}>
                        <h3>No tienes listas creadas</h3>
                        <p>Crea tu primera lista para empezar a organizar tu colección.</p>
                    </div>
                ) : (
                    getSortedLists().map(list => (
                        <div 
                            key={list.id} 
                            className="list-card"
                            onClick={() => navigate(`/list/${list.id}`)} // Navigate to details
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="list-preview">
                                {renderPreviews(list.covers)}
                            </div>
                            <div className="list-info">
                                <div className="list-header">
                                    <div className="list-name">{list.name}</div>
                                </div>
                                <div className="list-meta">
                                    {list.game_count || 0} juegos
                                </div>
                                <div className="list-description">
                                    {list.description || "Sin descripción"}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <CreateListModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateList}
            />
        </div>
    );
}