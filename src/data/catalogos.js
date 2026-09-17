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

// UFs brasileiras — dado fixo e público, não é catálogo de negócio (diferente
// de tipo_servico/curso/habilidade, que ainda não têm endpoint).
export const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
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

// Ciclo de vida do contrato (PRD §4.7) — usado no select de Status que só o
// ADMIN/ANALISTA edita (ContractDetailAdmin.jsx). Sem validação de transição
// aqui: o front deixa escolher qualquer estado, quem garante a regra de
// negócio é o backend.
export const STATUS_CONTRATO = [
  "Rascunho",
  "Aguardando Prestadores",
  "Prestador Selecionado",
  "Em Execução",
  "Concluído",
  "NF Emitida",
  "Aguardando Pagamento",
  "Finalizado",
  "Cancelado",
];

// Estados finais — "Adicionar Dias" (extensão de prazo) só é permitido fora
// destes (decidido em 17/09/2026, ver Figma.log §15).
export const STATUS_CONTRATO_FINALIZADOS = [
  "Concluído",
  "NF Emitida",
  "Aguardando Pagamento",
  "Finalizado",
  "Cancelado",
];

// Status de acesso do usuário (PRD §3.5) — usado no select de "Alterar
// Status" que ADMIN/ANALISTA edita em ClientProfileAdmin.jsx. Passar para
// Liberado exige CNPJ ativo com Capital Social mínimo de R$ 10 mil (decidido
// em 17/09/2026, ver Figma.log Sessão 7) — validação é do backend, o front só
// deixa escolher o destino.
export const STATUS_ACESSO = ["Pendente", "Liberado", "Bloqueado"];

// Método preferencial de pagamento do Cliente (PRD §4.4), usado em
// ClientBillingAdmin.jsx/ClientBillingClient.jsx. PIX entrou na Sessão 9 do
// Figma.log — o Figma original só desenhava Boleto/Cartão.
export const METODOS_PAGAMENTO = [
  { value: "BOLETO", label: "Boleto" },
  { value: "PIX", label: "PIX" },
  { value: "CARTAO", label: "Cartão de Crédito" },
];

// Tipo do crédito bônus concedido pelo ADMIN sem cobrança (matriz §3.6,
// "Conceder créditos bônus ao Cliente"), usado no modal de
// ClientBillingAdmin.jsx (Figma.log Sessão 9). Alimenta `transacao_credito`
// do lado da plataforma — não é o mesmo enum de `COMPRA`/`RESERVA_*` do PRD
// §6.3, que é sempre pago pelo próprio Cliente.
export const TIPOS_CREDITO_BONUS = [
  { value: "BONUS", label: "Bônus" },
  { value: "PROMOCIONAL", label: "Promocional" },
  { value: "ESTORNO", label: "Estorno" },
  { value: "OUTRO", label: "Outro" },
];
