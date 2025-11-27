import { useState, useEffect } from 'react';
import { listService, type CustomList } from '../services/listService';
import './LogModal.css'; // Reuse the same modal styles

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameId: number;
}

export function ListSelectorModal({ isOpen, onClose, gameId }: Props) {
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State for creating a new list
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Fetch lists when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLists();
    }
  }, [isOpen]);

  async function loadLists() {
    try {
      setLoading(true);
      const data = await listService.getMyLists();
      setLists(data);
    } catch (error) {
      console.error("Error fetching lists", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddGame(listId: number) {
    try {
      await listService.addGameToList(listId, gameId);
      alert("Juego añadido a la lista correctamente.");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al añadir juego (quizás ya está en la lista).");
    }
  }

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName) return;

    try {
      await listService.createList(newListName);
      setNewListName('');
      setShowCreateForm(false);
      loadLists(); // Refresh list to show the new one
    } catch (error) {
      alert("Error creando la lista");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Añadir a una lista</h2>

        {loading ? (
          <p>Cargando listas...</p>
        ) : (
          <div className="lists-selection">
            {lists.length === 0 && !showCreateForm && (
              <p style={{marginBottom: '1rem', color: '#888'}}>No tienes listas creadas.</p>
            )}

            {/* List of existing lists */}
            {!showCreateForm && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {lists.map(list => (
                  <button 
                    key={list.id} 
                    className="btn-secondary" 
                    style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                    onClick={() => handleAddGame(list.id)}
                  >
                    📂 {list.name}
                  </button>
                ))}
              </div>
            )}

            {/* Create New List Form */}
            {showCreateForm ? (
              <form onSubmit={handleCreateList} style={{ marginBottom: '1rem' }}>
                <div className="form-group">
                  <label>Nombre de la nueva lista</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newListName}
                    onChange={e => setNewListName(e.target.value)}
                    placeholder="Ej: JRPGs Favoritos"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn-primary">Crear</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancelar</button>
                </div>
              </form>
            ) : (
              <button 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={() => setShowCreateForm(true)}
              >
                + Crear nueva lista
              </button>
            )}
          </div>
        )}
        
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
           <button className="btn-secondary" onClick={onClose} style={{border: 'none'}}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}