// Para onde cada papel vai por padrão — usado tanto pelo redirecionamento
// pós-login (Login.jsx) quanto pelo item "Home"/"Minha Conta" da Sidebar.
// Fica num só lugar para os dois não divergirem.

// Alguns papéis ainda não têm uma rota própria (ex.: painel do Cliente).
// Nesses casos cai em "/" em vez de inventar um destino.
export function getHomeRoute(tipo, uuid) {
  if (tipo === 'ADMIN' || tipo === 'ANALISTA') return '/dashboard'
  if (tipo === 'CLIENTE') return uuid ? `/client/profile/${uuid}` : '/'
  if (tipo === 'PRESTADOR') return '/provider/opportunities'
  return '/'
}

// `null` quando o papel não tem uma tela de perfil própria ainda (ou não há
// uuid disponível) — quem usa isso decide o que fazer (ex.: desabilitar o link).
export function getProfileRoute(tipo, uuid) {
  if (tipo === 'CLIENTE') return uuid ? `/client/profile/${uuid}` : null
  if (tipo === 'PRESTADOR') return uuid ? `/provider/profile/${uuid}` : null
  return null
}
