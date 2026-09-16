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

1. **Figma** (`ONnLf1dmAXa8SsZfIzYd4p`) — fonte de verdade do **modelo de negócio e das telas**
2. **@Figma.log** — mapeamento do Figma + histórico de decisões
3. **@PRD.md** — especificação; foi reescrito (v2.0) para bater com o Figma

⚠️ Em divergência entre PRD e Figma, **o Figma prevalece** — avise e corrija o PRD.

---

## Arquitetura

**Frontend** (React+Vite) → **Backend** (Java+Spring, REST) → **Database** (PostgreSQL)

- **Autenticação**: Spring Security + **JWT**, senhas em **BCrypt**
- **Autorização**: por **Roles** (ver pendência abaixo)
- **Interfaces**: Site institucional · App do Cliente · App do Prestador · Admin (backlog)
- **~16 tabelas**, transações **ACID** obrigatórias em toda movimentação de crédito
- **Testes**: JUnit 5 + Jest, **cobertura mínima de 70% — requisito de entrega**

❌ **Sem WebSocket / chat** — saiu do escopo v1.

### Rotas (conforme Figma)
Site: `/` · `/business` · `/partners`
App: `/login` · `/register/client` · `/register/provider` · `/client/contracts/new` ·
`/client/contracts/{uuid}` · `/provider/opportunities` · `/client/profile/{uuid}` ·
`/client/profile/{uuid}/billing` · `/provider/profile/{uuid}` · `/admin` *(backlog)*

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
5. **Cálculo de valor**: na **Diária** o sistema calcula o **total** (diárias × valor/dia); na
   **Empreitada** calcula o **valor/dia** (total ÷ dias).
6. **Painel financeiro é exclusivo do Cliente.** O Prestador só recebe após a NF aprovada.
7. **Faltas descontam do valor**: o **Cliente registra**, o **Prestador aprova** a remoção.
8. **Status de acesso** (`Pendente`/`Liberado`/`Bloqueado`) é determinado pela validação do CNPJ.

---

## Estado Atual do Código

O código em `src/` **ainda não reflete o design**: navegação por `useState` + `localStorage`
(sem `react-router`, embora instalado), CSS puro por componente (Tailwind instalado e não
usado), componentes `Header`/`Footer`/`Login`/`SignUp`/`AdminForm`/`Dashboard`/`ProtectedPage`,
e backend esperado em `http://localhost:8080/api/usuarios/{login,registrar}`.

**Migração para `react-router` com as rotas reais está acordada**, mas só depois de fechar
modelagem, permissões e convenções.

---

## Regras de Comportamento

1. **Plano antes de mudanças complexas** — Proponha antes de implementar (2+ arquivos ou
   comportamento existente)
2. **Sem deps externas sem permissão** — Vanilla por design (exceto React/Vite/Tailwind/
   react-router)
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

- **Matriz de permissões por papel** — não definida (o próprio Figma registra como pendente)
- **Herança vs Roles** — o design sustenta Roles/Permissions; a hierarquia de 5 classes da
  Sessão 1 (`SystemAnalyst`/`SystemAdm`/`CompanyAnalyst`/`CompanyAdm`/`Provider`) não tem
  respaldo nas telas. Decisão pendente.
- **O crédito reservado inclui a taxa?**
- **Apuração da faixa de taxa** — retroativa ao cruzar 240/600 dias, ou fixada na publicação?

Ver `@PRD.md` §9 para a lista completa.

---

## Como Rodar

**Frontend**: `npm install && npm run dev` (porta 5173)
**Backend**: `mvn spring-boot:run` (porta 8080)
**Database**: PostgreSQL local, schema via `.sql` (quando criado)
**Lint**: `npm run lint`

---

**Nota**: decisões críticas estão em `@PRD.md` e `@Figma.log`. Em dúvida, pergunte.
