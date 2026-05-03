import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, FaCashRegister, FaBox, FaUsers, 
  FaChartLine, FaWarehouse, FaReceipt, FaBars, FaSignOutAlt, FaCog,
  FaTimes, FaUserCircle
} from 'react-icons/fa';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const bottomNavLeft = [
    { path: '/', icon: <FaHome />, label: 'Home' },
    { path: '/products', icon: <FaBox />, label: 'Produk' },
  ];

  const bottomNavRight = [
    { path: '/transactions', icon: <FaReceipt />, label: 'Transaksi' },
    { path: '/reports', icon: <FaChartLine />, label: 'Laporan' },
  ];

  return (
    <div className="layout">
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen && isMobile ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaCashRegister />
          </div>
          <h2>Vendra Kasir</h2>
          {isMobile && (
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              <FaTimes />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MENU</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => { if (isMobile) setSidebarOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {location.pathname === item.path && <span className="nav-active-dot" />}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <FaUserCircle className="sidebar-user-avatar" />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-role">{user?.role}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`main-content ${sidebarOpen && !isMobile ? '' : 'full'}`}>
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars />
            </button>
            <h1 className="header-title">
              {menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <div className="header-user">
              <FaUserCircle className="header-avatar" />
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-role">{user?.role}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile */}
      <nav className="bottom-nav">
        <div className="bottom-nav-side">
          {bottomNavLeft.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="bottom-nav-center">
          <Link
            to="/kasir"
            className={`bottom-nav-fab ${location.pathname === '/kasir' ? 'active' : ''}`}
          >
            <FaCashRegister />
          </Link>
          <span className="bottom-nav-fab-label">Kasir</span>
        </div>

        <div className="bottom-nav-side">
          {bottomNavRight.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          ))}
          <button className="bottom-nav-item" onClick={() => setSidebarOpen(true)}>
            <span className="bottom-nav-icon"><FaBars /></span>
            <span className="bottom-nav-label">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
