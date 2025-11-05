import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import React from 'react';
import logo from './logo.svg';
import './App.css';
import UserPage from './pages/UserPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <div>
          Nuestros enlaces:
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/user">User</Link></li>
            </ul>
          </nav>
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/user" element={<UserPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
