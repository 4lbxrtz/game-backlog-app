import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { gameService } from '../services/gameService';
import { Footer } from '../components/Footer';
import './Profile.css';
import { Navbar } from '../components/Navbar';

interface ProfileData {
    totalPlayed: number;
    playedThisYear: number;
    backlogCount: number;
    ratings: { rating: number; count: number }[];
    topGenres: { name: string; count: number }[];
    platforms: { name: string; count: number }[]; 
    gamesPerYear: { year: number; count: number }[];
    recentGames: { id: number; title: string; cover_url?: string; updated_at: string }[];
    totalMinutesPlayed: number;
    statusDistribution: { status: string; count: number }[];
    gamesPerDecade: { decade: number; count: number }[];
    lists: { id: number; name: string; game_count: number }[];
}

export function Profile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [stats, setStats] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const ratingSteps = Array.from({ length: 10 }, (_, i) => (50 - i * 5) / 10);

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await gameService.getProfileStats();
                setStats(data);
            } catch (error) {
                console.error("Error loading profile:", error);
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    // Helper to calculate bar width for ratings
    const getRatingPercentage = (star: number) => {
        if (!stats || !stats.ratings.length) return 0;
        
        const totalRated = stats.ratings.reduce((acc, curr) => acc + curr.count, 0);
        
        // --- CORRECCIÓN AQUÍ ---
        // Convertimos r.rating a Number() porque la BD suele devolver decimales como strings
        const ratingData = stats.ratings.find(r => Number(r.rating) === star);
        // -----------------------

        return ratingData ? (ratingData.count / totalRated) * 100 : 0;
    };

    // Helper for year bar height (normalize relative to the max year)
    const getYearHeight = (count: number) => {
        if (!stats || !stats.gamesPerYear.length) return 0;
        const maxCount = Math.max(...stats.gamesPerYear.map(y => y.count));
        return maxCount > 0 ? (count / maxCount) * 100 : 0;
    };

    // Format date (e.g., "Oct 16")
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getDonutGradient = () => {
        if (!stats?.statusDistribution.length) return 'conic-gradient(#333 0% 100%)';

        let gradientString = 'conic-gradient(';
        let currentDeg = 0;
        const total = stats.statusDistribution.reduce((acc, curr) => acc + curr.count, 0);

        // Colors for statuses
        const colors: Record<string, string> = {
            'Completed': '#4ade80', // Green
            'Playing': '#60a5fa',   // Blue
            'Backlog': '#ff4d6d',   // Pink
            'Wishlist': '#fbbf24',  // Yellow
            'Abandoned': '#9ca3af'  // Gray
        };

        stats.statusDistribution.forEach((item, index) => {
            const percentage = (item.count / total) * 360; // Convert to degrees
            const color = colors[item.status] || '#333';
            const start = currentDeg;
            const end = currentDeg + percentage;
            
            gradientString += `${color} ${start}deg ${end}deg`;
            if (index < stats.statusDistribution.length - 1) gradientString += ', ';
            
            currentDeg += percentage;
        });

        gradientString += ')';
        return gradientString;
    };
    
    // --- HELPER: PLAYTIME FORMATTER ---
    const formatPlaytime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${(minutes % 60)}m`;
    };

    // Helper for Decade bar height
    const getDecadeHeight = (count: number) => {
        if (!stats || !stats.gamesPerDecade.length) return 0;
        const maxCount = Math.max(...stats.gamesPerDecade.map(d => d.count));
        return maxCount > 0 ? (count / maxCount) * 100 : 0;
    };

    

    // if (loading) return <div className="container" style={{padding:'50px', textAlign:'center'}}>Cargando perfil...</div>;
    if (loading) return <div>Cargando...</div>;

    return (
        <div className="container">
            <Navbar />

            <div className="profile-hero">
                <div className="profile-sidebar">
                    
                    <div>
                        <h1 className="profile-username">
                            {user?.username}
                        </h1>
                        <button className="btn-edit-profile" onClick={() => navigate('/settings')}>
                            Editar Perfil
                        </button>
                    </div>
                    
                    <div className="rating-distribution">
                        <h3 className="rating-title">Valoraciones</h3>
                        <div className="rating-bars compact">
                            {ratingSteps.map(star => (
                                <div className="rating-row compact" key={star}>
                                    <span className="rating-label">{star}★</span>
                                    <div className="rating-bar compact">
                                        <div 
                                            className="rating-bar-fill" 
                                            style={{width: `${getRatingPercentage(star)}%`}}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="sidebar-lists-section">
                        <h3 className="rating-title">Mis Listas</h3>
                        <div className="sidebar-lists-container">
                            {stats?.lists && stats.lists.length > 0 ? (
                                stats.lists.map(list => (
                                    <div 
                                        key={list.id} 
                                        className="sidebar-list-item"
                                        onClick={() => navigate(`/list/${list.id}`)}
                                    >
                                        <div className="sidebar-list-name">
                                            <span>📋</span> {list.name}
                                        </div>
                                        <div className="sidebar-list-count">{list.game_count}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{color: '#666', fontSize: '13px'}}>Sin listas creadas</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="profile-main">
                    <div className="stats-overview">
                        <div className="stat-box">
                            <div className="stat-number">{stats?.totalPlayed}</div>
                            <div className="stat-label">Juegos Completados</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number" style={{color: '#60a5fa'}}>
                                {formatPlaytime(stats?.totalMinutesPlayed || 0)}
                            </div>
                            <div className="stat-label">Tiempo Total Jugado</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">{stats?.backlogCount}</div>
                            <div className="stat-label">En Backlog</div>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">Actividad Reciente</h2>
                        </div>
                        <div className="games-row">
                            {stats?.recentGames && stats.recentGames.length > 0 ? (
                                stats.recentGames.map(game => (
                                    <div key={game.id} className="game-card" onClick={() => navigate(`/game/${game.id}`)}>
                                        <div className="game-cover">
                                            {game.cover_url ? (
                                                <img src={game.cover_url} alt={game.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                                            ) : '🎮'}
                                        </div>
                                        <div className="game-date">{formatDate(game.updated_at)}</div>
                                        <div className="game-title">{game.title}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{color: '#666', fontStyle:'italic'}}>Sin actividad reciente</div>
                            )}
                        </div>
                    </div>

                        
<div className="section">
                        <div className="section-header">
                            <h2 className="section-title">Estadísticas Detalladas</h2>
                        </div>
                        
                        {/* UNIFICAMOS TODO EN UN SOLO GRID */}
                        <div className="stats-dashboard-grid">
                            
                            {/* 1. DONUT CHART (Estado) */}
                            <div className="stat-card">
                                <h3 className="stat-card-title">Estado de la Colección</h3>
                                <div className="donut-chart-container">
                                    <div 
                                        className="donut-chart" 
                                        style={{ background: getDonutGradient() }}
                                    >
                                        <div className="donut-hole">
                                            <span className="donut-total">
                                                {stats?.statusDistribution.reduce((a, b) => a + b.count, 0)}
                                            </span>
                                            <span className="donut-label">Juegos</span>
                                        </div>
                                    </div>
                                    <div className="donut-legend">
                                        {stats?.statusDistribution.map(s => (
                                            <div key={s.status} className="legend-item">
                                                <span className={`legend-dot status-${s.status.toLowerCase()}`}></span>
                                                <span className="legend-text">{s.status}: {s.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 2. PLATAFORMAS */}
                            <div className="stat-card">
                                <h3 className="stat-card-title">Plataformas utilizadas</h3>
                                <div className="platform-list">
                                    {stats?.platforms.map((p, idx) => (
                                        <span className="platform-tag" key={idx}>
                                            {p.name} 
                                            <strong style={{color: '#ff4d6d', marginLeft: '4px'}}>
                                                {p.count}
                                            </strong>
                                        </span>
                                    ))}
                                    {(!stats?.platforms.length) && (
                                        <div style={{color:'#666', fontStyle:'italic', padding: '20px'}}>
                                            Añade logs a tus juegos para ver datos.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. ERAS (DÉCADAS) */}
                            <div className="stat-card">
                                <h3 className="stat-card-title">Eras (Décadas)</h3>
                                <div className="year-chart">
                                    {stats?.gamesPerDecade.map(item => (
                                        <div className="year-bar-container" key={item.decade}>
                                            <div 
                                                className="year-bar decade-bar" 
                                                style={{height: `${getDecadeHeight(item.count)}%`}}
                                                title={`${item.count} juegos de los ${item.decade}s`}
                                            ></div>
                                            <span className="year-label">{item.decade}s</span>
                                        </div>
                                    ))}
                                    {(!stats?.gamesPerDecade.length) && <div style={{color:'#666', marginTop:'20px'}}>Sin datos</div>}
                                </div>
                            </div>

                            {/* 4. GÉNEROS */}
                            <div className="stat-card">
                                <h3 className="stat-card-title">Géneros más jugados</h3>
                                <div className="genre-list">
                                    {stats?.topGenres.map((genre, idx) => (
                                        <div className="genre-item" key={idx}>
                                            <span className="genre-name">{genre.name}</span>
                                            <span className="genre-count">{genre.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* 5. AÑADIDOS POR AÑO */}
                             <div className="stat-card">
                                <h3 className="stat-card-title">Añadidos por año</h3>
                                <div className="year-chart">
                                    {stats?.gamesPerYear.map(item => (
                                        <div className="year-bar-container" key={item.year}>
                                            <div 
                                                className="year-bar" 
                                                style={{height: `${getYearHeight(item.count)}%`}} 
                                                title={`${item.count} juegos`}
                                            ></div>
                                            <span className="year-label">{item.year}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}