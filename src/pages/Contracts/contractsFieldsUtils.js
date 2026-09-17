// Constantes e funções puras usadas pelos átomos de ContractsFields.jsx —
// separadas em arquivo próprio porque react-refresh/only-export-components
// não deixa misturar componentes com outros exports no mesmo módulo (mesma
// convenção de dashboardFieldsUtils.js). Cada pasta de recurso mantém a sua
// própria cópia em vez de importar de outra (CLAUDE.md — pasta por recurso).
export function formatBRL(valor) {
  if (valor === "" || valor === null || valor === undefined) return "—";
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDataHoraBR(iso) {
  if (!iso) return "—";
  const data = new Date(iso);
  const dataFormatada = data.toLocaleDateString("pt-BR");
  const horaFormatada = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dataFormatada} ${horaFormatada}`;
}

export const verLinkClassName =
  "flex h-10 shrink-0 items-center justify-center rounded-full border border-(--color-border-subtle) px-6 text-sm font-medium text-(--color-muted) transition-colors hover:bg-(--bg-subtle)";

export const filterSelectClassName =
  "rounded-full bg-white px-4 py-2 text-sm font-medium text-(--color-heading) outline outline-1 -outline-offset-1 outline-(--color-border-subtle) focus:outline-2 focus:outline-(--color-accent)";
