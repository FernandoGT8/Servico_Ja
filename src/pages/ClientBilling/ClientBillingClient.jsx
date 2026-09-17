import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/services/api";
import { METODOS_PAGAMENTO } from "@/data/catalogos";
import { Section, FormField, RadioOption, BackArrowIcon } from "./ClientBillingFields";
import {
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  formatDataHoraBR,
} from "./clientBillingFieldsUtils";

// Visão do Cliente de /client/profile/{uuid}/billing (Figma.log Sessão 9) —
// mais enxuta que a do ADMIN/ANALISTA (ClientBillingAdmin.jsx): sem Acesso ao
// Sistema, Razão Social nem CNPJ em Financeiro (isso já está em
// /client/profile/{uuid}). "Editar Perfil" > "Salvar" desbloqueia só o
// Método Preferencial de pagamento — Créditos Atuais, Email para
// comprovante¹, Telefone¹ e Data da última compra seguem sempre travados. A
// visão do time interno é ClientBillingAdmin.jsx.
//
// ¹ Diferente de ClientBillingAdmin.jsx: lá o ADMIN pode atualizar o contato
// de cobrança em nome do Cliente; aqui o próprio Cliente só reconfigura o
// método de pagamento nesta tela — email/telefone de contato são editados em
// /client/profile/{uuid} (Dados Gerais).
export default function ClientBillingClient() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  // Todo o estado abaixo nasce vazio — ainda não existe
  // GET /api/clientes/{uuid}/creditos.
  const [financeiro, setFinanceiro] = useState({
    creditosAtuais: "",
    emailComprovante: "",
    telefone: "",
    metodoPagamento: "BOLETO",
    dataUltimaCompra: "",
  });

  const [historico, setHistorico] = useState([]);
  const [valorAdicionar, setValorAdicionar] = useState("");

  useEffect(() => {
    let cancelado = false;
    apiFetch(`/clientes/${uuid}/creditos`)
      .then((dados) => {
        if (cancelado || !dados) return;
        setFinanceiro({
          creditosAtuais: dados.creditosAtuais ?? "",
          emailComprovante: dados.emailComprovante ?? "",
          telefone: dados.telefone ?? "",
          metodoPagamento: dados.metodoPagamento ?? "BOLETO",
          dataUltimaCompra: formatDataHoraBR(dados.dataUltimaCompra),
        });
        setHistorico(dados.historico ?? []);
      })
      .catch(() => {
        // Endpoint ainda não existe no backend — mantém os campos vazios.
      });
    return () => {
      cancelado = true;
    };
  }, [uuid]);

  function handleSalvar(event) {
    event.preventDefault();
    // TODO: integrar com PUT/PATCH /api/clientes/{uuid}/creditos — body só
    // com metodoPagamento. Créditos, contato de cobrança e data da última
    // compra são sempre ignorados pela API (PRD §4.5).
    setIsEditing(false);
  }

  function handleIrParaPagamento() {
    // TODO: integrar com o checkout do provedor de pagamentos — ainda não
    // definido qual (Boleto/PIX/Cartão).
  }

  return (
    <div className="w-full font-poppins">
      <div className="w-full flex-1">
        <header className="mb-8">
          <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
            Meus Créditos
          </h1>
          <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
        </header>

        <form onSubmit={handleSalvar} className="flex flex-col gap-8">
          <div className="flex flex-col gap-10 rounded-2xl bg-(--bg-card) p-6 md:p-10">
            <Section title="Financeiro">
              {/* Campo calculado (PRD §4.5) — sempre somente leitura. */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Créditos Atuais"
                  value={financeiro.creditosAtuais}
                  placeholder="R$ 0,00"
                  disabled
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Email para comprovante"
                  value={financeiro.emailComprovante}
                  placeholder="email@mail.com"
                  disabled
                />
                <FormField
                  label="Telefone"
                  value={financeiro.telefone}
                  placeholder="+55 (DDD) 99999-4321"
                  disabled
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-3">
                  <span className={labelClassName}>Método Preferencial de pagamento</span>
                  <div className="flex flex-wrap items-center gap-6">
                    {METODOS_PAGAMENTO.map((opcao) => (
                      <RadioOption
                        key={opcao.value}
                        label={opcao.label}
                        checked={financeiro.metodoPagamento === opcao.value}
                        onChange={() =>
                          setFinanceiro((atual) => ({ ...atual, metodoPagamento: opcao.value }))
                        }
                        disabled={!isEditing}
                      />
                    ))}
                  </div>
                </div>
                <FormField
                  label="Data da última compra"
                  value={financeiro.dataUltimaCompra}
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
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={primaryButtonClassName}
              >
                Editar
              </button>
            )}
            {isEditing && (
              <button type="submit" className={primaryButtonClassName}>
                Salvar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
