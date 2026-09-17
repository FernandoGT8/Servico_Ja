import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Paperclip } from "lucide-react";
import { apiFetch } from "@/services/api";
import {
  CURSOS,
  HABILIDADES,
  STATUS_CONTRATO,
  STATUS_CONTRATO_FINALIZADOS,
  TIPOS_SERVICO,
} from "@/data/catalogos";
import Modal from "@/components/Modal/Modal";
import {
  Section,
  FormField,
  SimNaoField,
  ContractTypeToggle,
  DateListField,
  TagMultiSelect,
  BackArrowIcon,
} from "@/components/ContractForm/ContractFormFields";
import {
  inputClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
  formatBRL,
} from "@/components/ContractForm/contractFormUtils";

function formatDataHoraBR(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("pt-BR");
}

// Visão de ADMIN/ANALISTA de /contracts/{uuid} — acesso total (PRD §3.1),
// então é quem tem Percentual/Valor de Taxa, Nota Fiscal e Candidaturas.
// "Editar Contrato" só desbloqueia Status, Tipo de Serviço, o valor de entrada
// (por dia ou total, conforme o tipo) e a Nota Fiscal — o resto (tipo de
// contrato, localização, datas, dias de trabalho/folga/falta, condições de
// operação, cursos, habilidades) fica travado, conforme decidido em conversa
// (17/09/2026). "Adicionar Dias" é uma ação à parte: abre um modal para
// definir uma nova Data de Encerramento e estender o contrato — não edita
// mais os dias de trabalho/folga diretamente. A visão do Cliente é
// ContractDetailClient.jsx; a do Prestador, ContractDetailProvider.jsx.
export default function ContractDetailAdmin() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [modalDiasAberto, setModalDiasAberto] = useState(false);
  const [novaDataEncerramento, setNovaDataEncerramento] = useState("");
  const [valorAdicionalDias, setValorAdicionalDias] = useState("");

  // Todo o estado abaixo nasce vazio — ainda não existe GET /api/contratos/{uuid}.
  const [tipoContrato, setTipoContrato] = useState("DIARIA");
  const [status, setStatus] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [localizacao, setLocalizacao] = useState({ cidade: "", estado: "" });

  const [financeiro, setFinanceiro] = useState({
    dataInicio: "",
    dataEncerramento: "",
    valorPorDia: "",
    valorTotal: "",
  });

  // Congelados na publicação (PRD §2.2/§4.5) — só o backend calcula, aqui só exibimos.
  const [percentualTaxa, setPercentualTaxa] = useState("");
  const [valorTaxa, setValorTaxa] = useState("");

  const [nf, setNf] = useState({ arquivoNome: "", arquivoUrl: "", dataAprovacao: "" });

  const [diasTrabalho, setDiasTrabalho] = useState([]);
  const [diasFolga, setDiasFolga] = useState([]);
  const [diasFalta, setDiasFalta] = useState([]);

  const [operacao, setOperacao] = useState({
    pernoiteCasa: null,
    pernoiteAlojamento: null,
    transporteFornecido: null,
    ferramentasFornecidas: null,
    episFornecidos: null,
    areaAlimentacao: null,
  });

  const [cursosExigidos, setCursosExigidos] = useState([]);
  const [habilidadesDesejadas, setHabilidadesDesejadas] = useState([]);

  // Candidaturas do mural — vazio até existir GET /api/contratos/{uuid}/candidaturas.
  const [candidaturas, setCandidaturas] = useState([]);

  const [descricao, setDescricao] = useState("");

  // Campos calculados (PRD §4.5) — sempre somente leitura, mesmo em edição.
  // "Dias de trabalho" também é calculado (intervalo Data de Início → Data de
  // Encerramento, menos os Dias de folga) — nunca foi um campo que se edita
  // dia a dia, nem para o ADMIN. Simplificação: descontamos diasFalta do
  // total aqui na hora, mas na regra real (§4.8) a falta só desconta depois
  // que o Prestador aprova a remoção — sem backend, não temos como saber se
  // já foi aprovada.
  const quantidadeDiariasEfetivas = Math.max(diasTrabalho.length - diasFalta.length, 0);
  const valorTotalCalculado = useMemo(() => {
    if (tipoContrato !== "DIARIA") return null;
    return quantidadeDiariasEfetivas * (Number(financeiro.valorPorDia) || 0);
  }, [tipoContrato, quantidadeDiariasEfetivas, financeiro.valorPorDia]);
  const valorPorDiaCalculado = useMemo(() => {
    if (tipoContrato !== "EMPREITADA") return null;
    if (quantidadeDiariasEfetivas === 0) return 0;
    return (Number(financeiro.valorTotal) || 0) / quantidadeDiariasEfetivas;
  }, [tipoContrato, quantidadeDiariasEfetivas, financeiro.valorTotal]);

  function handleNfChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    // TODO: subir o arquivo de verdade quando o endpoint existir — por ora só
    // guardamos o nome/URL local para a UI refletir a seleção.
    setNf((atual) => ({ ...atual, arquivoNome: file.name, arquivoUrl: URL.createObjectURL(file) }));
  }

  // Busca o contrato ao montar a página — endpoint ainda não existe no
  // backend, então hoje isso só cai no catch e a tela fica com os campos
  // vazios. Deixado pronto para quando GET /api/contratos/{uuid} existir.
  useEffect(() => {
    let cancelado = false;
    apiFetch(`/contratos/${uuid}`)
      .then((contrato) => {
        if (cancelado || !contrato) return;
        setTipoContrato(contrato.tipo ?? "DIARIA");
        setStatus(contrato.status ?? "");
        setTipoServico(contrato.tipoServico ?? "");
        setLocalizacao({ cidade: contrato.cidade ?? "", estado: contrato.estado ?? "" });
        setFinanceiro({
          dataInicio: contrato.dataInicio ?? "",
          dataEncerramento: contrato.dataEncerramento ?? "",
          valorPorDia: contrato.valorPorDia ?? "",
          valorTotal: contrato.valorTotal ?? "",
        });
        setPercentualTaxa(contrato.percentualTaxa ?? "");
        setValorTaxa(contrato.valorTaxa ?? "");
        setNf({
          arquivoNome: contrato.notaFiscal?.arquivoNome ?? "",
          arquivoUrl: contrato.notaFiscal?.arquivoUrl ?? "",
          dataAprovacao: contrato.notaFiscal?.dataAprovacao ?? "",
        });
        setDiasTrabalho(contrato.diasTrabalho ?? []);
        setDiasFolga(contrato.diasFolga ?? []);
        setDiasFalta(contrato.diasFalta ?? []);
        if (contrato.operacao) setOperacao(contrato.operacao);
        setCursosExigidos(contrato.cursosExigidos ?? []);
        setHabilidadesDesejadas(contrato.habilidadesDesejadas ?? []);
        setCandidaturas(contrato.candidaturas ?? []);
        setDescricao(contrato.descricao ?? "");
      })
      .catch(() => {
        // Endpoint ainda não existe no backend — mantém os campos vazios.
      });
    return () => {
      cancelado = true;
    };
  }, [uuid]);

  const selecionada = candidaturas.find((candidatura) => candidatura.selecionado);

  function handleSelecionarPrestador() {
    // Ação financeira irreversível (reserva serviço + taxa, regra 5/§2.1) —
    // não mutamos a lista localmente sem confirmação do backend. Feita pelo
    // ADMIN em nome do Cliente exige log_auditoria (PRD §3.1/regra 14).
    // TODO: integrar com o endpoint de seleção quando existir.
  }

  function handleSalvar(event) {
    event.preventDefault();
    // TODO: integrar com PUT/PATCH /api/contratos/{uuid} — a API deve rejeitar
    // os campos calculados no corpo da requisição (PRD §4.5, regra 13). Toda
    // edição de ADMIN entra em log_auditoria (regra 14).
    setIsEditing(false);
  }

  function handleAbrirModalDias() {
    setNovaDataEncerramento(financeiro.dataEncerramento);
    setValorAdicionalDias("");
    setModalDiasAberto(true);
  }

  function handleConfirmarNovaDataEncerramento() {
    // "Adicionar Dias" só muda a Data de Encerramento — não mexe nos dias já
    // registrados em dia_contrato (decidido em 17/09/2026). O que acontece
    // com o valor é regra do backend, não recalculamos aqui:
    // - Diária: valor_total já é campo calculado (quantidade de diárias ×
    //   valor/dia) — atualiza sozinho conforme novos dias de trabalho forem
    //   registrados no período estendido.
    // - Empreitada: valor_total é fechado, então o backend soma
    //   `valorAdicionalDias` (valor do período restante) a ele.
    // TODO: integrar com POST /api/contratos/{uuid}/dias quando o endpoint
    // existir (ver BACKEND_ANALISE.md §6) — body: { novaDataEncerramento,
    // valorAdicionalDias (só Empreitada) }.
    setFinanceiro((atual) => ({ ...atual, dataEncerramento: novaDataEncerramento }));
    setModalDiasAberto(false);
  }

  function handlePagamentoFinal() {
    // Aprova a NF e libera o pagamento ao Prestador, cobrando a taxa no mesmo
    // evento (PRD §4.7 estado 7, regra 5).
    // TODO: integrar com o endpoint de aprovação de NF quando existir.
  }

  function handleFinalizarContrato() {
    // Fecha a execução, status → Concluído/Finalizado (PRD §4.7 estado 5).
    // TODO: integrar com o endpoint de transição de status quando existir.
  }

  return (
    <div className="w-full font-poppins">
      <div className="w-full flex-1">
        <header className="mb-8">
          <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
            Contrato {uuid}
          </h1>
          <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
        </header>

        <form onSubmit={handleSalvar} className="flex flex-col gap-8">
          <div className="flex flex-col gap-10 rounded-2xl bg-(--bg-card) p-6 md:p-10">
            <section className="flex flex-col gap-6 border-b border-(--color-border-subtle) pb-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl leading-7 font-semibold text-(--color-heading) sm:text-2xl sm:leading-8">
                  Tipo de contrato
                </h2>
                {/* Nem o ADMIN muda o tipo depois de publicado (decidido em
                    conversa, 17/09/2026) — resolve a pendência "Ações por
                    estado do contrato" do Figma.log §12 para este campo. */}
                <ContractTypeToggle value={tipoContrato} onChange={() => {}} disabled />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="ID do contrato" value={uuid ?? ""} disabled />
                {isEditing ? (
                  <label className="flex flex-col gap-2">
                    <span className={labelClassName}>Status</span>
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className={inputClassName}
                    >
                      <option value="">Selecione o status</option>
                      {STATUS_CONTRATO.map((opcao) => (
                        <option key={opcao} value={opcao}>
                          {opcao}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <FormField label="Status" value={status} placeholder="Carregando..." disabled />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className={labelClassName}>Tipo de serviço</span>
                  <select
                    value={tipoServico}
                    onChange={(event) => setTipoServico(event.target.value)}
                    disabled={!isEditing}
                    className={inputClassName}
                  >
                    <option value="">Selecione o tipo de serviço</option>
                    {TIPOS_SERVICO.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Localização não é editável aqui — quem define é a
                      criação do contrato (ContractNew.jsx). */}
                  <FormField label="Cidade" value={localizacao.cidade} disabled />
                  <FormField label="Estado" value={localizacao.estado} disabled />
                </div>
              </div>
            </section>

            <Section title="Financeiro">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Data de Início"
                  type="datetime-local"
                  value={financeiro.dataInicio}
                  disabled
                />
                <FormField
                  label="Data de Encerramento"
                  type="datetime-local"
                  value={financeiro.dataEncerramento}
                  disabled
                />
              </div>

              {tipoContrato === "DIARIA" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Valor por Dia"
                    type="number"
                    value={financeiro.valorPorDia}
                    disabled={!isEditing}
                    onChange={
                      isEditing
                        ? (value) => setFinanceiro((atual) => ({ ...atual, valorPorDia: value }))
                        : undefined
                    }
                  />
                  <FormField label="Valor Total do Serviço" value={formatBRL(valorTotalCalculado)} disabled />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Valor Total do Serviço"
                    type="number"
                    value={financeiro.valorTotal}
                    disabled={!isEditing}
                    onChange={
                      isEditing
                        ? (value) => setFinanceiro((atual) => ({ ...atual, valorTotal: value }))
                        : undefined
                    }
                  />
                  <FormField label="Valor por Dia" value={formatBRL(valorPorDiaCalculado)} disabled />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Percentual de Taxa de Serviço"
                  value={percentualTaxa ? `${percentualTaxa}%` : ""}
                  placeholder="25/20/15%"
                  disabled
                />
                <FormField label="Valor da Taxa de Serviço" value={formatBRL(valorTaxa)} disabled />
              </div>
              <p className="text-xs text-(--color-muted)">
                Percentual e valor da taxa são congelados na publicação do contrato (PRD §2.2) —
                não recalculamos no front, só exibimos o que o backend gravou.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className={labelClassName}>Nota Fiscal Emitida pelo Prestador</span>
                  {isEditing ? (
                    <label
                      className={`${inputClassName} flex min-h-13 cursor-pointer items-center gap-2`}
                    >
                      <Paperclip className="h-4 w-4 shrink-0" />
                      {nf.arquivoNome || "Anexe o arquivo da NF"}
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        onChange={handleNfChange}
                      />
                    </label>
                  ) : (
                    <div className={`${inputClassName} flex min-h-13 items-center`}>
                      {nf.arquivoUrl ? (
                        <a
                          href={nf.arquivoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-(--color-accent)"
                        >
                          {nf.arquivoNome || "Baixar Nota Fiscal"}
                        </a>
                      ) : (
                        <span className="text-(--color-muted)">
                          Nota fiscal ainda não emitida pelo prestador.
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <FormField
                  label="Aprovação da Nota Fiscal"
                  value={formatDataHoraBR(nf.dataAprovacao)}
                  placeholder="XX/XX/XXXX 00:00"
                  disabled
                />
              </div>
            </Section>

            <Section title="Operação">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DateListField
                  label="Dias de trabalho"
                  dates={diasTrabalho}
                  onAdd={() => {}}
                  onRemove={() => {}}
                  disabled
                  emptyMessage="Calculado pelo backend (Data de Início → Data de Encerramento, menos os Dias de folga)."
                />
                <DateListField
                  label="Dias de folga"
                  dates={diasFolga}
                  onAdd={() => {}}
                  onRemove={() => {}}
                  disabled
                />
                {tipoContrato === "DIARIA" && (
                  <DateListField
                    label="Dias de falta"
                    dates={diasFalta}
                    onAdd={() => {}}
                    onRemove={() => {}}
                    disabled
                  />
                )}
              </div>
              {/* Quem registra falta é o Cliente (PRD regra 10/§4.8) — o
                  ADMIN só visualiza aqui. Dias de trabalho/folga também são
                  só leitura: para estender o contrato usa-se "Adicionar
                  Dias", que muda a Data de Encerramento (ver botão abaixo). */}

              <div className="grid gap-6 sm:grid-cols-3">
                <SimNaoField label="Pernoite em casa?" value={operacao.pernoiteCasa} onChange={() => {}} disabled />
                <SimNaoField
                  label="Pernoite em alojamento?"
                  value={operacao.pernoiteAlojamento}
                  onChange={() => {}}
                  disabled
                />
                <SimNaoField
                  label="Transporte fornecido pela empresa?"
                  value={operacao.transporteFornecido}
                  onChange={() => {}}
                  disabled
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <SimNaoField
                  label="Ferramentas fornecidas pela empresa?"
                  value={operacao.ferramentasFornecidas}
                  onChange={() => {}}
                  disabled
                />
                <SimNaoField
                  label="EPI's fornecidos pela empresa?"
                  value={operacao.episFornecidos}
                  onChange={() => {}}
                  disabled
                />
                <SimNaoField
                  label="Área de alimentação disponível?"
                  value={operacao.areaAlimentacao}
                  onChange={() => {}}
                  disabled
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <TagMultiSelect
                  label="Cursos exigidos"
                  values={cursosExigidos}
                  onChange={() => {}}
                  sugestoes={CURSOS}
                  disabled
                />
                <TagMultiSelect
                  label="Habilidades desejadas"
                  values={habilidadesDesejadas}
                  onChange={() => {}}
                  sugestoes={HABILIDADES}
                  disabled
                />
              </div>
            </Section>

            <Section title="Candidaturas">
              {candidaturas.length === 0 ? (
                <p className="text-sm text-(--color-muted)">Nenhuma candidatura ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-160 text-left text-sm">
                    <thead>
                      <tr className="border-b border-(--color-border-subtle) text-xs uppercase text-(--color-muted-light)">
                        <th className="py-3 pr-4 font-bold">Candidatos ao serviço</th>
                        <th className="py-3 pr-4 font-bold">Nível no App</th>
                        <th className="py-3 pr-4 font-bold">Horário de candidatura</th>
                        <th className="py-3 pr-4 font-bold" />
                        <th className="py-3 font-bold">Selecionado?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidaturas.map((candidatura) => (
                        <tr
                          key={candidatura.id}
                          className="outline -outline-offset-1 outline-(--color-border-subtle) font-medium text-(--color-heading) even:bg-(--bg-subtle)"
                        >
                          <td className="py-3 pr-4">{candidatura.nomePrestador}</td>
                          <td className="py-3 pr-4">{candidatura.nivel || "—"}</td>
                          <td className="py-3 pr-4">{formatDataHoraBR(candidatura.horario)}</td>
                          <td className="py-3 pr-4">
                            <Link
                              to={`/provider/profile/${candidatura.prestadorUuid}`}
                              className="font-semibold text-(--color-accent)"
                            >
                              Ver Perfil
                            </Link>
                          </td>
                          <td className="py-3">
                            {candidatura.selecionado ? (
                              <span className="font-semibold text-(--color-success)">
                                Selecionado
                              </span>
                            ) : selecionada ? (
                              <span className="text-(--color-muted)">—</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSelecionarPrestador(candidatura.id)}
                                className={secondaryButtonClassName}
                              >
                                Selecionar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Selecionado"
                  value={selecionada?.nomePrestador ?? ""}
                  placeholder="Nenhum prestador selecionado ainda"
                  disabled
                />
                <FormField
                  label="Data de Seleção"
                  value={selecionada ? formatDataHoraBR(selecionada.dataSelecao) : ""}
                  placeholder="XX/XX/XXXX 00:00"
                  disabled
                />
              </div>
            </Section>

            <Section title="Descrição do Serviço">
              <label className="flex flex-col gap-2">
                <span className={labelClassName}>Descrição completa do serviço</span>
                <textarea
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="O que o prestador deve fornecer, tarefas e responsabilidades, proibições, regras de aceite e pagamento..."
                  disabled={!isEditing}
                  rows={8}
                  className={`${inputClassName} resize-none`}
                />
              </label>
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
            <button
              type={isEditing ? "submit" : "button"}
              onClick={isEditing ? undefined : () => setIsEditing(true)}
              className={primaryButtonClassName}
            >
              {isEditing ? "Salvar Contrato" : "Editar Contrato"}
            </button>
            <button
              type="button"
              onClick={handleAbrirModalDias}
              disabled={STATUS_CONTRATO_FINALIZADOS.includes(status)}
              className={primaryButtonClassName}
            >
              Adicionar Dias
            </button>
            <button
              type="button"
              onClick={handlePagamentoFinal}
              disabled={!nf.arquivoUrl}
              className={primaryButtonClassName}
            >
              Pagamento Final
            </button>
            <button type="button" onClick={handleFinalizarContrato} className={primaryButtonClassName}>
              Finalizar Contrato
            </button>
          </div>
        </form>

        <Modal
          open={modalDiasAberto}
          onClose={() => setModalDiasAberto(false)}
          title="Adicionar dias ao contrato"
        >
          <p className="mb-4 text-sm text-(--color-muted)">
            Informe a nova data de encerramento para estender o período de execução do contrato.
            Os dias já registrados não mudam.
          </p>
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>Nova data de encerramento</span>
            <input
              type="datetime-local"
              value={novaDataEncerramento}
              onChange={(event) => setNovaDataEncerramento(event.target.value)}
              className={inputClassName}
            />
          </label>
          {tipoContrato === "EMPREITADA" && (
            <label className="mt-4 flex flex-col gap-2">
              <span className={labelClassName}>Valor adicional do período</span>
              <input
                type="number"
                value={valorAdicionalDias}
                onChange={(event) => setValorAdicionalDias(event.target.value)}
                placeholder="R$ 0,00"
                className={inputClassName}
              />
              <p className="text-xs text-(--color-muted)">
                Empreitada tem valor fechado — este valor se soma ao Valor Total do Serviço pelo
                backend, ao confirmar.
              </p>
            </label>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalDiasAberto(false)}
              className={secondaryButtonClassName}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarNovaDataEncerramento}
              className={primaryButtonClassName}
            >
              Confirmar
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
