export default function BarCountModal({ countRatingsData }: { countRatingsData: { counts: Array<{ personal_rating: number; count: number }> } | null }) {
    // Normalize incoming data. Supported input shapes:
    // - { "4.5": 12, "5": 20 }
    // - { counts: [ { personal_rating: 4.5, count: 12 }, ... ] }
    const normalized: Record<number, number> = {}
    if (countRatingsData) {
        // If backend returned { counts: [...] }
        if (Array.isArray(countRatingsData.counts)) {
            for (const row of countRatingsData.counts) {
                const raw = Number(row.personal_rating)
                if (Number.isNaN(raw)) continue
                // round to nearest 0.5 to avoid tiny float differences
                const n = Math.round(raw * 2) / 2
                normalized[n] = (normalized[n] || 0) + Number(row.count || 0)
            }
        } else {
            // generic object map (keys may be strings)
            Object.entries(countRatingsData).forEach(([k, v]) => {
                const raw = Number(k)
                if (Number.isNaN(raw)) return
                const n = Math.round(raw * 2) / 2
                normalized[n] = (normalized[n] || 0) + Number(v || 0)
            })
        }
    }

    const total = Object.values(normalized).reduce((a, b) => a + b, 0)

    // build steps from 5.0 down to 0.0 in 0.5 increments
    const steps: number[] = []
    for (let i = 10; i > 0; i--) {
        steps.push(i * 0.5)
    }

    return (
        <div className="rating-bars">
            {steps.map((value) => {
                const count = normalized[value] || 0
                const percentage = total > 0 ? (count / total) * 100 : 0
                return (
                    <div className="rating-bar-row" key={value}>
                        <span className="rating-bar-label">{value.toFixed(1)}★</span>
                        <div className="rating-bar-track">
                            <div
                                className="rating-bar-fill"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <span className="rating-bar-count">{count}</span>
                    </div>
                )
            })}
        </div>
    )
}