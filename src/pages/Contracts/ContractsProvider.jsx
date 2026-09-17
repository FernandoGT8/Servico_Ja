import { useCallback, useEffect, useState } from "react";
import { TIPOS_SERVICO } from "@/data/catalogos";
import { apiFetch } from "@/services/api";
import { ContractTypeToggle } from "@/components/ContractForm/ContractFormFields";
import {
  CityFilterInput,
  ContractCard,
  ContractsActionBar,
  EmptyState,
  FilterSelect,
} from "./ContractsFields";

// Visão de PRESTADOR de /contracts — era o "Mural de Oportunidades"
// (/provider/opportunities). Só mostra contratos em "Aguardando
// Prestadores" (status fixo, não é filtro do usuário); filtráveis por Tipo
// de contrato, Tipo de serviço (PRD §4.6 original) e Cidade (adicionado em
// 17/09/2026, ver Figma.log). Candidatura acontece em /contracts/{uuid}, não
// aqui. Endpoint ainda não existe — ver BACKEND_ANALISE.md §6, item 13.
const STATUS_MURAL = "Aguardando Prestadores";

export default function ContractsProvider() {
  const [tipoContrato, setTipoContrato] = useState("");
  const [tipoServico, setTipoServico] = useState("");
  const [cidade, setCidade] = useState("");
  const [contratos, setContratos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const buscarContratos = useCallback(
    ({ paginaAlvo, substituir }) => {
      setCarregando(true);
      const params = new URLSearchParams({ status: STATUS_MURAL });
      if (tipoContrato) params.set("tipoContrato", tipoContrato);
      if (tipoServico) params.set("tipoServico", tipoServico);
      if (cidade) params.set("cidade", cidade);
      params.set("pagina", String(paginaAlvo));

      apiFetch(`/contratos?${params.toString()}`)
        .then((dados) => {
          if (!dados) return;
          setContratos((atual) =>
            substituir ? (dados.itens ?? []) : [...atual, ...(dados.itens ?? [])],
          );
          setTemMais(Boolean(dados.temMais));
          setPagina(paginaAlvo);
        })
        .catch(() => {
          // Endpoint ainda não existe no backend — mantém a lista vazia.
          if (substituir) setContratos([]);
          setTemMais(false);
        })
        .finally(() => setCarregando(false));
    },
    [tipoContrato, tipoServico, cidade],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mesmo padrão de ContractNew.jsx: precisa iniciar o loading antes do fetch.
    buscarContratos({ paginaAlvo: 1, substituir: true });
  }, [buscarContratos]);

  return (
    <div className="w-full font-poppins">
      <header className="mb-8">
        <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
          Contratos Disponíveis
        </h1>
        <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
      </header>

      <div className="flex flex-col gap-8 rounded-2xl bg-(--bg-card) p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ContractTypeToggle value={tipoContrato} onChange={setTipoContrato} allowTodos />
          <div className="flex flex-wrap items-center gap-4">
            <FilterSelect
              label="Tipo de serviço"
              value={tipoServico}
              onChange={setTipoServico}
              options={TIPOS_SERVICO}
            />
            <CityFilterInput value={cidade} onChange={setCidade} />
          </div>
        </div>

        <div className="h-px w-full bg-(--color-border-subtle)" />

        <div className="flex flex-col gap-4">
          {contratos.length === 0 ? (
            <EmptyState mensagem="Nenhum contrato disponível com esses filtros." />
          ) : (
            contratos.map((contrato) => <ContractCard key={contrato.uuid} contrato={contrato} />)
          )}
        </div>
      </div>

      <ContractsActionBar
        onLoadMore={() => buscarContratos({ paginaAlvo: pagina + 1, substituir: false })}
        onRefresh={() => buscarContratos({ paginaAlvo: 1, substituir: true })}
        carregando={carregando}
        temMais={temMais}
      />
    </div>
  );
}
