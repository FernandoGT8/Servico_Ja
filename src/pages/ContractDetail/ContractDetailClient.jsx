import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/services/api";
import { CURSOS, STATUS_CONTRATO_FINALIZADOS } from "@/data/catalogos";
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

// Visão do Cliente de /contracts/{uuid} — mais enxuta que a do ADMIN/ANALISTA
// (ContractDetailAdmin.jsx): sem Percentual/Valor de Taxa e sem Nota Fiscal
// (painel financeiro é exclusivo do Cliente, mas esses dois são geridos pelo
// time interno — regra 9/§4.4). "Editar Contrato" só desbloqueia Descrição,
// Cursos exigidos, Habilidades desejadas e Dias de falta — decidido em
// conversa (17/09/2026); o resto (tipo de contrato, tipo de serviço,
// localização, datas, valores, condições de operação) é sempre somente
// leitura aqui. "Adicionar Dias" abre um modal para definir uma nova Data de
// Encerramento e estender o contrato — não edita os dias de trabalho/folga
// diretamente. Mantém Candidaturas (o Cliente é quem seleciona o prestador,
// PRD §3.6) mesmo não estando no mockup mais recente — confirmado em
// conversa para não perder essa capacidade em nenhuma tela. A visão do
// Prestador é ContractDetailProvider.jsx.
export default function ContractDetailClient() {
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

  const [descricao, setDescricao] = useState({
    fornecimento: "",
    tarefas: "",
    proibicoes: "",
    regrasAceitePagamento: "",
  });

  // Campos calculados (PRD §4.5) — sempre somente leitura. Simplificação:
  // descontamos diasFalta do total na hora, mas na regra real (§4.8) a falta
  // só desconta depois que o Prestador aprova a remoção — sem backend, não
  // temos como saber se já foi aprovada.
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

  function handleAddDiaFalta(data) {
    // Registro do Cliente (PRD regra 10/§4.8) — ainda precisa da aprovação do
    // Prestador para de fato descontar do valor. Sem backend, só guardamos a
    // data; não há como representar aqui o estado "aguardando aprovação".
    setDiasFalta((atual) => (atual.includes(data) ? atual : [...atual, data].sort()));
  }
  function handleRemoveDiaFalta(index) {
    setDiasFalta((atual) => atual.filter((_, i) => i !== index));
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
        setDiasTrabalho(contrato.diasTrabalho ?? []);
        setDiasFolga(contrato.diasFolga ?? []);
        setDiasFalta(contrato.diasFalta ?? []);
        if (contrato.operacao) setOperacao(contrato.operacao);
        setCursosExigidos(contrato.cursosExigidos ?? []);
        setHabilidadesDesejadas(contrato.habilidadesDesejadas ?? []);
        setCandidaturas(contrato.candidaturas ?? []);
        if (contrato.descricao) setDescricao(contrato.descricao);
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
    // não mutamos a lista localmente sem confirmação do backend.
    // TODO: integrar com o endpoint de seleção quando existir.
  }

  function handleSalvar(event) {
    event.preventDefault();
    // TODO: integrar com PUT/PATCH /api/contratos/{uuid} — só envia Descrição,
    // Cursos exigidos e Habilidades desejadas, que é tudo que este papel edita.
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
                <ContractTypeToggle value={tipoContrato} onChange={() => {}} disabled />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="ID do contrato" value={uuid ?? ""} disabled />
                <FormField label="Status" value={status} placeholder="Carregando..." disabled />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Tipo de serviço" value={tipoServico} disabled />
                <div className="grid grid-cols-2 gap-3">
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
                  <FormField label="Valor por Dia" value={formatBRL(financeiro.valorPorDia)} disabled />
                  <FormField label="Valor Total do Serviço" value={formatBRL(valorTotalCalculado)} disabled />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Valor Total do Serviço" value={formatBRL(financeiro.valorTotal)} disabled />
                  <FormField label="Valor por Dia" value={formatBRL(valorPorDiaCalculado)} disabled />
                </div>
              )}
              {/* Sem Percentual/Valor da Taxa e sem Nota Fiscal aqui — ficam
                  só na visão do ADMIN/ANALISTA (ContractDetailAdmin.jsx). */}
            </Section>

            <Section title="Operação">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DateListField
                  label="Dias de trabalho"
                  dates={diasTrabalho}
                  onAdd={() => {}}
                  onRemove={() => {}}
                  disabled
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
                    onAdd={handleAddDiaFalta}
                    onRemove={handleRemoveDiaFalta}
                    disabled={!isEditing}
                  />
                )}
              </div>
              {/* "Dias de falta" usa o mesmo "Editar Contrato" de
                  Descrição/Cursos/Habilidades — é o único campo de operação
                  que o Cliente registra de verdade (PRD regra 10/§4.8).
                  "Dias de trabalho/folga" usam o botão "Adicionar Dias". */}

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
                  onChange={setCursosExigidos}
                  sugestoes={CURSOS}
                  permitirLivre={false}
                  disabled={!isEditing}
                />
                <TagMultiSelect
                  label="Habilidades desejadas"
                  values={habilidadesDesejadas}
                  onChange={setHabilidadesDesejadas}
                  placeholder="Ex: Assentamento de piso..."
                  disabled={!isEditing}
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
                <span className={labelClassName}>O que o prestador deve fornecer</span>
                <textarea
                  value={descricao.fornecimento}
                  onChange={(event) =>
                    setDescricao((atual) => ({ ...atual, fornecimento: event.target.value }))
                  }
                  disabled={!isEditing}
                  rows={3}
                  className={`${inputClassName} resize-none`}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelClassName}>Tarefas e responsabilidades</span>
                <textarea
                  value={descricao.tarefas}
                  onChange={(event) =>
                    setDescricao((atual) => ({ ...atual, tarefas: event.target.value }))
                  }
                  disabled={!isEditing}
                  rows={3}
                  className={`${inputClassName} resize-none`}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelClassName}>Proibições</span>
                <textarea
                  value={descricao.proibicoes}
                  onChange={(event) =>
                    setDescricao((atual) => ({ ...atual, proibicoes: event.target.value }))
                  }
                  disabled={!isEditing}
                  rows={3}
                  className={`${inputClassName} resize-none`}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className={labelClassName}>Regras de aceite e pagamento</span>
                <textarea
                  value={descricao.regrasAceitePagamento}
                  onChange={(event) =>
                    setDescricao((atual) => ({
                      ...atual,
                      regrasAceitePagamento: event.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  rows={3}
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
