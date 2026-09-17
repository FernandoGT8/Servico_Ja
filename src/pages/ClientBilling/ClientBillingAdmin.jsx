import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { apiFetch } from "@/services/api";
import { METODOS_PAGAMENTO } from "@/data/catalogos";
import CreditoBonusModal from "@/components/CreditoBonusModal/CreditoBonusModal";
import { Section, FormField, RadioOption, BackArrowIcon } from "./ClientBillingFields";
import {
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  formatDataHoraBR,
} from "./clientBillingFieldsUtils";

// Visão de ADMIN/ANALISTA de /client/profile/{uuid}/billing (Figma.log
// Sessão 9/10) — o painel de créditos é o financeiro do Cliente (PRD §4.4),
// mas o time interno também precisa dele: o ADMIN concede créditos bônus
// (CreditoBonusModal, compartilhado com ClientProfileAdmin.jsx) e pode
// comprar créditos em nome do Cliente (matriz §3.6, "Conceder créditos
// bônus"/"Comprar créditos" ✅¹). "Editar" > "Salvar" só desbloqueia o Método
// Preferencial de pagamento — Créditos Atuais, Acesso ao Sistema, Razão
// Social, CNPJ, Email para comprovante, Telefone e Data da última compra
// seguem sempre travados, vêm do backend (computados, da Documentação, ou de
// dados de contato geridos em /client/profile/{uuid}). ANALISTA não tem
// nenhuma dessas ações na matriz — só visualiza. A visão do Cliente é
// ClientBillingClient.jsx.
export default function ClientBillingAdmin() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.tipo === "ADMIN";

  const [isEditing, setIsEditing] = useState(false);

  // Todo o estado abaixo nasce vazio — ainda não existe
  // GET /api/clientes/{uuid}/creditos.
  const [financeiro, setFinanceiro] = useState({
    creditosAtuais: "",
    statusAcesso: "Pendente",
    razaoSocial: "",
    cnpj: "",
    emailComprovante: "",
    telefone: "",
    metodoPagamento: "BOLETO",
    dataUltimaCompra: "",
  });

  const [historico, setHistorico] = useState([]);
  const [valorAdicionar, setValorAdicionar] = useState("");
  const [modalCreditosAberto, setModalCreditosAberto] = useState(false);

  useEffect(() => {
    let cancelado = false;
    apiFetch(`/clientes/${uuid}/creditos`)
      .then((dados) => {
        if (cancelado || !dados) return;
        setFinanceiro({
          creditosAtuais: dados.creditosAtuais ?? "",
          statusAcesso: dados.statusAcesso ?? "Pendente",
          razaoSocial: dados.razaoSocial ?? "",
          cnpj: dados.cnpj ?? "",
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
    // com metodoPagamento. Créditos, status, razão social, CNPJ, contato de
    // cobrança e data da última compra são sempre ignorados pela API (PRD
    // §4.5). Ação de ADMIN em nome de terceiro entra em log_auditoria
    // (regra 14).
    setIsEditing(false);
  }

  function handleIrParaPagamento() {
    // TODO: integrar com o checkout do provedor de pagamentos (ainda não
    // definido) — compra em nome do Cliente é ação de ADMIN (matriz §3.6,
    // "Comprar créditos" ✅¹) e entra em log_auditoria.
  }

  function handleConfirmarCreditosBonus(_dadosCredito) {
    // TODO: integrar com POST /api/clientes/{uuid}/creditos/bonus quando
    // existir — _dadosCredito = { valor, tipo, descricao } (catálogo
    // TIPOS_CREDITO_BONUS), vindo do CreditoBonusModal compartilhado. Grava
    // `transacao_credito` sem cobrança, distinto da compra paga acima.
    // Exclusivo do ADMIN (o botão já não aparece para ANALISTA) e entra em
    // log_auditoria (regra 14).
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
              {/* Campos calculados (PRD §4.5) — sempre somente leitura. */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Créditos Atuais"
                  value={financeiro.creditosAtuais}
                  placeholder="R$ 0,00"
                  disabled
                />
                <FormField label="Acesso ao Sistema" value={financeiro.statusAcesso} disabled />
              </div>

              {/* Documentação (PRD §4.2) — nunca editada manualmente, nem pelo ADMIN. */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Razão Social"
                  value={financeiro.razaoSocial}
                  placeholder="Nome da Empresa"
                  disabled
                />
                <FormField
                  label="CNPJ"
                  value={financeiro.cnpj}
                  placeholder="00.000.000/0001-00"
                  disabled
                />
              </div>

              {/* Contato de cobrança — geridos pelo próprio Cliente em
                  /client/profile/{uuid}, aqui só exibição. */}
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
            {isAdmin && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={primaryButtonClassName}
              >
                Editar
              </button>
            )}
            {isAdmin && isEditing && (
              <button type="submit" className={primaryButtonClassName}>
                Salvar
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setModalCreditosAberto(true)}
                className={primaryButtonClassName}
              >
                Adicionar Créditos
              </button>
            )}
          </div>
        </form>

        <CreditoBonusModal
          open={modalCreditosAberto}
          onClose={() => setModalCreditosAberto(false)}
          onConfirm={handleConfirmarCreditosBonus}
        />
      </div>
    </div>
  );
}
