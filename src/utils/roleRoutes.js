// Landing pós-login de todo papel — usada tanto pelo redirecionamento do
// Login.jsx quanto pelo item "Home"/"Dashboard" da Sidebar, num só lugar
// pra não divergirem. Desde que /dashboard virou um dispatcher com view
// própria pra ADMIN/ANALISTA/CLIENTE/PRESTADOR, é a mesma rota pra todos —
// não depende mais de uuid.
export function getHomeRoute() {
  return '/dashboard'
}

// `null` quando o papel não tem uma tela de perfil própria ainda (ou não há
// uuid disponível) — quem usa isso decide o que fazer (ex.: desabilitar o link).
export function getProfileRoute(tipo, uuid) {
  if (tipo === 'CLIENTE') return uuid ? `/client/profile/${uuid}` : null
  if (tipo === 'PRESTADOR') return uuid ? `/provider/profile/${uuid}` : null
  return null
}
