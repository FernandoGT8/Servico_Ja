import { useState } from "react";
import Modal from "@/components/Modal/Modal";
import { TIPOS_CREDITO_BONUS } from "@/data/catalogos";

// Mesmas classes usadas em ClientProfile/ClientBilling — este componente não
// pertence a nenhuma das duas pastas, então repete a convenção local em vez
// de importar de um utils específico de feature.
const inputClassName =
  "w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-(--color-heading) outline outline-2 -outline-offset-2 outline-(--color-border-subtle) transition-colors placeholder:text-(--color-muted) focus:outline-(--color-accent) disabled:cursor-not-allowed disabled:bg-(--bg-subtle) disabled:text-(--color-muted)";
const labelClassName =
  "text-xs font-bold uppercase tracking-wide text-(--color-muted-light)";
const primaryButtonClassName =
  "rounded-full bg-(--color-heading) px-6 py-4 text-sm font-bold font-dm-sans text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const secondaryButtonClassName =
  "rounded-full border border-(--color-border-subtle) px-6 py-4 text-sm font-bold font-dm-sans text-(--color-heading) transition-colors hover:bg-(--bg-subtle)";

// "Conceder créditos bônus ao Cliente" (matriz PRD §3.6, exclusiva do ADMIN)
// aparece em duas telas — ClientProfileAdmin.jsx e ClientBillingAdmin.jsx
// (Figma.log Sessão 9/10) — por isso o modal virou componente compartilhado
// em vez de duas cópias divergindo. onConfirm recebe { valor, tipo, descricao }.
export default function CreditoBonusModal({ open, onClose, onConfirm }) {
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState(TIPOS_CREDITO_BONUS[0].value);
  const [descricao, setDescricao] = useState("");

  function resetAndClose() {
    setValor("");
    setTipo(TIPOS_CREDITO_BONUS[0].value);
    setDescricao("");
    onClose();
  }

  function handleConfirmar() {
    onConfirm({ valor, tipo, descricao });
    resetAndClose();
  }

  return (
    <Modal open={open} onClose={resetAndClose} title="Adicionar créditos bônus">
      <p className="mb-4 text-sm text-(--color-muted)">
        Crédito concedido pelo Serviços Já!, sem cobrança — distinto da compra paga pelo próprio
        Cliente.
      </p>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className={labelClassName}>Valor</span>
          <input
            type="number"
            value={valor}
            onChange={(event) => setValor(event.target.value)}
            placeholder="R$ 0,00"
            className={inputClassName}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClassName}>Tipo de crédito</span>
          <select
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            className={inputClassName}
          >
            {TIPOS_CREDITO_BONUS.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelClassName}>Descrição (opcional)</span>
          <textarea
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Motivo do crédito, referência interna, etc."
            rows={3}
            className={`${inputClassName} resize-none`}
          />
        </label>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={resetAndClose} className={secondaryButtonClassName}>
          Cancelar
        </button>
        <button type="button" onClick={handleConfirmar} className={primaryButtonClassName}>
          Confirmar
        </button>
      </div>
    </Modal>
  );
}
