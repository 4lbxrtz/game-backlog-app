import { useState } from 'react';
import './LogModal.css'; // We will create this below

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (data: any) => Promise<void>;
  platforms: { id?: number; name: string }[]; // To populate the dropdown
}

export function LogModal({ isOpen, onClose, onSubmit, platforms }: LogModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    platformId: '',
    timePlayedHours: '', // User enters hours, we convert to minutes
    startDate: '',
    endDate: '',
    review: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Prepare data for backend
      const payload = {
        title: formData.title,
        platformId: formData.platformId ? Number(formData.platformId) : undefined,
        // Send platform name just in case backend needs to sync it
        platformName: platforms.find(p => p.id === Number(formData.platformId))?.name,
        // Convert hours to minutes
        timePlayed: formData.timePlayedHours ? Number(formData.timePlayedHours) * 60 : 0,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        review: formData.review
      };

      await onSubmit(payload);
      onClose(); // Close modal on success
      // Reset form
      setFormData({ title: '', platformId: '', timePlayedHours: '', startDate: '', endDate: '', review: '' });
    } catch (error) {
      console.error(error);
      alert('Error saving log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Añadir Log (Partida)</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título (Ej: Primera pasada, Speedrun...)</label>
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
              placeholder="¿Qué te pareció esta partida?"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}