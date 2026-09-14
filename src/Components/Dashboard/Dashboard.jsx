import { useState, useEffect } from 'react'
import './Dashboard.css'

export default function Dashboard({ onLogout }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return <div className="dashboard-loading">Carregando...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Bem-vindo, {user.nome}!</h2>
          <p>Você está logado como <strong>{user.tipo}</strong></p>
        </div>

        <div className="user-info-card">
          <h3>Informações da Conta</h3>
          <div className="info-row">
            <label>Email:</label>
            <span>{user.email}</span>
          </div>
          <div className="info-row">
            <label>Tipo de Usuário:</label>
            <span>{user.tipo}</span>
          </div>
          <div className="info-row">
            <label>Nome:</label>
            <span>{user.nome}</span>
          </div>
          <div className="info-row">
            <label>Telefone:</label>
            <span>{user.telefone || 'Não informado'}</span>
          </div>
          <div className="info-row">
            <label>Membro desde:</label>
            <span>{new Date(user.criadoEm).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Próximas Funcionalidades</h3>
          <ul>
            <li>📋 Gerenciar Serviços</li>
            <li>💬 Chat com Prestadores</li>
            <li>📊 Relatórios e Estatísticas</li>
            <li>⚙️ Configurações da Conta</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
