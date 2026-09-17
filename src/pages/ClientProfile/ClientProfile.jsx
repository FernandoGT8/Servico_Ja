import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";

// Classes compartilhadas pelos inputs e botões da página — mantidas como
// constantes para não repetir a mesma string longa em cada campo.
const inputClassName =
  "w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-(--color-heading) outline outline-2 -outline-offset-2 outline-(--color-border-subtle) transition-colors placeholder:text-(--color-muted) focus:outline-(--color-accent) disabled:cursor-not-allowed disabled:bg-(--bg-subtle) disabled:text-(--color-muted)";
const labelClassName =
  "text-xs font-bold uppercase tracking-wide text-(--color-muted-light)";
const primaryButtonClassName =
  "rounded-full bg-(--color-heading) px-6 py-4 text-sm font-bold font-dm-sans text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40";
const secondaryButtonClassName =
  "rounded-full border border-(--color-border-subtle) px-6 py-4 text-sm font-bold font-dm-sans text-(--color-heading) transition-colors hover:bg-(--bg-subtle)";

function Section({ title, children }) {
  return (
    <section className="flex flex-col gap-6 border-b border-(--color-border-subtle) pb-10 last:border-b-0 last:pb-0">
      <h2 className="text-xl leading-7 font-semibold text-(--color-heading) sm:text-2xl sm:leading-8">
        {title}
      </h2>
      {children}
    </section>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  className = "",
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className={labelClassName}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={!onChange}
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        className={inputClassName}
      />
    </label>
  );
}

function AttachIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.44 11.05l-9.19 9.19a5 5 0 0 1-7.07-7.07l9.19-9.19a3 3 0 0 1 4.24 4.24L9.41 17.41a1 1 0 0 1-1.41-1.41l8.49-8.49" />
    </svg>
  );
}

function PhotoPlaceholderIcon() {
  return (
    <svg
      className="h-14 w-14 text-white/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5m0 0l7 7m-7-7l7-7" />
    </svg>
  );
}

export default function ClientProfile() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  // Seção "Conta" (PRD §4.2). O login é por email (PRD §3.4) — o mockup do
  // Figma mostrava CNPJ+Senha como credencial, mas isso conflita com o PRD,
  // que prevalece. Pré-preenchemos com o e-mail/telefone reais da sessão
  // (useAuth) quando existirem; o resto nasce vazio, sem dado mockado.
  const [conta, setConta] = useState({
    email: user?.email ?? "",
    cnpj: "",
    novaSenha: "",
  });
  const [fotoPreview, setFotoPreview] = useState(null);
  const statusAcesso = user?.statusAcesso ?? "Pendente";

  // Seção "Dados Gerais"
  const [dadosGerais, setDadosGerais] = useState({
    nomeEmpresa: "",
    segmentoAtuacao: "",
    responsavel: "",
    telefone: user?.telefone ?? "",
    emailCorporativo: "",
  });
  const [tiposProfissional, setTiposProfissional] = useState([]);
  const [novoTipoProfissional, setNovoTipoProfissional] = useState("");

  // Seção "Documentação" — preenchida pela validação de CNPJ (PRD §4.2).
  // Sem setter por enquanto: só muda quando "Verificar CNPJ" chamar a API de
  // fato (hoje é um stub), não por edição manual do formulário.
  const [documentacao] = useState({
    statusCnpj: "",
    razaoSocial: "",
    endereco: "",
    cidade: "",
    estado: "",
    cnaePrincipalCodigo: "",
    cnaePrincipalDescricao: "",
  });
  const [atividadesSecundarias, setAtividadesSecundarias] = useState([]);
  const [novaAtividadeSecundaria, setNovaAtividadeSecundaria] = useState({
    codigo: "",
    descricao: "",
  });

  // Seção "Contratos" — histórico virá da API; começa vazio (sem dado mockado)
  const [contratos] = useState([]);

  const [sobre, setSobre] = useState("");

  const dataCadastro = user?.criadoEm
    ? new Date(user.criadoEm).toLocaleDateString("pt-BR")
    : "";

  function handleAddTipoProfissional() {
    const valor = novoTipoProfissional.trim();
    if (!valor) return;
    setTiposProfissional((atual) => [...atual, valor]);
    setNovoTipoProfissional("");
  }

  function handleRemoveTipoProfissional(index) {
    setTiposProfissional((atual) => atual.filter((_, i) => i !== index));
  }

  function handleAddAtividadeSecundaria() {
    if (
      !novaAtividadeSecundaria.codigo.trim() &&
      !novaAtividadeSecundaria.descricao.trim()
    )
      return;
    setAtividadesSecundarias((atual) => [...atual, novaAtividadeSecundaria]);
    setNovaAtividadeSecundaria({ codigo: "", descricao: "" });
  }

  function handleRemoveAtividadeSecundaria(index) {
    setAtividadesSecundarias((atual) => atual.filter((_, i) => i !== index));
  }

  function handleFotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSalvar(event) {
    event.preventDefault();
    // TODO: integrar com o endpoint de atualização de perfil do Cliente quando o backend estiver pronto.
    setIsEditing(false);
  }

  function handleAtualizarSenha() {
    // TODO: ação do próprio Cliente — integrar com o endpoint de troca de senha quando existir.
  }

  function handleVerificarCnpj() {
    // TODO: ação de ANALISTA/ADMIN (PRD §3.1) — sem gate de role definido ainda; deixado pronto na UI.
  }

  function handleLiberarCadastro() {
    // TODO: ação de ANALISTA/ADMIN — altera o status de acesso (PRD §3.5); sem gate de role definido ainda.
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
                  label="ID do Cliente"
                  value={uuid ?? ""}
                  placeholder="ID sequencial - autogerado"
                  disabled
                />
                <FormField
                  label="Email (login)"
                  value={conta.email}
                  placeholder="email@empresa.com"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setConta((atual) => ({ ...atual, email: value }))
                  }
                />
                <FormField
                  label="CNPJ"
                  value={conta.cnpj}
                  placeholder="00.000.000/0001-00"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setConta((atual) => ({ ...atual, cnpj: value }))
                  }
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
                <FormField
                  label="Status de Acesso"
                  value={statusAcesso}
                  disabled
                />
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
                      {fotoPreview
                        ? "Foto selecionada"
                        : "Envie uma foto de perfil"}
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
                    setDadosGerais((atual) => ({
                      ...atual,
                      nomeEmpresa: value,
                    }))
                  }
                />
                <FormField
                  label="Segmento de Atuação"
                  value={dadosGerais.segmentoAtuacao}
                  placeholder="Principal Segmento"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({
                      ...atual,
                      segmentoAtuacao: value,
                    }))
                  }
                />
              </div>

              <div>
                <span className={labelClassName}>
                  Tipos de Profissional de Interesse
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tiposProfissional.map((tipo, index) => (
                    <span
                      key={`${tipo}-${index}`}
                      className="flex items-center gap-2 rounded-full border border-(--color-border-subtle) bg-white px-4 py-2 text-sm text-(--color-heading)"
                    >
                      {tipo}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTipoProfissional(index)}
                          aria-label={`Remover ${tipo}`}
                          className="text-(--color-muted) hover:text-(--color-danger)"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                  {tiposProfissional.length === 0 && (
                    <p className="text-sm text-(--color-muted)">
                      Nenhum tipo de profissional adicionado ainda.
                    </p>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={novoTipoProfissional}
                      onChange={(event) =>
                        setNovoTipoProfissional(event.target.value)
                      }
                      placeholder="Ex: Pedreiro, Eletricista..."
                      className={`${inputClassName} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={handleAddTipoProfissional}
                      className={secondaryButtonClassName}
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Responsável"
                  value={dadosGerais.responsavel}
                  placeholder="Nome do Responsável"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({
                      ...atual,
                      responsavel: value,
                    }))
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
                <FormField
                  label="Email"
                  value={dadosGerais.emailCorporativo}
                  placeholder="Email Corporativo"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({
                      ...atual,
                      emailCorporativo: value,
                    }))
                  }
                />
                <FormField
                  label="Data do Cadastro"
                  value={dataCadastro}
                  placeholder="XX/XX/XXXX 00:00"
                  disabled
                />
              </div>
            </Section>

            <Section title="Documentação">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="CNPJ"
                  value={conta.cnpj}
                  placeholder="00.000.000/0001-00"
                  disabled
                />
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

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="Endereço"
                  value={documentacao.endereco}
                  placeholder="Rua dos Bobos, 0"
                  disabled
                  className="sm:col-span-1"
                />
                <FormField
                  label="Cidade"
                  value={documentacao.cidade}
                  placeholder="Cidade XYZ"
                  disabled
                />
                <FormField
                  label="Estado"
                  value={documentacao.estado}
                  placeholder="Estado XYZ"
                  disabled
                />
              </div>

              <div>
                <span className={labelClassName}>Atividade Principal</span>
                <div className="mt-2 flex gap-3">
                  <input
                    type="text"
                    value={documentacao.cnaePrincipalCodigo}
                    placeholder="CNAE"
                    disabled
                    readOnly
                    className={`${inputClassName} sm:w-32`}
                  />
                  <input
                    type="text"
                    value={documentacao.cnaePrincipalDescricao}
                    placeholder="Descrição da Atividade"
                    disabled
                    readOnly
                    className={`${inputClassName} flex-1`}
                  />
                </div>
              </div>

              <div>
                <span className={labelClassName}>Atividades Secundárias</span>
                <div className="mt-2 flex flex-col gap-2">
                  {atividadesSecundarias.map((atividade, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl border border-(--color-border-subtle) px-4 py-3 text-sm"
                    >
                      <span className="font-bold text-(--color-heading)">
                        {atividade.codigo}
                      </span>
                      <span className="text-(--color-muted)">
                        {atividade.descricao}
                      </span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAtividadeSecundaria(index)}
                          aria-label="Remover atividade secundária"
                          className="ml-auto text-(--color-muted) hover:text-(--color-danger)"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {atividadesSecundarias.length === 0 && (
                    <p className="text-sm text-(--color-muted)">
                      Nenhuma atividade secundária cadastrada.
                    </p>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="text"
                      value={novaAtividadeSecundaria.codigo}
                      onChange={(event) =>
                        setNovaAtividadeSecundaria((atual) => ({
                          ...atual,
                          codigo: event.target.value,
                        }))
                      }
                      placeholder="CNAE"
                      className={`${inputClassName} sm:w-32`}
                    />
                    <input
                      type="text"
                      value={novaAtividadeSecundaria.descricao}
                      onChange={(event) =>
                        setNovaAtividadeSecundaria((atual) => ({
                          ...atual,
                          descricao: event.target.value,
                        }))
                      }
                      placeholder="Descrição da Atividade"
                      className={`${inputClassName} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={handleAddAtividadeSecundaria}
                      className={secondaryButtonClassName}
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>
            </Section>

            <Section title="Financeiro">
              {/* Campos calculados (PRD §4.5) — sempre somente leitura, mesmo em modo de edição. */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Créditos Disponíveis"
                  value=""
                  placeholder="R$ 0,00"
                  disabled
                />
                <FormField
                  label="Taxa de Serviço"
                  value=""
                  placeholder="25/20/15%"
                  disabled
                />
              </div>
            </Section>

            <Section title="Contratos">
              {contratos.length === 0 ? (
                <p className="text-sm text-(--color-muted)">
                  Nenhum contrato ainda.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-160 text-left text-sm">
                    <thead>
                      <tr className="border-b border-(--color-border-subtle) text-xs uppercase text-(--color-muted-light)">
                        <th className="py-3 pr-4 font-bold">ID do Contrato</th>
                        <th className="py-3 pr-4 font-bold">Status</th>
                        <th className="py-3 pr-4 font-bold">Prestador</th>
                        <th className="py-3 pr-4 font-bold">
                          Total do Contrato
                        </th>
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
            <button
              type="submit"
              disabled={!isEditing}
              className={primaryButtonClassName}
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={handleVerificarCnpj}
              className={secondaryButtonClassName}
            >
              Verificar CNPJ
            </button>
            <button
              type="button"
              onClick={handleLiberarCadastro}
              className={secondaryButtonClassName}
            >
              Liberar Cadastro
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
