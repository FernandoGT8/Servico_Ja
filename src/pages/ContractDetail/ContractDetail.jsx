import { useAuth } from "@/contexts/useAuth";
import ContractDetailAdmin from "./ContractDetailAdmin";
import ContractDetailClient from "./ContractDetailClient";
import ContractDetailProvider from "./ContractDetailProvider";

// /contracts/{uuid} é compartilhada entre três papéis (Figma.log §13/§14) —
// este componente só decide qual visão renderizar.
export default function ContractDetail() {
  const { user } = useAuth();

  // ANALISTA não tem essa tela definida na matriz de permissões (PRD §3.6) —
  // por ora cai na visão de ADMIN, que tem acesso total (PRD §3.1), até isso
  // ser decidido.
  if (user?.tipo === "ADMIN" || user?.tipo === "ANALISTA") return <ContractDetailAdmin />;
  if (user?.tipo === "PRESTADOR") return <ContractDetailProvider />;
  return <ContractDetailClient />;
}
