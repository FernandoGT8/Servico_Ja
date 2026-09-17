import { useState } from "react";
import { inputClassName, labelClassName, secondaryButtonClassName } from "./contractFormUtils";
import { formatDateBR } from "./contractFormUtils";

// Átomos de UI compartilhados entre ContractNew.jsx, ContractDetail.jsx e
// Contracts.jsx (listagem) — as três telas do mesmo recurso (contrato) usam
// exatamente os mesmos campos, então extrair evita cópias divergindo (a
// mesma convenção de ClientProfile.jsx/ClientBilling.jsx, só que agora com
// 3 páginas usando).

export function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-6 border-b border-(--color-border-subtle) pb-10 last:border-b-0 last:pb-0">
      <h2 className="text-xl leading-7 font-semibold text-(--color-heading) sm:text-2xl sm:leading-8">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  className = "",
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className={labelClassName}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={!onChange}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        className={inputClassName}
      />
    </label>
  );
}

export function RadioOption({ label, checked, onChange, disabled }) {
  return (
    <label
      className={`flex items-center gap-2 font-work-sans text-base font-medium tracking-tight text-(--color-heading) ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
          checked ? "border-(--color-heading)" : "border-(--color-muted-light)"
        }`}
      >
        {checked && (
          <span className="h-2.5 w-2.5 rounded-full bg-(--color-heading)" />
        )}
      </span>
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      {label}
    </label>
  );
}

export function SimNaoField({ label, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-3">
      <span className={labelClassName}>{label}</span>
      <div className="flex items-center gap-4">
        <RadioOption
          label="Sim"
          checked={value === true}
          onChange={() => onChange(true)}
          disabled={disabled}
        />
        <RadioOption
          label="Não"
          checked={value === false}
          onChange={() => onChange(false)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// `allowTodos` liga uma opção extra sem valor (usada como filtro em
// Contracts.jsx) — ContractNew.jsx/ContractDetail.jsx continuam com as duas
// opções originais, tipo de contrato é obrigatório nessas duas telas.
export function ContractTypeToggle({ value, onChange, disabled, allowTodos = false }) {
  const opcoes = [
    ...(allowTodos ? [{ valor: "", rotulo: "Todos" }] : []),
    { valor: "DIARIA", rotulo: "Diária" },
    { valor: "EMPREITADA", rotulo: "Empreitada" },
  ];
  return (
    <div className="flex items-center gap-2">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opcao.valor)}
          className={`rounded-full px-3 py-1.5 text-sm font-bold font-dm-sans transition-colors disabled:cursor-not-allowed ${
            value === opcao.valor
              ? "bg-(--color-heading) text-white"
              : "text-(--color-muted) enabled:hover:bg-(--bg-subtle)"
          }`}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}

export function DateListField({
  label,
  dates,
  onAdd,
  onRemove,
  disabled,
  emptyMessage = "Nenhuma data adicionada.",
}) {
  const [novaData, setNovaData] = useState("");

  function handleAdd() {
    if (!novaData) return;
    onAdd(novaData);
    setNovaData("");
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <span className={labelClassName}>{label}</span>
      <div className={`${inputClassName} flex min-h-16 flex-wrap items-center gap-2`}>
        {dates.length === 0 && (
          <span className="text-(--color-muted)">{emptyMessage}</span>
        )}
        {dates.map((data, index) => (
          <span
            key={`${data}-${index}`}
            className="flex items-center gap-1 rounded-full bg-(--bg-subtle) px-3 py-1 text-xs font-semibold text-(--color-heading)"
          >
            {formatDateBR(data)}
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remover ${formatDateBR(data)}`}
                className="text-(--color-muted) hover:text-(--color-danger)"
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="date"
            value={novaData}
            onChange={(event) => setNovaData(event.target.value)}
            className={`${inputClassName} flex-1`}
          />
          <button type="button" onClick={handleAdd} className={secondaryButtonClassName}>
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}

export function TagMultiSelect({
  label,
  values,
  onChange,
  sugestoes = [],
  placeholder,
  permitirLivre = true,
  disabled,
}) {
  const [novoValor, setNovoValor] = useState("");

  function handleAdd(valor) {
    const limpo = valor.trim();
    if (!limpo || values.includes(limpo)) return;
    onChange([...values, limpo]);
    setNovoValor("");
  }

  function handleRemove(index) {
    onChange(values.filter((_, i) => i !== index));
  }

  const sugestoesDisponiveis = sugestoes.filter((s) => !values.includes(s));

  return (
    <div className="flex flex-col gap-3">
      <span className={labelClassName}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {values.map((valor, index) => (
          <span
            key={`${valor}-${index}`}
            className="flex items-center gap-2 rounded-full border border-(--color-border-subtle) bg-white px-4 py-2 text-sm text-(--color-heading)"
          >
            {valor}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Remover ${valor}`}
                className="text-(--color-muted) hover:text-(--color-danger)"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {values.length === 0 && (
          <p className="text-sm text-(--color-muted)">Nenhum item adicionado ainda.</p>
        )}
      </div>
      {!disabled && sugestoesDisponiveis.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sugestoesDisponiveis.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              onClick={() => handleAdd(sugestao)}
              className="rounded-full border border-dashed border-(--color-muted-light) px-4 py-2 text-xs font-semibold text-(--color-muted)"
            >
              + {sugestao}
            </button>
          ))}
        </div>
      )}
      {!disabled && permitirLivre && (
        <div className="flex gap-2">
          <input
            type="text"
            value={novoValor}
            onChange={(event) => setNovoValor(event.target.value)}
            placeholder={placeholder}
            className={`${inputClassName} flex-1`}
          />
          <button type="button" onClick={() => handleAdd(novoValor)} className={secondaryButtonClassName}>
            Adicionar
          </button>
        </div>
      )}
    </div>
  );
}

export function BackArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5m0 0l7 7m-7-7l7-7" />
    </svg>
  );
}

