import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Dashboard';
import './Products.css';
import API_BASE_URL from "../config";

/* ── Inline Icons ── */
const Icon = ({ name, size = 16 }) => {
  const icons = {
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    package: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    alertTriangle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  };
  return icons[name] || null;
};

/* ── Product Modal ── */
const ProductModal = ({ product, onClose, onSave }) => {
  const isEdit = Boolean(product?.id);
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    description: product?.description || '',
    quantity: product?.quantity ?? '',
    price: product?.price ?? '',
    reorder_level: product?.reorder_level ?? '',
    category: product?.category || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Product name is required.');
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const payload = {
      ...form,
      quantity: Number(form.quantity) || 0,
      price: parseFloat(form.price) || 0,
      reorder_level: Number(form.reorder_level) || 0,
    };

    try {
      const url = isEdit ? `${API_BASE_URL}/api/products/${product.id}` : `${API_BASE_URL}/api/products`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      onSave(data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="modal-title">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
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

            <div className="form-row">
              <div className="input-group">
                <label className="input-label" htmlFor="name">Product Name *</label>
                <input
                  id="name"
                  name="name"
                  className="input-field"
                  type="text"
                  placeholder="e.g. Wireless Keyboard"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="sku">SKU</label>
                <input
                  id="sku"
                  name="sku"
                  className="input-field"
                  type="text"
                  placeholder="e.g. WK-001"
                  value={form.sku}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="input-field input-textarea"
                placeholder="Short product description…"
                value={form.description}
                onChange={handleChange}
                rows={2}
              />
            </div>

            <div className="form-row form-row-3">
              <div className="input-group">
                <label className="input-label" htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  name="quantity"
                  className="input-field"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.quantity}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="price">Price ($)</label>
                <input
                  id="price"
                  name="price"
                  className="input-field"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="reorder_level">Reorder Level</label>
                <input
                  id="reorder_level"
                  name="reorder_level"
                  className="input-field"
                  type="number"
                  min="0"
                  placeholder="10"
                  value={form.reorder_level}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                className="input-field"
                type="text"
                placeholder="e.g. Electronics"
                value={form.category}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Delete Confirm Modal ── */
const DeleteModal = ({ product, onClose, onConfirm, loading }) => (
  <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal modal-sm" role="dialog" aria-modal="true">
      <div className="modal-header">
        <h2 className="modal-title">Delete Product</h2>
        <button className="modal-close" onClick={onClose}><Icon name="x" size={15} /></button>
      </div>
      <div className="modal-body">
        <p className="delete-confirm-text">
          Are you sure you want to delete <strong>{product?.name}</strong>?
          This action cannot be undone.
        </p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

/* ── Products Page ── */
const Products = ({ user, onNavigate, onLogout }) => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);   // null | 'add' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/products`, { headers });
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.products || [];
      setProducts(list);
      setFiltered(list);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not load products. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Filter products
  useEffect(() => {
    let list = [...products];
    if (categoryFilter !== 'all') {
      list = list.filter(p => (p.category || 'Uncategorized') === categoryFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [search, categoryFilter, products]);

  const categories = ['all', ...new Set(products.map(p => p.category || 'Uncategorized').filter(Boolean))];

  const handleSave = async () => {
    await fetchProducts();
    showToast(modal === 'edit' ? 'Product updated successfully.' : 'Product added successfully.');
    setModal(null);
    setSelected(null);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${selected.id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Delete failed');
      await fetchProducts();
      setModal(null);
      setSelected(null);
      showToast('Product deleted.', 'success');
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete product.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (n) =>
    n != null ? `$${Number(n).toFixed(2)}` : '—';

  const stockStatus = (qty, reorder) => {
    if (qty === 0) return { label: 'Out of Stock', cls: 'badge-danger' };
    if (qty < (reorder || 10)) return { label: 'Low Stock', cls: 'badge-warning' };
    return { label: 'In Stock', cls: 'badge-success' };
  };

  return (
    <div className="app-shell">
      <Sidebar activePage="products" user={user} onNavigate={onNavigate} onLogout={onLogout} />

      <div className="main-content">
        <header className="page-header">
          <div className="page-header-left">
            <div className="page-title">Products</div>
            <div className="page-subtitle">{products.length} items in inventory</div>
          </div>
          <div className="page-header-right">
            <button className="btn btn-primary" onClick={() => setModal('add')}>
              <Icon name="plus" size={14} />
              Add Product
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

          {/* Table */}
          <div className="table-wrap">
            {/* Toolbar */}
            <div className="table-toolbar">
              <div className="table-toolbar-left">
                <div className="search-wrap">
                  <span className="search-icon"><Icon name="search" size={13} /></span>
                  <input
                    className="search-input"
                    type="search"
                    placeholder="Search products…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {/* Category filter pills */}
                <div className="filter-pills">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <span className="table-count">{filtered.length} of {products.length}</span>
            </div>

            {/* Table content */}
            {loading ? (
              <div className="table-loading">
                <div className="products-skeleton">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton-row" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="skeleton-line" style={{ width: '30%' }} />
                      <div className="skeleton-line" style={{ width: '15%' }} />
                      <div className="skeleton-line" style={{ width: '10%' }} />
                      <div className="skeleton-line" style={{ width: '12%' }} />
                      <div className="skeleton-line" style={{ width: '18%' }} />
                    </div>
                  ))}
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Icon name="package" /></div>
                <div className="empty-title">
                  {search ? 'No products match your search' : 'No products yet'}
                </div>
                <div className="empty-desc">
                  {search
                    ? 'Try a different search term or clear filters.'
                    : 'Add your first product to get started.'}
                </div>
                {!search && (
                  <button className="btn btn-primary" onClick={() => setModal('add')}>
                    <Icon name="plus" size={14} />
                    Add Product
                  </button>
                )}
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => {
                    const status = stockStatus(product.quantity, product.reorder_level);
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="product-name-cell">
                            <div className="product-avatar">
                              {(product.name || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="product-name">{product.name}</div>
                              {product.description && (
                                <div className="product-desc">{product.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="td-mono">{product.sku || '—'}</td>
                        <td>
                          {product.category
                            ? <span className="badge badge-neutral">{product.category}</span>
                            : <span className="td-muted">—</span>}
                        </td>
                        <td className="td-mono price-cell">{formatCurrency(product.price)}</td>
                        <td>
                          <span className="stock-qty">{product.quantity}</span>
                          {product.reorder_level != null && (
                            <span className="stock-reorder">/ {product.reorder_level}</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${status.cls}`}>
                            <span className="badge-dot" />
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              className="btn btn-ghost btn-icon"
                              onClick={() => { setSelected(product); setModal('edit'); }}
                              title="Edit"
                            >
                              <Icon name="edit" size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-icon action-delete"
                              onClick={() => { setSelected(product); setModal('delete'); }}
                              title="Delete"
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </div>
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
                  Showing {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <ProductModal onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal === 'edit' && selected && (
        <ProductModal product={selected} onClose={() => { setModal(null); setSelected(null); }} onSave={handleSave} />
      )}
      {modal === 'delete' && selected && (
        <DeleteModal
          product={selected}
          loading={deleteLoading}
          onClose={() => { setModal(null); setSelected(null); }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default Products;