import { useAuth } from "@/contexts/useAuth";
import ContractsAdmin from "./ContractsAdmin";
import ContractsClient from "./ContractsClient";
import ContractsProvider from "./ContractsProvider";

// /contracts é compartilhada entre os três papéis (decisão de 17/09/2026,
// mesmo raciocínio de /contracts/{uuid} — ver PRD §4.6/§6.2): substitui
// /provider/opportunities. Este componente só decide qual visão renderizar,
// mesmo padrão de dispatcher de Dashboard.jsx/ContractDetail.jsx.
export default function Contracts() {
  const { user } = useAuth();

  // ANALISTA não tem essa tela definida na matriz de permissões (PRD §3.6) —
  // por ora cai na visão de ADMIN, que tem acesso total (PRD §3.1), mesmo
  // critério já usado em ContractDetail.jsx.
  if (user?.tipo === "ADMIN" || user?.tipo === "ANALISTA") return <ContractsAdmin />;
  if (user?.tipo === "PRESTADOR") return <ContractsProvider />;
  return <ContractsClient />;
}
