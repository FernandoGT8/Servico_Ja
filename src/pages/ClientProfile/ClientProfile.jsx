import { useAuth } from "@/contexts/useAuth";
import ClientProfileAdmin from "./ClientProfileAdmin";
import ClientProfileClient from "./ClientProfileClient";
import ClientProfileProvider from "./ClientProfileProvider";

// /client/profile/{uuid} é compartilhada entre o time interno, o próprio
// Cliente e — a partir da seleção, enquanto o contrato estiver ativo — o
// Prestador (Figma.log Sessões 7 e 8). Este componente só decide qual visão
// renderizar, mesmo padrão de ContractDetail.jsx para /contracts/{uuid}.
export default function ClientProfile() {
  const { user } = useAuth();

  if (user?.tipo === "ADMIN" || user?.tipo === "ANALISTA") {
    return <ClientProfileAdmin />;
  }
  if (user?.tipo === "PRESTADOR") {
    return <ClientProfileProvider />;
  }
  return <ClientProfileClient />;
}
