import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listService, type CustomList } from '../services/listService';
import { CreateListModal } from '../components/CreateListModal';
import { DeleteListModal } from '../components/DeleteListModal'; // <--- IMPORTAR
import './List.css';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';

export function List() {
    const navigate = useNavigate();
    const [lists, setLists] = useState<CustomList[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Recientes');

    // Estado para saber qué lista estamos borrando
    const [listToDelete, setListToDelete] = useState<CustomList | null>(null); // <--- NUEVO

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
        fetchLists();
    };

    // Función que se ejecuta cuando confirmamos en el modal
    const handleConfirmDelete = async () => {
        if (!listToDelete) return;
        
        await listService.deleteList(listToDelete.id);
        
        // Actualizamos la UI quitando la lista borrada
        setLists(lists.filter(l => l.id !== listToDelete.id));
        setListToDelete(null);
    };

    // Función para abrir el modal (evitando que se abra el detalle de la lista)
    const openDeleteModal = (e: React.MouseEvent, list: CustomList) => {
        e.stopPropagation(); // IMPORTANTE: Evita navegar al detalle
        setListToDelete(list);
    };

    // ... (Lógica de sorting y renderPreviews se mantiene igual) ...
    const getSortedLists = () => { /* ... tu código existente ... */ 
        const sorted = [...lists];
        switch (sortBy) {
            case 'Nombre A-Z': return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'Nombre Z-A': return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'Más juegos': return sorted.sort((a, b) => (b.game_count || 0) - (a.game_count || 0));
            case 'Menos juegos': return sorted.sort((a, b) => (a.game_count || 0) - (b.game_count || 0));
            case 'Recientes': default: return sorted.sort((a, b) => b.id - a.id);
        }
    };

    const renderPreviews = (covers: string[] = []) => { /* ... tu código existente ... */ 
        const slots = Array(5).fill(null);
        return slots.map((_, index) => {
            const coverUrl = covers[index];
            return (
                <div key={index} className="preview-game">
                    {coverUrl ? <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} /> : <span style={{ opacity: 0.3 }}>🎮</span>}
                </div>
            );
        });
    };

    if (loading) return <div className="container" style={{paddingTop: '100px', textAlign: 'center'}}>Cargando listas...</div>;

    return (
        <div className="container">
            <Navbar />
            <div className="page-header">
                <h1 className="page-title">Mis Listas</h1>
                <p className="page-subtitle">Organiza tus juegos en colecciones personalizadas</p>
            </div>

            <div className="controls-bar">
                <div className="lists-count">{lists.length} listas</div>
                <div className="controls-right">
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="Recientes">Recientes</option>
                        <option value="Nombre A-Z">Nombre A-Z</option>
                        <option value="Nombre Z-A">Nombre Z-A</option>
                        <option value="Más juegos">Más juegos</option>
                        <option value="Menos juegos">Menos juegos</option>
                    </select>
                    <button className="btn-create" onClick={() => setIsCreateModalOpen(true)}>+ Crear lista</button>
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
                            onClick={() => navigate(`/list/${list.id}`)}
                            style={{ cursor: 'pointer', position: 'relative' }} // relative para posicionar el botón
                        >
                            {/* BOTÓN DE BORRAR */}
                            <button 
                                className="delete-list-btn"
                                onClick={(e) => openDeleteModal(e, list)}
                                title="Eliminar lista"
                            >
                                🗑️
                            </button>

                            <div className="list-preview">
                                {renderPreviews(list.covers)}
                            </div>
                            <div className="list-info">
                                <div className="list-meta">{list.game_count || 0} juegos</div>
                                <div className="list-description">{list.name || "Sin Nombre"}</div>
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

            {/* MODAL DE BORRADO */}
            <DeleteListModal
                isOpen={!!listToDelete}
                onClose={() => setListToDelete(null)}
                onConfirm={handleConfirmDelete}
                listName={listToDelete?.name || ''}
            />
            <span style={{ display: 'block', height: '20px' }}></span>
            <Footer />
        </div>
    );
}