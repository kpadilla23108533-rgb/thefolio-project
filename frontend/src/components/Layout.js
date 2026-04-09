// frontend/src/components/Layout.js
import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Theme from './Theme';

import pic5 from '../components/gmail.png';
import pic6 from '../components/facebook.png';
import logo from '../pictures/LogoK.jpg';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* ── Header ── */}
      <header className="site-header">
        <div className="header-inner">
          {/* Left: logo + brand */}
          <div className="header-brand">
            <img src={logo} alt="Travel Journal Logo" className="header-logo" />
            <div className="header-brand-text">
              <span className="header-title">TRAVEL JOURNAL</span>
              <span className="header-sub">Explore · Document · Remember</span>
            </div>
          </div>

          {/* Right: compass deco + dark mode toggle aligned together */}
          <div className="header-right">
            <div className="header-center-deco" aria-hidden="true">🧭</div>
            <Theme />
          </div>
        </div>
      </header>

      {/* ── Navigation ── */}
      <nav className="horizontal-nav" aria-label="Main navigation">
        <div className="nav-inner">
          <ul className="nav-list">
            <li><Link to="/home"    className={`nav-link ${isActive('/home')}`}>🏠 Home</Link></li>
            <li><Link to="/about"   className={`nav-link ${isActive('/about')}`}>📖 About</Link></li>

            {/* Contact hidden for admin */}
            {!isAdmin && (
              <li><Link to="/contact" className={`nav-link ${isActive('/contact')}`}>✉️ Contact</Link></li>
            )}

            {!user && (
              <>
                <li><Link to="/register" className={`nav-link ${isActive('/register')}`}>✍️ Register</Link></li>
                <li><Link to="/login"    className={`nav-link ${isActive('/login')}`}>🔑 Login</Link></li>
              </>
            )}

            {user && (
              <>
                <li><Link to="/create-post" className={`nav-link ${isActive('/create-post')}`}>✏️ Write</Link></li>
                <li><Link to="/profile"     className={`nav-link ${isActive('/profile')}`}>👤 Profile</Link></li>
                {isAdmin && (
                  <li><Link to="/admin" className={`nav-link ${isActive('/admin')}`}>🛡️ Admin</Link></li>
                )}
                <li>
                  <button className="nav-logout-btn" onClick={handleLogout}>
                    👋 Logout
                    <span className="nav-user-name">({user.name})</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* ── Page Content ── */}
      <main className="site-main">{children}</main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={logo} alt="Logo" className="footer-logo-img" />
            <span className="footer-brand-name">Travel Journal</span>
          </div>

          <div className="footer-links">
            <a href="mailto:krishanepadilla@gmail.com" className="footer-contact-item">
              <img src={pic5} alt="Gmail" className="footer-icon" />
              <span>krishanepadilla@gmail.com</span>
            </a>
            <a href="https://facebook.com/krishanepadilla" target="_blank" rel="noreferrer" className="footer-contact-item">
              <img src={pic6} alt="Facebook" className="footer-icon" />
              <span>krishanepadilla</span>
            </a>
          </div>

          <div className="footer-copy">
            &copy; 2026 Student Portfolio &nbsp;·&nbsp; Made with ❤️ in La Union
          </div>
        </div>
      </footer>
    </>
  );
};

export default Layout;
