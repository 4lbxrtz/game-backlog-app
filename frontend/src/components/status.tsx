import { gameService } from '../services/gameService'
import '../views/Game.css'

type Props = {
  gameId: number
  currentStatus: string | null
  onStatusChange: (newStatus: string) => void
}

export default function StatusSelector({ gameId, currentStatus, onStatusChange }: Props) {
  const statuses = [
    { key: 'Wishlist', label: 'Wishlist', icon: '📋' },
    { key: 'Backlog', label: 'Backlog', icon: '📚' },
    { key: 'Playing', label: 'Jugando', icon: '🎮' },
    { key: 'Completed', label: 'Completado', icon: '✓' },
  ]
  
  const handleStatusChange = async (status: string) => {
    if (status === currentStatus) {
      await gameService.deleteFromCollection(gameId)
    } else {
      await gameService.addToCollection(gameId, status)
    }
    
    onStatusChange(status)
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