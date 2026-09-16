import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import Sidebar from "@/components/Sidebar/Sidebar";

// Mesmas classes de ClientProfile.jsx — a página ainda não extraiu um design
// system compartilhado, então repetimos a convenção local por enquanto.
const inputClassName =
  "w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-(--color-heading) outline outline-2 -outline-offset-2 outline-(--color-border-subtle) transition-colors placeholder:text-(--color-muted) focus:outline-(--color-accent) disabled:cursor-not-allowed disabled:bg-(--bg-subtle) disabled:text-(--color-muted)";
const labelClassName =
  "text-xs font-bold uppercase tracking-wide text-(--color-muted-light)";
const primaryButtonClassName =
  "rounded-full bg-(--color-heading) px-6 py-4 text-sm font-bold font-dm-sans text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const secondaryButtonClassName =
  "rounded-full border border-(--color-border-subtle) px-6 py-4 text-sm font-bold font-dm-sans text-(--color-heading) transition-colors hover:bg-(--bg-subtle)";

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-6 border-b border-(--color-border-subtle) pb-10 last:border-b-0 last:pb-0">
      <h2 className="text-xl leading-7 font-semibold text-(--color-heading) sm:text-2xl sm:leading-8">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FormField({
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

function RadioOption({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 font-work-sans text-base font-medium tracking-tight text-(--color-heading)">
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
        className="sr-only"
      />
      {label}
    </label>
  );
}

function BackArrowIcon() {
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

export default function ClientBilling() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const statusAcesso = user?.statusAcesso ?? "Pendente";

  // "Razão Social" e "CNPJ" vêm da Documentação validada (PRD §4.2) — a
  // página de créditos só exibe, quem edita é o cadastro em /client/profile.
  const [documentacao] = useState({ razaoSocial: "", cnpj: "" });

  // Contato para o comprovante de compra — editável aqui, distinto do e-mail
  // de login (PRD §4.4).
  const [contato, setContato] = useState({
    emailComprovante: user?.email ?? "",
    telefone: user?.telefone ?? "",
  });

  const [metodoPagamento, setMetodoPagamento] = useState("BOLETO");

  // Histórico vem do extrato (`transacao_credito`, PRD §6.3) — começa vazio,
  // sem dado mockado.
  const [historico] = useState([]);

  const [valorAdicionar, setValorAdicionar] = useState("");

  function handleSalvarConfiguracoes(event) {
    event.preventDefault();
    // TODO: integrar com o endpoint de atualização do contato de cobrança e método de pagamento.
  }

  function handleIrParaPagamento() {
    // TODO: integrar com o fluxo de compra de créditos (Boleto/Cartão) quando o backend estiver pronto.
  }

  return (
    <div className="flex w-full flex-col gap-8 font-poppins md:flex-row md:items-start">
      <Sidebar />

      <div className="w-full flex-1">
        <header className="mb-8">
          <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
            Meus Créditos
          </h1>
          <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
        </header>

        <form
          onSubmit={handleSalvarConfiguracoes}
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-10 rounded-2xl bg-(--bg-card) p-6 md:p-10">
            <Section title="Financeiro">
              {/* Campos calculados (PRD §4.5) — sempre somente leitura. */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Créditos Atuais"
                  value=""
                  placeholder="R$ 0,00"
                  disabled
                />
                <FormField
                  label="Acesso ao Sistema"
                  value={statusAcesso}
                  disabled
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Razão Social"
                  value={documentacao.razaoSocial}
                  placeholder="Nome da Empresa"
                  disabled
                />
                <FormField
                  label="CNPJ"
                  value={documentacao.cnpj}
                  placeholder="00.000.000/0001-00"
                  disabled
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Email para comprovante"
                  value={contato.emailComprovante}
                  placeholder="email@mail.com"
                  onChange={(value) =>
                    setContato((atual) => ({
                      ...atual,
                      emailComprovante: value,
                    }))
                  }
                />
                <FormField
                  label="Telefone"
                  value={contato.telefone}
                  placeholder="+55 (DDD) 99999-4321"
                  onChange={(value) =>
                    setContato((atual) => ({ ...atual, telefone: value }))
                  }
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <span className={labelClassName}>
                    Método Preferencial de pagamento
                  </span>
                  <div className="flex items-center gap-6">
                    <RadioOption
                      label="Boleto"
                      checked={metodoPagamento === "BOLETO"}
                      onChange={() => setMetodoPagamento("BOLETO")}
                    />
                    <RadioOption
                      label="Cartão de Crédito"
                      checked={metodoPagamento === "CARTAO"}
                      onChange={() => setMetodoPagamento("CARTAO")}
                    />
                  </div>
                </div>
                <FormField
                  label="Data da última compra"
                  value=""
                  placeholder="XX/XX/XXXX 00:00"
                  disabled
                />
              </div>
            </Section>

            <Section title="Histórico de Créditos">
              {historico.length === 0 ? (
                <p className="text-sm text-(--color-muted)">
                  Nenhuma movimentação de crédito ainda.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-160 text-left text-sm">
                    <thead>
                      <tr className="border-b border-(--color-border-subtle) text-xs uppercase text-(--color-muted-light)">
                        <th className="py-3 pr-4 font-bold">Operação</th>
                        <th className="py-3 pr-4 font-bold">Status</th>
                        <th className="py-3 pr-4 font-bold">Origem</th>
                        <th className="py-3 font-bold">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historico.map((movimento) => (
                        <tr
                          key={movimento.id}
                          className="outline -outline-offset-1 outline-(--color-border-subtle) font-medium text-(--color-heading) even:bg-(--bg-subtle)"
                        >
                          <td className="py-3 pr-4">{movimento.operacao}</td>
                          <td className="py-3 pr-4">{movimento.status}</td>
                          <td className="py-3 pr-4">{movimento.origem}</td>
                          <td className="py-3">{movimento.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section title="Adicionar Créditos">
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
                <FormField
                  label="Valor total"
                  type="number"
                  value={valorAdicionar}
                  placeholder="R$ 0,00"
                  onChange={setValorAdicionar}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleIrParaPagamento}
                  className={secondaryButtonClassName}
                >
                  Ir para Pagamento
                </button>
              </div>
            </Section>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 py-3 md:gap-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 rounded-full border border-(--color-muted) px-6 py-4 font-dm-sans text-sm font-bold text-(--color-heading) transition-colors hover:bg-(--bg-subtle)"
            >
              <BackArrowIcon />
              Voltar
            </button>
            <button type="submit" className={primaryButtonClassName}>
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
