import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
const PERSON_PATH = "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/business", label: "Sou Empresa" },
  { to: "/partners", label: "Sou Profissional" },
];

function StarIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

function PersonIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PERSON_PATH} />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon({ open, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

function LogoBadge() {
  return (
    <Link
      to="/"
      aria-label="Logo"
      className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-gray-200 px-6 py-4 transition-colors hover:bg-gray-300"
    >
      <StarIcon className="h-3.5 w-3.5 shrink-0 text-zinc-800" />
      <span className="font-dm-sans text-base font-bold leading-4 tracking-wide text-zinc-800">
        LOGO
      </span>
    </Link>
  );
}

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleUserMenuClick = () => setIsUserMenuOpen((prev) => !prev);
  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-345 items-center justify-between gap-4 px-5 py-4 sm:px-9 lg:px-16">
        {/* Lado esquerdo: Logo (+ navegação, só no site público) */}
        <div className="flex items-center gap-8">
          <LogoBadge />

          {!isAuthenticated && (
            <div
              className="hidden h-10 w-0.5 shrink-0 rounded-xs bg-gray-200 lg:block"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Navegação pública — some quando autenticado (o app usa a Sidebar) */}
        {!isAuthenticated && (
          <nav
            aria-label="Navegação Principal"
            className="hidden lg:flex lg:w-auto lg:flex-1 lg:items-center lg:gap-7"
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-lg py-1.5 text-center text-base font-bold leading-4 text-slate-500 transition-colors hover:text-zinc-800"
              >
                {label}
              </Link>
            ))}
            <a
              href="#sobre-nos"
              className="rounded-lg py-1.5 text-center text-base font-bold leading-4 text-slate-500 transition-colors hover:text-zinc-800"
            >
              Sobre Nós
            </a>
            <a
              href="#contato"
              className="rounded-lg py-1.5 text-center text-base font-bold leading-4 text-slate-500 transition-colors hover:text-zinc-800"
            >
              Contato
            </a>
          </nav>
        )}

        {/* Drawer mobile — só existe no site público; o app usa a Sidebar */}
        {!isAuthenticated && isMenuOpen && (
          <div className="fixed inset-0 z-60 flex flex-col gap-16 overflow-y-auto bg-white lg:hidden">
            <div className="flex flex-col items-center gap-2.5 px-8 pt-12 pb-6">
              <div className="flex w-full items-center justify-between">
                <LogoBadge />
                <button
                  type="button"
                  onClick={toggleMenu}
                  aria-label="Fechar menu"
                  className="flex h-8 w-8 items-center justify-center text-slate-500"
                >
                  <MenuIcon open className="h-5 w-5" />
                </button>
              </div>
            </div>

            <nav aria-label="Navegação Principal" className="flex flex-col">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={toggleMenu}
                  className="flex items-center gap-7"
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`h-16 w-0.5 shrink-0 ${isActive ? "bg-neutral-900" : "bg-gray-50"}`}
                        aria-hidden="true"
                      />
                      <span
                        className={`font-poppins text-2xl leading-8 font-semibold ${isActive ? "text-zinc-800" : "text-slate-500"}`}
                      >
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
              <a href="#sobre-nos" onClick={toggleMenu} className="flex items-center gap-7">
                <span className="h-16 w-0.5 shrink-0 bg-gray-50" aria-hidden="true" />
                <span className="font-poppins text-2xl leading-8 font-semibold text-slate-500">
                  Sobre Nós
                </span>
              </a>
              <a href="#contato" onClick={toggleMenu} className="flex items-center gap-7">
                <span className="h-16 w-0.5 shrink-0 bg-gray-50" aria-hidden="true" />
                <span className="font-poppins text-2xl leading-8 font-semibold text-slate-500">
                  Contato
                </span>
              </a>
            </nav>
          </div>
        )}

        {/* Lado direito: Login/Perfil */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative flex items-center" ref={userMenuRef}>
              <button
                type="button"
                onClick={handleUserMenuClick}
                className="flex items-center gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-white"
                aria-label="Abrir menu do usuário"
                aria-expanded={isUserMenuOpen}
              >
                <span className="relative block h-11 w-11 shrink-0 overflow-hidden rounded-full bg-blue-500">
                  {user.foto ? (
                    <img
                      src={user.foto}
                      alt={user.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PersonIcon className="absolute inset-0 m-auto h-6 w-6 text-white" />
                  )}
                </span>
                <span className="hidden w-28 flex-col items-center gap-1.5 sm:flex">
                  <span className="w-full truncate text-center text-base font-bold leading-4 text-slate-500">
                    {user.nome}
                  </span>
                  <span className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${i < (user.avaliacao || 0) ? "text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </span>
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-50 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                  <a
                    href="#perfil"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-gray-50 hover:text-zinc-900"
                  >
                    <PersonIcon className="h-4.5 w-4.5 shrink-0" />
                    Meu Perfil
                  </a>
                  <a
                    href="#configuracoes"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsUserMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:bg-gray-50 hover:text-zinc-900"
                  >
                    <svg
                      className="h-4.5 w-4.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <path d="M12 1v6m0 6v4M4.22 4.22l4.24 4.24m2.84 2.84l4.24 4.24M1 12h6m6 0h4M4.22 19.78l4.24-4.24m2.84-2.84l4.24-4.24M19.78 19.78l-4.24-4.24m-2.84-2.84l-4.24-4.24" />
                    </svg>
                    Configurações
                  </a>
                  <hr className="my-2 border-gray-200" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <svg
                      className="h-4.5 w-4.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4m7-4l4-4m0 0l-4-4m4 4H9" />
                    </svg>
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-bold leading-4 text-slate-500 transition-colors hover:bg-white hover:text-zinc-800"
            >
              <PersonIcon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline">Login</span>
            </Link>
          )}

          {/* Toggle do menu mobile: nav pública (site) ou menu do usuário (app) */}
          <button
            type="button"
            onClick={isAuthenticated ? handleUserMenuClick : toggleMenu}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white lg:hidden"
            aria-label={
              isMenuOpen || isUserMenuOpen ? "Fechar menu" : "Abrir menu"
            }
            aria-expanded={isAuthenticated ? isUserMenuOpen : isMenuOpen}
          >
            <MenuIcon
              open={isAuthenticated ? isUserMenuOpen : isMenuOpen}
              className="h-6 w-6 text-slate-500"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
