import React from 'react';
import './ProtectedPage.css';

export default function ProtectedPage({ isLoggedIn, userType, requiredType, onLoginClick, onHomeClick, children }) {
  const handleLoginClick = (e) => {
    e.preventDefault();
    onLoginClick?.();
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    onHomeClick?.();
  };

  // Se não está logado
  if (!isLoggedIn) {
    return (
      <div className="protected-page-container">
        <div className="access-denied-card">
          <div className="access-denied-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2>Acesso Restrito</h2>
          <p>É necessário estar <strong>logado</strong> para visualizar essa tela.</p>
          <button onClick={handleLoginClick} className="access-denied-button">
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Se está logado mas não tem o tipo correto
  if (userType !== requiredType) {
    return (
      <div className="protected-page-container">
        <div className="access-denied-card">
          <div className="access-denied-icon error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2>Acesso Negado</h2>
          <p>Você não possui permissão para acessar essa área.</p>
          <p className="access-denied-subtext">
            Seu tipo de conta: <strong>{userType}</strong>
          </p>
          <button onClick={handleHomeClick} className="access-denied-button secondary">
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // Se tem permissão, renderiza o conteúdo
  return children;
}
