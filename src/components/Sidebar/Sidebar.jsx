import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  FileText,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/useAuth";
import { getHomeRoute, getProfileRoute } from "@/utils/roleRoutes";

function SidebarItem({ label, to, icon: Icon }) {
  if (!to) {
    return (
      <li>
        <span
          aria-disabled="true"
          title="Em breve"
          className="flex cursor-not-allowed items-center gap-3 whitespace-nowrap rounded-xl border-l-2 border-transparent px-6 py-4 text-sm font-semibold text-(--color-muted-light)"
        >
          <Icon className="h-5 w-5 shrink-0" />
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
        <Icon className="h-5 w-5 shrink-0" />
        {label}
      </NavLink>
    </li>
  );
}

function BottomBarLink({ label, to, icon: Icon }) {
  if (!to) {
    return (
      <span
        aria-disabled="true"
        title="Em breve"
        className="flex h-11 w-11 cursor-not-allowed items-center justify-center rounded-full text-(--color-muted-light)"
      >
        <Icon className="h-6 w-6" />
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
          isActive
            ? "bg-(--color-accent-bg) text-(--color-accent)"
            : "text-(--color-heading) hover:bg-(--bg-subtle)"
        }`
      }
    >
      <Icon className="h-6 w-6" />
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isInternal = user?.tipo === "ADMIN" || user?.tipo === "ANALISTA";
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate("/login");
  };

  // Equipe Serviços Já! (ADMIN/ANALISTA) navega por Dashboard/Analytics;
  // Cliente/Prestador navega por Home. "Usuários" é exclusivo do ADMIN
  // (PRD §3.6 — ANALISTA não gerencia usuários internos). "Contratos" aponta
  // pra rota única /contracts pros 3 papéis (dispatcher por papel, substitui
  // /provider/opportunities — decisão de 17/09/2026, PRD §4.6/§6.2).
  const primaryItems = isInternal
    ? [
        { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
        { label: "Analytics", to: null, icon: TrendingUp },
        { label: "Contratos", to: "/contracts", icon: FileText },
        ...(user?.tipo === "ADMIN"
          ? [{ label: "Usuários", to: null, icon: Users }]
          : []),
      ]
    : [
        { label: "Home", to: getHomeRoute(), icon: Home },
        { label: "Contratos", to: "/contracts", icon: FileText },
      ];

  const accountItems = [
    { label: "Configurações", to: null, icon: Settings },
    {
      label:
        !isInternal && user?.tipo === "PRESTADOR" ? "Meu Perfil" : "Minha Conta",
      to: isInternal ? null : getProfileRoute(user?.tipo, user?.uuid),
      icon: User,
    },
  ];

  const homeItem = primaryItems[0];
  const contractsItem = primaryItems.find((item) => item.label === "Contratos");
  const accountItem = accountItems[accountItems.length - 1];

  return (
    <>
      {/* Desktop/tablet: coluna fixa de navegação */}
      <aside className="hidden shrink-0 rounded-2xl bg-(--bg-card) px-5 py-6 md:block md:w-72.5">
        <nav aria-label="Navegação da conta" className="flex flex-col gap-6">
          <ul className="flex flex-col gap-0">
            {primaryItems.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </ul>

          <div className="h-px w-full bg-(--color-border-subtle)" />

          <ul className="flex flex-col gap-0">
            {accountItems.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 whitespace-nowrap rounded-xl border-l-2 border-transparent px-6 py-4 text-left text-sm font-semibold text-(--color-heading) transition-colors hover:bg-(--bg-subtle)"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Sair
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile: barra fixa no rodapé no lugar da Sidebar */}
      <div className="fixed inset-x-4 bottom-4 z-50 md:hidden">
        <nav
          aria-label="Navegação da conta"
          className="flex h-20 items-center justify-around rounded-full border border-(--color-border-subtle) bg-(--bg-card) px-6 shadow-lg"
        >
          <BottomBarLink {...homeItem} />
          <BottomBarLink {...contractsItem} />
          <BottomBarLink {...accountItem} />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-full text-(--color-heading) transition-colors hover:bg-(--bg-subtle)"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile: menu completo, aberto pelo botão acima */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-60 flex flex-col gap-6 overflow-y-auto bg-white px-5 pt-8 pb-28 md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-dm-sans text-lg font-bold text-(--color-heading)">
              Menu
            </span>
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Fechar menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-(--color-heading) hover:bg-(--bg-subtle)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="flex flex-col gap-0" onClick={closeMobileMenu}>
            {primaryItems.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </ul>

          <div className="h-px w-full bg-(--color-border-subtle)" />

          <ul className="flex flex-col gap-0" onClick={closeMobileMenu}>
            {accountItems.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 whitespace-nowrap rounded-xl border-l-2 border-transparent px-6 py-4 text-left text-sm font-semibold text-(--color-heading) transition-colors hover:bg-(--bg-subtle)"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Sair
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
