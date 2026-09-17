import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "@/services/api";
import {
  Section,
  FormField,
  AttachIcon,
  PhotoPlaceholderIcon,
  BackArrowIcon,
} from "./ClientProfileFields";
import {
  inputClassName,
  labelClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "./clientProfileFieldsUtils";

// Visão do Cliente de /client/profile/{uuid} (Figma.log Sessão 7) — mais
// enxuta que a do ADMIN/ANALISTA (ClientProfileAdmin.jsx): sem ID do
// Cliente/Acesso ao Sistema em Conta, sem Segmento/Tipos de Profissional/Data
// do Cadastro em Dados Gerais, e Documentação só com CNPJ/Status/Razão
// Social — o resto (endereço, CNAE, atividades secundárias) fica só na visão
// interna. "Editar Perfil" > "Salvar" desbloqueia Foto e Senha (Conta) e todo
// o Dados Gerais mostrado aqui, mais Sobre; CNPJ vem do cadastro e nunca é
// editável pelo próprio Cliente. Documentação e Financeiro seguem sempre
// travados (vêm do backend).
export default function ClientProfileClient() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  // Todo o estado abaixo nasce vazio — ainda não existe GET /api/clientes/{uuid}.
  const [conta, setConta] = useState({ email: "", cnpj: "", novaSenha: "" });
  const [fotoPreview, setFotoPreview] = useState(null);

  const [dadosGerais, setDadosGerais] = useState({
    nomeEmpresa: "",
    responsavel: "",
    telefone: "",
    emailCorporativo: "",
  });

  // Documentação (PRD §4.2) — vem do backend, o Cliente só visualiza.
  const [documentacao, setDocumentacao] = useState({ statusCnpj: "", razaoSocial: "" });

  const [financeiro, setFinanceiro] = useState({ creditos: "", taxaServico: "" });
  const [contratos, setContratos] = useState([]);
  const [sobre, setSobre] = useState("");

  useEffect(() => {
    let cancelado = false;
    apiFetch(`/clientes/${uuid}`)
      .then((cliente) => {
        if (cancelado || !cliente) return;
        setConta((atual) => ({
          ...atual,
          email: cliente.email ?? "",
          cnpj: cliente.cnpj ?? "",
        }));
        setDadosGerais({
          nomeEmpresa: cliente.nomeEmpresa ?? "",
          responsavel: cliente.responsavel ?? "",
          telefone: cliente.telefone ?? "",
          emailCorporativo: cliente.emailCorporativo ?? "",
        });
        if (cliente.documentacao) {
          setDocumentacao({
            statusCnpj: cliente.documentacao.statusCnpj ?? "",
            razaoSocial: cliente.documentacao.razaoSocial ?? "",
          });
        }
        setFinanceiro({
          creditos: cliente.creditosDisponiveis ?? "",
          taxaServico: cliente.percentualTaxa ?? "",
        });
        setContratos(cliente.contratos ?? []);
        setSobre(cliente.sobre ?? "");
      })
      .catch(() => {
        // Endpoint ainda não existe no backend — mantém os campos vazios.
      });
    return () => {
      cancelado = true;
    };
  }, [uuid]);

  function handleFotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSalvar(event) {
    event.preventDefault();
    // TODO: integrar com PUT/PATCH /api/clientes/{uuid} — body só com o que o
    // próprio Cliente edita aqui (foto, senha, dadosGerais, sobre). CNPJ não
    // entra: vem do cadastro e a API deve rejeitá-lo no corpo da requisição.
    setIsEditing(false);
  }

  function handleAtualizarSenha() {
    // TODO: integrar com o endpoint de troca de senha quando existir.
  }

  return (
    <div className="w-full font-poppins">
      <div className="w-full flex-1">
        <header className="mb-8">
          <h1 className="font-dm-sans text-4xl leading-tight font-bold text-(--color-heading) md:text-5xl md:leading-14">
            {dadosGerais.nomeEmpresa || "Perfil da Empresa"}
          </h1>
          <div className="mt-4 h-px w-full bg-(--color-border-subtle)" />
        </header>

        <form onSubmit={handleSalvar} className="flex flex-col gap-8">
          <div className="flex flex-col gap-10 rounded-2xl bg-(--bg-card) p-6 md:p-10">
            <Section title="Conta">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Email (login)"
                  value={conta.email}
                  placeholder="email@empresa.com"
                  disabled
                />
                <FormField
                  label="CNPJ"
                  value={conta.cnpj}
                  placeholder="00.000.000/0001-00"
                  disabled
                />
                <div className="flex items-end gap-3">
                  <FormField
                    label="Senha"
                    type="password"
                    value={conta.novaSenha}
                    placeholder="••••••"
                    disabled={!isEditing}
                    onChange={(value) =>
                      setConta((atual) => ({ ...atual, novaSenha: value }))
                    }
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAtualizarSenha}
                    className={secondaryButtonClassName}
                  >
                    Atualizar Senha
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="flex h-48 w-48 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-(--color-heading)">
                  {fotoPreview ? (
                    <img
                      src={fotoPreview}
                      alt="Foto do perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PhotoPlaceholderIcon />
                  )}
                </div>
                <div className="flex flex-1 items-center justify-between gap-4 rounded-xl bg-(--bg-subtle) px-4 py-4">
                  <div>
                    <p className={labelClassName}>Foto do Perfil</p>
                    <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-medium text-(--color-heading)">
                      <AttachIcon />
                      {fotoPreview ? "Foto selecionada" : "Envie uma foto de perfil"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={!isEditing}
                        onChange={handleFotoChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Dados Gerais">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Nome"
                  value={dadosGerais.nomeEmpresa}
                  placeholder="Nome da Empresa"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({ ...atual, nomeEmpresa: value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Responsável"
                  value={dadosGerais.responsavel}
                  placeholder="Nome do Responsável"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({ ...atual, responsavel: value }))
                  }
                />
                <FormField
                  label="Telefone"
                  value={dadosGerais.telefone}
                  placeholder="+55 (DDD) 99999-4321"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({ ...atual, telefone: value }))
                  }
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Email"
                  value={dadosGerais.emailCorporativo}
                  placeholder="Email Corporativo"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({ ...atual, emailCorporativo: value }))
                  }
                />
              </div>
            </Section>

            <Section title="Documentação">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="CNPJ" value={conta.cnpj} placeholder="00.000.000/0001-00" disabled />
                <FormField
                  label="Status do CNPJ"
                  value={documentacao.statusCnpj}
                  placeholder="ATIVO/INAPTO/BAIXADO"
                  disabled
                />
              </div>
              <FormField
                label="Razão Social"
                value={documentacao.razaoSocial}
                placeholder="Empresa XYZ Ltda."
                disabled
              />
            </Section>

            <Section title="Financeiro">
              {/* Campos calculados (PRD §4.5) — sempre somente leitura. */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Créditos disponíveis"
                  value={financeiro.creditos}
                  placeholder="R$ 0,00"
                  disabled
                />
                <FormField
                  label="Taxa de Serviço"
                  value={financeiro.taxaServico ? `${financeiro.taxaServico}%` : ""}
                  placeholder="25/20/15%"
                  disabled
                />
              </div>
            </Section>

            <Section title="Contratos">
              {contratos.length === 0 ? (
                <p className="text-sm text-(--color-muted)">Nenhum contrato ainda.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-160 text-left text-sm">
                    <thead>
                      <tr className="border-b border-(--color-border-subtle) text-xs uppercase text-(--color-muted-light)">
                        <th className="py-3 pr-4 font-bold">ID do Contrato</th>
                        <th className="py-3 pr-4 font-bold">Status</th>
                        <th className="py-3 pr-4 font-bold">Prestador</th>
                        <th className="py-3 pr-4 font-bold">Total do Contrato</th>
                        <th className="py-3 font-bold" />
                      </tr>
                    </thead>
                    <tbody>
                      {contratos.map((contrato) => (
                        <tr
                          key={contrato.id}
                          className="outline -outline-offset-1 outline-(--color-border-subtle) font-medium text-(--color-heading) even:bg-(--bg-subtle)"
                        >
                          <td className="py-3 pr-4">{contrato.id}</td>
                          <td className="py-3 pr-4">{contrato.status}</td>
                          <td className="py-3 pr-4">{contrato.prestador}</td>
                          <td className="py-3 pr-4">{contrato.total}</td>
                          <td className="py-3">
                            <Link
                              to={`/contracts/${contrato.id}`}
                              className="font-semibold text-(--color-accent)"
                            >
                              Ver Contrato
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            <Section title="Sobre">
              <label className="flex flex-col gap-2">
                <span className={labelClassName}>Biografia</span>
                <textarea
                  value={sobre}
                  onChange={(event) => setSobre(event.target.value)}
                  placeholder="Pequena biografia sobre a empresa"
                  disabled={!isEditing}
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
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={primaryButtonClassName}
            >
              Editar Perfil
            </button>
            <button type="submit" disabled={!isEditing} className={primaryButtonClassName}>
              Salvar
            </button>
            <button
              type="button"
              onClick={() => navigate(`/client/profile/${uuid}/billing`)}
              className={primaryButtonClassName}
            >
              Adicionar Créditos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
