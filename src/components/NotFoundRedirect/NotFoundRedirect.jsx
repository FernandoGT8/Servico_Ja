import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/useAuth'

// Rota coringa (path="*"): qualquer URL sem match cai aqui em vez de
// renderizar em branco. Devolve para um destino que o usuário já reconhece
// — Home pública se ele não estiver logado, Dashboard se estiver.
export default function NotFoundRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />
}
