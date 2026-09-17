import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/services/api";
import { Section, FormField, PhotoPlaceholderIcon, BackArrowIcon } from "./ClientProfileFields";
import { inputClassName, labelClassName } from "./clientProfileFieldsUtils";

// Visão do Prestador de /client/profile/{uuid} (Figma.log Sessão 8) — a mais
// enxuta das três: só o contato que o Cliente já libera no sentido inverso
// (PRD regra 15) — Nome, Responsável, Telefone, Email e Sobre, tudo somente
// leitura, sem Conta/Documentação/Financeiro/Contratos. Existe para que o
// Prestador consiga alinhar detalhes com o Cliente já que não há chat no MVP
// (CLAUDE.md, pendência "canal de contato").
//
// Só deve ser alcançável por um Prestador **selecionado e com contrato ativo**
// com esse Cliente — quem garante isso é o backend (o ideal é ele nem devolver
// dados se a relação não existir mais, mesmo padrão de ContractDetailProvider.jsx
// para os campos exclusivos do Cliente). "Ativo" aqui é lido como qualquer
// contrato a partir de `Prestador Selecionado` (PRD §4.7) que não tenha caído
// em `Cancelado` — mesma janela, sem data de corte, da regra 15 no sentido
// Cliente→Prestador; ainda não confirmado em conversa, então fica sujeito a
// ajuste quando a autorização real for implementada.
export default function ClientProfileProvider() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  // Nasce vazio — ainda não existe GET /api/clientes/{uuid}, e mesmo quando
  // existir, o Prestador só deve receber este subconjunto de campos.
  const [dadosGerais, setDadosGerais] = useState({
    nomeEmpresa: "",
    responsavel: "",
    telefone: "",
    emailCorporativo: "",
  });
  const [sobre, setSobre] = useState("");

  useEffect(() => {
    let cancelado = false;
    apiFetch(`/clientes/${uuid}`)
      .then((cliente) => {
        if (cancelado || !cliente) return;
        setDadosGerais({
          nomeEmpresa: cliente.nomeEmpresa ?? "",
          responsavel: cliente.responsavel ?? "",
          telefone: cliente.telefone ?? "",
          emailCorporativo: cliente.emailCorporativo ?? "",
        });
        setSobre(cliente.sobre ?? "");
      })
      .catch(() => {
        // Endpoint ainda não existe no backend — mantém os campos vazios. Uma
        // vez que exista, um catch aqui também deve cobrir o caso de acesso
        // negado (Prestador sem contrato ativo com esse Cliente).
      });
    return () => {
      cancelado = true;
    };
  }, [uuid]);

  return (
    <div className="w-full font-poppins">
      <div className="w-full flex-1">
        <header className="mb-8">
          <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
            {dadosGerais.nomeEmpresa || "Perfil da Empresa"}
          </h1>
          <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
        </header>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-10 rounded-2xl bg-(--bg-card) p-6 md:p-10">
            <Section title="Dados Gerais">
              <div className="flex flex-col items-start gap-6 sm:flex-row">
                <div className="flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-(--color-heading)">
                  <PhotoPlaceholderIcon />
                </div>
                <div className="flex flex-1 flex-col gap-6">
                  <FormField label="Nome" value={dadosGerais.nomeEmpresa} placeholder="Nome da Empresa" disabled />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      label="Responsável"
                      value={dadosGerais.responsavel}
                      placeholder="Nome do Responsável"
                      disabled
                    />
                    <FormField
                      label="Telefone"
                      value={dadosGerais.telefone}
                      placeholder="+55 (DDD) 99999-4321"
                      disabled
                    />
                  </div>
                  <FormField
                    label="Email"
                    value={dadosGerais.emailCorporativo}
                    placeholder="Email Corporativo"
                    disabled
                  />
                </div>
              </div>
            </Section>

            <Section title="Sobre">
              <label className="flex flex-col gap-2">
                <span className={labelClassName}>Biografia</span>
                <textarea
                  value={sobre}
                  placeholder="Pequena biografia sobre a empresa"
                  disabled
                  rows={4}
                  className={`${inputClassName} resize-none`}
                />
              </label>
            </Section>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 py-3 md:gap-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 rounded-full border border-(--color-muted) px-6 py-4 font-dm-sans text-sm font-bold text-(--color-heading) transition-colors hover:bg-(--bg-subtle)"
            >
              <BackArrowIcon />
              Voltar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
