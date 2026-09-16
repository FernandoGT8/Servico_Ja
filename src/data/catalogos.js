// Catálogos de tipo_servico e curso (PRD §6.3). Hoje são listas locais porque
// o `/admin` que vai gerenciá-los (PRD §3.1, matriz §3.6 — "Gerenciar
// catálogos") ainda é backlog e não existe endpoint no backend. Quando o CRUD
// do Admin existir, trocar estas constantes por GET /api/tipos-servico e
// GET /api/cursos.

export const TIPOS_SERVICO = [
  "Alvenaria",
  "Elétrica",
  "Hidráulica",
  "Pintura",
  "Gesso e Drywall",
  "Pisos e Revestimentos",
  "Estrutura Metálica",
  "Impermeabilização",
  "Limpeza Pós-Obra",
  "Limpeza e Conservação",
  "Jardinagem",
  "Manutenção Predial",
  "Segurança Patrimonial",
  "Portaria e Recepção",
];

export const CURSOS = [
  "NR-06 — Equipamento de Proteção Individual",
  "NR-10 — Segurança em Instalações Elétricas",
  "NR-12 — Segurança em Máquinas e Equipamentos",
  "NR-18 — Condições no Trabalho na Construção",
  "NR-20 — Inflamáveis e Combustíveis",
  "NR-33 — Espaços Confinados",
  "NR-35 — Trabalho em Altura",
  "Primeiros Socorros",
];
