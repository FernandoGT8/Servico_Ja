import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/useAuth'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import AppRoutes from './router'

function AppShell() {
  // O Footer do site (contato, redes sociais, lojas de app) não faz sentido
  // dentro da área logada: lá a navegação é a Sidebar/FooterAppM, e no
  // mobile ele ficaria embaixo da barra fixa da Sidebar.
  const { isAuthenticated } = useAuth()

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <AppRoutes />
      </main>
      {!isAuthenticated && <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
