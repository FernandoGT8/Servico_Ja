import { useState, useEffect } from 'react'
import Header from './Components/Header/Header'
import Footer from './Components/Footer/Footer'
import AdminForm from './Components/AdminForm/AdminForm'
import Login from './Components/Login/Login'
import SignUp from './Components/SignUp/SignUp'
import Dashboard from './Components/Dashboard/Dashboard'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'home'
  })
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('token')
  })

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage)
  }, [currentPage])

  if (isLoggedIn) {
    return <Dashboard onLogout={() => {
      setIsLoggedIn(false)
      setCurrentPage('home')
    }} />
  }

  if (currentPage === 'login') {
    return (
      <div className="app-container">
        <Header onLogoClick={() => setCurrentPage('home')} onLoginClick={() => setCurrentPage('login')} />
        <Login onLoginSuccess={() => {
          setIsLoggedIn(true)
          setCurrentPage('dashboard')
        }} onSignUpClick={() => setCurrentPage('signup')} />
        <Footer />
      </div>
    )
  }

  if (currentPage === 'signup') {
    return (
      <div className="app-container">
        <Header onLogoClick={() => setCurrentPage('home')} onLoginClick={() => setCurrentPage('login')} />
        <SignUp />
        <Footer />
      </div>
    )
  }

  if (currentPage === 'admin') {
    return (
      <div className="app-container">
        <Header onLogoClick={() => setCurrentPage('home')} onLoginClick={() => setCurrentPage('login')} />
        <AdminForm />
        <Footer />
      </div>
    )
  }

  return (
    <div className="app-container">
      <Header onLogoClick={() => setCurrentPage('home')} onLoginClick={() => setCurrentPage('login')} />

      <main className="main-content">
        <section className="portal-section">
          <div className="portal-header">
            <h1 className="portal-title">Selecione o seu acesso</h1>
            <p className="portal-subtitle">Escolha o portal correspondente ao seu perfil para continuar</p>
          </div>

          <div className="portal-buttons-grid">
            {/* 1. Página do Administrador */}
            <button onClick={() => setCurrentPage('admin')} className="portal-btn">
              <div className="portal-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="portal-btn-content">
                <span className="portal-btn-name">Administrador</span>
                <span className="portal-btn-desc">Painel de gestão e controle</span>
              </div>
            </button>

            {/* 2. Página da Corporação */}
            <a href="#corporacao" className="portal-btn">
              <div className="portal-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <line x1="9" y1="22" x2="9" y2="22.01" />
                  <line x1="15" y1="22" x2="15" y2="22.01" />
                  <line x1="8" y1="6" x2="8" y2="6.01" />
                  <line x1="16" y1="6" x2="16" y2="6.01" />
                  <line x1="8" y1="10" x2="8" y2="10.01" />
                  <line x1="16" y1="10" x2="16" y2="10.01" />
                  <line x1="8" y1="14" x2="8" y2="14.01" />
                  <line x1="16" y1="14" x2="16" y2="14.01" />
                  <line x1="8" y1="18" x2="8" y2="18.01" />
                  <line x1="16" y1="18" x2="16" y2="18.01" />
                </svg>
              </div>
              <div className="portal-btn-content">
                <span className="portal-btn-name">Corporação</span>
                <span className="portal-btn-desc">Área para empresas e parceiros</span>
              </div>
            </a>

            {/* 3. Página do Trabalhador */}
            <a href="#trabalhador" className="portal-btn">
              <div className="portal-btn-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="portal-btn-content">
                <span className="portal-btn-name">Trabalhador</span>
                <span className="portal-btn-desc">Espaço do profissional prestador</span>
              </div>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
