import { Link } from "react-router-dom";
import { primaryButtonClassName, secondaryButtonClassName } from "@/components/ContractForm/contractFormUtils";
import { formatBRL, formatDataHoraBR, verLinkClassName, filterSelectClassName } from "./contractsFieldsUtils";

// Átomos de UI de /contracts — usados pelas 3 visões (ContractsAdmin/
// ContractsClient/ContractsProvider), mesma convenção de
// DashboardFields.jsx: ficam aqui em vez de dentro de uma única visão porque
// as outras duas reaproveitam.

export function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-sm text-(--color-muted)">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={filterSelectClassName}
      >
        <option value="">Todos</option>
        {options.map((opcao) => (
          <option key={opcao} value={opcao}>
            {opcao}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CityFilterInput({ value, onChange }) {
  return (
    <label className="flex items-center gap-3">
      <span className="text-sm text-(--color-muted)">Cidade</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Cidade"
        className={`${filterSelectClassName} w-36`}
      />
    </label>
  );
}

export function ContractCard({ contrato, mostrarStatus = false }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-(--color-border-subtle) bg-(--bg-subtle) p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-(--color-muted-light)/30 text-xs font-bold text-(--color-heading)">
          LOGO
        </div>
        <div className="flex min-w-36 flex-col gap-0.5">
          <span className="text-sm font-bold text-(--color-heading)">
            {contrato.empresa || "—"}
          </span>
          <span className="text-sm text-(--color-muted)">{contrato.tipoServico || "—"}</span>
          <span className="text-sm text-(--color-muted)">
            {contrato.cidade ? `${contrato.cidade}${contrato.estado ? `/${contrato.estado}` : ""}` : "—"}
          </span>
        </div>
        <div className="hidden min-w-36 flex-col gap-0.5 sm:flex">
          <span className="text-sm font-bold text-(--color-heading)">Data do Contrato</span>
          <span className="text-sm text-(--color-muted)">
            {formatDataHoraBR(contrato.dataInicio)}
          </span>
          <span className="text-sm text-(--color-muted)">
            {formatDataHoraBR(contrato.dataEncerramento)}
          </span>
        </div>
        <div className="flex min-w-36 flex-col gap-0.5">
          <span className="text-sm font-bold text-(--color-heading)">Valor Total</span>
          <span className="text-sm text-(--color-muted)">{formatBRL(contrato.valorTotal)}</span>
          {mostrarStatus && contrato.status ? (
            <span className="text-xs font-semibold text-(--color-accent)">{contrato.status}</span>
          ) : null}
        </div>
      </div>
      <Link to={`/contracts/${contrato.uuid}`} className={verLinkClassName}>
        Ver
      </Link>
    </div>
  );
}

export function EmptyState({ mensagem }) {
  return (
    <div className="w-full rounded-2xl border border-dashed border-(--color-border-subtle) py-12 text-center text-sm text-(--color-muted)">
      {mensagem}
    </div>
  );
}

export function ContractsActionBar({ onLoadMore, onRefresh, carregando, temMais, extra }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-3 sm:gap-8">
      <button
        type="button"
        onClick={onLoadMore}
        disabled={!temMais || carregando}
        className={secondaryButtonClassName}
      >
        Carregar Mais
      </button>
      <button
        type="button"
        onClick={onRefresh}
        disabled={carregando}
        className={primaryButtonClassName}
      >
        Atualizar
      </button>
      {extra}
    </div>
  );
}
