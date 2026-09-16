import { useState, useCallback } from 'react'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  // userData é o payload que a API de login/registro já retorna hoje
  // (token + dados do usuário no mesmo objeto).
  const login = useCallback((userData) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(userData.token)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const value = { user, token, isAuthenticated: !!token, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
