import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import './Header.css';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleUserMenuClick = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Lado Esquerdo: Logo, Divisor e Navegação */}
        <div className="header-left">
          <Link to="/" className="header-logo-badge" aria-label="Logo">
            <svg
              className="logo-star-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="logo-text">LOGO</span>
          </Link>

          <div className="header-divider" aria-hidden="true" />

          <nav className={`header-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label="Navegação Principal">
            <ul className="nav-list">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/business" className="nav-link">Sou Empresa</Link>
              </li>
              <li className="nav-item">
                <Link to="/partners" className="nav-link">Sou Profissional</Link>
              </li>
              <li className="nav-item">
                <a href="#sobre-nos" className="nav-link">Sobre Nós</a>
              </li>
              <li className="nav-item">
                <a href="#contato" className="nav-link">Contato</a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Lado Direito: Login ou Perfil do Usuário */}
        <div className="header-right">
          {isAuthenticated && user ? (
            <div className="user-profile-container" ref={userMenuRef}>
              <button
                onClick={handleUserMenuClick}
                className="user-profile-button"
                aria-label="Abrir menu do usuário"
              >
                <img
                  src={user.foto || 'https://via.placeholder.com/40'}
                  alt={user.nome}
                  className="user-profile-image"
                />
                <div className="user-profile-info">
                  <span className="user-profile-name">{user.nome}</span>
                  <div className="user-profile-rating">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`star-icon ${i < (user.avaliacao || 0) ? 'filled' : 'empty'}`}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="user-menu-dropdown">
                  <a href="#perfil" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); }} className="user-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Meu Perfil
                  </a>
                  <a href="#configuracoes" onClick={(e) => { e.preventDefault(); setIsUserMenuOpen(false); }} className="user-menu-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="1" />
                      <path d="M12 1v6m0 6v4M4.22 4.22l4.24 4.24m2.84 2.84l4.24 4.24M1 12h6m6 0h4M4.22 19.78l4.24-4.24m2.84-2.84l4.24-4.24M19.78 19.78l-4.24-4.24m-2.84-2.84l-4.24-4.24" />
                    </svg>
                    Configurações
                  </a>
                  <hr className="user-menu-divider" />
                  <button onClick={handleLogout} className="user-menu-item logout-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4m7-4l4-4m0 0l-4-4m4 4H9" />
                    </svg>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-button">
              <svg
                className="login-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="login-text">Login</span>
            </Link>
          )}

          {/* Botão de Menu para Dispositivos Móveis */}
          <button
            type="button"
            className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>
    </header>
  );
}
