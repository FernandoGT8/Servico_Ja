import { Link } from "react-router-dom";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { formatDataBR, formatHoraBR } from "./dashboardFieldsUtils";

// Átomos de UI de /dashboard — hoje só usados por DashboardAdmin.jsx, mas
// ficam aqui (em vez de dentro dela) seguindo a mesma convenção de
// ClientProfileFields.jsx: quando DashboardClient.jsx/DashboardProvider.jsx
// existirem, reaproveitam os mesmos átomos.

export function SectionTitle({ children }) {
  return (
    <h2 className="w-full text-center text-2xl leading-8 font-bold text-(--color-heading) md:text-left">
      {children}
    </h2>
  );
}

// Medidor de barras de cada StatCard — representa o valor do card como
// proporção do valor total mensal (ex.: Créditos Reservados / valor total
// mensal do Cliente). Backlog (18/09/2026): falta o endpoint que dá o valor
// total mensal e a proporção real de cada card; até lá as larguras ficam
// fixas, do jeito que o Figma desenhou, sem dado ligado.
function ProportionalMeter() {
  return (
    <div className="flex w-full max-w-48 flex-col items-center gap-1.5" aria-hidden="true">
      <div className="h-1.5 w-full rounded-xl bg-(--color-muted-light)/30" />
      <div className="h-1.5 w-7/12 rounded-xl bg-(--color-heading)" />
      <div className="h-1.5 w-4/12 rounded-xl bg-(--color-heading)" />
      <div className="h-1.5 w-2/12 rounded-xl bg-(--color-heading)" />
    </div>
  );
}

export function StatCard({ label, subtitle, value }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-4 rounded-2xl bg-(--bg-subtle) p-4">
      <h3 className="text-center text-base font-bold text-(--color-heading)">{label}</h3>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm text-(--color-muted)">{subtitle}</p>
        <p className="text-2xl font-bold text-(--color-heading)">{value}</p>
      </div>
      <ProportionalMeter />
    </div>
  );
}

export function ContractOverviewCard({ title, total, atualizadoEm, itens = [] }) {
  return (
    <div className="flex h-64 flex-col justify-between gap-6 rounded-2xl bg-(--bg-subtle) p-4">
      <div className="flex flex-col items-stretch gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-(--color-heading)">{title}</h3>
          <span className="rounded-md bg-(--color-muted-light)/10 px-4 py-1 text-xs font-semibold text-(--color-heading)">
            {total === "" || total === null || total === undefined ? "—" : total}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-(--color-muted)">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {formatDataBR(atualizadoEm)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatHoraBR(atualizadoEm)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-start gap-3 overflow-hidden">
        {itens.length === 0 ? (
          <p className="text-sm text-(--color-muted)">Nenhum contrato ainda.</p>
        ) : (
          itens.slice(0, 3).map((item, index) => (
            <div key={item.id ?? index} className="flex items-center gap-4">
              <span className="w-2 text-center text-xs font-bold text-(--color-muted-light)">
                {index + 1}
              </span>
              <span className="truncate text-xs font-bold text-(--color-heading)">
                Contrato {item.id}
              </span>
            </div>
          ))
        )}
      </div>

      <Link
        to="/contracts"
        className="flex w-full items-center justify-between text-xs font-semibold text-(--color-accent)"
      >
        Ver mais
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
