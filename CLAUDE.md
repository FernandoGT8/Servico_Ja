# CLAUDE.md — Instruções para Claude

## Visão Geral

**Serviço Já**: marketplace B2B web (React+Vite frontend, Java+Spring Boot backend, PostgreSQL). Conecta empresas contratantes com prestadores. MVP com autenticação, busca, chat, contratos, pagamento, avaliações. **Deadline**: 31/10/2026. **Equipe**: 5 generalistas.

---

## Arquitetura

**Frontend** (React+Vite) → **Backend** (Java+Spring) → **Database** (PostgreSQL)

- 3 portais: Home, Admin Panel, Corporação, Trabalhador
- Autenticação: JWT
- Chat/Real-time: WebSocket
- 12 tabelas no BD, transações ACID, auditoria

---

## Escopo do Projeto

Veja **@PRD.md** para especificação completa.

**MVP obrigatório**: 3 portais, autenticação (CNPJ/CPF/email), busca com filtros, chat, contratos digitais, pagamento, avaliação bilateral, admin panel, deploy.

**Fora do escopo v1**: mobile, multi-idioma, ML, redes sociais.

---

## Regras de Comportamento

1. **Plano antes de mudanças complexas** — Proponha antes de implementar (2+ arquivos ou comportamento existente)
2. **Sem deps externas sem permissão** — Vanilla por design (exceto React/Vite/Tailwind)
3. **Comentários em português explicam "por quê"** — Código em inglês, foco no contexto não óbvio
4. **Justifique novos arquivos** — Explique por quê não pode ir em arquivo existente
5. **Avise conflitos com @PRD.md** — Cite a seção que conflita, proponha opções, aguarde decisão

---

## Convenções de Código

**Frontend** (React):
- Componentes: `PascalCase` (Ex: `AdminForm.jsx`)
- Props/State: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- CSS: `kebab-case`

**Backend** (Java):
- Classes: `PascalCase` (Ex: `UserService.java`)
- Métodos: `camelCase`
- Pacotes: `lowercase.dotted` (Ex: `br.com.servicoja.controller`)
- Estrutura: controller → service → repository → entity

**Database** (PostgreSQL):
- Tabelas: `snake_case` singular (Ex: `usuario`, `empresa`)
- FK: `nome_tabela_id`
- Índices: `idx_tabela_coluna`

---

## Como Rodar

**Frontend**: `npm install && npm run dev` (porta 5173)

**Backend**: `mvn spring-boot:run` (porta 8080)

**Database**: PostgreSQL local, schema via `.sql` (quando criado)

**Lint**: `npm run lint`

---

## Links

- **PRD**: @PRD.md — requisitos completos
- **Deadline**: 31/10/2026
- **Repositório**: GitHub (local)

---

**Nota**: Decisões críticas estão em @PRD.md. Em dúvida, pergunte.
