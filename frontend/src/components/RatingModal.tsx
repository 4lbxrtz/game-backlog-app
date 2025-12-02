import { useState } from 'react'
import { gameService } from '../services/gameService'
import '../views/Game.css'

type Props = {
  gameId?: number
  userRating: number | string | null
  onChange?: (newRating: number | null) => void
}

export default function RatingModal({ gameId, userRating, onChange }: Props) {
  // Coerce userRating to a numeric value and clamp between 0 and 5
  const parsed = userRating !== null && userRating !== undefined ? Number(userRating) : NaN
  const r = Number.isFinite(parsed) ? Math.max(0, Math.min(5, parsed)) : 0
  const [saving, setSaving] = useState(false)
  const [hoverRating, setHoverRating] = useState<number | null>(null)

  // Determine which rating to display (hover preview or actual)
  const display = hoverRating !== null ? hoverRating : r

  // Determine star states: 'full' | 'half' | 'empty' based on display value
  const stars = Array.from({ length: 5 }, (_, i) => {
    const index = i + 1
    const delta = display - (index - 1)
    if (delta >= 0.75) return 'full'
    if (delta >= 0.25) return 'half'
    return 'empty'
  })

  const handleClick = async (e: React.MouseEvent, starIndex: number) => {
    if (saving || !gameId) return
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const half = clickX < rect.width / 2

    const newRating = half ? starIndex + 0.5 : starIndex + 1
    try {
      setSaving(true)
      await gameService.changeUserRating(gameId, newRating)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onChange && onChange(newRating)
    } catch (err) {
      console.error('Failed to change rating', err)
    } finally {
      setSaving(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent, starIndex: number) => {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const half = x < rect.width / 2
    const preview = half ? starIndex + 0.5 : starIndex + 1
    setHoverRating(preview)
  }

  const handleMouseLeave = () => setHoverRating(null)

  return (
    <div className="stars" aria-label={`userRating ${r} out of 5`} onMouseLeave={handleMouseLeave}>
      {stars.map((s, i) => (
        <span
          key={i}
          className={`star ${s} ${saving ? 'disabled' : ''}`}
          aria-hidden
          onClick={(e) => handleClick(e, i)}
          onMouseMove={(e) => handleMouseMove(e, i)}
          onMouseEnter={(e) => handleMouseMove(e, i)}
          style={{ cursor: saving ? 'wait' : 'pointer' }}
        >
          ★
        </span>
      ))}
    </div>
  )
}