import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaBox, FaDollarSign, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import './Dashboard.css';
import './Products.css';
import './Inventory.css';

const Inventory = () => {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const [summaryRes, productsRes] = await Promise.all([
        axios.get('/inventory/summary'),
        axios.get('/products')
      ]);
      setSummary(summaryRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (!summary) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Manajemen Inventori</h1>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><FaBox /></div>
          <div className="stat-content">
            <h3>Total Produk</h3>
            <p className="stat-value">{summary.totalProducts}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-content">
            <h3>Total Stok</h3>
            <p className="stat-value">{summary.totalStock}</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon"><FaDollarSign /></div>
          <div className="stat-content">
            <h3>Nilai Inventori</h3>
            <p className="stat-value">{formatRupiah(summary.totalValue)}</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon"><FaExclamationTriangle /></div>
          <div className="stat-content">
            <h3>Stok Rendah</h3>
            <p className="stat-value">{summary.lowStock}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginTop: '20px' }}>
        <h2>Daftar Inventori</h2>
        
        {/* Desktop Table View */}
        <div className="products-table-wrapper desktop-view">
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Kategori</th>
                  <th>Stok</th>
                  <th>Harga</th>
                  <th>Nilai Total</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: 600 }}>{product.name}</td>
                    <td>
                      <span className="category-badge">{product.category}</span>
                    </td>
                    <td>
                      <span className={`stock-badge ${product.stock < 10 ? 'danger' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>{formatRupiah(product.price)}</td>
                    <td style={{ fontWeight: 700 }}>
                      {formatRupiah(product.stock * product.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="products-cards mobile-view">
          {products.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-card-header">
                <div>
                  <h3>{product.name}</h3>
                  <span className="category-badge">{product.category}</span>
                </div>
                <span className={`stock-badge ${product.stock < 10 ? 'danger' : ''}`}>
                  {product.stock}
                </span>
              </div>
              <div className="product-card-body">
                <div className="transaction-info">
                  <div className="info-row">
                    <span className="info-label">Harga</span>
                    <span className="info-value">{formatRupiah(product.price)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nilai Total</span>
                    <span className="info-value" style={{ color: 'var(--brand-600)' }}>
                      {formatRupiah(product.stock * product.price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
