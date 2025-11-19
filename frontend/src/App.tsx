import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Dashboard from './views/Dashboard'
import Game from './views/Game'
import Register from './views/Register'
import Login from './views/Login'
import Search from './views/Search'

function Home() {
  return (
    <div className="home">
      <h1>Bienvenido a GameTracker</h1>
      <p>Página de inicio mínima. Haz clic para ir al dashboard.</p>
      <Link to="/dashboard">Ir al Dashboard</Link>
      <br></br>
      <Link to="/game/1">Ir a la página del juego (ejemplo)</Link>
      <br></br>
      <Link to="/login">Iniciar sesión</Link>
      <br></br>
      <Link to="/register">Registrarse</Link>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/game/:id" element={<Game />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
    </Routes>
  )
}

export default App
