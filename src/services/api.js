// Base única da API — antes duplicada como string literal em Login.jsx e SignUp.jsx.
export const API_BASE_URL = 'http://localhost:8080/api'

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    // Backend retorna { mensagem: '...' } em erro — mesmo contrato usado hoje.
    throw new Error(data?.mensagem || 'Erro ao comunicar com o servidor')
  }

  return data
}
