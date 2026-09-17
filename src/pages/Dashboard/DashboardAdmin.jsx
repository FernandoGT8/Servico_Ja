import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { apiFetch } from "@/services/api";
import { SectionTitle, StatCard, ContractOverviewCard } from "./DashboardFields";
import { formatMoedaBR, formatContagem } from "./dashboardFieldsUtils";

const CONTRATOS_VAZIO = { total: "", atualizadoEm: "", itens: [] };

// Visão de ADMIN/ANALISTA de /dashboard, landing pós-login desses dois
// papéis (Sidebar aponta "Dashboard" só pra quem é isInternal). Mesmo padrão
// de dispatcher das outras telas: Dashboard.jsx só decide qual visão
// renderizar.
//
// "Visão Geral Financeira" é dado agregado de toda a plataforma — a matriz
// de permissões do PRD (§3.6) marca "Auditoria financeira da plataforma" só
// para ADMIN, o ANALISTA fica de fora (decidido em conversa, 17/09/2026,
// mesmo racional da nota ³ que já tira "Editar Perfil" do ANALISTA em
// ClientProfileAdmin.jsx). Por isso a seção só aparece com isAdmin.
export default function DashboardAdmin() {
  const { user } = useAuth();
  const isAdmin = user?.tipo === "ADMIN";

  // Todo o estado abaixo nasce vazio — ainda não existe endpoint de
  // dashboard no backend (ver BACKEND_ANALISE.md).
  const [financeiro, setFinanceiro] = useState({
    pagamentosRestantes: "",
    creditosReservados: "",
    saldoMensal: "",
  });
  const [contratos, setContratos] = useState({
    criados: CONTRATOS_VAZIO,
    abertos: CONTRATOS_VAZIO,
    finalizados: CONTRATOS_VAZIO,
  });
  const [usuarios, setUsuarios] = useState({
    clientesAtivos: "",
    prestadoresAtivos: "",
    clientesInativos: "",
  });

  useEffect(() => {
    let cancelado = false;
    apiFetch("/dashboard/admin")
      .then((dados) => {
        if (cancelado || !dados) return;
        setFinanceiro({
          pagamentosRestantes: dados.financeiro?.pagamentosRestantes ?? "",
          creditosReservados: dados.financeiro?.creditosReservados ?? "",
          saldoMensal: dados.financeiro?.saldoMensal ?? "",
        });
        setContratos({
          criados: dados.contratos?.criados ?? CONTRATOS_VAZIO,
          abertos: dados.contratos?.abertos ?? CONTRATOS_VAZIO,
          finalizados: dados.contratos?.finalizados ?? CONTRATOS_VAZIO,
        });
        setUsuarios({
          clientesAtivos: dados.usuarios?.clientesAtivos ?? "",
          prestadoresAtivos: dados.usuarios?.prestadoresAtivos ?? "",
          clientesInativos: dados.usuarios?.clientesInativos ?? "",
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
        {isAdmin && (
          <>
            <section className="flex w-full flex-col items-center gap-6">
              <SectionTitle>Visão Geral Financeira</SectionTitle>
              <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-3">
                <StatCard
                  label="Pagamentos Restantes"
                  subtitle="A serem realizados aos prestadores"
                  value={formatMoedaBR(financeiro.pagamentosRestantes)}
                />
                <StatCard
                  label="Créditos Reservados"
                  subtitle="Reserva Atual"
                  value={formatMoedaBR(financeiro.creditosReservados)}
                />
                <StatCard
                  label="Saldo Mensal"
                  subtitle="Taxa dos contratos até hoje"
                  value={formatMoedaBR(financeiro.saldoMensal)}
                />
              </div>
            </section>
            <div className="h-px w-full bg-(--color-border-subtle)" />
          </>
        )}

        <section className="flex w-full flex-col items-center gap-6">
          <SectionTitle>Visão Geral Contratos</SectionTitle>
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3">
            <ContractOverviewCard title="Contratos Criados" {...contratos.criados} />
            <ContractOverviewCard title="Contratos Abertos" {...contratos.abertos} />
            <ContractOverviewCard title="Contratos Finalizados" {...contratos.finalizados} />
          </div>
        </section>

        <div className="h-px w-full bg-(--color-border-subtle)" />

        <section className="flex w-full flex-col items-center gap-6">
          <SectionTitle>Visão Geral Usuários</SectionTitle>
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-3">
            <StatCard
              label="Clientes Ativos"
              subtitle="Clientes com contratos lançados"
              value={formatContagem(usuarios.clientesAtivos)}
            />
            <StatCard
              label="Prestadores Ativos"
              subtitle="Prestadores que atuaram"
              value={formatContagem(usuarios.prestadoresAtivos)}
            />
            <StatCard
              label="Clientes Inativos"
              subtitle="Clientes com crédito que estão sem contratos"
              value={formatContagem(usuarios.clientesInativos)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
