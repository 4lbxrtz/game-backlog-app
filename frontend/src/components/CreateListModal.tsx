import { useState, useEffect } from 'react';
import './LogModal.css'; // Asumo que usas los mismos estilos

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string) => Promise<void>;
    initialData?: { name: string; description: string } | null; // <--- NUEVA PROP
}

export function CreateListModal({ isOpen, onClose, onSubmit, initialData }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // Efecto para rellenar o limpiar el formulario al abrirse
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // MODO EDICIÓN: Rellenar datos
                setName(initialData.name);
                setDescription(initialData.description || '');
            } else {
                // MODO CREACIÓN: Limpiar datos
                setName('');
                setDescription('');
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(name, description);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const isEditMode = !!initialData;

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{isEditMode ? 'Editar Lista' : 'Crear Nueva Lista'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre de la lista</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ej: RPGs Pendientes"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Descripción (Opcional)</label>
                        <textarea 
                            rows={3}
                            placeholder="¿Qué tipo de juegos guardas aquí?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Lista')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}