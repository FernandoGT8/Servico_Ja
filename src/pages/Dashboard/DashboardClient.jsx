import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { apiFetch } from "@/services/api";
import { SectionTitle, StatCard, ContractOverviewCard } from "./DashboardFields";
import { formatMoedaBR, primaryActionClassName } from "./dashboardFieldsUtils";

const CONTRATOS_VAZIO = { total: "", atualizadoEm: "", itens: [] };

// Visão de CLIENTE de /dashboard — mesma landing pós-login que ADMIN/ANALISTA
// (DashboardAdmin.jsx), mas o Financeiro é o do próprio Cliente (créditos
// restantes/reservados/usados), não o agregado da plataforma — painel
// financeiro é exclusivo do Cliente (PRD regra 9), cada papel só vê o seu.
// Sem "Visão Geral Usuários": esse bloco é operacional interno, só de
// ADMIN/ANALISTA.
export default function DashboardClient() {
  const { user } = useAuth();

  // Todo o estado abaixo nasce vazio — ainda não existe endpoint de
  // dashboard no backend (ver BACKEND_ANALISE.md §9).
  const [financeiro, setFinanceiro] = useState({
    creditosRestantes: "",
    creditosReservados: "",
    creditosUsados: "",
  });
  const [contratos, setContratos] = useState({
    criados: CONTRATOS_VAZIO,
    abertos: CONTRATOS_VAZIO,
    finalizados: CONTRATOS_VAZIO,
  });

  useEffect(() => {
    let cancelado = false;
    apiFetch("/dashboard/cliente")
      .then((dados) => {
        if (cancelado || !dados) return;
        setFinanceiro({
          creditosRestantes: dados.financeiro?.creditosRestantes ?? "",
          creditosReservados: dados.financeiro?.creditosReservados ?? "",
          creditosUsados: dados.financeiro?.creditosUsados ?? "",
        });
        setContratos({
          criados: dados.contratos?.criados ?? CONTRATOS_VAZIO,
          abertos: dados.contratos?.abertos ?? CONTRATOS_VAZIO,
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
              label="Créditos Restantes"
              subtitle="Saldo Atual"
              value={formatMoedaBR(financeiro.creditosRestantes)}
            />
            <StatCard
              label="Créditos Reservados"
              subtitle="Reserva Atual"
              value={formatMoedaBR(financeiro.creditosReservados)}
            />
            <StatCard
              label="Créditos Usados"
              subtitle="Saldo utilizado até hoje"
              value={formatMoedaBR(financeiro.creditosUsados)}
            />
          </div>
        </section>

        <div className="h-px w-full bg-(--color-border-subtle)" />

        <section className="flex w-full flex-col items-center gap-6">
          <SectionTitle>Visão Geral Contratos</SectionTitle>
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
            <ContractOverviewCard title="Contratos Criados" {...contratos.criados} />
            <ContractOverviewCard title="Contratos Abertos" {...contratos.abertos} />
            <ContractOverviewCard title="Contratos Finalizados" {...contratos.finalizados} />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-4 py-3 sm:gap-8">
          <Link to="/client/contracts/new" className={primaryActionClassName}>
            Novo Contrato
          </Link>
          <Link
            to={user?.uuid ? `/client/profile/${user.uuid}/billing` : "#"}
            className={primaryActionClassName}
          >
            Adicionar Créditos
          </Link>
        </div>
      </div>
    </div>
  );
}
