import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/services/api";
import { CURSOS, HABILIDADES } from "@/data/catalogos";
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
  formatBRL,
} from "@/components/ContractForm/contractFormUtils";

// Visão do Prestador de /contracts/{uuid} — somente leitura e sem os dados
// exclusivos do Cliente (percentual/valor da taxa, Nota Fiscal, Candidaturas;
// regra 9/§4.4 e matriz §3.6). A visão completa (Cliente/ADMIN, com edição e
// as ações de contrato) é ContractDetailClient.jsx; quem decide qual delas
// renderizar é ContractDetail.jsx.
export default function ContractDetailProvider() {
  const { uuid } = useParams();
  const navigate = useNavigate();

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
  const [descricao, setDescricao] = useState("");

  // "Dias de trabalho" é calculado (intervalo Data de Início → Data de
  // Encerramento, menos os Dias de folga) — nunca é uma lista editável, nem
  // aqui nem nas outras visões. Mesma simplificação do ContractDetailClient.jsx:
  // desconta diasFalta na hora, embora a regra real (§4.8) só desconte após
  // aprovação do Prestador.
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

  // Busca o contrato ao montar a página — mesmo endpoint do ContractDetailClient.jsx,
  // mas só lemos os campos que o Prestador pode ver. O ideal é o backend nem
  // mandar percentualTaxa/valorTaxa/notaFiscal/candidaturas pra esse papel;
  // aqui no front só não os usamos.
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
        setDescricao(contrato.descricao ?? "");
      })
      .catch(() => {
        // Endpoint ainda não existe no backend — mantém os campos vazios.
      });
    return () => {
      cancelado = true;
    };
  }, [uuid]);

  function handleCandidatar() {
    // Candidatura do Prestador ao contrato (PRD §4.6, matriz §3.6).
    // TODO: integrar com o endpoint de candidatura quando existir.
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

        <div className="flex flex-col gap-8">
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
                <FormField label="Data de Início" type="datetime-local" value={financeiro.dataInicio} disabled />
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
              {/* Sem Percentual/Valor da Taxa e sem Nota Fiscal aqui — são
                  exclusivos do painel financeiro do Cliente (regra 9/§4.4). */}
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
                <DateListField label="Dias de folga" dates={diasFolga} onAdd={() => {}} onRemove={() => {}} disabled />
                {tipoContrato === "DIARIA" && (
                  <DateListField label="Dias de falta" dates={diasFalta} onAdd={() => {}} onRemove={() => {}} disabled />
                )}
              </div>

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

            {/* Sem seção de Candidaturas — o Prestador não vê quem mais se
                candidatou (matriz §3.6). */}

            <Section title="Descrição do Serviço">
              <label className="flex flex-col gap-2">
                <span className={labelClassName}>Descrição completa do serviço</span>
                <textarea value={descricao} disabled rows={8} className={`${inputClassName} resize-none`} />
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
            <button type="button" onClick={handleCandidatar} className={primaryButtonClassName}>
              Me Candidatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
