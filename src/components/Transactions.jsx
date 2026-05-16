import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Dashboard';
import './Transactions.css';

/* ── Inline Icons ── */
const Icon = ({ name, size = 16 }) => {
  const icons = {
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    arrowDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
    arrowUp: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    alertTriangle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  };
  return icons[name] || null;
};

/* ── Add Transaction Modal ── */
const AddTransactionModal = ({ products, onClose, onSave }) => {
  const [form, setForm] = useState({
    product_id: '',
    type: 'in',
    quantity: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id) return setError('Please select a product.');
    if (!form.quantity || Number(form.quantity) <= 0) return setError('Enter a valid quantity.');
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const payload = {
      product_id: Number(form.product_id),
      type: form.type,
      quantity: Number(form.quantity),
      notes: form.notes,
    };

    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
});
    
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Transaction failed');
      onSave(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record transaction.');
    } finally {
      setLoading(false);
    }
  };

  const isStockIn = form.type === 'in';

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="tx-modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="tx-modal-title">Record Transaction</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <Icon name="alertTriangle" size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Type toggle */}
            <div className="tx-type-toggle">
              <button
                type="button"
                className={`tx-type-btn ${isStockIn ? 'active-in' : ''}`}
                onClick={() => setForm(p => ({ ...p, type: 'in' }))}
              >
                <Icon name="arrowDown" size={14} />
                Stock In
              </button>
              <button
                type="button"
                className={`tx-type-btn ${!isStockIn ? 'active-out' : ''}`}
                onClick={() => setForm(p => ({ ...p, type: 'out' }))}
              >
                <Icon name="arrowUp" size={14} />
                Stock Out
              </button>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="product_id">Product *</label>
              <select
                id="product_id"
                name="product_id"
                className="input-field"
                value={form.product_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a product…</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.sku ? `(${p.sku})` : ''} — Stock: {p.quantity}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="tx-quantity">Quantity *</label>
              <input
                id="tx-quantity"
                name="quantity"
                className="input-field"
                type="number"
                min="1"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                className="input-field input-textarea"
                placeholder="Optional notes or reference…"
                value={form.notes}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className={`btn ${isStockIn ? 'btn-success-tx' : 'btn-danger-tx'}`}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : (isStockIn ? <Icon name="arrowDown" size={14} /> : <Icon name="arrowUp" size={14} />)}
              {loading ? 'Recording…' : isStockIn ? 'Record Stock In' : 'Record Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Transactions Page ── */
const Transactions = ({ user, onNavigate, onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [txRes, prodRes] = await Promise.all([
    fetch('http://localhost:5000/api/transactions', { headers }),
    fetch('http://localhost:5000/api/products', { headers }),
]);
      if (!txRes.ok) throw new Error('Failed to load transactions');

      const txData = await txRes.json();
      const prodData = await prodRes.json();

      const txList = Array.isArray(txData) ? txData : txData.transactions || [];
      const prodList = Array.isArray(prodData) ? prodData : prodData.products || [];

      // Sort newest first
      txList.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));

      setTransactions(txList);
      setFiltered(txList);
      setProducts(prodList);
    } catch {
      setError('Could not load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Apply filters
  useEffect(() => {
    let list = [...transactions];
    if (typeFilter === 'in') {
      list = list.filter(tx => tx.type === 'in' || tx.transaction_type === 'purchase');
    } else if (typeFilter === 'out') {
      list = list.filter(tx => tx.type === 'out' || tx.transaction_type === 'sale');
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(tx =>
        (tx.product_name || tx.product || '').toLowerCase().includes(q) ||
        (tx.notes || '').toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, typeFilter, transactions]);

  const handleSave = async () => {
    await fetchData();
    showToast('Transaction recorded successfully.');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isStockIn = (tx) =>
    tx.type === 'in' || tx.transaction_type === 'purchase';

  // Summary counts
  const inCount = transactions.filter(isStockIn).length;
  const outCount = transactions.length - inCount;

  return (
    <div className="app-shell">
      <Sidebar activePage="transactions" user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="main-content">
        <header className="page-header">
          <div className="page-header-left">
            <div className="page-title">Transactions</div>
            <div className="page-subtitle">{transactions.length} movements recorded</div>
          </div>
          <div className="page-header-right">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Icon name="plus" size={14} />
              Record Transaction
            </button>
          </div>
        </header>

        <main className="page-body">
          {/* Toast */}
          {toast && (
            <div className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'} toast`}>
              <Icon name={toast.type === 'error' ? 'alertTriangle' : 'checkCircle'} size={14} />
              <span>{toast.msg}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <Icon name="alertTriangle" size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Summary chips */}
          {!loading && (
            <div className="tx-summary">
              <div className="tx-summary-chip chip-all" onClick={() => setTypeFilter('all')}>
                <span className="chip-label">Total</span>
                <span className="chip-value">{transactions.length}</span>
              </div>
              <div className="tx-summary-chip chip-in" onClick={() => setTypeFilter('in')}>
                <Icon name="arrowDown" size={12} />
                <span className="chip-label">Stock In</span>
                <span className="chip-value">{inCount}</span>
              </div>
              <div className="tx-summary-chip chip-out" onClick={() => setTypeFilter('out')}>
                <Icon name="arrowUp" size={12} />
                <span className="chip-label">Stock Out</span>
                <span className="chip-value">{outCount}</span>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="table-toolbar-left">
                <div className="search-wrap">
                  <span className="search-icon"><Icon name="search" size={13} /></span>
                  <input
                    className="search-input"
                    type="search"
                    placeholder="Search transactions…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {/* Type filter pills */}
                <div className="filter-pills">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'in', label: 'Stock In' },
                    { value: 'out', label: 'Stock Out' },
                  ].map(f => (
                    <button
                      key={f.value}
                      className={`filter-pill ${typeFilter === f.value ? 'active' : ''}`}
                      onClick={() => setTypeFilter(f.value)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <span className="table-count">{filtered.length} of {transactions.length}</span>
            </div>

            {loading ? (
              <div className="table-loading">
                <div className="products-skeleton">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="skeleton-line" style={{ width: '25%' }} />
                      <div className="skeleton-line" style={{ width: '14%' }} />
                      <div className="skeleton-line" style={{ width: '8%' }} />
                      <div className="skeleton-line" style={{ width: '22%' }} />
                      <div className="skeleton-line" style={{ width: '18%' }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Icon name="activity" /></div>
                <div className="empty-title">
                  {search ? 'No transactions found' : 'No transactions yet'}
                </div>
                <div className="empty-desc">
                  {search
                    ? 'Try a different search or clear your filters.'
                    : 'Record your first stock movement to get started.'}
                </div>
                {!search && (
                  <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Icon name="plus" size={14} />
                    Record Transaction
                  </button>
                )}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Notes</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => {
                    const stockIn = isStockIn(tx);
                    return (
                      <tr key={tx.id || i}>
                        <td>
                          <div className="tx-product-cell">
                            <div className={`tx-type-dot ${stockIn ? 'dot-in' : 'dot-out'}`}>
                              <Icon name={stockIn ? 'arrowDown' : 'arrowUp'} size={10} />
                            </div>
                            <span className="tx-product-name">
                              {tx.product_name || tx.product || '—'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${stockIn ? 'badge-success' : 'badge-danger'}`}>
                            <span className="badge-dot" />
                            {stockIn ? 'Stock In' : 'Stock Out'}
                          </span>
                        </td>
                        <td>
                          <span className={`tx-qty ${stockIn ? 'qty-in' : 'qty-out'}`}>
                            {stockIn ? '+' : '−'}{tx.quantity}
                          </span>
                        </td>
                        <td className="td-muted tx-notes">
                          {tx.notes || <span style={{ opacity: 0.4 }}>—</span>}
                        </td>
                        <td className="td-mono td-muted">
                          {formatDate(tx.date || tx.created_at)}
                        </td>
                        <td className="td-mono td-muted">
                          {formatTime(tx.date || tx.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && filtered.length > 0 && (
              <div className="table-footer">
                <span className="table-count">
                  {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <AddTransactionModal
          products={products}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Transactions;