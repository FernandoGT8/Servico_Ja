import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCidadesPorEstado } from "@/services/ibgeService";
import { TIPOS_SERVICO, CURSOS, HABILIDADES, ESTADOS_BR } from "@/data/catalogos";
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
  calcularDiasTrabalho,
} from "@/components/ContractForm/contractFormUtils";

export default function ContractNew() {
  const navigate = useNavigate();

  const [tipoContrato, setTipoContrato] = useState("DIARIA");
  const [tipoServico, setTipoServico] = useState("");
  const [localizacao, setLocalizacao] = useState({ cidade: "", estado: "" });
  const [cidades, setCidades] = useState([]);
  const [carregandoCidades, setCarregandoCidades] = useState(false);
  const [erroCidades, setErroCidades] = useState("");

  // Lista de cidades depende da UF escolhida — vem da API pública do IBGE
  // (PRD não tem catálogo próprio de municípios, e criar um seria reinventar
  // uma base que já existe e é mantida pelo governo).
  useEffect(() => {
    if (!localizacao.estado) return;
    let cancelado = false;
    // react-hooks/set-state-in-effect (plugin novo, focado no React Compiler)
    // reclama de setState síncrono aqui, mas é o padrão padrão de "iniciar
    // loading antes do fetch" — não dá pra mover isso para dentro do .then
    // sem perder o indicador de carregamento.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarregandoCidades(true);
    setErroCidades("");
    getCidadesPorEstado(localizacao.estado)
      .then((lista) => {
        if (!cancelado) setCidades(lista);
      })
      .catch(() => {
        if (!cancelado) setErroCidades("Não foi possível carregar as cidades. Tente novamente.");
      })
      .finally(() => {
        if (!cancelado) setCarregandoCidades(false);
      });
    return () => {
      cancelado = true;
    };
  }, [localizacao.estado]);

  function handleEstadoChange(uf) {
    // Troca de UF invalida a cidade e a lista antigas.
    setLocalizacao({ estado: uf, cidade: "" });
    setCidades([]);
    setErroCidades("");
  }

  const [financeiro, setFinanceiro] = useState({
    dataInicio: "",
    dataEncerramento: "",
    valorPorDia: "", // input do Cliente quando Diária
    valorTotal: "", // input do Cliente quando Empreitada
  });

  const [diasFolga, setDiasFolga] = useState([]);

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

  const [descricao, setDescricao] = useState("");

  // Campos calculados (PRD §4.5) — nunca editáveis diretamente. "Dias de
  // trabalho" é derivado de Data de Início → Data de Encerramento, menos
  // Dias de folga (decidido em 18/09/2026) — não é mais uma lista que o
  // Cliente povoa dia a dia.
  const diasTrabalhoCalculados = useMemo(
    () => calcularDiasTrabalho(financeiro.dataInicio, financeiro.dataEncerramento, diasFolga),
    [financeiro.dataInicio, financeiro.dataEncerramento, diasFolga],
  );
  const quantidadeDiarias = diasTrabalhoCalculados.length;
  const valorTotalCalculado = useMemo(() => {
    if (tipoContrato !== "DIARIA") return null;
    return quantidadeDiarias * (Number(financeiro.valorPorDia) || 0);
  }, [tipoContrato, quantidadeDiarias, financeiro.valorPorDia]);
  const valorPorDiaCalculado = useMemo(() => {
    if (tipoContrato !== "EMPREITADA") return null;
    if (quantidadeDiarias === 0) return 0;
    return (Number(financeiro.valorTotal) || 0) / quantidadeDiarias;
  }, [tipoContrato, quantidadeDiarias, financeiro.valorTotal]);

  function handleAddDiaFolga(data) {
    setDiasFolga((atual) => (atual.includes(data) ? atual : [...atual, data].sort()));
  }
  function handleRemoveDiaFolga(index) {
    setDiasFolga((atual) => atual.filter((_, i) => i !== index));
  }

  function handleSalvarRascunho(event) {
    event.preventDefault();
    // Grava o contrato como Rascunho, sem publicar no mural — o Cliente volta
    // depois para revisar e publicar (PRD §4.7, estado 1).
    // TODO: integrar com POST /api/contratos (status Rascunho) quando o endpoint existir.
  }

  function handleCriarContrato(event) {
    event.preventDefault();
    // Já publica: grava o contrato e move direto para "Aguardando
    // Prestadores" (PRD §4.7, estado 2), pulando o Rascunho.
    // TODO: integrar com POST /api/contratos (status Aguardando Prestadores) quando o endpoint existir.
  }

  return (
    <div className="w-full font-poppins">
      <div className="w-full flex-1">
        <header className="mb-8">
          <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
            Lançar novo contrato
          </h1>
          <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
        </header>

        <form onSubmit={handleCriarContrato} className="flex flex-col gap-8">
          <div className="flex flex-col gap-10 rounded-2xl bg-(--bg-card) p-6 md:p-10">
            <section className="flex flex-col gap-6 border-b border-(--color-border-subtle) pb-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-xl leading-7 font-semibold text-(--color-heading) sm:text-2xl sm:leading-8">
                  Tipo de contrato
                </h2>
                <ContractTypeToggle value={tipoContrato} onChange={setTipoContrato} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="ID do contrato"
                  value=""
                  placeholder="ID sequencial — autogerado"
                  disabled
                />
                <FormField label="Status" value="Rascunho" disabled />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className={labelClassName}>Tipo de serviço</span>
                  <select
                    value={tipoServico}
                    onChange={(event) => setTipoServico(event.target.value)}
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
                <div className="flex flex-col gap-2">
                  <span className={labelClassName}>Localização</span>
                  <div className="flex gap-3">
                    <select
                      value={localizacao.estado}
                      onChange={(event) => handleEstadoChange(event.target.value)}
                      className={`${inputClassName} sm:w-28`}
                    >
                      <option value="">UF</option>
                      {ESTADOS_BR.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                    <select
                      value={localizacao.cidade}
                      onChange={(event) =>
                        setLocalizacao((atual) => ({ ...atual, cidade: event.target.value }))
                      }
                      disabled={!localizacao.estado || carregandoCidades}
                      className={`${inputClassName} flex-1`}
                    >
                      <option value="">
                        {!localizacao.estado
                          ? "Selecione o estado primeiro"
                          : carregandoCidades
                            ? "Carregando cidades..."
                            : "Cidade"}
                      </option>
                      {cidades.map((cidade) => (
                        <option key={cidade} value={cidade}>
                          {cidade}
                        </option>
                      ))}
                    </select>
                  </div>
                  {erroCidades && <p className="text-xs text-(--color-danger)">{erroCidades}</p>}
                </div>
              </div>
            </section>

            <Section title="Financeiro">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Data de Início"
                  type="datetime-local"
                  value={financeiro.dataInicio}
                  onChange={(value) => setFinanceiro((atual) => ({ ...atual, dataInicio: value }))}
                />
                <FormField
                  label="Data de Encerramento"
                  type="datetime-local"
                  value={financeiro.dataEncerramento}
                  onChange={(value) =>
                    setFinanceiro((atual) => ({ ...atual, dataEncerramento: value }))
                  }
                />
              </div>

              {tipoContrato === "DIARIA" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Valor por Dia"
                    type="number"
                    value={financeiro.valorPorDia}
                    placeholder="R$ 0,00"
                    onChange={(value) =>
                      setFinanceiro((atual) => ({ ...atual, valorPorDia: value }))
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
                    placeholder="R$ 0,00"
                    onChange={(value) => setFinanceiro((atual) => ({ ...atual, valorTotal: value }))}
                  />
                  <FormField label="Valor por Dia" value={formatBRL(valorPorDiaCalculado)} disabled />
                </div>
              )}
              <p className="text-xs text-(--color-muted)">
                {tipoContrato === "DIARIA"
                  ? `Total calculado a partir de ${quantidadeDiarias} dia(s) de trabalho × valor/dia (PRD §4.5).`
                  : `Valor/dia calculado dividindo o total por ${quantidadeDiarias || "—"} dia(s) de trabalho (PRD §4.5).`}
              </p>
            </Section>

            <Section title="Operação">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DateListField
                  label="Dias de trabalho"
                  dates={diasTrabalhoCalculados}
                  onAdd={() => {}}
                  onRemove={() => {}}
                  disabled
                  emptyMessage="Calculado automaticamente (Data de Início → Data de Encerramento, menos os Dias de folga)."
                />
                <DateListField
                  label="Dias de folga"
                  dates={diasFolga}
                  onAdd={handleAddDiaFolga}
                  onRemove={handleRemoveDiaFolga}
                />
                {tipoContrato === "DIARIA" && (
                  <div className="flex flex-1 flex-col gap-3">
                    <span className={labelClassName}>Dias de falta</span>
                    <div
                      className={`${inputClassName} flex min-h-16 items-center justify-center bg-(--bg-subtle) text-center text-(--color-muted)`}
                    >
                      Registrados pelo Cliente durante a execução do contrato
                    </div>
                  </div>
                )}
              </div>
              {/* O campo acima é inerte de propósito: falta só existe de
                  verdade após a seleção do prestador, registrada pelo Cliente
                  e aprovada pelo Prestador (PRD §4.7/§4.8). Aparece aqui só
                  para casar com o desenho do Figma; o fluxo real acontece em
                  /contracts/{"{uuid}"} — ver ContractDetail.jsx. */}

              <div className="grid gap-6 sm:grid-cols-3">
                <SimNaoField
                  label="Pernoite em casa?"
                  value={operacao.pernoiteCasa}
                  onChange={(value) => setOperacao((atual) => ({ ...atual, pernoiteCasa: value }))}
                />
                <SimNaoField
                  label="Pernoite em alojamento?"
                  value={operacao.pernoiteAlojamento}
                  onChange={(value) =>
                    setOperacao((atual) => ({ ...atual, pernoiteAlojamento: value }))
                  }
                />
                <SimNaoField
                  label="Transporte fornecido pela empresa?"
                  value={operacao.transporteFornecido}
                  onChange={(value) =>
                    setOperacao((atual) => ({ ...atual, transporteFornecido: value }))
                  }
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <SimNaoField
                  label="Ferramentas fornecidas pela empresa?"
                  value={operacao.ferramentasFornecidas}
                  onChange={(value) =>
                    setOperacao((atual) => ({ ...atual, ferramentasFornecidas: value }))
                  }
                />
                <SimNaoField
                  label="EPI's fornecidos pela empresa?"
                  value={operacao.episFornecidos}
                  onChange={(value) => setOperacao((atual) => ({ ...atual, episFornecidos: value }))}
                />
                <SimNaoField
                  label="Área de alimentação disponível?"
                  value={operacao.areaAlimentacao}
                  onChange={(value) => setOperacao((atual) => ({ ...atual, areaAlimentacao: value }))}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <TagMultiSelect
                  label="Cursos exigidos"
                  values={cursosExigidos}
                  onChange={setCursosExigidos}
                  sugestoes={CURSOS}
                  permitirLivre={false}
                />
                <TagMultiSelect
                  label="Habilidades desejadas"
                  values={habilidadesDesejadas}
                  onChange={setHabilidadesDesejadas}
                  sugestoes={HABILIDADES}
                  permitirLivre={false}
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
            <button type="button" onClick={handleSalvarRascunho} className={secondaryButtonClassName}>
              Criar Rascunho
            </button>
            <button type="submit" className={primaryButtonClassName}>
              Criar Contrato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
