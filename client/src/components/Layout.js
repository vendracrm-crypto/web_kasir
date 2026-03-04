import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaCashRegister, FaBox, FaUsers, 
  FaChartLine, FaWarehouse, FaReceipt, FaBars, FaSignOutAlt, FaCog 
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set sidebar default: open for desktop, closed for mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: <FaHome />, label: 'Dashboard' },
    { path: '/kasir', icon: <FaCashRegister />, label: 'Kasir' },
    { path: '/products', icon: <FaBox />, label: 'Produk' },
    { path: '/inventory', icon: <FaWarehouse />, label: 'Inventori' },
    { path: '/customers', icon: <FaUsers />, label: 'Pelanggan' },
    { path: '/transactions', icon: <FaReceipt />, label: 'Transaksi' },
    { path: '/reports', icon: <FaChartLine />, label: 'Laporan' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/pengaturan', icon: <FaCog />, label: 'Pengaturan' });
  }

  return (
    <div className="layout">
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div style={{ width: 32, height: 32, background: 'var(--brand-500)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FaCashRegister style={{ color: 'white', fontSize: 16 }} />
          </div>
          <h2>Vendra Kasir</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => {
                // Close sidebar on mobile when menu clicked
                if (window.innerWidth <= 768) {
                  setSidebarOpen(false);
                }
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars />
          </button>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="content">
          <Outlet />
        </main>

        {/* Bottom Navigation for Mobile */}
        <nav className="bottom-nav">
          <Link to="/" className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <FaHome />
            <span>Home</span>
          </Link>
          <Link to="/kasir" className={`bottom-nav-item ${location.pathname === '/kasir' ? 'active' : ''}`}>
            <FaCashRegister />
            <span>Kasir</span>
          </Link>
          <Link to="/products" className={`bottom-nav-item ${location.pathname === '/products' ? 'active' : ''}`}>
            <FaBox />
            <span>Produk</span>
          </Link>
          <Link to="/transactions" className={`bottom-nav-item ${location.pathname === '/transactions' ? 'active' : ''}`}>
            <FaReceipt />
            <span>Transaksi</span>
          </Link>
          <Link to="/reports" className={`bottom-nav-item ${location.pathname === '/reports' ? 'active' : ''}`}>
            <FaChartLine />
            <span>Laporan</span>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
