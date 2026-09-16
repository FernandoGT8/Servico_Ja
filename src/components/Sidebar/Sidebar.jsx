import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { getHomeRoute, getProfileRoute } from "@/utils/roleRoutes";

// Só o Prestador tem hoje uma tela que funciona como "meus contratos"
// (o mural de oportunidades). Cliente/Admin/Analista ainda não têm rota.
function getContractsTarget(tipo) {
  return tipo === "PRESTADOR" ? "/provider/opportunities" : null;
}

function HomeIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20V10m6 10V4m6 16v-7" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 6h7v7" />
    </svg>
  );
}

function ContractsIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4m7-4l4-4m0 0l-4-4m4 4H9" />
    </svg>
  );
}

function SidebarItem({ label, to, icon: Icon }) {
  if (!to) {
    return (
      <li>
        <span
          aria-disabled="true"
          title="Em breve"
          className="flex cursor-not-allowed items-center gap-3 whitespace-nowrap rounded-xl border-l-2 border-transparent px-6 py-4 text-sm font-semibold text-(--color-muted-light)"
        >
          <Icon />
          {label}
          <span className="ml-auto hidden text-[10px] font-bold uppercase tracking-wide md:inline">
            Em breve
          </span>
        </span>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-3 whitespace-nowrap rounded-xl border-l-2 px-6 py-4 text-sm font-semibold transition-colors ${
            isActive
              ? "border-(--color-accent) bg-(--color-accent-bg) text-(--color-accent)"
              : "border-transparent text-(--color-heading) hover:bg-(--bg-subtle)"
          }`
        }
      >
        <Icon />
        {label}
      </NavLink>
    </li>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { uuid } = useParams();
  const navigate = useNavigate();

  const isInternal = user?.tipo === "ADMIN" || user?.tipo === "ANALISTA";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Equipe Serviços Já! (ADMIN/ANALISTA) navega por Dashboard/Analytics;
  // Cliente/Prestador navega por Home. "Usuários" é exclusivo do ADMIN
  // (PRD §3.6 — ANALISTA não gerencia usuários internos).
  const primaryItems = isInternal
    ? [
        { label: "Dashboard", to: "/dashboard", icon: DashboardIcon },
        { label: "Analytics", to: null, icon: AnalyticsIcon },
        { label: "Contratos", to: null, icon: ContractsIcon },
        ...(user?.tipo === "ADMIN"
          ? [{ label: "Usuários", to: null, icon: UsersIcon }]
          : []),
      ]
    : [
        { label: "Home", to: getHomeRoute(user?.tipo, uuid), icon: HomeIcon },
        {
          label: "Contratos",
          to: getContractsTarget(user?.tipo),
          icon: ContractsIcon,
        },
      ];

  const accountItems = [
    { label: "Configurações", to: null, icon: SettingsIcon },
    {
      label:
        !isInternal && user?.tipo === "PRESTADOR" ? "Meu Perfil" : "Minha Conta",
      to: isInternal ? null : getProfileRoute(user?.tipo, uuid),
      icon: AccountIcon,
    },
  ];

  return (
    <aside className="w-full shrink-0 rounded-2xl bg-(--bg-card) px-5 py-6 md:w-72.5">
      <nav
        aria-label="Navegação da conta"
        className="flex flex-row items-center gap-1 overflow-x-auto md:flex-col md:items-stretch md:gap-6 md:overflow-visible"
      >
        <ul className="flex flex-row gap-1 md:flex-col md:gap-0">
          {primaryItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </ul>

        <div className="hidden h-px w-full bg-(--color-border-subtle) md:block" />

        <ul className="flex flex-row gap-1 md:flex-col md:gap-0">
          {accountItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
          <li>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 whitespace-nowrap rounded-xl border-l-2 border-transparent px-6 py-4 text-left text-sm font-semibold text-(--color-heading) transition-colors hover:bg-(--bg-subtle)"
            >
              <LogoutIcon />
              Sair
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
