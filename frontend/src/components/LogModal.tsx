import { useState, useEffect } from 'react';
import { type Log } from '../services/logService';
import './LogModal.css';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
  platforms: { id?: number; name: string }[];
  initialData?: Log | null; // <--- NEW PROP
}

export function LogModal({ isOpen, onClose, onSubmit, platforms, initialData }: LogModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    platformId: '',
    timePlayedHours: '', 
    startDate: '',
    endDate: '',
    review: ''
  });

  // Helper to extract "YYYY-MM-DD" from ISO string
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0]; // Simple split for ISO dates
  };

  // Populate form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || '',
        platformId: initialData.platform_id ? String(initialData.platform_id) : '',
        // Convert minutes (DB) to hours (UI)
        timePlayedHours: initialData.time_played ? String((initialData.time_played / 60).toFixed(1)) : '',
        startDate: formatDateForInput(initialData.start_date),
        endDate: formatDateForInput(initialData.end_date),
        review: initialData.review || ''
      });
    } else if (isOpen && !initialData) {
      // Reset form if opening in "Create" mode
      setFormData({ title: '', platformId: '', timePlayedHours: '', startDate: '', endDate: '', review: '' });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        platformId: formData.platformId ? Number(formData.platformId) : undefined,
        platformName: platforms.find(p => p.id === Number(formData.platformId))?.name,
        // Convert hours (UI) to minutes (DB)
        timePlayed: (formData.timePlayedHours && !isNaN(Number(formData.timePlayedHours))) 
            ? Number(formData.timePlayedHours) * 60 
            : 0,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        review: formData.review
      };

      await onSubmit(payload);
      onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Error saving log.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{initialData ? 'Editar log de partida' : 'Añadir log de partida'}</h2>
        <form onSubmit={handleSubmit}>
          {/* ... Same inputs as before ... */}
          <div className="form-group">
            <label>Título</label>
            <input 
              type="text" 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Ej: Run pacifista"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Plataforma</label>
              <select 
                value={formData.platformId}
                onChange={e => setFormData({...formData, platformId: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {platforms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Horas jugadas</label>
              <input 
                type="number" 
                min="0"
                step="0.1"
                value={formData.timePlayedHours}
                onChange={e => setFormData({...formData, timePlayedHours: e.target.value})}
                placeholder="Ej: 45"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Fecha inicio</label>
              <input 
                type="date" 
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Fecha fin</label>
              <input 
                type="date" 
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reseña / Notas</label>
            <textarea 
              rows={4}
              value={formData.review}
              onChange={e => setFormData({...formData, review: e.target.value})}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}