import { gameService } from '../services/gameService'
import '../views/Game.css'

type Props = {
  gameId: number
  currentStatus: string | null
  // Update type to accept null (clearing the status)
  onStatusChange: (newStatus: string | null) => void 
}

export default function StatusSelector({ gameId, currentStatus, onStatusChange }: Props) {
  const statuses = [
    { key: 'Wishlist', label: 'Wishlist', icon: '📋' },
    { key: 'Backlog', label: 'Backlog', icon: '📚' },
    { key: 'Playing', label: 'Jugando', icon: '🎮' },
    { key: 'Completed', label: 'Completado', icon: '✓' },
    { key: 'Abandoned', label: 'Abandonado', icon: '🚫' },
  ]
  
  const handleStatusChange = async (status: string) => {
    try {
      if (status === currentStatus) {
        // Case: Removing from collection
        await gameService.deleteFromCollection(gameId)
        onStatusChange(null) // <--- FIX: Tell parent to set status to null
      } else {
        // Case: Adding/Changing status
        await gameService.addToCollection(gameId, status)
        onStatusChange(status)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error al actualizar el estado")
    }
  }

  return (
    <div className="status-selector">
      {statuses.map(({ key, label, icon }) => (
        <div
          key={key}
          className={`status-option ${currentStatus === key ? 'active' : ''}`}
          onClick={() => handleStatusChange(key)}
        >
          <div className="status-icon">{icon}</div>
          <div className="status-label">{label}</div>
        </div>
      ))}
    </div>
  )
}