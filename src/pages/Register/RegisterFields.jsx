import { ChevronDown, User } from "lucide-react";
import { inputClassName, labelClassName } from "./registerFieldsUtils";

// Átomos de UI compartilhados entre RegisterClient.jsx e RegisterProvider.jsx
// — as duas telas da segunda etapa do cadastro (completar perfil, já
// autenticado) usam o mesmo layout e os mesmos tipos de campo, então extrair
// evita duas cópias divergindo (mesma convenção de ContractFormFields.jsx).

export function RegisterLayout({ title, subtitle, children }) {
  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="flex w-full flex-col items-center justify-center gap-4 rounded-2xl bg-zinc-700 px-8 py-10 text-center sm:flex-row sm:gap-7 sm:px-12 sm:text-left">
        <h1 className="font-dm-sans text-3xl leading-tight font-bold text-white sm:max-w-md sm:text-4xl sm:leading-[48px]">
          {title}
        </h1>
        <p className="max-w-96 text-lg leading-8 text-white">{subtitle}</p>
      </div>

      <div className="flex w-full flex-col items-center gap-10 md:flex-row md:items-start md:justify-center md:gap-16">
        <div
          className="hidden h-80 w-96 shrink-0 items-center justify-center rounded-2xl bg-zinc-700 md:flex"
          aria-hidden="true"
        >
          <User className="h-20 w-20 text-white/40" strokeWidth={1.5} />
        </div>
        <div className="flex w-full max-w-96 flex-col gap-7">{children}</div>
      </div>
    </div>
  );
}

export function TextField({ label, hint, className = "", ...inputProps }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className={labelClassName}>{label}</span>
      <input {...inputProps} className={inputClassName} />
      {hint && <small className="text-right text-xs text-slate-500">{hint}</small>}
    </label>
  );
}

export function SelectField({ label, children, className = "", ...selectProps }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className={labelClassName}>{label}</span>
      <div className="relative">
        <select {...selectProps} className={`${inputClassName} appearance-none pr-10`}>
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
      </div>
    </label>
  );
}

function RadioDot({ checked }) {
  return (
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
        checked ? "border-neutral-900 bg-neutral-900" : "border-zinc-300 bg-white"
      }`}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-white" />}
    </span>
  );
}

export function RadioRows({ name, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-3 rounded-md bg-slate-100 px-5 py-3"
        >
          <RadioDot checked={value === option.value} />
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span className="text-base font-medium text-gray-500">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export function InlineRadioGroup({ name, value, options, onChange }) {
  return (
    <div className="flex items-center gap-6">
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-2">
          <RadioDot checked={value === option.value} />
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span className="text-base font-medium text-gray-500">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export function SimNaoField({ label, name, value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <span className={labelClassName}>{label}</span>
      <InlineRadioGroup
        name={name}
        value={value}
        onChange={onChange}
        options={[
          { value: "sim", label: "Sim" },
          { value: "não", label: "Não" },
        ]}
      />
    </div>
  );
}

export function CheckboxGrid({ label, values, onChange, options, max }) {
  return (
    <div className="flex flex-col gap-3">
      <span className={labelClassName}>
        {label}
        {max && <span className="text-slate-400"> (escolha até {max})</span>}
      </span>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((option) => {
          const checked = values.includes(option);
          const disabled = !checked && Boolean(max) && values.length >= max;
          return (
            <label
              key={option}
              className={`flex items-center gap-2 rounded-md bg-slate-100 px-4 py-3 text-sm font-medium text-gray-500 ${
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() =>
                  onChange(checked ? values.filter((v) => v !== option) : [...values, option])
                }
                className="h-4 w-4 shrink-0 accent-neutral-900"
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}
