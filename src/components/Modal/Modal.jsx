// Modal genérico (overlay + painel) — primeiro uso é o de "Adicionar Dias"
// em ContractDetailAdmin.jsx/ContractDetailClient.jsx, mas não tem nada
// específico de contrato, então fica em components/ em vez de ContractForm/.
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        {title && (
          <h3 className="mb-4 font-dm-sans text-xl font-bold text-(--color-heading)">{title}</h3>
        )}
        {children}
      </div>
    </div>
  );
}
