import './Search.css'
import '../components/forms/forms.css'
import { useState } from 'react'
import axios from 'axios'
import TextInput from '../components/forms/TextInput'

type GameResult = {
  id: number
  name: string
  cover_url?: string | null
  summary?: string | null
}

type RawGame = {
  id: number
  name: string
  cover?: { url?: string } | null
  cover_url?: string | null
  summary?: string | null
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      // Backend endpoint expected to proxy IGDB search
      const res = await axios.get('/api/games/search', { params: { q: query.trim() } })
      const data = (res.data as unknown) as RawGame[]
      const mapped: GameResult[] = (Array.isArray(data) ? data : []).map((g) => ({
        id: g.id,
        name: g.name,
        cover_url: g.cover?.url ?? g.cover_url ?? null,
        summary: g.summary ?? null,
      }))
      setResults(mapped)
    } catch (err: unknown) {
      console.error('Search error', err)
      setError('Error buscando juegos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-container">
      <div className="logo-section">
        <div className="logo">
          <span className="logo-icon">🎮</span>
          <span>GameTracker</span>
        </div>
        <p className="logo-tagline">Busca juegos</p>
      </div>

      <div className="search-card">
        <div className="card-header">
          <h1 className="card-title">Buscar juegos</h1>
          <p className="card-subtitle">Escribe el título y pulsa buscar</p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <TextInput
            id="q"
            label="Buscar"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder="ej. Elden Ring"
            autoComplete="off"
          />
          <div className="search-actions">
            <button className="search-button" type="submit" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </form>

        {error && <div className="form-error">{error}</div>}

        <div className="results-section">
          {results.length === 0 && !loading && <div className="no-results">No hay resultados</div>}

          <div className="game-grid">
            {results.map((g) => (
              <div key={g.id} className="game-card">
                <div className="game-cover">{g.cover_url ? <img src={g.cover_url} alt={g.name} /> : 'Portada'}</div>
                <div className="game-title">{g.name}</div>
                {g.summary && <div className="game-summary">{g.summary.slice(0, 120)}{g.summary.length > 120 ? '…' : ''}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
