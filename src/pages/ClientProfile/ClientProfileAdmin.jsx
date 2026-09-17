import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { apiFetch } from "@/services/api";
import { STATUS_ACESSO } from "@/data/catalogos";
import Modal from "@/components/Modal/Modal";
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
  formatDataHoraBR,
} from "./clientProfileFieldsUtils";

// Visão de ADMIN/ANALISTA de /client/profile/{uuid} (Figma.log Sessão 7).
// "Editar Perfil" > "Salvar" é exclusivo do ADMIN — a matriz de permissões do
// PRD (§3.6) só marca "Alterar qualquer contrato ou perfil, add/remover
// dados" para ADMIN, o ANALISTA fica de fora (confirmado em conversa,
// 17/09/2026). Quando desbloqueado, edita Foto e CNPJ (Conta), tudo em Dados
// Gerais menos Data do Cadastro, e Sobre — Documentação e Financeiro seguem
// sempre travados (o primeiro vem de "Verificar CNPJ", o segundo é campo
// calculado, PRD §4.5). "Verificar CNPJ" e "Alterar Status" (ex-"Liberar
// Cadastro") são ações próprias do ADMIN e do ANALISTA, que têm essas duas
// linhas marcadas na matriz. "Adicionar Créditos" (bônus, sem cobrança) é só
// do ADMIN. A visão do Cliente é ClientProfileClient.jsx.
export default function ClientProfileAdmin() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.tipo === "ADMIN";

  const [isEditing, setIsEditing] = useState(false);
  const [modalStatusAberto, setModalStatusAberto] = useState(false);
  const [statusSelecionado, setStatusSelecionado] = useState("Pendente");
  const [modalCreditosAberto, setModalCreditosAberto] = useState(false);
  const [valorCreditoBonus, setValorCreditoBonus] = useState("");

  // Todo o estado abaixo nasce vazio — ainda não existe GET /api/clientes/{uuid}.
  const [conta, setConta] = useState({ email: "", cnpj: "" });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [statusAcesso, setStatusAcesso] = useState("Pendente");

  const [dadosGerais, setDadosGerais] = useState({
    nomeEmpresa: "",
    segmentoAtuacao: "",
    responsavel: "",
    telefone: "",
    emailCorporativo: "",
  });
  const [dataCadastro, setDataCadastro] = useState("");
  const [tiposProfissional, setTiposProfissional] = useState([]);
  const [novoTipoProfissional, setNovoTipoProfissional] = useState("");

  // Documentação (PRD §4.2) — só muda pela ação "Verificar CNPJ", nunca por
  // edição manual (regra confirmada em conversa, 17/09/2026).
  const [documentacao, setDocumentacao] = useState({
    statusCnpj: "",
    razaoSocial: "",
    endereco: "",
    cidade: "",
    estado: "",
    cnaePrincipalCodigo: "",
    cnaePrincipalDescricao: "",
  });
  const [atividadesSecundarias, setAtividadesSecundarias] = useState([]);

  const [financeiro, setFinanceiro] = useState({ creditos: "", taxaServico: "" });
  const [contratos, setContratos] = useState([]);
  const [sobre, setSobre] = useState("");

  useEffect(() => {
    let cancelado = false;
    apiFetch(`/clientes/${uuid}`)
      .then((cliente) => {
        if (cancelado || !cliente) return;
        setConta({ email: cliente.email ?? "", cnpj: cliente.cnpj ?? "" });
        setStatusAcesso(cliente.statusAcesso ?? "Pendente");
        setDadosGerais({
          nomeEmpresa: cliente.nomeEmpresa ?? "",
          segmentoAtuacao: cliente.segmentoAtuacao ?? "",
          responsavel: cliente.responsavel ?? "",
          telefone: cliente.telefone ?? "",
          emailCorporativo: cliente.emailCorporativo ?? "",
        });
        setDataCadastro(formatDataHoraBR(cliente.criadoEm));
        setTiposProfissional(cliente.tiposProfissional ?? []);
        if (cliente.documentacao) setDocumentacao(cliente.documentacao);
        setAtividadesSecundarias(cliente.atividadesSecundarias ?? []);
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

  function handleAddTipoProfissional() {
    const valor = novoTipoProfissional.trim();
    if (!valor) return;
    setTiposProfissional((atual) => [...atual, valor]);
    setNovoTipoProfissional("");
  }

  function handleRemoveTipoProfissional(index) {
    setTiposProfissional((atual) => atual.filter((_, i) => i !== index));
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
    // TODO: integrar com PUT/PATCH /api/clientes/{uuid} — body só com o que o
    // ADMIN edita aqui (foto, cnpj, dadosGerais, tiposProfissional, sobre); a
    // API deve rejeitar Documentação/Financeiro no corpo da requisição (PRD
    // §4.5). Toda edição de ADMIN em perfil de terceiro entra em
    // log_auditoria (regra 14).
    setIsEditing(false);
  }

  function handleAtualizarSenha() {
    // TODO: aciona reset de senha do Cliente (ex.: e-mail de redefinição) —
    // endpoint ainda não existe. Ação de ADMIN em nome de terceiro exige
    // log_auditoria (PRD §3.1/regra 14).
  }

  function handleVerificarCnpj() {
    // TODO: integrar com a consulta de CNPJ pelo backend. Fontes avaliadas
    // (Figma.log Sessão 7): sintegrapi.com.br (10 consultas grátis/mês, dado
    // em tempo real da Receita) como principal, com brasilapi.com.br (grátis,
    // sem limite, mas até 45 dias de atraso) como fallback quando o limite
    // estourar. Preenche `documentacao` e `atividadesSecundarias` — nunca
    // editado manualmente.
  }

  function handleAbrirModalStatus() {
    setStatusSelecionado(statusAcesso);
    setModalStatusAberto(true);
  }

  function handleConfirmarAlterarStatus() {
    // TODO: integrar com PUT /api/clientes/{uuid}/status quando existir.
    // Mover para "Liberado" exige, além do CNPJ ativo, Capital Social mínimo
    // de R$ 10 mil (decidido em 17/09/2026, ver Figma.log Sessão 7) — quem
    // valida é o backend, o front só propõe o destino. Ação de ADMIN/ANALISTA
    // entra em log_auditoria.
    setStatusAcesso(statusSelecionado);
    setModalStatusAberto(false);
  }

  function handleAbrirModalCreditos() {
    setValorCreditoBonus("");
    setModalCreditosAberto(true);
  }

  function handleConfirmarCreditosBonus() {
    // TODO: integrar com POST /api/clientes/{uuid}/creditos/bonus quando
    // existir — grava `transacao_credito` (tipo a definir, ex. `BONUS_ADMIN`)
    // sem cobrança, distinto da compra paga em ClientBilling.jsx. Exclusivo
    // do ADMIN (o botão já não aparece para ANALISTA) e entra em
    // log_auditoria (regra 14).
    setModalCreditosAberto(false);
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
                <FormField label="Acesso ao Sistema" value={statusAcesso} disabled />
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
                  disabled={!isEditing}
                  onChange={(value) =>
                    setConta((atual) => ({ ...atual, cnpj: value }))
                  }
                />
              </div>

              <div className="flex items-end gap-3 sm:w-1/2">
                <FormField
                  label="Senha"
                  type="password"
                  value=""
                  placeholder="******"
                  disabled
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
                <FormField
                  label="Segmento de Atuação"
                  value={dadosGerais.segmentoAtuacao}
                  placeholder="Principal Segmento"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({ ...atual, segmentoAtuacao: value }))
                  }
                />
              </div>

              <div>
                <span className={labelClassName}>Tipos de Profissional de Interesse</span>
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
                      onChange={(event) => setNovoTipoProfissional(event.target.value)}
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
                <FormField
                  label="Email"
                  value={dadosGerais.emailCorporativo}
                  placeholder="Email Corporativo"
                  disabled={!isEditing}
                  onChange={(value) =>
                    setDadosGerais((atual) => ({ ...atual, emailCorporativo: value }))
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

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  label="Endereço"
                  value={documentacao.endereco}
                  placeholder="Rua dos Bobos, 0"
                  disabled
                  className="sm:col-span-1"
                />
                <FormField label="Cidade" value={documentacao.cidade} placeholder="Cidade XYZ" disabled />
                <FormField label="Estado" value={documentacao.estado} placeholder="Estado XYZ" disabled />
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
                      <span className="font-bold text-(--color-heading)">{atividade.codigo}</span>
                      <span className="text-(--color-muted)">{atividade.descricao}</span>
                    </div>
                  ))}
                  {atividadesSecundarias.length === 0 && (
                    <p className="text-sm text-(--color-muted)">
                      Nenhuma atividade secundária cadastrada.
                    </p>
                  )}
                </div>
              </div>
            </Section>

            <Section title="Financeiro">
              {/* Campos calculados (PRD §4.5) — sempre somente leitura, mesmo para o ADMIN. */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Créditos Disponíveis"
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
            {isAdmin && (
              <>
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
              </>
            )}
            <button type="button" onClick={handleVerificarCnpj} className={secondaryButtonClassName}>
              Verificar CNPJ
            </button>
            <button type="button" onClick={handleAbrirModalStatus} className={secondaryButtonClassName}>
              Alterar Status
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={handleAbrirModalCreditos}
                className={primaryButtonClassName}
              >
                Adicionar Créditos
              </button>
            )}
          </div>
        </form>

        <Modal
          open={modalStatusAberto}
          onClose={() => setModalStatusAberto(false)}
          title="Alterar status de acesso"
        >
          <p className="mb-4 text-sm text-(--color-muted)">
            Liberado exige CNPJ ativo com Capital Social mínimo de R$ 10.000 — o backend valida
            na confirmação.
          </p>
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>Novo status</span>
            <select
              value={statusSelecionado}
              onChange={(event) => setStatusSelecionado(event.target.value)}
              className={inputClassName}
            >
              {STATUS_ACESSO.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalStatusAberto(false)}
              className={secondaryButtonClassName}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarAlterarStatus}
              className={primaryButtonClassName}
            >
              Confirmar
            </button>
          </div>
        </Modal>

        <Modal
          open={modalCreditosAberto}
          onClose={() => setModalCreditosAberto(false)}
          title="Adicionar créditos bônus"
        >
          <p className="mb-4 text-sm text-(--color-muted)">
            Crédito concedido pelo Serviços Já!, sem cobrança — distinto da compra paga pelo
            próprio Cliente.
          </p>
          <label className="flex flex-col gap-2">
            <span className={labelClassName}>Valor do bônus</span>
            <input
              type="number"
              value={valorCreditoBonus}
              onChange={(event) => setValorCreditoBonus(event.target.value)}
              placeholder="R$ 0,00"
              className={inputClassName}
            />
          </label>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalCreditosAberto(false)}
              className={secondaryButtonClassName}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmarCreditosBonus}
              className={primaryButtonClassName}
            >
              Confirmar
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
