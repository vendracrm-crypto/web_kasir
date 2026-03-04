import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaSearch, FaFileInvoice } from 'react-icons/fa';
import './Products.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Riwayat Transaksi</h1>
      </div>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Cari transaksi..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table View */}
      <div className="products-table-wrapper desktop-view">
        <table className="products-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Tanggal</th>
              <th>Pelanggan</th>
              <th>Kasir</th>
              <th>Items</th>
              <th>Pembayaran</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaFileInvoice color="var(--brand-500)" />
                    {transaction.invoiceNumber}
                  </div>
                </td>
                <td>{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</td>
                <td>{transaction.customer?.name || 'Customer Umum'}</td>
                <td>{transaction.cashier}</td>
                <td>{transaction.items.length} item</td>
                <td>
                  <span className="category-badge">{transaction.paymentMethod}</span>
                </td>
                <td style={{ fontWeight: '700', color: 'var(--brand-600)' }}>
                  {formatRupiah(transaction.total)}
                </td>
                <td>
                  <span className="stock-badge">
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="products-cards mobile-view">
        {filteredTransactions.map(transaction => (
          <div key={transaction.id} className="product-card transaction-card">
            <div className="product-card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <FaFileInvoice color="var(--brand-500)" size={16} />
                  <h3 style={{ margin: 0 }}>{transaction.invoiceNumber}</h3>
                </div>
                <p className="product-sku">{new Date(transaction.createdAt).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}</p>
              </div>
              <span className="stock-badge">{transaction.status}</span>
            </div>
            <div className="product-card-body">
              <div className="transaction-info">
                <div className="info-row">
                  <span className="info-label">Pelanggan</span>
                  <span className="info-value">{transaction.customer?.name || 'Customer Umum'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Kasir</span>
                  <span className="info-value">{transaction.cashier}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Items</span>
                  <span className="info-value">{transaction.items.length} item</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Pembayaran</span>
                  <span className="category-badge">{transaction.paymentMethod}</span>
                </div>
              </div>
            </div>
            <div className="transaction-total">
              <span>Total</span>
              <span className="total-amount">{formatRupiah(transaction.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
