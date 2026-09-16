// Usuários fixos só para desenvolvimento local (npm run dev), para logar e
// testar as telas de cada papel sem precisar do backend no ar. Consumido
// apenas por authService.js, e só quando import.meta.env.DEV é verdadeiro —
// nunca entra no bundle de produção.
export const MOCK_USERS = [
  {
    email: 'admin@email.com',
    senha: 'admin1234',
    tipo: 'ADMIN',
    nome: 'Admin de Teste',
    telefone: '11900000001',
    criadoEm: '2026-01-01T00:00:00.000Z',
  },
  {
    email: 'cliente@email.com',
    senha: 'cliente1234',
    tipo: 'CLIENTE',
    nome: 'Cliente de Teste',
    telefone: '11900000002',
    criadoEm: '2026-01-01T00:00:00.000Z',
    uuid: 'mock-cliente-001',
  },
  {
    email: 'prestador@email.com',
    senha: 'prestador1234',
    tipo: 'PRESTADOR',
    nome: 'Prestador de Teste',
    telefone: '11900000003',
    criadoEm: '2026-01-01T00:00:00.000Z',
    uuid: 'mock-prestador-001',
  },
]
