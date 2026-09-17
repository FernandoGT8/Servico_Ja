import { labelClassName, inputClassName } from "./clientProfileFieldsUtils";

// Átomos de UI compartilhados entre ClientProfileAdmin.jsx e
// ClientProfileClient.jsx — as duas visões de /client/profile/{uuid}
// (Figma.log Sessão 7) usam os mesmos campos, só com escopo de leitura/edição
// diferente (mesma convenção de ContractFormFields.jsx para as 3 visões de
// /contracts/{uuid}).

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

export function AttachIcon() {
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
      <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24L9.41 17.41a1 1 0 0 1-1.41-1.41l8.49-8.49" />
    </svg>
  );
}

export function PhotoPlaceholderIcon() {
  return (
    <svg
      className="h-14 w-14 text-white/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
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
