import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCidadesPorEstado } from "@/services/ibgeService";
import { TIPOS_SERVICO, CURSOS } from "@/data/catalogos";

// Mesma convenção de ClientProfile.jsx/ClientBilling.jsx — ainda não existe
// um design system compartilhado, então repetimos as classes localmente.
const inputClassName =
  "w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-(--color-heading) outline outline-2 -outline-offset-2 outline-(--color-border-subtle) transition-colors placeholder:text-(--color-muted) focus:outline-(--color-accent) disabled:cursor-not-allowed disabled:bg-(--bg-subtle) disabled:text-(--color-muted)";
const labelClassName =
  "text-xs font-bold uppercase tracking-wide text-(--color-muted-light)";
const primaryButtonClassName =
  "rounded-full bg-(--color-heading) px-6 py-4 text-sm font-bold font-dm-sans text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const secondaryButtonClassName =
  "rounded-full border border-(--color-border-subtle) px-6 py-4 text-sm font-bold font-dm-sans text-(--color-heading) transition-colors hover:bg-(--bg-subtle)";

// UFs brasileiras — dado fixo e público, não é catálogo de negócio (diferente
// de tipo_servico/curso/habilidade, que ainda não têm endpoint).
const ESTADOS_BR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

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

function SimNaoField({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-3">
      <span className={labelClassName}>{label}</span>
      <div className="flex items-center gap-4">
        <RadioOption label="Sim" checked={value === true} onChange={() => onChange(true)} />
        <RadioOption label="Não" checked={value === false} onChange={() => onChange(false)} />
      </div>
    </div>
  );
}

function ContractTypeToggle({ value, onChange }) {
  const opcoes = [
    { valor: "DIARIA", rotulo: "Diária" },
    { valor: "EMPREITADA", rotulo: "Empreitada" },
  ];
  return (
    <div className="flex items-center gap-2">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          onClick={() => onChange(opcao.valor)}
          className={`rounded-full px-3 py-1.5 text-sm font-bold font-dm-sans transition-colors ${
            value === opcao.valor
              ? "bg-(--color-heading) text-white"
              : "text-(--color-muted) hover:bg-(--bg-subtle)"
          }`}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}

function formatDateBR(isoDate) {
  const [, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}`;
}

function DateListField({ label, dates, onAdd, onRemove }) {
  const [novaData, setNovaData] = useState("");

  function handleAdd() {
    if (!novaData) return;
    onAdd(novaData);
    setNovaData("");
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <span className={labelClassName}>{label}</span>
      <div className={`${inputClassName} flex min-h-16 flex-wrap items-center gap-2`}>
        {dates.length === 0 && (
          <span className="text-(--color-muted)">Nenhuma data adicionada.</span>
        )}
        {dates.map((data, index) => (
          <span
            key={`${data}-${index}`}
            className="flex items-center gap-1 rounded-full bg-(--bg-subtle) px-3 py-1 text-xs font-semibold text-(--color-heading)"
          >
            {formatDateBR(data)}
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remover ${formatDateBR(data)}`}
              className="text-(--color-muted) hover:text-(--color-danger)"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="date"
          value={novaData}
          onChange={(event) => setNovaData(event.target.value)}
          className={`${inputClassName} flex-1`}
        />
        <button type="button" onClick={handleAdd} className={secondaryButtonClassName}>
          Adicionar
        </button>
      </div>
    </div>
  );
}

function TagMultiSelect({
  label,
  values,
  onChange,
  sugestoes = [],
  placeholder,
  permitirLivre = true,
}) {
  const [novoValor, setNovoValor] = useState("");

  function handleAdd(valor) {
    const limpo = valor.trim();
    if (!limpo || values.includes(limpo)) return;
    onChange([...values, limpo]);
    setNovoValor("");
  }

  function handleRemove(index) {
    onChange(values.filter((_, i) => i !== index));
  }

  const sugestoesDisponiveis = sugestoes.filter((s) => !values.includes(s));

  return (
    <div className="flex flex-col gap-3">
      <span className={labelClassName}>{label}</span>
      <div className="flex flex-wrap gap-2">
        {values.map((valor, index) => (
          <span
            key={`${valor}-${index}`}
            className="flex items-center gap-2 rounded-full border border-(--color-border-subtle) bg-white px-4 py-2 text-sm text-(--color-heading)"
          >
            {valor}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label={`Remover ${valor}`}
              className="text-(--color-muted) hover:text-(--color-danger)"
            >
              ×
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <p className="text-sm text-(--color-muted)">Nenhum item adicionado ainda.</p>
        )}
      </div>
      {sugestoesDisponiveis.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sugestoesDisponiveis.map((sugestao) => (
            <button
              key={sugestao}
              type="button"
              onClick={() => handleAdd(sugestao)}
              className="rounded-full border border-dashed border-(--color-muted-light) px-4 py-2 text-xs font-semibold text-(--color-muted)"
            >
              + {sugestao}
            </button>
          ))}
        </div>
      )}
      {permitirLivre && (
        <div className="flex gap-2">
          <input
            type="text"
            value={novoValor}
            onChange={(event) => setNovoValor(event.target.value)}
            placeholder={placeholder}
            className={`${inputClassName} flex-1`}
          />
          <button type="button" onClick={() => handleAdd(novoValor)} className={secondaryButtonClassName}>
            Adicionar
          </button>
        </div>
      )}
    </div>
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

function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value || 0,
  );
}

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

  const [diasTrabalho, setDiasTrabalho] = useState([]);
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

  const [descricao, setDescricao] = useState({
    fornecimento: "",
    tarefas: "",
    proibicoes: "",
    regrasAceitePagamento: "",
  });

  // Campos calculados (PRD §4.5) — nunca editáveis diretamente. `quantidadeDiarias`
  // vem das datas em "Dias de trabalho", não de um input numérico separado.
  const quantidadeDiarias = diasTrabalho.length;
  const valorTotalCalculado = useMemo(() => {
    if (tipoContrato !== "DIARIA") return null;
    return quantidadeDiarias * (Number(financeiro.valorPorDia) || 0);
  }, [tipoContrato, quantidadeDiarias, financeiro.valorPorDia]);
  const valorPorDiaCalculado = useMemo(() => {
    if (tipoContrato !== "EMPREITADA") return null;
    if (quantidadeDiarias === 0) return 0;
    return (Number(financeiro.valorTotal) || 0) / quantidadeDiarias;
  }, [tipoContrato, quantidadeDiarias, financeiro.valorTotal]);

  function handleAddDiaTrabalho(data) {
    setDiasTrabalho((atual) => (atual.includes(data) ? atual : [...atual, data].sort()));
  }
  function handleRemoveDiaTrabalho(index) {
    setDiasTrabalho((atual) => atual.filter((_, i) => i !== index));
  }
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
                  dates={diasTrabalho}
                  onAdd={handleAddDiaTrabalho}
                  onRemove={handleRemoveDiaTrabalho}
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
                  /client/contracts/{"{uuid}"}. */}

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
                  placeholder="Ex: Assentamento de piso..."
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
                  placeholder="Ferramental, EPIs próprios, etc."
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
