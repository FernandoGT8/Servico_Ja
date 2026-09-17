import { Link } from "react-router-dom";

const PLATFORM_LINKS = [
  { to: "/", label: "Serviço Já!" },
  { to: "/business", label: "Para empresas" },
  { to: "/partners", label: "Para prestadores" },
];

const ABOUT_LINKS = [
  { href: "#equipe", label: "A Equipe" },
  { href: "#privacidade", label: "Política de Privacidade" },
  { href: "#termos", label: "Termos de uso" },
];

const SOCIAL_LINKS = [
  {
    href: "https://facebook.com",
    label: "Facebook",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    href: "https://linkedin.com",
    label: "LinkedIn",
    path: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74v-8.37H5.06v8.37h2.8z",
  },
  {
    href: "https://twitter.com",
    label: "Twitter / X",
    path: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z",
  },
  {
    href: "https://instagram.com",
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
];

function SocialIcon({ href, label, path }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-5 w-5 items-center justify-center text-zinc-700 transition-colors hover:text-zinc-900"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    </a>
  );
}

function StoreBadge({ href, label, subtitle, title, path }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-11 w-40 items-center gap-2.5 rounded-[5px] bg-neutral-900 px-3 text-white transition-opacity hover:opacity-90"
    >
      <svg
        className="h-6 w-6 shrink-0"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d={path} />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="font-rubik text-[10px] text-slate-300">
          {subtitle}
        </span>
        <span className="font-rubik text-sm font-medium text-slate-50">
          {title}
        </span>
      </span>
    </a>
  );
}

function FooterColumn({ title, children }) {
  return (
    <div className="flex flex-col items-start gap-5">
      <h3 className="font-poppins text-base font-semibold text-neutral-700">
        {title}
      </h3>
      <div className="flex flex-col items-start gap-3">{children}</div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-100">
      <div className="mx-auto flex w-full max-w-345 flex-col gap-8 px-5 pt-10 pb-7 sm:px-9 sm:pt-14 lg:px-16">
        <span className="font-rubik text-2xl font-medium text-neutral-900">
          SERVIÇOS JÁ!
        </span>

        <div className="flex flex-col flex-wrap gap-10 sm:flex-row sm:gap-16 lg:gap-24">
          {/* Contato */}
          <div className="flex w-64 flex-col items-start gap-6">
            <h3 className="font-poppins text-base font-semibold text-slate-600">
              Contato
            </h3>
            <div className="flex flex-col items-start gap-3">
              <a
                href="mailto:contato@servicoja.com.br"
                className="font-lato text-base text-zinc-700 hover:text-zinc-900"
              >
                contato@servicoja.com.br
              </a>
              <a
                href="tel:+5511987654321"
                className="font-lato text-base text-zinc-700 hover:text-zinc-900"
              >
                +55 (11) 98765-4321
              </a>
              <span className="font-lato text-base text-zinc-700">
                Rua dos Bobos, 0
              </span>
            </div>
            <div className="flex items-center gap-5">
              {SOCIAL_LINKS.map((social) => (
                <SocialIcon key={social.label} {...social} />
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <FooterColumn title="Plataforma">
            {PLATFORM_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="font-rubik text-base text-neutral-700 hover:text-neutral-900"
              >
                {label}
              </Link>
            ))}
          </FooterColumn>

          {/* Sobre Nós */}
          <FooterColumn title="Sobre Nós">
            {ABOUT_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="font-rubik text-base text-neutral-700 hover:text-neutral-900"
              >
                {label}
              </a>
            ))}
          </FooterColumn>

          {/* Baixe agora */}
          <div className="flex w-80 flex-col items-start gap-5">
            <h3 className="font-poppins text-base font-semibold text-slate-600">
              Baixe agora
            </h3>
            <div className="flex flex-col items-start gap-4">
              <StoreBadge
                href="https://apple.com/app-store"
                label="Download na App Store"
                subtitle="Download on the"
                title="App Store"
                path="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 7.17c.66-.8 1.11-1.92.99-3.04-1 .04-2.14.65-2.82 1.45-.59.68-1.12 1.83-.98 2.93 1.12.09 2.19-.54 2.81-1.34z"
              />
              <StoreBadge
                href="https://play.google.com"
                label="Disponível no Google Play"
                subtitle="GET IT ON"
                title="Google Play"
                path="M3.609 1.814L13.792 12 3.61 22.186a1.944 1.944 0 0 1-.36-.936V2.75c0-.348.12-.668.359-.936zm11.24 11.24l2.122-2.122-11.96-6.9 9.838 9.022zm0 1.892l-9.838 9.022 11.96-6.9-2.122-2.122zm2.97-1.052l3.41-1.97a1.05 1.05 0 0 0 0-1.848l-3.41-1.97-2.13 2.13 2.13 2.13z"
              />
              <p className="font-rubik text-sm text-slate-400">
                Copyright © 2026. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
