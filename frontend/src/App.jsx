import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Transactions from './components/Transactions';
import './global.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner-modern"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#141417',
            color: '#fff',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route 
          path="/dashboard/*" 
          element={
            user ? (
              <DashboardLayout user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}

function DashboardLayout({ user, onLogout }) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={setCurrentPage} onLogout={onLogout} />;
      case 'products':
        return <Products user={user} onNavigate={setCurrentPage} onLogout={onLogout} />;
      case 'transactions':
        return <Transactions user={user} onNavigate={setCurrentPage} onLogout={onLogout} />;
      default:
        return <Dashboard user={user} onNavigate={setCurrentPage} onLogout={onLogout} />;
    }
  };

  return renderPage();
}

export default App;