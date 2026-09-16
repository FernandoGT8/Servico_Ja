import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth'
import { login as loginRequest } from '@/services/authService'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginRequest({ email, senha: password })
      login(data)
      setLoading(false)
      // Dashboard é a landing exclusiva de ADMIN/ANALISTA; os demais papéis
      // ainda não têm um perfil real para onde redirecionar.
      navigate(data.tipo === 'ADMIN' || data.tipo === 'ANALISTA' ? '/dashboard' : '/')
    } catch (err) {
      setError(err.message || 'Erro ao conectar com o servidor. Tente novamente.')
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-header">
          <svg
            className="login-logo-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span className="login-logo-text">LOGO</span>
        </div>

        <div className="login-text">
          <h1>Bem-vindo ao Serviço Já</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Vulputate ut laoreet velit ma.</p>
        </div>

        <div className="login-image-section">
          <div className="image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="3" />
              <path d="M4 20c0-2.667 3.582-4 8-4s8 1.333 8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-header">
          <h2>Bem-vindo de volta!</h2>
          <p>Acesse sua conta.</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div style={{ color: '#dc3545', fontSize: '14px', marginBottom: '16px', padding: '8px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>{error}</div>}

          <div className="form-field">
            <label>E-mail ou CPF/CNPJ</label>
            <input
              type="text"
              className="form-input"
              placeholder="Digite seu email, CPF ou CNPJ"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label>Senha</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="form-remember">
            <label>
              <input type="checkbox" disabled={loading} />
              <span>Lembrar-me</span>
            </label>
            <a href="#forgot" className="forgot-link">Esqueci a senha?</a>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Login'}
          </button>
        </form>

        <div className="login-divider">
          <span>ou use sua conta vinculada</span>
        </div>

        <div className="social-login">
          <button className="social-btn google" aria-label="Login com Google">
            <span>G</span>
          </button>
          <button className="social-btn apple" aria-label="Login com Apple">
            <span>🍎</span>
          </button>
          <button className="social-btn facebook" aria-label="Login com Facebook">
            <span>f</span>
          </button>
        </div>

        <div className="login-footer">
          <p>
            <span>Você é Prestador de Serviços?</span>
            <Link to="/register/provider" className="link">Cadastre-se</Link>
          </p>
          <p>
            <span>Você tem uma Empresa?</span>
            <Link to="/register/client" className="link">Contrate</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
