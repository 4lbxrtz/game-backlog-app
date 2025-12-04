import { useState, useEffect } from 'react';
import './LogModal.css'; // Reutilizamos estilos existentes

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    listName: string;
}

export function DeleteListModal({ isOpen, onClose, onConfirm, listName }: Props) {
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);

    // Resetear input cada vez que se abre el modal
    useEffect(() => {
        if (isOpen) setInputValue('');
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDelete = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // La palabra clave para confirmar
    const CONFIRMATION_WORD = "eliminar";
    const isMatch = inputValue.toLowerCase() === CONFIRMATION_WORD;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ borderColor: '#ff4d6d' }}>
                <h2 style={{ color: '#ff4d6d' }}>⚠️ Eliminar Lista</h2>
                
                <p style={{ marginBottom: '1rem', lineHeight: '1.5' }}>
                    ¿Estás seguro de que quieres eliminar la lista <strong>"{listName}"</strong>? 
                    <br />
                    <span style={{ color: '#aaa', fontSize: '0.9em' }}>
                        Esta acción no se puede deshacer y borrará la lista permanentemente.
                    </span>
                </p>

                <div className="form-group">
                    <label>Escribe <strong>{CONFIRMATION_WORD}</strong> para confirmar:</label>
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="eliminar"
                        style={{ borderColor: isMatch ? '#ff4d6d' : '#333' }}
                        autoFocus
                    />
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={handleDelete}
                        disabled={!isMatch || loading}
                        style={{ 
                            backgroundColor: isMatch ? '#ff4d6d' : '#333',
                            opacity: isMatch ? 1 : 0.5,
                            cursor: isMatch ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {loading ? 'Eliminando...' : 'Eliminar permanentemente'}
                    </button>
                </div>
            </div>
        </div>
    );
}