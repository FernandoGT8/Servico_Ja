import React, { useState } from 'react';
import './Header.css';

export default function Header({ onLogoClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Lado Esquerdo: Logo, Divisor e Navegação */}
        <div className="header-left">
          <a href="#" onClick={(e) => { e.preventDefault(); onLogoClick?.(); }} className="header-logo-badge" aria-label="Logo">
            <svg
              className="logo-star-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="logo-text">LOGO</span>
          </a>

          <div className="header-divider" aria-hidden="true" />

          <nav className={`header-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label="Navegação Principal">
            <ul className="nav-list">
              <li className="nav-item">
                <a href="#home" onClick={(e) => { e.preventDefault(); onLogoClick?.(); }} className="nav-link">Home</a>
              </li>
              <li className="nav-item">
                <a href="#empresa" className="nav-link">Sou Empresa</a>
              </li>
              <li className="nav-item">
                <a href="#profissional" className="nav-link">Sou Profissional</a>
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

        {/* Lado Direito: Login e Botão Mobile */}
        <div className="header-right">
          <a href="#login" className="login-button">
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
          </a>

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
