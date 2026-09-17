# CLAUDE.md — Instruções para Claude

## Visão Geral

**Serviços Já!**: plataforma web de **agenciamento de mão de obra B2B** para **construção civil
e facilities** (React+Vite frontend, Java+Spring Boot backend, PostgreSQL).

Empresas contratantes (**Cliente**) compram **créditos** na plataforma, publicam contratos por
**Diária** ou **Empreitada**, recebem **candidaturas** de **Prestadores** (profissionais
individuais, CPF + CNPJ MEI), selecionam **um** prestador e pagam mediante **Nota Fiscal**.
A plataforma retém uma **taxa escalonada** (25/20/15% conforme dias agenciados/mês).

**Deadline**: 31/10/2026. **Equipe**: 5 generalistas. **Contexto**: TCC + especialização.

---

## Fonte de Verdade

1. **@PRD.md** — **fonte de verdade**. Regras de negócio, permissões e modelo de dados.
2. **@BACKEND_ANALISE.md** — **fonte de verdade** do que já está implementado e do que falta
   para o backend (diagnóstico + backlog de endpoints por módulo).
3. **Figma** (`ONnLf1dmAXa8SsZfIzYd4p`) — **protótipo**: esqueleto visual e referência de telas

⚠️ O Figma **não é contrato**. Onde o código precisar divergir do desenho, diverge — mas avise.
Em divergência entre PRD e Figma, **o PRD prevalece**.

⚠️ **`Figma.log` é local e não é versionado** (decisão de 17/09/2026) — histórico de decisões e
o "porquê" por trás delas, útil como bloco de notas desta máquina, mas **nunca commitado** (já
cai no `*.log` do `.gitignore`; foi removido do índice do repositório frontend em 17/09/2026).
Não conte com ele existindo em outro clone do repositório — qualquer regra ou decisão que
precise sobreviver ao time vai para o `PRD.md` ou o `BACKEND_ANALISE.md`.

---

## Arquitetura

**Frontend** (React+Vite) → **Backend** (Java+Spring, REST) → **Database** (PostgreSQL)

- **Autenticação**: Spring Security + **JWT**, senhas em **BCrypt**
- **Autorização**: por **Roles**. 4 papéis: `ADMIN` · `ANALISTA` · `CLIENTE` · `PRESTADOR`.
  Mecanismo (enum vs tabela de permissões) a definir.
- **Login: email + senha** para todos os papéis. CNPJ e CPF são atributos, não credenciais
  (login por documento → backlog). **Um login por empresa.**
- **Interfaces**: Site institucional · App do Cliente · App do Prestador · Admin (backlog)
- **~18 tabelas**, transações **ACID** obrigatórias em toda movimentação de crédito
- **Testes**: JUnit 5 + Jest, **cobertura mínima de 70% — requisito de entrega**

❌ **Sem WebSocket / chat** — saiu do escopo v1.

### Rotas (conforme Figma)
Site: `/` · `/business` · `/partners`
App: `/login` · `/register/client` · `/register/client/complete` · `/register/provider` ·
`/register/provider/complete` · `/client/contracts/new` · `/contracts` · `/contracts/{uuid}` ·
`/client/profile/{uuid}` · `/client/profile/{uuid}/billing` · `/provider/profile/{uuid}` ·
`/admin` *(backlog)*

⚠️ **`/contracts` sem prefixo de papel** (decisão de 17/09/2026): listagem de contratos
compartilhada entre os três papéis logados (dispatcher por papel, `pages/Contracts/`), mesmo
raciocínio de `/contracts/{uuid}` abaixo. Substitui `/provider/opportunities`.

⚠️ **`/contracts/{uuid}` sem prefixo de papel** (decisão de 17/09/2026, ver `Figma.log` §13):
a tela já era compartilhada entre Cliente e Prestador (o Figma desenha as duas visões), só a
URL tinha "client" à toa. `/client/contracts/new` continua exclusivo do Cliente.

⚠️ **Cadastro em duas etapas** (decisão de 17/09/2026, ver `Figma.log` Sessão 11):
`/register/client` e `/register/provider` só criam a conta (nome, telefone, email, senha,
termos). `/register/client/complete` e `/register/provider/complete` completam o perfil
(segmento/CNPJ ou CPF/CNPJ-MEI/habilidades) já autenticado, protegidas por `RequireAuth` com
o papel dono da conta — status continua `Pendente` até a liberação do `ADMIN`/`ANALISTA`.

Breakpoints: **Desktop 1440px** / **Mobile 375px**.

---

## Regras de Negócio Invioláveis

Errar qualquer uma destas quebra o produto:

1. **Prestador é sempre individual** — pessoa física com CPF + CNPJ MEI. Nunca empresa com
   funcionários.
2. **1 contrato : 1 prestador.** Várias candidaturas, uma única seleção.
3. **Crédito é reservado na seleção do prestador**, não na publicação do contrato.
4. **Taxa de serviço**: 25% (<240 dias/mês) · 20% (<600) · 15% (>600). Paga **só pelo Cliente**;
   o Prestador não paga nada.
5. **A taxa só é cobrada na aprovação da NF**, no mesmo evento em que o prestador é pago —
   mas na **seleção** reserva-se **serviço + taxa** (R$ 2.500 + 25% = R$ 3.125), em duas linhas
   de extrato (`RESERVA_SERVICO` / `RESERVA_TAXA`). Selecionar exige saldo ≥ serviço + taxa.
6. **A faixa de taxa vale para o mês seguinte**, nunca retroativa: 240 dias agenciados em
   setembro → taxa menor em outubro. `percentual_taxa` é **congelado no contrato** na publicação.
   Cliente novo começa em 25%. **Conta só o dia de trabalho efetivado**, rateado pelo mês em que
   o dia cai — folgas e faltas aprovadas não contam. A apuração é uma agregação sobre
   `dia_contrato`, que por isso é a base do cálculo de receita.
7. **Apuração fechada nunca é reaberta.** Falta aprovada tarde ajusta o **mês corrente**;
   contratos que já congelaram o percentual não são recalculados.
8. **Cálculo de valor**: na **Diária** o sistema calcula o **total** (diárias × valor/dia); na
   **Empreitada** calcula o **valor/dia** (total ÷ dias).
9. **Painel de gestão de crédito é exclusivo do Cliente** (compra, saldo, taxa — `/client/profile/{uuid}/billing`).
   O Prestador só recebe após a NF aprovada; no `/dashboard` ele vê um **resumo de pagamentos, só
   leitura** (ganhos do mês, recebidos, a receber) — não é o mesmo painel, sem crédito/taxa nem
   ação de gestão (decidido em 18/09/2026, ver `PRD.md` §4.3).
10. **Faltas descontam do valor**: o **Cliente registra**, o **Prestador aprova** a remoção.
11. **Status de acesso** (`Pendente`/`Liberado`/`Bloqueado`) é determinado pela validação do CNPJ.
    `Pendente` navega (vê mural e perfis, completa o cadastro) mas **não transaciona**.
12. **O Cliente nunca vê documentos do prestador** (RG/CNH, comprovantes). Vê foto,
    habilidades, "sobre" e **contato**. Documentos: só o time Serviços Já! e o próprio prestador.
13. **Campos calculados são imutáveis — nem o `ADMIN` edita**: `valor_total`, `valor_dia`,
    quantidade de diárias, `percentual_taxa`, `valor_taxa`, dias agenciados e saldos. A API
    **rejeita** esses campos no corpo da requisição; não basta desabilitar o input. Ver
    `@PRD.md` §4.5.
14. **Toda ação de `ADMIN` é auditada** (`log_auditoria`). Recálculo financeiro depois da
    seleção gera lançamento compensatório no extrato, nunca ajuste silencioso.
15. **O Cliente vê o contato do prestador** (nome, telefone, email) a partir da seleção —
    mas nunca os documentos.
16. **O Prestador vê o contato do Cliente** (nome, responsável, telefone, email, "sobre") em
    `/client/profile/{uuid}` — só enquanto **selecionado e com contrato ativo** com esse Cliente
    (não antes da seleção, não depois de `Cancelado`). Espelha a regra 15 no sentido inverso;
    quem garante o filtro é o backend.

---

## Estado Atual do Código

O código em `src/` já reflete boa parte do design (atualizado em 17/09/2026 — histórico da
migração em `Figma.log` §9):

- **Roteamento**: `react-router-dom` em uso — `BrowserRouter` (`App.jsx`), rotas centralizadas
  em `router.jsx`. `RequireAuth` (`components/RequireAuth/`) protege as rotas logadas, aceita
  `allowedRoles` e renderiza a `Sidebar` + `Outlet`.
- **CSS**: Tailwind v4 (config CSS-first, tokens `--color-*`/`--bg-*` em `styles/variables.css`
  via `@theme`) é o padrão em todo componente novo (`Header`, `Footer`, `Sidebar`,
  `ClientProfile*`, `ContractDetail*`, `ClientBilling*`, `ContractNew`, `Register*`,
  `FirstRegister*`...). `Login.jsx` é a única tela ainda em CSS puro colocado por página — não
  foi migrada.
- **Padrão de dispatcher por papel**: `ClientProfile.jsx`, `ContractDetail.jsx`,
  `ClientBilling.jsx`, `Dashboard.jsx` e `Contracts.jsx` só decidem qual visão renderizar
  (`*Admin`/`*Client`/`*Provider`, conforme `user.tipo`), com UI compartilhada em `*Fields.jsx`.
  Siga esse padrão para qualquer tela nova que precise de 2+ visões por papel.
- **Padrão de pasta por recurso**: telas que compartilham dado ou fluxo vivem juntas numa
  pasta só (`pages/ClientProfile/`, `pages/ContractDetail/`, `pages/ClientBilling/`,
  `pages/Contracts/`, `pages/Register/`, `pages/FirstRegister/`), com átomos de UI num
  `*Fields.jsx` + classes Tailwind num `*fieldsUtils.js` (mesma convenção de
  `ContractFormFields.jsx`/`contractFormUtils.js`) — nunca importados entre pastas diferentes,
  cada recurso é autocontido.
- **Autenticação**: `AuthContext`/`useAuth` guardam `token` + `user` no `localStorage`;
  `authService.js` chama `POST /api/usuarios/{login,registrar}`. Em dev
  (`import.meta.env.DEV`), `login()` primeiro tenta um usuário fixo de `mockUsers.js` antes de
  bater no backend.
- **Cadastro em duas etapas** desde 17/09/2026 — ver "Rotas" acima e `Figma.log` Sessões 11–13.

Praticamente toda ação que depende do backend segue marcada `TODO` no front — o backend real
(`Servco-Ja-Back`) ainda não implementa nenhuma delas (ver `BACKEND_ANALISE.md` §6–§8).

---

## Regras de Comportamento

1. **Plano antes de mudanças complexas** — Proponha antes de implementar (2+ arquivos ou
   comportamento existente)
2. **Sem deps externas sem permissão** — Vanilla por design (exceto React/Vite/Tailwind/
   react-router/lucide-react)
3. **Comentários em português explicam "por quê"** — Código em inglês, foco no contexto não óbvio
4. **Justifique novos arquivos** — Explique por quê não pode ir em arquivo existente
5. **Avise conflitos com @PRD.md ou com o Figma** — Cite a seção que conflita, proponha opções,
   aguarde decisão
6. **Sem dados mock** a menos que explicitamente solicitado
7. **Seja direto** — aponte a causa raiz do problema em vez de entregar receita pronta; discorde
   quando a proposta não fechar

---

## Convenções de Código

**Frontend** (React):
- Componentes: `PascalCase` (Ex: `ContractForm.jsx`)
- Props/State: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- CSS: `kebab-case`
- **Rotas em inglês** (`/client`, `/provider`), conforme Figma

**Backend** (Java):
- Classes: `PascalCase` (Ex: `ContractService.java`)
- Métodos: `camelCase`
- Pacotes: `lowercase.dotted` (Ex: `br.com.servicoja.controller`)
- Estrutura: controller → service → repository → entity

**Database** (PostgreSQL):
- Tabelas: `snake_case` singular (Ex: `contrato`, `candidatura`, `dia_contrato`)
- FK: `nome_tabela_id`
- Índices: `idx_tabela_coluna`

**Git**:
- `main` ← `dev` ← branch por funcionalidade
- Commits em português, imperativo

---

## Pendências que Bloqueiam Implementação

- **Mecanismo de autorização** — enum `role` + `@PreAuthorize` ou tabela de permissões?
- **Canal de contato cliente ↔ prestador** — sem chat e sem dados de contato, as partes não
  têm como se falar depois da seleção.
- **Backend** (`Servco-Ja-Back`) — ver `@BACKEND_ANALISE.md`: segurança desligada
  (`permitAll()`), credenciais commitadas no GitHub, modelo de 1 tabela, zero testes.
  A documentação já foi sincronizada lá (branch `update-info`); o código, não.

⚠️ **Dois repositórios, mesma documentação.** `PRD.md` e `BACKEND_ANALISE.md` têm cópia em
`Servco-Ja-Back` — são os dois arquivos versionados e compartilhados pelo time. Mudou regra de
negócio? Atualize os dois no mesmo dia. `Figma.log` **não** entra nessa sincronização — é local
e não versionado (ver "Fonte de Verdade" acima); cada máquina mantém o seu, sem cobrança de
paridade entre eles.

A matriz de permissões está em `@PRD.md` §3.6. Ver `@PRD.md` §9 para o resto.

---

## Como Rodar

**Frontend**: `npm install && npm run dev` (porta 5173)
**Backend**: `mvn spring-boot:run` (porta 8080)
**Database**: PostgreSQL local, schema via `.sql` (quando criado)
**Lint**: `npm run lint`

---

**Nota**: decisões críticas estão em `@PRD.md` e `@BACKEND_ANALISE.md`. Em dúvida, pergunte.
