import { useAuth } from "@/contexts/useAuth";
import DashboardAdmin from "./DashboardAdmin";
import DashboardClient from "./DashboardClient";
import DashboardProvider from "./DashboardProvider";

// /dashboard é a landing pós-login de todo papel (Login.jsx redireciona
// todo mundo pra cá — getHomeRoute só desvia CLIENTE/PRESTADOR quando eles
// já têm uuid). Este componente só decide qual visão renderizar, mesmo
// padrão de dispatcher de ClientProfile.jsx/ContractDetail.jsx.
export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="w-full py-12 text-center text-(--color-muted)">Carregando...</div>
    );
  }

  if (user.tipo === "ADMIN" || user.tipo === "ANALISTA") {
    return <DashboardAdmin />;
  }

  if (user.tipo === "CLIENTE") {
    return <DashboardClient />;
  }

  return <DashboardProvider />;
}
