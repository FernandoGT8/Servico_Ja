import { User } from "lucide-react";
import { inputClassName, labelClassName } from "./firstRegisterFieldsUtils";

// Átomos de UI compartilhados entre FirstRegisterClient.jsx e
// FirstRegisterProvider.jsx — as duas telas da primeira etapa do cadastro
// (criar a conta) usam o mesmo layout e os mesmos tipos de campo, então
// extrair evita duas cópias divergindo (mesma convenção de
// pages/Register/RegisterFields.jsx).

export function FirstRegisterLayout({ title, subtitle, onSubmit, children }) {
  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="flex w-full flex-col items-center justify-center gap-4 rounded-2xl bg-zinc-700 px-8 py-10 text-center sm:flex-row sm:gap-7 sm:px-12 sm:text-left">
        <h1 className="font-dm-sans text-3xl leading-tight font-bold text-white sm:max-w-md sm:text-4xl sm:leading-12">
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
        <form
          onSubmit={onSubmit}
          className="flex w-full max-w-96 flex-col gap-7"
        >
          {children}
        </form>
      </div>
    </div>
  );
}

export function TextField({ label, className = "", ...inputProps }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className={labelClassName}>{label}</span>
      <input {...inputProps} className={inputClassName} />
    </label>
  );
}

export function PasswordField({ label, hint, className = "", ...inputProps }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className={labelClassName}>{label}</span>
      <input {...inputProps} type="password" className={inputClassName} />
      {hint && (
        <small className="text-right text-xs text-slate-500">{hint}</small>
      )}
    </label>
  );
}

export function CheckboxField({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 shrink-0 rounded-sm accent-neutral-900"
      />
      <span className="text-sm font-medium text-neutral-900">{label}</span>
    </label>
  );
}
