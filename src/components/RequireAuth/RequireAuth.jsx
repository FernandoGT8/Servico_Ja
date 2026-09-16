import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth'
import Sidebar from '@/components/Sidebar/Sidebar'
import './RequireAuth.css'

export default function RequireAuth({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
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
          <Link to="/login" className="access-denied-button">
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(user?.tipo)) {
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
            Seu tipo de conta: <strong>{user?.tipo}</strong>
          </p>
          <Link to="/" className="access-denied-button secondary">
            Voltar para Home
          </Link>
        </div>
      </div>
    )
  }

  // Toda página logada tem a Sidebar — centralizada aqui em vez de repetida
  // em cada página, então uma tela nova já nasce com ela.
  return (
    <div className="flex w-full flex-col gap-8 md:flex-row md:items-start">
      <Sidebar />
      {/* pb extra no mobile: a barra de navegação da Sidebar flutua fixa no rodapé */}
      <div className="w-full min-w-0 flex-1 pb-28 md:pb-0">
        <Outlet />
      </div>
    </div>
  )
}
