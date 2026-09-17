import { labelClassName, inputClassName } from "./clientBillingFieldsUtils";

// Átomos de UI compartilhados entre ClientBillingAdmin.jsx e
// ClientBillingClient.jsx — as duas visões de /client/profile/{uuid}/billing
// usam os mesmos campos, só com escopo de leitura/edição diferente (mesma
// convenção de ClientProfileFields.jsx para /client/profile/{uuid}).

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
