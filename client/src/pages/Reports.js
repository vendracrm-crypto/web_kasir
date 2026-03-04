import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Reports.css';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [period, setPeriod] = useState('day');
  const [activeTab, setActiveTab] = useState('reports');
  
  // Export Vendra state
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchSalesReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchSalesReport = async () => {
    try {
      const params = { groupBy: period };
      const response = await axios.get('/reports/sales', { params });
      setSalesData(response.data);
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
  const totalTransactions = salesData.reduce((sum, item) => sum + item.transactions, 0);
  const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Export Vendra functions
  const fetchPreview = async () => {
    setPreviewLoading(true);
    try {
      const params = {};
      if (exportStartDate) params.startDate = exportStartDate;
      if (exportEndDate) params.endDate = exportEndDate;
      const response = await axios.get('/reports/export-vendra-preview', { params });
      setPreviewData(response.data);
    } catch (error) {
      console.error('Failed to fetch preview:', error);
      alert('Gagal memuat preview data');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const params = {};
      if (exportStartDate) params.startDate = exportStartDate;
      if (exportEndDate) params.endDate = exportEndDate;
      
      const response = await axios.get('/reports/export-vendra', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vendra-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Gagal mengexport data');
    } finally {
      setExportLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + 
           ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="reports-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Laporan Penjualan</h1>
          <p className="page-subtitle">Analisis penjualan dan export data ke Vendra CRM</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="reports-tabs">
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          Laporan
        </button>
        <button 
          className={`tab-btn ${activeTab === 'export' ? 'active' : ''}`}
          onClick={() => setActiveTab('export')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          Export Vendra
        </button>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="reports-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Penjualan</span>
                <span className="stat-value">{formatRupiah(totalSales)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Transaksi</span>
                <span className="stat-value">{totalTransactions}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Rata-rata / Transaksi</span>
                <span className="stat-value">{formatRupiah(avgTransaction)}</span>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="report-card">
            <div className="report-card-header">
              <h2>Grafik Penjualan</h2>
              <div className="period-filter">
                {['day', 'month', 'year'].map(p => (
                  <button
                    key={p}
                    className={period === p ? 'active' : ''}
                    onClick={() => setPeriod(p)}
                  >
                    {p === 'day' ? 'Harian' : p === 'month' ? 'Bulanan' : 'Tahunan'}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#667085" fontSize={12} />
                  <YAxis stroke="#667085" fontSize={12} tickFormatter={(v) => v >= 1000000 ? (v/1000000).toFixed(1)+'jt' : v >= 1000 ? (v/1000)+'rb' : v} />
                  <Tooltip formatter={(value) => formatRupiah(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#465fff" name="Penjualan" strokeWidth={2.5} dot={{ r: 4, fill: '#465fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaction Chart */}
          <div className="report-card">
            <div className="report-card-header">
              <h2>Grafik Transaksi</h2>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#667085" fontSize={12} />
                  <YAxis stroke="#667085" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                  <Legend />
                  <Bar dataKey="transactions" fill="#465fff" name="Jumlah Transaksi" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Export Vendra Tab */}
      {activeTab === 'export' && (
        <div className="export-content">
          {/* Export Info Card */}
          <div className="export-info-card">
            <div className="export-info-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div className="export-info-text">
              <h3>Export ke Vendra CRM</h3>
              <p>Export data transaksi dari Vendra Kasir ke format CSV yang kompatibel dengan fitur Import di Vendra CRM. Data akan mencakup semua informasi order, customer, produk, dan keuangan.</p>
            </div>
          </div>

          {/* Date Range */}
          <div className="export-card">
            <div className="export-card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <h3>Filter Tanggal</h3>
            </div>
            <div className="export-card-body">
              <div className="date-range-row">
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="vendra-input"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                  />
                </div>
                <div className="date-range-divider">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Akhir</label>
                  <input
                    type="date"
                    className="vendra-input"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                  />
                </div>
              </div>
              <p className="date-hint">Kosongkan untuk mengexport semua data transaksi</p>
            </div>
          </div>

          {/* Actions */}
          <div className="export-actions">
            <button 
              className="btn-secondary" 
              onClick={fetchPreview}
              disabled={previewLoading}
            >
              {previewLoading ? (
                <><span className="spinner"></span> Memuat...</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> Preview Data</>
              )}
            </button>
            <button 
              className="btn-primary" 
              onClick={handleExportCSV}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <><span className="spinner"></span> Mengexport...</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> Export CSV untuk Vendra</>
              )}
            </button>
          </div>

          {/* Preview Table */}
          {previewData && (
            <div className="export-card preview-card">
              <div className="export-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                <h3>Preview Data ({previewData.total} total rows)</h3>
              </div>
              <div className="preview-table-wrapper">
                <table className="vendra-table">
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Waktu</th>
                      <th>Customer</th>
                      <th>Brand</th>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Harga</th>
                      <th>Amount</th>
                      <th>Profit</th>
                      <th>Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.preview.length === 0 ? (
                      <tr><td colSpan="10" style={{textAlign:'center', padding:'40px', color:'var(--gray-400)'}}>Tidak ada data untuk periode ini</td></tr>
                    ) : (
                      previewData.preview.map((row, i) => (
                        <tr key={i}>
                          <td><span className="invoice-badge">{row.orderNo}</span></td>
                          <td className="text-muted">{formatDateTime(row.orderTime)}</td>
                          <td>{row.customerName || '-'}</td>
                          <td><span className="brand-badge">{row.brand || 'General'}</span></td>
                          <td className="text-bold">{row.itemName}</td>
                          <td className="text-center">{row.qty}</td>
                          <td className="text-right">{formatRupiah(row.price)}</td>
                          <td className="text-right text-bold">{formatRupiah(row.amount)}</td>
                          <td className={`text-right ${row.profit >= 0 ? 'text-success' : 'text-danger'}`}>{formatRupiah(row.profit || 0)}</td>
                          <td><span className="payment-badge">{(row.paymentType || 'cash').toUpperCase()}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {previewData.total > 100 && (
                <div className="preview-footer">
                  Menampilkan 100 dari {previewData.total} rows. Export CSV untuk data lengkap.
                </div>
              )}
            </div>
          )}

          {/* CSV Format Info */}
          <div className="export-card format-card">
            <div className="export-card-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
              <h3>Format CSV Vendra</h3>
            </div>
            <div className="export-card-body">
              <p className="format-desc">File CSV yang diexport akan memiliki 22 kolom sesuai format import Vendra CRM:</p>
              <div className="format-columns">
                {['order no', 'order time', 'customer name', 'customer phone', 'customer email', 'brand', 'item group', 'item name', 'item sku', 'qty', 'currency', 'price', 'add-on price', 'discount percent', 'discount amount', 'amount', 'tax amount', 'cost perunit', 'total cost', 'profit', 'paid to brand', 'payment type'].map((col, i) => (
                  <span key={i} className="format-column-tag">{col}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
