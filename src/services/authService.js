import { apiFetch } from './api'

export function login({ email, senha }) {
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
