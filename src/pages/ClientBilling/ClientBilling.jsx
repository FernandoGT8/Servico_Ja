import { useAuth } from "@/contexts/useAuth";
import ClientBillingAdmin from "./ClientBillingAdmin";
import ClientBillingClient from "./ClientBillingClient";

// /client/profile/{uuid}/billing tem duas visões (Figma.log Sessão 9),
// mesmo padrão de ClientProfile.jsx para /client/profile/{uuid}: este
// componente só decide qual renderizar. ANALISTA cai na visão de ADMIN (que
// tem acesso total, PRD §3.1) mas sem os botões de ação — a matriz §3.6 não
// dá a ele nenhuma ação de crédito, só visualização.
export default function ClientBilling() {
  const { user } = useAuth();

  if (user?.tipo === "ADMIN" || user?.tipo === "ANALISTA") {
    return <ClientBillingAdmin />;
  }
  return <ClientBillingClient />;
}
