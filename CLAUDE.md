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
- **Autorização**: por **Roles**. 5 papéis: `ADMIN` · `ANALISTA` · `CLIENTE_ADMIN` ·
  `CLIENTE_ANALISTA` · `PRESTADOR`. Mecanismo (enum vs tabela de permissões) a definir.
- **Uma empresa cliente tem vários usuários**, com papéis diferentes → login por **email**,
  não por CNPJ (conflito com o Figma, ver `@PRD.md` §9)
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
9. **Painel financeiro é exclusivo do Cliente.** O Prestador só recebe após a NF aprovada.
10. **Faltas descontam do valor**: o **Cliente registra**, o **Prestador aprova** a remoção.
11. **Status de acesso** (`Pendente`/`Liberado`/`Bloqueado`) é determinado pela validação do CNPJ.

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

- **Login por CNPJ não funciona** com vários usuários por empresa — precisa ser email + senha.
  Muda `/login` e `/client/profile/{uuid}` no Figma.
- **Mecanismo de autorização** — enum `role` + `@PreAuthorize` ou tabela de permissões?
- **Fronteira entre os papéis** — `CLIENTE_ADMIN` × `CLIENTE_ANALISTA` e `ADMIN` × `ANALISTA`
- **Como um usuário entra numa empresa** — convite? auto-cadastro por CNPJ? quem é o primeiro?
- **Visibilidade dos documentos pessoais do prestador** (RG/CNH) — LGPD

É a **única** pendência que ainda bloqueia o diagrama ER. Ver `@PRD.md` §9 para o resto.

---

## Como Rodar

**Frontend**: `npm install && npm run dev` (porta 5173)
**Backend**: `mvn spring-boot:run` (porta 8080)
**Database**: PostgreSQL local, schema via `.sql` (quando criado)
**Lint**: `npm run lint`

---

**Nota**: decisões críticas estão em `@PRD.md` e `@Figma.log`. Em dúvida, pergunte.
