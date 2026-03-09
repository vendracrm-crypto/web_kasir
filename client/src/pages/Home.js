import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

// SVG Icons
const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <ChartIcon />,
      title: 'Laporan Real-time',
      description: 'Pantau penjualan, profit, dan performa bisnis secara real-time dengan dashboard interaktif.'
    },
    {
      icon: <UsersIcon />,
      title: 'Manajemen Pelanggan',
      description: 'Kelola data pelanggan, loyalty points, dan riwayat pembelian dengan mudah.'
    },
    {
      icon: <BoxIcon />,
      title: 'Inventori Pintar',
      description: 'Sistem stok otomatis dengan notifikasi minimum stok dan pelacakan barang.'
    },
    {
      icon: <ShieldIcon />,
      title: 'Keamanan Terjamin',
      description: 'Data bisnis Anda aman dengan enkripsi dan backup otomatis.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: 'Gratis',
      period: 'Selamanya',
      features: ['1 Kasir', '100 Produk', 'Laporan Dasar', 'Support Email'],
      popular: false
    },
    {
      name: 'Business',
      price: 'Rp 199.000',
      period: '/bulan',
      features: ['5 Kasir', 'Unlimited Produk', 'Laporan Lengkap', 'Support Prioritas', 'Multi Outlet', 'Integrasi Payment Gateway'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'Hubungi Kami',
      features: ['Unlimited Kasir', 'Unlimited Produk', 'API Access', 'Dedicated Support', 'Custom Features', 'On-premise Option'],
      popular: false
    }
  ];

  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className={`home-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo">
            <ShoppingBagIcon />
            <span>Vendra POS</span>
          </div>
          <div className="nav-links">
            <a href="#features">Fitur</a>
            <a href="#pricing">Harga</a>
            <a href="#contact">Kontak</a>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="nav-btn-secondary">Masuk</Link>
            <Link to="/register" className="nav-btn-primary">Daftar Gratis</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="hero-blob-1"></div>
          <div className="hero-blob-2"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨ Solusi POS Modern untuk Bisnis Anda</span>
          </div>
          <h1>Kelola Bisnis Retail<br />dengan <span className="gradient-text">Vendra POS</span></h1>
          <p>Sistem Point of Sale modern yang mudah digunakan, powerful, dan dirancang khusus untuk UMKM Indonesia. Tingkatkan efisiensi dan profit bisnis Anda.</p>
          <div className="hero-actions">
            <Link to="/register" className="hero-btn-primary">
              Mulai Gratis Sekarang
              <ArrowRightIcon />
            </Link>
            <a href="#features" className="hero-btn-secondary">
              Lihat Fitur
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">1,000+</span>
              <span className="stat-label">Bisnis Terdaftar</span>
            </div>
            <div className="stat">
              <span className="stat-number">50,000+</span>
              <span className="stat-label">Transaksi/Hari</span>
            </div>
            <div className="stat">
              <span className="stat-number">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Fitur Unggulan</span>
            <h2>Semua yang Anda Butuhkan<br />untuk Bisnis Retail</h2>
            <p>Fitur lengkap yang dirancang untuk memudahkan operasional bisnis Anda sehari-hari.</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Harga</span>
            <h2>Pilih Paket yang Sesuai<br />dengan Kebutuhan Anda</h2>
            <p>Mulai gratis, upgrade kapan saja sesuai pertumbuhan bisnis Anda.</p>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="popular-badge">Paling Populer</span>}
                <h3>{plan.name}</h3>
                <div className="pricing-amount">
                  <span className="price">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <CheckIcon />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`pricing-btn ${plan.popular ? 'primary' : 'secondary'}`}>
                  Mulai Sekarang
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Kontak</span>
            <h2>Hubungi Kami</h2>
            <p>Tim kami siap membantu Anda 24/7</p>
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">
                <PhoneIcon />
              </div>
              <h4>Telepon</h4>
              <p>+62 812-3456-7890</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <MailIcon />
              </div>
              <h4>Email</h4>
              <p>support@vendra.software</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <MapPinIcon />
              </div>
              <h4>Alamat</h4>
              <p>Jakarta, Indonesia</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Siap Meningkatkan Bisnis Anda?</h2>
          <p>Bergabung dengan ribuan bisnis yang sudah menggunakan Vendra POS.</p>
          <Link to="/register" className="cta-btn">
            Daftar Gratis Sekarang
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <ShoppingBagIcon />
              <span>Vendra POS</span>
            </div>
            <p>Sistem Point of Sale modern untuk bisnis Anda.</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Produk</h4>
              <a href="#features">Fitur</a>
              <a href="#pricing">Harga</a>
              <a href="#">Integrasi</a>
            </div>
            <div className="footer-column">
              <h4>Perusahaan</h4>
              <a href="#">Tentang Kami</a>
              <a href="#">Karir</a>
              <a href="#">Blog</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#contact">Kontak</a>
              <a href="#">FAQ</a>
              <a href="#">Dokumentasi</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Vendra POS. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
