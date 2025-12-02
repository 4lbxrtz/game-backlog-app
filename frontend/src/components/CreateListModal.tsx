// components/CreateListModal.tsx
import { useState } from 'react';
import './LogModal.css'; // Reusing your existing modal styles

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, description: string) => Promise<void>;
}

export function CreateListModal({ isOpen, onClose, onSubmit }: Props) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(name, description);
            setName('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Crear Nueva Lista</h2>
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
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creando...' : 'Crear Lista'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}