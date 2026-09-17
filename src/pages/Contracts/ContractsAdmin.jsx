import { useCallback, useEffect, useState } from "react";
import { STATUS_CONTRATO } from "@/data/catalogos";
import { apiFetch } from "@/services/api";
import { ContractTypeToggle } from "@/components/ContractForm/ContractFormFields";
import { ContractCard, ContractsActionBar, EmptyState, FilterSelect } from "./ContractsFields";

// Visão de ADMIN/ANALISTA de /contracts — todos os contratos da plataforma
// (sem escopo por cliente), filtráveis por Status e Tipo de contrato
// (PRD §4.6). Endpoint ainda não existe — ver BACKEND_ANALISE.md §6, item 13.
export default function ContractsAdmin() {
  const [status, setStatus] = useState("");
  const [tipoContrato, setTipoContrato] = useState("");
  const [contratos, setContratos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const buscarContratos = useCallback(
    ({ paginaAlvo, substituir }) => {
      setCarregando(true);
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (tipoContrato) params.set("tipoContrato", tipoContrato);
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
    [status, tipoContrato],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mesmo padrão de ContractNew.jsx: precisa iniciar o loading antes do fetch.
    buscarContratos({ paginaAlvo: 1, substituir: true });
  }, [buscarContratos]);

  return (
    <div className="w-full font-poppins">
      <header className="mb-8">
        <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
          Contratos
        </h1>
        <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
      </header>

      <div className="flex flex-col gap-8 rounded-2xl bg-(--bg-card) p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ContractTypeToggle value={tipoContrato} onChange={setTipoContrato} allowTodos />
          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_CONTRATO}
          />
        </div>

        <div className="h-px w-full bg-(--color-border-subtle)" />

        <div className="flex flex-col gap-4">
          {contratos.length === 0 ? (
            <EmptyState mensagem="Nenhum contrato encontrado." />
          ) : (
            contratos.map((contrato) => (
              <ContractCard key={contrato.uuid} contrato={contrato} mostrarStatus />
            ))
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
