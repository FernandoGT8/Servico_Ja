import { apiFetch } from './api'
import { MOCK_USERS } from './mockUsers'

export function login({ email, senha }) {
  // Atalho só para desenvolvimento: loga com um dos usuários fixos de
  // mockUsers.js sem precisar do backend no ar. import.meta.env.DEV é
  // substituído estaticamente pelo Vite — esse branch some no build de
  // produção, então nunca chega a existir fora do `npm run dev`.
  if (import.meta.env.DEV) {
    const mockUser = MOCK_USERS.find((u) => u.email === email && u.senha === senha)
    if (mockUser) {
      return Promise.resolve({
        token: `mock-token-${mockUser.tipo.toLowerCase()}`,
        nome: mockUser.nome,
        email: mockUser.email,
        tipo: mockUser.tipo,
        telefone: mockUser.telefone,
        criadoEm: mockUser.criadoEm,
        ...(mockUser.uuid ? { uuid: mockUser.uuid } : {}),
      })
    }
  }

  return apiFetch('/usuarios/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
}

export function register(payload) {
  return apiFetch('/usuarios/registrar', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
