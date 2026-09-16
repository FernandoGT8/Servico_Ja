# PRD - Serviços Já!
**Product Requirements Document**

**Data original**: 06/09/2026
**Última revisão**: 15/09/2026
**Versão**: 2.0
**Status**: Em Desenvolvimento
**Deadline**: 31/10/2026

> **Nota de versão — o que mudou da v1.0 para a v2.0**
> A v1.0 descrevia um **marketplace B2B genérico** (RFQ, propostas, chat, assinatura digital,
> avaliação bilateral, disputas e multas). O mapeamento do Figma (15/09/2026, ver `Figma.log`)
> mostrou que o produto realmente desenhado é outro: **agenciamento de mão de obra por créditos
> pré-pagos**. Decisão do dia 15/09/2026: **o Figma é a fonte de verdade do modelo de negócio**
> e este PRD foi reescrito para refletir o design. Chat, assinatura digital, avaliação bilateral,
> disputas e multas **saíram do escopo v1** (§8).

---

## 1. Visão Geral

### Missão
Conectar **empresas contratantes** a **prestadores de serviço individuais** por meio de uma
plataforma de **agenciamento de mão de obra B2B**, eliminando a informalidade e a burocracia do
modelo B2C tradicional.

### Domínio
**Construção civil e facilities.** O produto é especializado: o contrato modela NRs, EPIs,
alojamento, pernoite, transporte e ferramental — não é um marketplace de serviços genérico.

### Problema
Empresas de construção e facilities precisam de mão de obra qualificada por período determinado
e esbarram em informalidade, falta de documentação e insegurança jurídica. Prestadores autônomos,
por sua vez, não têm um canal confiável para encontrar contratos de empresas maiores.

### Solução
Uma plataforma web onde a **empresa contratante coloca créditos**, publica contratos (por
**Diária** ou **Empreitada**), recebe **candidaturas** de prestadores, **seleciona** um prestador
e paga pela plataforma mediante **Nota Fiscal**. A plataforma retém um **percentual escalonado**
por volume.

---

## 2. Modelo de Negócio

### 2.1 Fluxo financeiro

```
Cliente (empresa) → compra créditos → PLATAFORMA → repassa ao Prestador após NF aprovada
                                          ↓
                                    retém a taxa de serviço
```

- Nenhum pagamento acontece fora da plataforma.
- O **Cliente** compra créditos (Boleto ou Cartão de Crédito) antes de contratar.
- O valor fica **reservado** dos créditos do Cliente **no momento em que o prestador é
  selecionado** — não na publicação do contrato.
- O **Prestador** recebe após a aprovação da Nota Fiscal. Não tem painel financeiro nem
  compra créditos.
- A **taxa de serviço só é cobrada na aprovação da Nota Fiscal**, no mesmo evento em que o
  prestador é pago. Antes disso a plataforma não retém nada.
- Na seleção, porém, é reservado **serviço + taxa**. Ex.: contrato de R$ 2.500 com taxa de 25%
  reserva **R$ 3.125**. O dinheiro só *sai* na aprovação da NF; a reserva apenas garante que a
  plataforma conseguirá cobrar a taxa. **Selecionar um prestador exige saldo ≥ serviço + taxa.**

**Movimentações de crédito do Cliente**

| Evento | Movimento |
|---|---|
| Compra de créditos | `saldo_disponivel` **+** valor comprado |
| Seleção do prestador | `saldo_disponivel` → `saldo_reservado`, **em duas linhas**: `RESERVA_SERVICO` (valor do serviço) + `RESERVA_TAXA` (valor da taxa) |
| Aprovação da NF | `saldo_reservado` **−** `RESERVA_SERVICO` → **Prestador** <br> `saldo_reservado` **−** `RESERVA_TAXA` → **Plataforma** |
| Cancelamento | estorno para `saldo_disponivel` *(regras a definir — §9)* |

### 2.2 Taxa de serviço (receita da plataforma)

Paga **somente pela empresa contratante**, sobre o valor total de cada contrato agenciado.
Escalonada pelo volume de **dias agenciados por mês**:

| Dias agenciados / mês | Taxa |
|---|---|
| < 240 | **25%** |
| < 600 | **20%** |
| > 600 | **15%** |

**Prestadores não pagam nada à plataforma.**

#### Apuração da faixa — **mensal, com efeito no mês seguinte**
A faixa **não muda retroativamente**. O volume de dias agenciados é apurado no fechamento do
mês e a faixa resultante passa a valer **a partir do mês seguinte**.

> Exemplo: o cliente agencia **240 dias em setembro** → a taxa dele **cai em outubro**.
> Contratos de setembro permanecem na faixa vigente em setembro.

#### O que conta como "dia agenciado"
**Somente dias efetivamente agenciados**, apurados **dia a dia**:
- Conta o **dia de trabalho efetivado**. **Não** contam dias de folga nem **faltas aprovadas**
  (contrato de 10 diárias com 2 faltas aprovadas conta **8**).
- **Rateado por dia**: cada dia conta para o **mês em que ele cai**. Um contrato de 28/09 a
  05/10 contribui com os dias de setembro para setembro e os de outubro para outubro.
- Como a contagem é por dia e não por contrato, um **contrato ainda em execução** no fechamento
  do mês contribui com os dias já trabalhados naquele mês.

> Consequência de modelagem: a apuração é uma **agregação sobre `dia_contrato`** (tipo
> `TRABALHO`, agrupado pela data). A tabela `dia_contrato` deixa de ser um detalhe da Diária e
> vira a **base do cálculo de receita da plataforma**.

Implicações:
- É preciso uma **apuração mensal por cliente** (dias agenciados no mês → faixa do mês seguinte).
- `percentual_taxa` é **congelado no contrato** no momento da publicação, usando a faixa vigente
  do cliente naquele mês. Por isso a tela de contrato exibe o percentual como um dado do
  contrato, não como um cálculo em tempo real.
- **Cliente novo**, sem mês anterior apurado, entra na faixa inicial de **25%**.
- **Apuração fechada não é reaberta.** Se uma falta de 25/09 só for aprovada em 03/10, setembro
  permanece como foi fechado e o ajuste de dias entra no **mês corrente** (outubro). Contratos
  que já congelaram o percentual não são recalculados. O desvio se corrige na apuração seguinte.

### 2.3 Requisitos mínimos do Prestador
- **CNPJ ativo** (MEI)
- **Documentação completa** (documento de identificação + comprovantes de experiência)
- Experiência prévia *(critério a definir — ver §9)*
- **Não** precisa ter maquinário ou ferramentas: oferece **somente mão de obra**

---

## 3. Perfis de Usuário

### 3.1 Administrador / Operador
- **Quem**: time de desenvolvimento e operação da plataforma
- **Responsabilidades**: validar CNPJ de clientes e prestadores, liberar/bloquear acesso,
  gerenciar tipos de serviço, cursos e habilidades, auditar transações de crédito
- **Tela `/admin`**: ⏸️ **backlog** — será a tela inicial dos Administradores com dados da
  plataforma. Não há frame desenhado ainda.

### 3.2 Cliente (Empresa Contratante)
- **Quem**: empresas que precisam de mão de obra
- **Identificação**: **CNPJ**
- **Fluxo**: cadastro → validação de CNPJ → compra de créditos → publicação de contrato →
  seleção de prestador → acompanhamento da execução → aprovação da NF

### 3.3 Prestador (Profissional Individual)
- **Quem**: **profissionais individuais** — pessoa física com **CPF + CNPJ (MEI)**
- ❗ **Não existe prestador pessoa jurídica com funcionários.** 1 prestador = 1 pessoa.
- **Fluxo**: cadastro → validação de CNPJ e documentos → consulta ao mural de oportunidades →
  candidatura → execução → emissão de NF → recebimento

### 3.4 Controle de acesso
Todo usuário tem um **status de acesso**: `Pendente` · `Liberado` · `Bloqueado`,
determinado pela **validação do CNPJ**.

> ⚠️ **Pendência de arquitetura**: a Sessão 1 propôs herança com 5 classes
> (`SystemAnalyst`, `SystemAdm`, `CompanyAnalyst`, `CompanyAdm`, `Provider`). O design **não
> sustenta essa separação** — existem apenas telas de Cliente e Prestador. A recomendação é
> **Roles/Permissions** sobre uma única entidade `usuario`. Decisão pendente (§9).

---

## 4. Funcionalidades (MVP)

### 4.1 Autenticação e Cadastro
- [ ] Login único (`/login`) com **Spring Security + JWT**, senhas em **BCrypt**
- [ ] Cadastro de Cliente B2B (`/register/client`)
- [ ] Cadastro de Prestador (`/register/provider`), com aceite de termos de uso e política
      de privacidade
- [ ] Validação de **CNPJ** (formato + regularidade: `ATIVO` / `INAPTO` / `BAIXADO`)
- [ ] Validação de **CPF** (prestador)
- [ ] Validação de email (confirmação)
- [ ] Recuperação de senha
- [ ] Login social *(previsto no design — "ou use sua conta vinculada"; ver §9)*

### 4.2 Perfil do Cliente (`/client/profile/{uuid}`)
- [ ] **Conta**: ID sequencial autogerado · CNPJ · senha · status de acesso
- [ ] **Foto do perfil** (upload)
- [ ] **Dados Gerais**: nome da empresa · segmento de atuação · tipos de profissional de
      interesse · responsável · telefone · email corporativo · data do cadastro
- [ ] **Documentação** (preenchida pela validação do CNPJ): status do CNPJ · razão social ·
      endereço · cidade · estado · CNAE principal + descrição · atividades secundárias
- [ ] **Financeiro**: créditos disponíveis · taxa de serviço vigente
- [ ] **Contratos**: histórico
- [ ] **Sobre**: biografia da empresa

### 4.3 Perfil do Prestador (`/provider/profile/{uuid}`)
- [ ] **Conta**: ID sequencial autogerado · CPF · senha · status de acesso
- [ ] **Foto do perfil** (upload)
- [ ] **Dados Gerais**: nome completo · email · telefone · endereço · cidade · estado ·
      aceite de termos · "já tem CNPJ?" · data do cadastro
- [ ] **Documentação**: CNPJ · status do CNPJ · razão social · CNAE principal + descrição ·
      atividades secundárias · **documento de identificação (RG ou CNH)** ·
      **documentos de experiência** (anexos)
- [ ] **Habilidades**: áreas de atuação · nível de conhecimento por área ·
      "já atuou como terceirizado?"
- [ ] **Contratos**: histórico
- [ ] **Sobre**: biografia do prestador
- [ ] ❌ **Sem painel financeiro** — o prestador apenas recebe após o contrato

### 4.4 Painel de Créditos (`/client/profile/{uuid}/billing`) — **exclusivo do Cliente**
- [ ] Créditos atuais
- [ ] Adicionar créditos (valor total)
- [ ] **Método preferencial de pagamento**: Boleto ou Cartão de Crédito
- [ ] Email para comprovante · telefone
- [ ] Data da última compra
- [ ] **Histórico de créditos** (extrato: compras, reservas, liberações, estornos)

### 4.5 Contratos

#### Tipos
| Tipo | Cliente informa | Sistema calcula |
|---|---|---|
| **Diária** | nº de diárias + **valor por dia** | **valor total** (ex.: 10 × R$ 250 = R$ 2.500) |
| **Empreitada** | **valor total** + período | **valor por dia** (ex.: R$ 3.000 / 10 = R$ 300) |

#### Criação (`/client/contracts/new`)
- [ ] Tipo de contrato: Diária | Empreitada
- [ ] ID sequencial autogerado · Status inicial `Rascunho`
- [ ] Tipo de serviço (dropdown)
- [ ] Localização: cidade + estado (dropdowns)
- [ ] **Financeiro**: data de início · data de encerramento · valor total · valor por dia
- [ ] **Operação**:
  - Dias de trabalho · dias de folga · **dias de falta** *(somente Diária)*
  - Pernoite em casa? · Pernoite em alojamento?
  - Transporte fornecido pela empresa? · Ferramentas fornecidas pela empresa?
  - EPI's fornecidos pela empresa? · Área de alimentação disponível?
- [ ] **Cursos exigidos** (multi-seleção: NR-35, NR-20, Primeiros Socorros, …)
- [ ] **Habilidades desejadas** (multi-seleção)
- [ ] **Descrição do serviço** — texto estruturado: o que o prestador deve fornecer ·
      tarefas e responsabilidades · proibições · regras de aceite e pagamento

#### Visualização (`/client/contracts/{uuid}`)
Tudo acima em leitura, **mais**:
- [ ] Percentual e **valor da taxa de serviço** (= valor total × taxa). O percentual é
      **congelado na publicação** conforme a faixa vigente do cliente (§2.2)
- [ ] **Nota Fiscal emitida pelo prestador** (anexo) e **data de aprovação da NF**
- [ ] **Candidaturas**: candidato · nível · hora da candidatura · selecionar →
      grava `Selecionado` + `Data de Seleção`

#### Cardinalidade
**1 contrato : 1 prestador.** Várias candidaturas, **uma única seleção**.

### 4.6 Mural de Oportunidades (`/provider/opportunities`)
- [ ] Listagem de contratos abertos em cards (logo da empresa, ID, tipo, descrição)
- [ ] Filtros: **tipo de contrato** (Diária/Empreitada) e **tipo de serviço**
- [ ] Candidatura ao contrato
- [ ] Campo **Promocode** → ⏸️ backlog (§8)

### 4.7 Ciclo de vida do contrato

| # | Estado | Gatilho |
|---|---|---|
| 1 | **Rascunho** | Cliente está montando o contrato |
| 2 | **Aguardando Prestadores** | Cliente publica no mural |
| 3 | **Prestador Selecionado** | Cliente escolhe um candidato → **valor é reservado dos créditos** |
| 4 | **Em Execução** | Chega a data de início; controle de dias de trabalho/folga/falta |
| 5 | **Concluído** | Fim do período de execução |
| 6 | **NF Emitida** | Prestador anexa a Nota Fiscal |
| 7 | **Pago** | Cliente aprova a NF → valor do serviço liberado ao prestador **e taxa cobrada do cliente no mesmo evento** |
| 8 | **Cancelado** | Cancelamento (regras a definir — §9) |

- [ ] Transições de estado com validação
- [ ] Notificações de mudança de estado

### 4.8 Controle de faltas (somente Diária)
- [ ] **Faltas descontam do valor** do contrato
- [ ] **O Cliente registra** a falta
- [ ] **O Prestador aprova** a remoção do dia
- [ ] Recálculo do valor total após a aprovação

> Implicação técnica: exige uma entidade de **dia de contrato** com estado próprio e um passo
> de **confirmação bilateral** — não é um campo simples no contrato.

### 4.9 Validações e Segurança
- [ ] Validação de CNPJ (ativo/inapto/baixado) e CPF
- [ ] Senhas em BCrypt · autenticação JWT · autorização por Roles
- [ ] Rate limiting
- [ ] Sanitização de inputs
- [ ] Auditoria das transações de crédito (ACID)

---

## 5. Fluxos de Usuário

### 5.1 Cliente contrata
```
1. Cadastro (/register/client) → validação de CNPJ → acesso Liberado
2. Compra créditos (/client/profile/{uuid}/billing)
3. Cria contrato (/client/contracts/new) → Rascunho
4. Publica → Aguardando Prestadores
5. Recebe candidaturas
6. Seleciona 1 prestador → valor RESERVADO dos créditos
7. Acompanha execução (registra faltas, se Diária)
8. Recebe a NF do prestador
9. Aprova a NF → crédito liberado ao prestador, taxa retida pela plataforma
```

### 5.2 Prestador executa
```
1. Cadastro (/register/provider) → CNPJ + documentos → acesso Liberado
2. Completa perfil: habilidades, áreas de atuação, experiência
3. Consulta o mural (/provider/opportunities)
4. Candidata-se a um contrato
5. É selecionado
6. Executa o serviço (aprova ou contesta faltas registradas)
7. Emite e anexa a Nota Fiscal
8. Recebe o valor após a aprovação da NF
```

---

## 6. Especificações Técnicas

### 6.1 Stack

| Camada | Tecnologia | Observações |
|---|---|---|
| **Frontend** | React + Vite | Em andamento |
| **CSS** | Tailwind CSS | Instalado, ainda não utilizado |
| **Roteamento** | react-router-dom v7 | Instalado, **ainda não utilizado** |
| **Backend** | Java + Spring Boot | API RESTful, arquitetura em camadas |
| **Banco** | **PostgreSQL** | Modelagem relacional normalizada |
| **Segurança** | Spring Security + JWT + BCrypt | Acesso controlado por Roles |
| **Testes** | JUnit 5 (back) / Jest (front) | **Cobertura mínima de 70% — obrigatória** |
| **Versionamento** | Git + GitHub | Repositório público, branch por funcionalidade |
| **Hospedagem front** | Vercel ou GitHub Pages | TBD |
| **Hospedagem back** | TBD | Necessário servidor para Java |

### 6.2 Rotas (conforme Figma)

**Site institucional**: `/` (Home + About + Details) · `/business` (Empresas) · `/partners` (Prestadores MEI)

**Aplicação**: `/login` · `/register/client` · `/register/provider` · `/client/contracts/new` ·
`/client/contracts/{uuid}` · `/provider/opportunities` · `/client/profile/{uuid}` ·
`/client/profile/{uuid}/billing` · `/provider/profile/{uuid}` · `/admin` *(backlog)*

Breakpoints desenhados: **Desktop 1440px** e **Mobile 375px**.

### 6.3 Banco de Dados (estrutura conceitual)

| Tabela | Conteúdo |
|---|---|
| `usuario` | credenciais, role, status de acesso, data de cadastro |
| `cliente` | dados da empresa contratante (CNPJ, segmento, responsável, CNAE, endereço) |
| `prestador` | dados do profissional (CPF, CNPJ MEI, endereço, aceite de termos) |
| `documento` | anexos do prestador (RG/CNH, comprovantes de experiência) |
| `tipo_servico` | catálogo de tipos de serviço |
| `habilidade` | catálogo de habilidades |
| `prestador_habilidade` | habilidade + **nível de conhecimento** do prestador |
| `curso` | catálogo de cursos/NRs |
| `contrato` | contrato B2B (tipo, status, valores, taxa, condições de operação) |
| `contrato_curso` | cursos exigidos pelo contrato |
| `contrato_habilidade` | habilidades desejadas pelo contrato |
| `dia_contrato` | cada dia: `TRABALHO` / `FOLGA` / `FALTA` + estado da aprovação da falta |
| `candidatura` | candidatura do prestador ao contrato (+ seleção e data de seleção) |
| `conta_credito` | saldo disponível e **saldo reservado** do cliente |
| `transacao_credito` | extrato: `COMPRA`, `RESERVA_SERVICO`, `RESERVA_TAXA`, `LIBERACAO_PRESTADOR`, `COBRANCA_TAXA`, `ESTORNO` |
| `nota_fiscal` | anexo, data de emissão, data de aprovação |
| `apuracao_taxa_mensal` | por cliente/mês: dias agenciados apurados (agregação de `dia_contrato`) e **faixa vigente no mês seguinte** |

**~17 tabelas.** Convenções em `CLAUDE.md`. Transações ACID obrigatórias em toda movimentação
de crédito.

---

## 7. Critérios de Aceitação

O projeto será considerado **completo** quando:

- ✅ Site institucional no ar (`/`, `/business`, `/partners`)
- ✅ Cadastro e login funcionais para Cliente e Prestador, com validação de CNPJ/CPF
- ✅ Compra de créditos e extrato funcionando
- ✅ Criação e publicação de contrato (Diária e Empreitada) com cálculo correto de valores
- ✅ Mural de oportunidades com filtros e candidatura
- ✅ Seleção de prestador com **reserva de crédito**
- ✅ Controle de dias com fluxo de falta (registro pelo cliente + aprovação pelo prestador)
- ✅ Emissão e aprovação de Nota Fiscal, com liberação do crédito e retenção da taxa
- ✅ Cálculo correto da taxa escalonada (25/20/15%)
- ✅ Banco PostgreSQL normalizado com transações ACID
- ✅ **Cobertura de testes ≥ 70%** (back e front)
- ✅ Deploy em produção
- ✅ Documentação técnica (README com guia de execução, diagramas da arquitetura RESTful e
  decisões de design)

---

## 8. Fora do Escopo v1 / Backlog

### Removido do MVP em 15/09/2026 (estava na v1.0, não existe no design)
- ❌ **Chat integrado** entre cliente e prestador (WebSocket)
- ❌ **Contrato digital com assinatura eletrônica** — o aceite é o fluxo
  candidatura → seleção; a **Nota Fiscal** é o comprovante da execução
- ❌ **Avaliação bilateral / reviews** — evolui para o "Nível" do prestador (abaixo)
- ❌ **Disputas** e **multas por cancelamento**

### Backlog (desenhado ou citado, mas fora do MVP)
- ⏸️ **`/admin`** — tela inicial dos Administradores com dados da plataforma
- ⏸️ **"Nível" do prestador** — reputação acumulada ao longo dos contratos executados
- ⏸️ **Promocode** — cupom de R$ X em créditos para novos clientes testarem a plataforma

### Fora do escopo (v1)
- App mobile nativo (web responsivo apenas)
- Multi-idioma (português apenas)
- Integração com redes sociais
- Sistema de referência/afiliação
- Planos VIP / subscriptions
- Recomendação com ML
- Análise de dados avançada

---

## 9. Decisões Pendentes (TBD)

### Bloqueiam a modelagem do banco
- [ ] **Matriz de permissões por papel** — o que cada perfil vê e faz. *(É a pendência que o
      próprio Figma registra em "Regras de Negócio".)*
- [ ] **Herança vs Roles** para usuários — o design sustenta Roles/Permissions; a hierarquia de
      5 classes da Sessão 1 não tem respaldo nas telas.
*(Nada mais bloqueia o ER além da matriz de permissões.)*

### Regras a definir
- [ ] **Cancelamento**: em que estados é permitido? O que acontece com o crédito reservado?
- [ ] **"Experiência prévia"** como requisito do prestador: o que valida? Quem aprova?
- [ ] **Contestação de falta**: e se o prestador **não** aprovar a remoção do dia?
- [ ] **Login social**: entra no MVP ou sai? O design prevê ("ou use sua conta vinculada").
- [ ] **Notificações**: email, in-app, ambos?
- [ ] Limite de contratos simultâneos por prestador?

---

## 10. Timeline e Milestones

**Deadline final**: 31/10/2026

| Marco | Data sugerida | Entregas |
|---|---|---|
| **Fundação** | 20/09 | Modelagem ER, permissões definidas, rotas no front, convenções fechadas |
| **Autenticação** | 25/09 | Login, cadastro Cliente e Prestador, validação CNPJ/CPF, JWT |
| **Perfis** | 30/09 | Perfil do Cliente e do Prestador, upload de documentos |
| **Créditos** | 05/10 | Painel de créditos, compra, extrato, reserva |
| **Contratos** | 12/10 | Criação (Diária/Empreitada), publicação, visualização |
| **Mural e candidatura** | 18/10 | Oportunidades, filtros, candidatura, seleção |
| **Execução e NF** | 24/10 | Dias de trabalho/folga/falta, NF, aprovação, liberação de crédito |
| **Site institucional** | 27/10 | `/`, `/business`, `/partners` |
| **Testes e Deploy** | 31/10 | Cobertura ≥ 70%, deploy, documentação |

---

## 11. Equipe

- **Tamanho**: 5 pessoas
- **Perfil**: generalistas
- **Implicação**: documentação clara, arquitetura simples, comunicação constante

---

## 12. Referências

- **`Figma.log`** — mapeamento completo do design (fonte de verdade do modelo de negócio)
- **`CLAUDE.md`** — convenções de código e regras de trabalho
- **Figma**: `ONnLf1dmAXa8SsZfIzYd4p`

---

**Nota**: este PRD é vivo. Qualquer mudança deve ser comunicada ao time. Em caso de divergência
entre este documento e o Figma, **o Figma prevalece** e o PRD deve ser corrigido.
