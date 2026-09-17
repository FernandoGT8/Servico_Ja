import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import { SectionTitle, StatCard, ContractOverviewCard } from "./DashboardFields";
import { formatMoedaBR } from "./dashboardFieldsUtils";

const CONTRATOS_VAZIO = { total: "", atualizadoEm: "", itens: [] };

// Visão de PRESTADOR de /dashboard. "Visão Geral Financeira" aqui é um
// resumo de pagamentos só leitura (ganhos do mês, recebidos, a receber) — não
// é o painel de gestão de crédito do Cliente (PRD §4.4, exclusivo dele): o
// Prestador não compra crédito, não vê taxa nem saldo da plataforma
// (distinção decidida em 18/09/2026, ver PRD §4.3/regra 9 atualizada). Sem
// CTA no rodapé — ao contrário do Cliente, o Prestador não cria contrato nem
// adiciona crédito.
//
// "Contratos Favoritos" ainda não tem botão de favoritar no mural nem
// endpoint (PRD §4.6/§8, backlog) — o card fica com contagem vazia até lá.
export default function DashboardProvider() {
  const [financeiro, setFinanceiro] = useState({
    ganhosTotais: "",
    valoresRecebidos: "",
    valoresAReceber: "",
  });
  const [contratos, setContratos] = useState({
    atual: CONTRATOS_VAZIO,
    favoritos: CONTRATOS_VAZIO,
    finalizados: CONTRATOS_VAZIO,
  });

  useEffect(() => {
    let cancelado = false;
    apiFetch("/dashboard/prestador")
      .then((dados) => {
        if (cancelado || !dados) return;
        setFinanceiro({
          ganhosTotais: dados.financeiro?.ganhosTotais ?? "",
          valoresRecebidos: dados.financeiro?.valoresRecebidos ?? "",
          valoresAReceber: dados.financeiro?.valoresAReceber ?? "",
        });
        setContratos({
          atual: dados.contratos?.atual ?? CONTRATOS_VAZIO,
          favoritos: dados.contratos?.favoritos ?? CONTRATOS_VAZIO,
          finalizados: dados.contratos?.finalizados ?? CONTRATOS_VAZIO,
        });
      })
      .catch(() => {
        // Endpoint ainda não existe no backend — mantém os cards vazios.
      });
    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <div className="w-full font-poppins">
      <header className="mb-8">
        <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
          Dashboard Mensal
        </h1>
        <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
      </header>

      <div className="flex flex-col items-center gap-7">
        <section className="flex w-full flex-col items-center gap-6">
          <SectionTitle>Visão Geral Financeira</SectionTitle>
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-3">
            <StatCard
              label="Ganhos Totais do Mês"
              subtitle="Saldo Atual"
              value={formatMoedaBR(financeiro.ganhosTotais)}
            />
            <StatCard
              label="Valores Recebidos"
              subtitle="Notas Fiscais Pagas"
              value={formatMoedaBR(financeiro.valoresRecebidos)}
            />
            <StatCard
              label="Valores a Receber"
              subtitle="Aguardando Pagamento Final"
              value={formatMoedaBR(financeiro.valoresAReceber)}
            />
          </div>
        </section>

        <div className="h-px w-full bg-(--color-border-subtle)" />

        <section className="flex w-full flex-col items-center gap-6">
          <SectionTitle>Visão Geral Contratos</SectionTitle>
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
            <ContractOverviewCard title="Contrato Atual" {...contratos.atual} />
            <ContractOverviewCard title="Contratos Favoritos" {...contratos.favoritos} />
            <ContractOverviewCard title="Contratos Finalizados" {...contratos.finalizados} />
          </div>
        </section>
      </div>
    </div>
  );
}
