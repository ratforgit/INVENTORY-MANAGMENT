import React, { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config';
import './Dashboard.css';

/* ────────────────────────────────────
   Icon helpers (inline SVG, zero deps)
──────────────────────────────────── */
const Icon = ({ name, size = 16 }) => {
  const icons = {
    grid: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    package: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    arrowUpRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 17L17 7M17 7H7M17 7v10"/>
      </svg>
    ),
    arrowDownRight: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 7l10 10M17 17V7M17 17H7"/>
      </svg>
    ),
    dollar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    activity: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    alertTriangle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    refresh: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
      </svg>
    ),
    logOut: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    ),
    menu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    ),
    x: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  };
  return icons[name] || null;
};

/* ────────────────────────────────────
   Sidebar component (shared across pages)
──────────────────────────────────── */
export const Sidebar = ({ activePage, user, onNavigate, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: 'grid' },
    { id: 'products', label: 'Products', icon: 'package' },
    { id: 'transactions', label: 'Transactions', icon: 'activity' },
  ];

  const initials = (user?.username || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleNavigate = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <Icon name="package" size={14} />
        </div>
        <div>
          <div className="sidebar-logo-name">Inventory OS</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Workspace</span>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNavigate(item.id)}
          >
            <Icon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.username || 'Admin'}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogoutClick}
            title="Sign out"
          >
            <Icon name="logOut" size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};

/* ────────────────────────────────────
   Dashboard Page
──────────────────────────────────── */
const Dashboard = ({ user, onNavigate, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // const token = localStorage.getItem('token');
  
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      console.log('🔐 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      
      const cleanToken = token.replace('Bearer ', '');
      
      // Fetch all data
      const [statsRes, txRes, prodRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/stats`, { headers: { 'Authorization': cleanToken } }),
        fetch(`${API_BASE_URL}/api/transactions`, { headers: { 'Authorization': cleanToken } }),
        fetch(`${API_BASE_URL}/api/products`, { headers: { 'Authorization': cleanToken } }),
      ]);

      if (!statsRes.ok) {
        const errorText = await statsRes.text();
        throw new Error(`Failed to load stats: ${statsRes.status} - ${errorText}`);
      }
      if (!txRes.ok) throw new Error('Failed to load transactions');
      if (!prodRes.ok) throw new Error('Failed to load products');

      const statsData = await statsRes.json();
      const txData = await txRes.json();
      const prodData = await prodRes.json();

      setStats(statsData);
      setRecentTransactions(Array.isArray(txData) ? txData.slice(0, 5) : []);
      const products = Array.isArray(prodData) ? prodData : [];
      setLowStock(products.filter(p => p.quantity <= 10).slice(0, 5));
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data. Please make sure the backend is running.');
      if (err.message.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  },[]);

  // useEffect(() => { fetchDashboard(); }, []);
  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statCards = stats ? [
    {
      label: 'Total Products',
      value: stats.total_products ?? '—',
      icon: 'package',
      change: null,
      changeType: null,
      meta: 'unique SKUs tracked',
      color: '#6366f1',
    },
    {
      label: 'Inventory Value',
      value: formatCurrency(stats.total_value),
      icon: 'dollar',
      change: null,
      meta: 'current stock value',
      color: '#22c55e',
    },
    {
      label: 'Transactions Today',
      value: stats.transactions_today ?? '—',
      icon: 'activity',
      meta: 'stock movements',
      color: '#f59e0b',
    },
    {
      label: 'Low Stock Alerts',
      value: stats.low_stock_count ?? lowStock.length,
      icon: 'alertTriangle',
      meta: 'items need restock',
      color: '#ef4444',
    },
  ] : [];

  const handleSidebarNavigate = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const handleSidebarLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar
          activePage="dashboard"
          user={user}
          onNavigate={handleSidebarNavigate}
          onLogout={handleSidebarLogout}
        />
      </div>

      <div className="main-content">
        {/* Page header */}
        <header className="page-header">
          <div className="page-header-left">
            <button
              className="btn btn-ghost btn-icon mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Icon name="menu" size={18} />
            </button>
            <div className="header-text">
              <div className="page-title">Overview</div>
              <div className="page-subtitle">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
          <div className="page-header-right">
            <button
              className="btn btn-secondary btn-sm"
              onClick={fetchDashboard}
              disabled={loading}
            >
              <Icon name="refresh" size={13} />
              Refresh
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="page-body">
          {error && (
            <div className="alert alert-error">
              <Icon name="alertTriangle" size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Stat cards */}
          {loading ? (
            <div className="stats-grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="stat-card stat-skeleton" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="skeleton-line skeleton-short" />
                  <div className="skeleton-line skeleton-value" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ))}
            </div>
          ) : (
            <div className="stats-grid">
              {statCards.map((s, i) => (
                <div
                  key={s.label}
                  className="stat-card"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="stat-header">
                    <span className="stat-label">{s.label}</span>
                    <div className="stat-icon" style={{ '--icon-color': s.color }}>
                      <Icon name={s.icon} size={14} />
                    </div>
                  </div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-meta">{s.meta}</div>
                </div>
              ))}
            </div>
          )}

          {/* Lower section */}
          <div className="dashboard-grid">
            {/* Recent Transactions */}
            <div className="table-wrap dash-table">
              <div className="table-toolbar">
                <div className="table-toolbar-left">
                  <span className="section-title">Recent Transactions</span>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onNavigate('transactions')}
                >
                  View all →
                </button>
              </div>

              {loading ? (
                <div className="empty-state">
                  <span className="spinner" style={{ width: 20, height: 20 }} />
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Icon name="activity" /></div>
                  <div className="empty-title">No transactions yet</div>
                  <div className="empty-desc">Transaction history will appear here</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx, i) => (
                      <tr key={tx.id || i}>
                        <td className="td-product">
                          {tx.product_name || tx.product || '—'}
                        </td>
                        <td>
                          <span className={`badge ${tx.type === 'in' || tx.transaction_type === 'purchase'
                            ? 'badge-success' : 'badge-danger'}`}>
                            <span className="badge-dot" />
                            {tx.type === 'in' || tx.transaction_type === 'purchase' ? 'Stock In' : 'Stock Out'}
                          </span>
                        </td>
                        <td className="td-mono">{tx.quantity}</td>
                        <td className="td-muted td-mono">{formatDate(tx.date || tx.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="table-wrap">
              <div className="table-toolbar">
                <span className="section-title">Low Stock Alerts</span>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('products')}>
                  Manage →
                </button>
              </div>

              {loading ? (
                <div className="empty-state">
                  <span className="spinner" style={{ width: 20, height: 20 }} />
                </div>
              ) : lowStock.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon" style={{ color: 'var(--success)' }}>
                    <Icon name="package" />
                  </div>
                  <div className="empty-title">All stock levels OK</div>
                  <div className="empty-desc">No items are running low</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock.map((p, i) => (
                      <tr key={p.id || i}>
                        <td>{p.name}</td>
                        <td className="td-mono">{p.sku || '—'}</td>
                        <td className="td-mono">{p.quantity}</td>
                        <td>
                          <span className={`badge ${p.quantity === 0
                            ? 'badge-danger' : 'badge-warning'}`}>
                            {p.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// export { Sidebar } from './dashboard';
export default Dashboard;
