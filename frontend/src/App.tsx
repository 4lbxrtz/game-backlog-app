import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Dashboard from './views/Dashboard'
import Game from './views/Game'
import Register from './views/Register'
import Login from './views/Login'
import Search from './views/Search'
import { List } from './views/List'
import { ListDetail } from './views/ListDetail'
import { Settings } from './views/Settings'
import { Profile } from './views/Profile'
import { GamesByStatus } from './views/GamesByStatus'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/game/:id" element={<Game />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route path="/list" element={<List />} />
      <Route path="/list/:id" element={<ListDetail />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/status" element={<GamesByStatus />} />
      <Route path="/status/:initialTab" element={<GamesByStatus />} />
    </Routes>
  )
}

export default App
