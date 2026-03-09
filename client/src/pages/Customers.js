import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaStar, FaHistory, FaDownload } from 'react-icons/fa';
import './Products.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedCustomerTransactions, setSelectedCustomerTransactions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCustomer) {
        await axios.put(`/customers/${editingCustomer.id}`, formData);
        alert('Pelanggan berhasil diupdate!');
      } else {
        const response = await axios.post('/customers', formData);
        console.log('Customer created:', response.data);
        alert('Pelanggan berhasil ditambahkan!');
      }
      
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error('Error details:', error.response || error);
      
      // Tutup modal dan refresh data meskipun ada error
      resetForm();
      fetchCustomers();
      
      // Tampilkan pesan error yang lebih detail
      const errorMsg = error.response?.data?.message || error.message || 'Terjadi kesalahan';
      alert('Pelanggan mungkin sudah tersimpan. Cek data terbaru.\n\nError: ' + errorMsg);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus pelanggan ini?')) {
      try {
        await axios.delete(`/customers/${id}`);
        alert('Pelanggan berhasil dihapus!');
        fetchCustomers();
      } catch (error) {
        alert('Gagal menghapus pelanggan: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: ''
    });
    setEditingCustomer(null);
    setShowModal(false);
  };

  const viewCustomerHistory = async (customer) => {
    try {
      const response = await axios.get(`/customers/${customer.id}`);
      setSelectedCustomerTransactions(response.data.transactions || []);
      setShowTransactionModal(true);
    } catch (error) {
      console.error('Failed to fetch customer history:', error);
      alert('Gagal memuat riwayat transaksi');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const downloadCSV = () => {
    const headers = ['Nama', 'Telepon', 'Email', 'Alamat', 'Poin', 'Total Belanja', 'Kunjungan'];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.phone,
      c.email || '',
      (c.address || '').replace(/[\n\r]+/g, ' '),
      c.points,
      c.totalSpent,
      c.visitCount
    ]);

    const escapeCSV = (val) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvContent = [headers.map(escapeCSV).join(','), ...rows.map(r => r.map(escapeCSV).join(','))].join('\n');
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_pelanggan_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Manajemen Pelanggan</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="add-btn" onClick={downloadCSV} style={{ background: 'var(--success-600)' }}>
            <FaDownload /> Download CSV
          </button>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <FaPlus /> Tambah Pelanggan
          </button>
        </div>
      </div>

      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Cari pelanggan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table View */}
      <div className="products-table-wrapper desktop-view">
        <table className="products-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Telepon</th>
              <th>Email</th>
              <th>Poin</th>
              <th>Total Belanja</th>
              <th>Kunjungan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.email}</td>
                <td>
                  <span className="points">
                    <FaStar /> {customer.points}
                  </span>
                </td>
                <td>{formatRupiah(customer.totalSpent)}</td>
                <td>{customer.visitCount}x</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(customer)}>
                    <FaEdit />
                  </button>
                  <button 
                    className="edit-btn" 
                    style={{ background: 'var(--success-50)', color: 'var(--success-700)' }}
                    onClick={() => viewCustomerHistory(customer)}
                    title="Lihat Riwayat"
                  >
                    <FaHistory />
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(customer.id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="products-cards mobile-view">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="product-card">
            <div className="product-card-header">
              <div>
                <h3>{customer.name}</h3>
                <p className="product-sku">{customer.phone}</p>
              </div>
              <span className="points">
                <FaStar /> {customer.points}
              </span>
            </div>
            <div className="product-card-body">
              <div className="transaction-info">
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value" style={{ fontSize: '13px' }}>{customer.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Belanja</span>
                  <span className="info-value">{formatRupiah(customer.totalSpent)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Kunjungan</span>
                  <span className="info-value">{customer.visitCount}x</span>
                </div>
              </div>
            </div>
            <div className="product-card-actions">
              <button className="edit-btn" onClick={() => handleEdit(customer)}>
                <FaEdit /> Edit
              </button>
              <button 
                className="edit-btn" 
                style={{ background: 'var(--success-50)', color: 'var(--success-700)' }}
                onClick={() => viewCustomerHistory(customer)}
              >
                <FaHistory /> Riwayat
              </button>
              <button className="delete-btn" onClick={() => handleDelete(customer.id)}>
                <FaTrash /> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Telepon *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Alamat</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  {editingCustomer ? 'Update' : 'Simpan'}
                </button>
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactionModal && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <h2>Riwayat Transaksi Pelanggan</h2>
            
            {selectedCustomerTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
                <FaHistory size={50} style={{ marginBottom: '15px', opacity: 0.3 }} />
                <p>Belum ada transaksi</p>
              </div>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '20px' }}>
                {selectedCustomerTransactions.map(transaction => (
                  <div key={transaction.id} style={{
                    background: 'var(--gray-25)',
                    padding: '16px',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <strong style={{ color: 'var(--brand-600)', fontSize: '14px' }}>{transaction.invoice_number}</strong>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--gray-500)' }}>
                          {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand-600)' }}>
                          {formatRupiah(transaction.total)}
                        </div>
                        <span className="category-badge" style={{ fontSize: '11px', marginTop: '4px' }}>
                          {transaction.payment_method}
                        </span>
                      </div>
                    </div>
                    
                    {/* Items Detail */}
                    {transaction.items && transaction.items.length > 0 && (
                      <div style={{ 
                        background: 'white', 
                        borderRadius: '8px', 
                        padding: '10px 12px',
                        border: '1px solid var(--gray-100)'
                      }}>
                        {transaction.items.map((item, idx) => (
                          <div key={idx} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '6px 0',
                            borderBottom: idx < transaction.items.length - 1 ? '1px solid var(--gray-100)' : 'none',
                            fontSize: '13px'
                          }}>
                            <div>
                              <span style={{ fontWeight: '600', color: 'var(--gray-800)' }}>
                                {item.name || 'Produk'}
                              </span>
                              {item.sku && (
                                <span style={{ fontSize: '11px', color: 'var(--gray-400)', marginLeft: '6px' }}>
                                  ({item.sku})
                                </span>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <span style={{ color: 'var(--gray-500)', marginRight: '8px' }}>
                                {item.quantity} x {formatRupiah(item.unit_price)}
                              </span>
                              <span style={{ fontWeight: '600', color: 'var(--gray-800)' }}>
                                {formatRupiah(item.subtotal)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button 
                type="button" 
                className="cancel-btn" 
                style={{ width: '100%' }}
                onClick={() => setShowTransactionModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
