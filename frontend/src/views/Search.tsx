import './Search.css'
import '../components/forms/forms.css'
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import TextInput from '../components/forms/TextInput'
import { Link } from 'react-router-dom'
import NavigationHeaderModal from '../components/NavigationHeaderModal'
import SettingsModal from '../components/SettingsModal'
import { Footer } from '../components/Footer'

type GameResult = {
  id: number
  name: string
  cover_url?: string | null
  summary?: string | null
}

type RawGame = {
  id: number
  title: string
  cover?: { url?: string } | null
  cover_url?: string | null
  summary?: string | null
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const IP_BACKEND = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000'

  // Restore previous search state when coming back with location state
  useEffect(() => {
    const state = location.state as { query?: string; results?: GameResult[] } | null
    if (state?.query) {
      setQuery(state.query)
      setResults(state.results ?? [])
    }
  }, [location.state])

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
      const res = await axios.get(`${IP_BACKEND}/api/games/search`, { params: { q: query.trim() } })
      const data = (res.data as unknown) as RawGame[]
      const mapped: GameResult[] = (Array.isArray(data) ? data : []).map((g) => ({
        id: g.id,
        name: g.title,
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
      <header className="logo-section">
        <NavigationHeaderModal />
        <button className="back-button" type="button" onClick={() => navigate(-1)}> ← Volver </button>
        <SettingsModal />
      </header>
      <p className="logo-tagline">Busca juegos</p>

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
                <Link to={`/game/${g.id}`} state={{ from: 'search', query, results }}>
                  <div className="game-cover">{g.cover_url ? <img src={g.cover_url} alt={g.name} /> : 'Portada'}</div>
                </Link>
                <div className="game-title">{g.name}</div>
                {g.summary && <div className="game-summary">{g.summary.slice(0, 120)}{g.summary.length > 120 ? '…' : ''}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
