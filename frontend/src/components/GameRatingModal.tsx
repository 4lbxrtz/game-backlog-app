import '../views/Game.css'

type Props = { rating?: number | null }

export default function GameRatingModal({ rating }: Props) {
    const parsed = rating !== null && rating !== undefined ? Number(rating) : NaN
    const r = Number.isFinite(parsed) ? Math.max(0, Math.min(5, parsed)) : 0

  return (
    <div className="stars" aria-label={`userRating ${r} out of 5`}>
        {Array.from({ length: 5 }, (_, i) => {
            const index = i + 1
            const delta = r - (index - 1)
            let starType: 'full' | 'half' | 'empty'
            if (delta >= 0.75) starType = 'full'
            else if (delta >= 0.25) starType = 'half'
            else starType = 'empty'

            // Always render the filled star character and let CSS control the appearance
            return (
                <span key={index} className={`star ${starType}`}>
                    ★
                </span>
            )
        })}
    </div>
  )
}