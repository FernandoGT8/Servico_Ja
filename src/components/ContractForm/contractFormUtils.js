// Constantes e funções puras usadas pelos átomos de ContractFormFields.jsx —
// separadas em arquivo próprio porque react-refresh/only-export-components
// não deixa misturar componentes com outros exports no mesmo módulo.
export const inputClassName =
  "w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-(--color-heading) outline outline-2 -outline-offset-2 outline-(--color-border-subtle) transition-colors placeholder:text-(--color-muted) focus:outline-(--color-accent) disabled:cursor-not-allowed disabled:bg-(--bg-subtle) disabled:text-(--color-muted)";
export const labelClassName =
  "text-xs font-bold uppercase tracking-wide text-(--color-muted-light)";
export const primaryButtonClassName =
  "rounded-full bg-(--color-heading) px-6 py-4 text-sm font-bold font-dm-sans text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
export const secondaryButtonClassName =
  "rounded-full border border-(--color-border-subtle) px-6 py-4 text-sm font-bold font-dm-sans text-(--color-heading) transition-colors hover:bg-(--bg-subtle)";

export function formatDateBR(isoDate) {
  const [, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}`;
}

export function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value || 0,
  );
}
