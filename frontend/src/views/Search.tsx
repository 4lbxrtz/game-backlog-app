import './Search.css'
import '../components/forms/forms.css'
import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import TextInput from '../components/forms/TextInput'
import { Footer } from '../components/Footer'
import { gameService } from '../services/gameService'
import { Navbar } from '../components/Navbar'

type GameResult = {
  id: number
  name: string
  cover_url?: string | null
  summary?: string | null
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameResult[]>([])
  const [trending, setTrending] = useState<GameResult[]>([]) 
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const location = useLocation()
  const navigate = useNavigate() // Added missing navigate hook
  const searchTimeout = useRef<number | null>(null);

  // 1. Load Trending on Mount
  useEffect(() => {
    async function loadTrending() {
      try {
        const data = await gameService.getTrending();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = data.map((g: any) => ({
            id: g.id,
            name: g.title,
            cover_url: g.cover_url
        }));
        setTrending(mapped);
      } catch (e) {
        console.error("Error loading trending", e);
      }
    }
    loadTrending();

    const state = location.state as { query?: string; results?: GameResult[] } | null
    if (state?.query) {
      setQuery(state.query)
      setResults(state.results ?? [])
    }
  }, [location.state]) 

  // 2. Search Logic (Debounced)
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = window.setTimeout(async () => {
        try {
            const data = await gameService.search(query.trim());
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mapped: GameResult[] = (Array.isArray(data) ? data : []).map((g: any) => ({
                id: g.id,
                name: g.title || g.name,
                cover_url: g.cover?.url ?? g.cover_url ?? null,
                summary: g.summary ?? null,
            }));
            setResults(mapped);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Error buscando juegos");
        } finally {
            setLoading(false);
        }
    }, 300);

    return () => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [query]);

  // --- LOGIC ---
  const isSearching = query.trim().length > 0;
  
  // Choose which list to display
  const displayGames = isSearching ? results : trending;
  
  // Only show "No results" if search finished and found nothing
  const showNoResults = isSearching && !loading && results.length === 0;

  return (
    <div className="search-container">
      <Navbar />

      <div className="search-card">
        <div className="card-header">
          <h1 className="card-title">Buscar juegos</h1>
          <p className="card-subtitle">Escribe para buscar automáticamente</p>
        </div>

        <div className="search-form">
          <TextInput
            id="q"
            label="Buscar"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            placeholder="ej. Elden Ring"
            autoComplete="off"
            autoFocus
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="results-section">
            
            {/* Show No Results Message */}
            {showNoResults && (
                <div className="no-results">No se encontraron resultados</div>
            )}

            {/* UNIFIED GRID */}
            {/* We apply opacity during loading to give feedback without layout shift */}
            <div 
                className="game-grid" 
                style={{ 
                    opacity: loading ? 0.5 : 1, 
                    transition: 'opacity 0.2s ease' 
                }}
            >
                {displayGames.map((g) => (
                <div key={g.id} className="game-card">
                    <Link to={`/game/${g.id}`} state={{ from: 'search', query, results }}>
                    <div className="game-cover">
                        {g.cover_url ? 
                            <img src={g.cover_url} alt={g.name} loading="lazy" /> : 
                            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', width:'100%', color:'#666'}}>🎮</div>
                        }
                    </div>
                    </Link>
                    <div className="game-title">{g.name}</div>
                </div>
                ))}
            </div>
            
            {/* Initial Loading State for Trending */}
            {!isSearching && trending.length === 0 && (
                <div className="no-results" style={{opacity: 0.5}}>Cargando populares...</div>
            )}

        </div>
      </div>
      <Footer />
    </div>
  )
}