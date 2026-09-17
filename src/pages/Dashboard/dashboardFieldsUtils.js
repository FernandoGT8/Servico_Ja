// Constantes e funções puras usadas pelos átomos de DashboardFields.jsx —
// separadas em arquivo próprio porque react-refresh/only-export-components
// não deixa misturar componentes com outros exports no mesmo módulo (mesma
// convenção de clientProfileFieldsUtils.js). Cada pasta de recurso mantém a
// sua própria cópia em vez de importar de outra (CLAUDE.md — pasta por
// recurso).
export function formatMoedaBR(valor) {
  if (valor === "" || valor === null || valor === undefined) return "—";
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatContagem(valor) {
  if (valor === "" || valor === null || valor === undefined) return "—";
  return Number(valor).toLocaleString("pt-BR");
}

export function formatDataBR(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export const primaryActionClassName =
  "flex items-center justify-center gap-3 rounded-full bg-(--color-heading) px-6 py-4 text-sm font-bold font-dm-sans text-white transition-opacity hover:opacity-90";

export function formatHoraBR(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
