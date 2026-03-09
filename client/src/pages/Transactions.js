import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaSearch, FaFileInvoice, FaChevronDown, FaChevronUp, FaFilePdf } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import './Products.css';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const generateReceipt = (transaction) => {
    // Calculate height needed first
    const itemCount = transaction.items ? transaction.items.length : 0;
    const estimatedHeight = 90 + (itemCount * 10) + (transaction.discount > 0 ? 5 : 0);
    const pageH = Math.max(estimatedHeight, 120);

    const doc = new jsPDF({ unit: 'mm', format: [80, pageH] });
    const w = 80;
    let y = 8;
    const leftX = 5;
    const rightX = w - 5;

    const drawDashedLine = (yPos) => {
      for (let x = leftX; x < rightX; x += 2) {
        doc.line(x, yPos, x + 1, yPos);
      }
    };

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('KASIR VENDRA', w / 2, y, { align: 'center' });
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('kasir.vendra.software', w / 2, y, { align: 'center' });
    y += 5;

    drawDashedLine(y);
    y += 5;

    // Invoice info
    doc.setFontSize(8);
    doc.text('No. Invoice', leftX, y);
    doc.text(String(transaction.invoiceNumber || '-'), rightX, y, { align: 'right' });
    y += 4;
    doc.text('Tanggal', leftX, y);
    doc.text(new Date(transaction.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }), rightX, y, { align: 'right' });
    y += 4;
    doc.text('Kasir', leftX, y);
    doc.text(String(transaction.cashier || '-'), rightX, y, { align: 'right' });
    y += 4;
    doc.text('Pelanggan', leftX, y);
    doc.text(String(transaction.customer?.name || 'Pelanggan Umum'), rightX, y, { align: 'right' });
    y += 5;

    drawDashedLine(y);
    y += 5;

    // Items header
    doc.setFont('helvetica', 'bold');
    doc.text('Item', leftX, y);
    doc.text('Subtotal', rightX, y, { align: 'right' });
    y += 4;
    doc.setFont('helvetica', 'normal');

    if (transaction.items && transaction.items.length > 0) {
      transaction.items.forEach(item => {
        const name = String(item.name || 'Produk');
        const displayName = name.length > 22 ? name.substring(0, 22) + '..' : name;
        doc.text(displayName, leftX, y);
        y += 3.5;
        doc.setFontSize(7);
        doc.text('  ' + String(item.quantity) + ' x ' + formatRupiah(item.unit_price), leftX, y);
        doc.text(formatRupiah(item.subtotal), rightX, y, { align: 'right' });
        doc.setFontSize(8);
        y += 5;
      });
    }

    drawDashedLine(y);
    y += 5;

    // Summary
    if (transaction.discount > 0) {
      doc.text('Diskon', leftX, y);
      doc.text('-' + formatRupiah(transaction.discount), rightX, y, { align: 'right' });
      y += 4;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', leftX, y);
    doc.text(formatRupiah(transaction.total), rightX, y, { align: 'right' });
    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Bayar (' + String(transaction.paymentMethod || '-') + ')', leftX, y);
    doc.text(formatRupiah(transaction.amountPaid), rightX, y, { align: 'right' });
    y += 4;
    doc.text('Kembalian', leftX, y);
    doc.text(formatRupiah(transaction.change || 0), rightX, y, { align: 'right' });
    y += 5;

    drawDashedLine(y);
    y += 5;

    // Footer
    doc.setFontSize(8);
    doc.text('Terima kasih atas kunjungan Anda!', w / 2, y, { align: 'center' });
    y += 4;
    doc.setFontSize(7);
    doc.text('Barang yang sudah dibeli tidak dapat', w / 2, y, { align: 'center' });
    y += 3;
    doc.text('ditukar atau dikembalikan', w / 2, y, { align: 'center' });

    doc.save('struk_' + String(transaction.invoiceNumber) + '.pdf');
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
      <div className="products-table-wrapper desktop-view" style={{ overflowX: 'auto' }}>
        <table className="products-table">
          <thead>
            <tr>
              <th></th>
              <th>Invoice</th>
              <th>Tanggal</th>
              <th>Pelanggan</th>
              <th>Kasir</th>
              <th>Items</th>
              <th>Pembayaran</th>
              <th>Total</th>
              <th>Status</th>
              <th>Struk</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => (
              <React.Fragment key={transaction.id}>
                <tr 
                  className={`trx-row ${expandedId === transaction.id ? 'expanded' : ''}`}
                  onClick={() => toggleExpand(transaction.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ width: '30px', textAlign: 'center' }}>
                    {expandedId === transaction.id ? 
                      <FaChevronUp size={12} color="var(--gray-400)" /> : 
                      <FaChevronDown size={12} color="var(--gray-400)" />
                    }
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaFileInvoice color="var(--brand-500)" />
                      {transaction.invoiceNumber}
                    </div>
                  </td>
                  <td>{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</td>
                  <td>{transaction.customer?.name || 'Pelanggan Umum'}</td>
                  <td>{transaction.cashier}</td>
                  <td>{transaction.items.length} item</td>
                  <td>
                    <span className="category-badge">{transaction.paymentMethod}</span>
                  </td>
                  <td style={{ fontWeight: '700', color: 'var(--brand-600)' }}>
                    {formatRupiah(transaction.total)}
                  </td>
                  <td>
                    <span className="stock-badge">{transaction.status}</span>
                  </td>
                  <td>
                    <button 
                      className="edit-btn" 
                      style={{ background: 'var(--error-50)', color: 'var(--error-600)' }}
                      onClick={(e) => { e.stopPropagation(); generateReceipt(transaction); }}
                      title="Download Struk PDF"
                    >
                      <FaFilePdf />
                    </button>
                  </td>
                </tr>
                {expandedId === transaction.id && (
                  <tr className="trx-detail-row">
                    <td colSpan="10" style={{ padding: 0 }}>
                      <div className="trx-detail-panel">
                        <div className="trx-detail-header">
                          <h4>Detail Pesanan</h4>
                        </div>
                        <table className="trx-items-table">
                          <thead>
                            <tr>
                              <th>Produk</th>
                              <th>SKU</th>
                              <th>Harga</th>
                              <th>Qty</th>
                              <th>Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transaction.items.map((item, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: '600' }}>{item.name || 'Produk'}</td>
                                <td style={{ color: 'var(--gray-500)', fontSize: '13px' }}>{item.sku || '-'}</td>
                                <td>{formatRupiah(item.unit_price)}</td>
                                <td>{item.quantity}</td>
                                <td style={{ fontWeight: '600' }}>{formatRupiah(item.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="trx-detail-summary">
                          {transaction.discount > 0 && (
                            <div className="summary-row">
                              <span>Diskon</span>
                              <span style={{ color: 'var(--error-500)' }}>-{formatRupiah(transaction.discount)}</span>
                            </div>
                          )}
                          <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatRupiah(transaction.total)}</span>
                          </div>
                          <div className="summary-row">
                            <span>Bayar ({transaction.paymentMethod})</span>
                            <span>{formatRupiah(transaction.amountPaid)}</span>
                          </div>
                          <div className="summary-row">
                            <span>Kembalian</span>
                            <span>{formatRupiah(transaction.change || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="trx-mobile-list mobile-view">
        {filteredTransactions.map(transaction => (
          <div key={transaction.id} className="trx-mobile-card">
            <div className="trx-mobile-header" onClick={() => toggleExpand(transaction.id)}>
              <div className="trx-mobile-top">
                <div>
                  <div className="trx-mobile-invoice">
                    <FaFileInvoice color="var(--brand-500)" size={14} />
                    <span>{transaction.invoiceNumber}</span>
                  </div>
                  <span className="trx-mobile-date">
                    {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="trx-mobile-total">
                  <span className="trx-amount">{formatRupiah(transaction.total)}</span>
                  <span className="category-badge" style={{ fontSize: '10px' }}>{transaction.paymentMethod}</span>
                </div>
              </div>
              <div className="trx-mobile-meta">
                <span>{transaction.customer?.name || 'Pelanggan Umum'}</span>
                <span>{transaction.items.length} item</span>
                {expandedId === transaction.id ?
                  <FaChevronUp size={12} color="var(--gray-400)" /> :
                  <FaChevronDown size={12} color="var(--gray-400)" />
                }
              </div>
            </div>
            
            {expandedId === transaction.id && (
              <div className="trx-mobile-detail">
                <div className="trx-mobile-items-header">Detail Pesanan</div>
                {transaction.items.map((item, idx) => (
                  <div key={idx} className="trx-mobile-item">
                    <div className="trx-mobile-item-info">
                      <span className="trx-mobile-item-name">{item.name || 'Produk'}</span>
                      <span className="trx-mobile-item-sku">{item.sku || ''}</span>
                    </div>
                    <div className="trx-mobile-item-calc">
                      <span>{item.quantity} x {formatRupiah(item.unit_price)}</span>
                      <span className="trx-mobile-item-subtotal">{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
                <div className="trx-mobile-summary">
                  {transaction.discount > 0 && (
                    <div className="trx-mobile-sum-row">
                      <span>Diskon</span>
                      <span style={{ color: 'var(--error-500)' }}>-{formatRupiah(transaction.discount)}</span>
                    </div>
                  )}
                  <div className="trx-mobile-sum-row total">
                    <span>Total</span>
                    <span>{formatRupiah(transaction.total)}</span>
                  </div>
                  <div className="trx-mobile-sum-row">
                    <span>Bayar</span>
                    <span>{formatRupiah(transaction.amountPaid)}</span>
                  </div>
                  <div className="trx-mobile-sum-row">
                    <span>Kembalian</span>
                    <span>{formatRupiah(transaction.change || 0)}</span>
                  </div>
                </div>
                <button 
                  className="add-btn" 
                  style={{ width: '100%', marginTop: '10px', background: 'var(--error-500)', justifyContent: 'center' }}
                  onClick={(e) => { e.stopPropagation(); generateReceipt(transaction); }}
                >
                  <FaFilePdf /> Download Struk PDF
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
