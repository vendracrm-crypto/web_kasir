import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { FaSearch, FaShoppingCart, FaTrash, FaPlus, FaMinus, FaMoneyBillWave, FaTimes } from 'react-icons/fa';
import './Kasir.css';

const Kasir = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showMobileProducts, setShowMobileProducts] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/products/meta/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    console.log('Adding product:', product.name);
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Stok tidak mencukupi!');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      console.log('Updated quantity for:', product.name);
    } else {
      if (product.stock < 1) {
        alert('Stok tidak tersedia!');
        return;
      }
      setCart(prevCart => [...prevCart, { ...product, quantity: 1 }]);
      console.log('Added new item:', product.name);
    }
    
    // Close mobile modal after adding
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        setShowMobileProducts(false);
      }, 100);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    
    if (newQuantity > product.stock) {
      alert('Stok tidak mencukupi!');
      return;
    }
    
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const calculateChange = () => {
    const paid = parseFloat(amountPaid) || 0;
    return paid - calculateTotal();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang kosong!');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;

    if (paid < total) {
      alert('Pembayaran kurang!');
      return;
    }

    try {
      const transactionData = {
        items: cart.map(item => ({
          ...item,
          cost: item.cost || 0,
          addOnPrice: 0,
          discountPercent: 0,
          discountAmount: 0,
          paidToBrand: item.price * item.quantity
        })),
        customer: selectedCustomer,
        paymentMethod,
        amountPaid: paid,
        discount
      };

      console.log('Transaction data:', transactionData);
      const response = await axios.post('/transactions', transactionData);
      console.log('Transaction response:', response.data);
      
      alert('Transaksi berhasil!');
      
      // Reset
      setCart([]);
      setAmountPaid('');
      setDiscount(0);
      setShowCheckout(false);
      setSelectedCustomer(null);
      fetchProducts(); // Refresh products to update stock
    } catch (error) {
      console.error('Transaction error:', error.response || error);
      alert('Transaksi gagal: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="kasir-container">
      <h1>Point of Sale (POS)</h1>

      <div className="kasir-layout">
        {/* Products Section */}
        <div className="products-section">
          <div className="search-filter">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filter">
              <button
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                Semua
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => addToCart(product)}
              >
                <img 
                  src={product.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                  alt={product.name}
                  onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'; }}
                />
                <h3>{product.name}</h3>
                <p className="price">{formatRupiah(product.price)}</p>
                <p className="stock">Stok: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <div className="cart-section">
          <div className="cart-header">
            <h2><FaShoppingCart /> Keranjang</h2>
          </div>

          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <FaShoppingCart />
                <p>Keranjang kosong</p>
                <span className="empty-hint">Tap tombol + untuk menambah produk</span>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>{formatRupiah(item.price)}</p>
                  </div>
                  <div className="item-controls">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                      min="1"
                    />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <FaPlus />
                    </button>
                  </div>
                  <div className="item-total">
                    {formatRupiah(item.price * item.quantity)}
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="cart-customer">
                <label>Pelanggan (Opsional)</label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => String(c.id) === e.target.value);
                    setSelectedCustomer(customer || null);
                  }}
                >
                  <option value="">Customer Umum</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatRupiah(calculateSubtotal())}</span>
                </div>
                <div className="summary-row">
                  <span>Diskon</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{formatRupiah(calculateTotal())}</span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  className="checkout-btn"
                  onClick={() => setShowCheckout(true)}
                >
                  <FaMoneyBillWave /> Checkout
                </button>
              ) : (
                <div className="payment-section">
                  <div className="form-group">
                    <label>Metode Pembayaran</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="cash">Tunai</option>
                      <option value="debit">Kartu Debit</option>
                      <option value="credit">Kartu Kredit</option>
                      <option value="qris">QRIS</option>
                      <option value="transfer">Transfer</option>
                      <option value="ewallet">E-Wallet</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Jumlah Bayar</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="Masukkan jumlah bayar"
                      autoFocus
                    />
                  </div>

                  {amountPaid && (
                    <div className="change-display">
                      <span>Kembalian:</span>
                      <span className={calculateChange() < 0 ? 'negative' : 'positive'}>
                        {formatRupiah(Math.max(0, calculateChange()))}
                      </span>
                    </div>
                  )}

                  <div className="payment-actions">
                    <button
                      className="confirm-btn"
                      onClick={handleCheckout}
                      disabled={parseFloat(amountPaid) < calculateTotal()}
                    >
                      Konfirmasi Pembayaran
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setShowCheckout(false);
                        setAmountPaid('');
                      }}
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Add Product Button */}
      <button 
        className="mobile-add-product"
        onClick={() => setShowMobileProducts(true)}
      >
        <FaPlus />
      </button>

      {/* Mobile Product Modal */}
      <div className={`mobile-product-modal ${showMobileProducts ? 'show' : ''}`}>
        <div className="mobile-product-content">
          <div className="modal-header-mobile">
            <h2>Pilih Produk</h2>
            <button 
              className="modal-close-btn"
              onClick={() => setShowMobileProducts(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div className="search-filter">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filter">
              <button
                className={selectedCategory === 'all' ? 'active' : ''}
                onClick={() => setSelectedCategory('all')}
              >
                Semua
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={selectedCategory === category ? 'active' : ''}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(product);
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  addToCart(product);
                }}
                role="button"
                tabIndex={0}
              >
                <img 
                  src={product.image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                  alt={product.name}
                  onError={(e) => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23ddd" width="150" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'; }}
                />
                <h3>{product.name}</h3>
                <p className="price">{formatRupiah(product.price)}</p>
                <p className="stock">Stok: {product.stock}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kasir;
