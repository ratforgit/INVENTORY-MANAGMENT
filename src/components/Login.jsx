import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('🔐 Attempting login with:', credentials.username);
    
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: credentials.username,
        password: credentials.password 
      }),
    });
    
    console.log('📡 Login response status:', response.status);
    const data = await response.json();
    console.log('📦 Login response data:', data);

    if (response.ok) {
      // Store token WITHOUT any prefix
      const cleanToken = data.token.replace('Bearer ', '');
      localStorage.setItem('token', cleanToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ Token stored:', cleanToken.substring(0, 20) + '...');
      
      if (onLogin) onLogin(data.user);
      window.location.href = '/dashboard';
    } else {
      setError(data.message || 'Invalid username or password.');
    }
  } catch (err) {
    console.error('❌ Login error:', err);
    setError('Unable to connect to server. Please make sure the backend is running on port 5000');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-root">
      {/* Ambient background */}
      <div className="login-ambient" aria-hidden="true">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-grid" />
      </div>

      <div className="login-wrap">
        {/* Card */}
        <div className="login-card">
          {/* Logo */}
          <div className="login-brand">
            <div className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.2"
                stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="brand-name">Inventory OS</span>
          </div>

          {/* Heading */}
          <div className="login-heading">
            <h1>Welcome back</h1>
            <p>Sign in to manage your inventory</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            {error && (
              <div className="login-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="form-field">
              <label htmlFor="username">Email or Username</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your email or username"
                  value={credentials.username}
                  onChange={handleChange}
                  autoComplete="username"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="login-footer">
          Inventory OS · Secure workspace
        </p>
      </div>
    </div>
  );
};

export default Login;