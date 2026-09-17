# PRD - Serviços Já!
**Product Requirements Document**

**Data original**: 06/09/2026
**Última revisão**: 15/09/2026
**Versão**: 2.0
**Status**: Em Desenvolvimento
**Deadline**: 31/10/2026

> **Este documento é a fonte de verdade do projeto.** O Figma é o **protótipo** — um esqueleto
> visual que orientou o levantamento das regras, não um contrato de telas. Onde o código
> precisar divergir do desenho, diverge; o que não pode divergir é o que está escrito aqui.
>
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

### 3.1 Papéis internos da plataforma — **ADMIN** e **ANALISTA**
- **Quem**: time de operação do Serviços Já!
- **`ANALISTA`** — escopo **estreito e operacional**: validar CNPJ (**manualmente, quando a API
  de consulta falhar**), conferir os documentos do prestador e **liberar acesso**. Nada além disso.
- **`ADMIN`** — **acesso total ao sistema**: tudo do analista, mais alterar qualquer contrato ou
  perfil, **adicionar e remover informações**, gerenciar catálogos e usuários internos, e
  auditoria financeira.

> 🔒 **Campos calculados pelo sistema são imutáveis — nem o `ADMIN` edita.** Ver §4.5.
> O `ADMIN` edita campos de **entrada**; os **derivados** são sempre recalculados a partir deles.
> Como editar uma entrada recalcula os derivados de um contrato que já tem dinheiro reservado,
> **toda ação de `ADMIN` é registrada em `log_auditoria`** e recálculo financeiro após a seleção
> gera **lançamento compensatório** no extrato, nunca ajuste silencioso.
- **Tela `/admin`**: ⏸️ **backlog** — será a tela inicial dos Administradores com dados da
  plataforma. Não há frame desenhado ainda.

### 3.2 Cliente (Empresa Contratante)
- **Quem**: empresas que precisam de mão de obra
- **Identificação da empresa**: **CNPJ** (atributo, não credencial)
- **Login**: **email + senha**
- ❗ **Um login por empresa** no MVP. O campo "Responsável" do perfil é um dado da empresa,
  não um segundo usuário.
- ⏸️ **Backlog**: vários usuários por empresa, com papéis distintos (`CLIENTE_ADMIN` /
  `CLIENTE_ANALISTA`) e telas de gestão de equipe — ver §8.
- **Fluxo**: cadastro → validação de CNPJ → compra de créditos → publicação de contrato →
  seleção de prestador → acompanhamento da execução → aprovação da NF

### 3.3 Prestador (Profissional Individual)
- **Quem**: **profissionais individuais** — pessoa física com **CPF + CNPJ (MEI)**
- ❗ **Não existe prestador pessoa jurídica com funcionários.** 1 prestador = 1 pessoa.
- **Fluxo**: cadastro → validação de CNPJ e documentos → consulta ao mural de oportunidades →
  candidatura → execução → emissão de NF → recebimento

### 3.4 Papéis (roles)

| Papel | Escopo | Quem é |
|---|---|---|
| `ADMIN` | plataforma | time Serviços Já! — acesso total |
| `ANALISTA` | plataforma | time Serviços Já! — validação de CNPJ, documentos e liberação |
| `CLIENTE` | uma empresa | a empresa contratante (**login único por empresa**) |
| `PRESTADOR` | ele mesmo | profissional individual |

**4 papéis no MVP**, com `role` numa única entidade `usuario` — não herança de classes.
A hierarquia de 5 classes da Sessão 1 (`SystemAnalyst`/`SystemAdm`/`CompanyAnalyst`/
`CompanyAdm`/`Provider`) fica sem os dois papéis intra-empresa, que foram para o backlog (§8).
*(Mecanismo de autorização ainda não decidido — §9.)*

**Login: email + senha para todos os papéis.** CNPJ e CPF são atributos da empresa e do
prestador, **não credenciais** — login por documento vai para o backlog (§8).

> ⚠️ **Conflito com o design**: o Figma mostra "Conta: CNPJ · Senha" em
> `/client/profile/{uuid}` e "Conta: CPF · Senha" em `/provider/profile/{uuid}`. Com login por
> email, esses dois blocos precisam ser ajustados no Figma.

### 3.6 Matriz de Permissões

| Ação | `ADMIN` | `ANALISTA` | `CLIENTE` | `PRESTADOR` |
|---|:---:|:---:|:---:|:---:|
| Validar CNPJ / conferir documentos | ✅ | ✅ | — | — |
| Liberar / bloquear acesso | ✅ | ✅ | — | — |
| Gerenciar catálogos (tipo de serviço, curso, habilidade) | ✅ | — | — | — |
| Gerenciar usuários internos | ✅ | — | — | — |
| Alterar qualquer contrato ou perfil, add/remover dados³ | ✅ | — | — | — |
| Auditoria financeira da plataforma | ✅ | — | — | — |
| Comprar créditos | ✅¹ | — | ✅ | — |
| Conceder créditos bônus ao Cliente *(sem cobrança)* | ✅ | — | — | — |
| Criar e publicar contrato | ✅¹ | — | ✅ | — |
| Selecionar prestador *(reserva crédito)* | ✅¹ | — | ✅ | — |
| Registrar falta | ✅¹ | — | ✅ | — |
| Aprovar a remoção da falta | — | — | — | ✅ |
| Ver o mural de oportunidades | ✅ | ✅ | — | ✅ |
| Candidatar-se a contrato | — | — | — | ✅ |
| Emitir / anexar Nota Fiscal | ✅¹ | — | — | ✅ |
| Aprovar Nota Fiscal *(libera pagamento)* | ✅¹ | — | ✅ | — |
| Ver RG/CNH e comprovantes do prestador | ✅ | ✅ | ❌ | ✅² |
| Ver foto, habilidades e "sobre" do prestador | ✅ | ✅ | ✅ | ✅ |
| Ver contato do Cliente *(nome, responsável, telefone, email)* | ✅ | ✅ | — | ✅⁴ |

¹ por ser acesso total; ação em nome de terceiro **exige registro em `log_auditoria`**
² apenas os próprios documentos
³ inclui **"Editar Perfil"/"Salvar"** em `/client/profile/{uuid}` — o `ANALISTA` não tem essa
  ação nessa tela (confirmado em conversa, 17/09/2026); seu escopo ali é só "Validar CNPJ" e
  "Liberar/bloquear acesso" (linhas acima), ver `Figma.log` Sessão 7
⁴ só enquanto **selecionado e com contrato ativo** com esse Cliente — não antes da seleção, não
  depois de `Cancelado` (ver §4.3, `Figma.log` Sessão 8)

**Escopo por registro**: o `CLIENTE` só enxerga os **próprios** contratos, créditos e
candidaturas; o `PRESTADOR` só os contratos em que se candidatou ou foi selecionado, e o
próprio perfil.

### 3.5 Status de acesso
Todo usuário tem `Pendente` · `Liberado` · `Bloqueado`, determinado pela **validação do CNPJ**.

**`Pendente` = navega, mas não transaciona.** Pode fazer login, ver o mural e perfis e
completar o próprio cadastro. **Não pode** publicar contrato, candidatar-se nem comprar crédito.

**Critério de liberação do Cliente** (decidido em 17/09/2026, ver `Figma.log` Sessão 7): passar
para `Liberado` exige, além do CNPJ **ATIVO**, **Capital Social mínimo de R$ 10.000**. A ação
que muda o status é `ADMIN`/`ANALISTA` (matriz §3.6), feita em **`/client/profile/{uuid}`** —
"Alterar Status" (antes chamada "Liberar Cadastro", renomeada porque também **bloqueia**, não só
libera).

**Consulta de CNPJ** ("Verificar CNPJ", mesma tela): duas fontes avaliadas — **sintegrapi.com.br**
(10 consultas grátis/mês, dado em tempo real da Receita Federal) como principal, e
**brasilapi.com.br** (grátis, sem limite de consultas, mas com até 45 dias de atraso) como
fallback quando o limite mensal estourar. Preenche a seção Documentação do perfil — nunca é
editada manualmente, nem pelo `ADMIN` (regra 13/§4.5). Implementação fica a cargo do backend.

---

## 4. Funcionalidades (MVP)

### 4.1 Autenticação e Cadastro
- [ ] Login único (`/login`) com **Spring Security + JWT**, senhas em **BCrypt**
- [ ] **Credencial: email + senha** para todos os papéis (login por CNPJ/CPF → backlog, §8)
- [ ] Cadastro de Cliente B2B em duas etapas (decisão de 17/09/2026): conta simplificada — nome,
      telefone, email, senha, aceite de termos (`/register/client`) — e, já autenticado, perfil
      completo — segmento, cargo, empresa, CNPJ (`/register/client/complete`).
      **Front pronto** (`pages/FirstRegister/`, `pages/Register/`); endpoint de completar perfil
      ainda não existe no backend — ver `@BACKEND_ANALISE.md` §8
- [ ] Cadastro de Prestador em duas etapas: conta simplificada — nome, telefone, email, senha,
      aceite de termos (`/register/provider`) — e, já autenticado, perfil completo — CPF,
      CNPJ/MEI, disponibilidade, habilidades, experiência (`/register/provider/complete`).
      **Front pronto**; endpoint de completar perfil ainda não existe no backend — ver
      `@BACKEND_ANALISE.md` §8
- [ ] Validação de **CNPJ** (formato + regularidade: `ATIVO` / `INAPTO` / `BAIXADO`)
- [ ] Validação de **CPF** (prestador)
- [ ] Validação de email (confirmação)
- [ ] Recuperação de senha
- [ ] Login social *(previsto no design — "ou use sua conta vinculada"; ver §9)*

### 4.2 Perfil do Cliente (`/client/profile/{uuid}`)
- [ ] **Conta**: ID sequencial autogerado · **email (login)** · CNPJ · senha · status de acesso
- [ ] **Foto do perfil** (upload)
- [ ] **Dados Gerais**: nome da empresa · segmento de atuação · tipos de profissional de
      interesse · responsável · telefone · email corporativo · data do cadastro
- [ ] **Documentação** (preenchida pela validação do CNPJ): status do CNPJ · razão social ·
      endereço · cidade · estado · CNAE principal + descrição · atividades secundárias
- [ ] **Financeiro**: créditos disponíveis · taxa de serviço vigente
- [ ] **Contratos**: histórico
- [ ] **Sobre**: biografia da empresa

> **Quem edita o quê em `/client/profile/{uuid}`** (decidido em 17/09/2026, ver `Figma.log`
> Sessão 7): a tela tem duas visões, mais enxuta para o `CLIENTE`. "Editar Perfil"/"Salvar" é
> **exclusivo do `ADMIN`** (o `ANALISTA` não tem essa ação aqui, matriz §3.6 nota ³): desbloqueia
> Foto e CNPJ (Conta), todo o Dados Gerais menos data do cadastro, e Sobre — Documentação e
> Financeiro seguem sempre travados. Para o `CLIENTE`, o mesmo botão desbloqueia Foto e Senha
> (Conta), Dados Gerais e Sobre; CNPJ vem do cadastro e nunca é editável por ele. "Verificar
> CNPJ" e "Alterar Status" (§3.5) são ações à parte, do `ADMIN` e do `ANALISTA`. "Adicionar
> Créditos" bônus é exclusiva do `ADMIN` (matriz §3.6) — distinta da compra paga que o próprio
> `CLIENTE` faz em `/client/profile/{uuid}/billing`.

### 4.3 Perfil do Prestador (`/provider/profile/{uuid}`)
- [ ] **Conta**: ID sequencial autogerado · **email (login)** · CPF · senha · status de acesso
- [ ] **Foto do perfil** (upload)
- [ ] **Dados Gerais**: nome completo · email · telefone · endereço · cidade · estado ·
      aceite de termos · "já tem CNPJ?" · data do cadastro
- [ ] **Documentação** *(visível só para o time Serviços Já! e para o próprio prestador)*:
      CNPJ · status do CNPJ · razão social · CNAE principal + descrição · atividades
      secundárias · **documento de identificação (RG ou CNH)** ·
      **documentos de experiência** (anexos)

> 🔒 **O Cliente nunca vê os documentos do prestador** (RG/CNH, comprovantes de experiência).
> Vê **foto do perfil, habilidades, "sobre"** e os **dados de contato** (nome, telefone e email).
> A plataforma **atesta** a validação documental em vez de repassar dado pessoal sensível —
> postura defensável em LGPD — mas libera o contato para que as partes possam combinar a
> execução, já que não há chat no MVP.
>
> *Aplicado a partir da **seleção** do prestador, que é o ponto onde a relação contratual nasce
> e o contato passa a ser necessário. Se você quiser liberar já na candidatura, é só dizer.*

> 🔒 **No sentido inverso, o Prestador vê o contato do Cliente** (decidido em 17/09/2026, ver
> `Figma.log` Sessão 8) — uma terceira visão de `/client/profile/{uuid}`
> (`ClientProfileProvider.jsx`), só com Nome, Responsável, Telefone, Email e "Sobre" da empresa,
> tudo somente leitura, sem Conta/Documentação/Financeiro/Contratos. Alcançável **somente pelo
> Prestador selecionado e com contrato ativo** com esse Cliente — não antes da seleção, não
> depois de `Cancelado`. Espelha a regra acima e resolve o mesmo furo de comunicação (sem chat
> no MVP), agora na direção Prestador → Cliente. *Janela exata de "ativo" (se some ao fim do
> contrato ou continua após `Pago`/`Finalizado`) segue como assumida pela sessão que definiu a
> tela — confirmar se precisar de um corte mais estrito.*
- [ ] **Habilidades**: áreas de atuação · nível de conhecimento por área ·
      "já atuou como terceirizado?"
- [ ] **Contratos**: histórico
- [ ] **Sobre**: biografia do prestador
- [ ] ❌ **Sem painel de gestão de crédito** — o prestador não compra crédito, não vê taxa nem
      saldo da plataforma (isso é exclusivo do Cliente, §4.4). O dashboard (`/dashboard`) mostra
      pra ele um **resumo de pagamentos, só leitura** — ganhos do mês, valores recebidos (NF
      paga) e a receber (aguardando pagamento final) — decidido em 18/09/2026: não é o mesmo
      painel financeiro do Cliente, só reflete o que ele recebe após a NF aprovada

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

#### Visualização (`/contracts/{uuid}` — compartilhada entre Cliente e Prestador, ver `Figma.log` §13)
Tudo acima em leitura, **mais** (visível só ao Cliente/`ADMIN`):
- [ ] Percentual e **valor da taxa de serviço** (= valor total × taxa). O percentual é
      **congelado na publicação** conforme a faixa vigente do cliente (§2.2)
- [ ] **Nota Fiscal emitida pelo prestador** (anexo) e **data de aprovação da NF**
- [ ] **Candidaturas**: candidato · nível · hora da candidatura · selecionar →
      grava `Selecionado` + `Data de Seleção`

#### Cardinalidade
**1 contrato : 1 prestador.** Várias candidaturas, **uma única seleção**.

#### 🔒 Campos calculados — imutáveis por qualquer papel

Estes valores **nunca** são editáveis, nem pelo `ADMIN`. São sempre derivados:

| Campo derivado | Calculado a partir de |
|---|---|
| `valor_total` *(Diária)* | nº de diárias × valor por dia |
| `valor_dia` *(Empreitada)* | valor total ÷ dias do período |
| quantidade de diárias / dias de trabalho | as datas registradas em `dia_contrato` |
| `percentual_taxa` | faixa vigente do cliente, congelada na publicação (§2.2) |
| `valor_taxa` | `valor_total` × `percentual_taxa` |
| dias agenciados do mês | agregação de `dia_contrato` (§2.2) |
| `saldo_disponivel` / `saldo_reservado` | soma das linhas de `transacao_credito` |
| IDs, data de cadastro, data de seleção, data de aprovação da NF | o próprio evento |

**Campos de entrada** (editáveis conforme o papel e o estado): tipo de contrato, tipo de
serviço, localização, datas, valor por dia *(Diária)* ou valor total *(Empreitada)*, dias de
trabalho e folga, condições de operação, cursos, habilidades e descrição.

> A UI deve exibir os derivados como **somente leitura**, e a API deve **ignorar ou rejeitar**
> esses campos no corpo da requisição — não basta desabilitar o input no front.

> **Quem edita o quê em `/contracts/{uuid}`** (decidido em 17/09/2026, ver `Figma.log` §14):
> ser um campo de entrada não significa que todo papel o edita ali. Na tela de visualização, o
> Cliente só altera Descrição, Cursos exigidos, Habilidades desejadas e Dias de falta; o
> `ADMIN`/`ANALISTA` só altera Status, Tipo de Serviço, o valor de entrada (por dia ou total) e
> a Nota Fiscal. Tipo de contrato e Localização não são editáveis por ninguém depois de
> publicado. Dias de trabalho/folga têm ação própria ("Adicionar Dias"), separada da edição
> geral do contrato.

### 4.6 Mural de Oportunidades (`/provider/opportunities`)
- [ ] Listagem de contratos abertos em cards (logo da empresa, ID, tipo, descrição)
- [ ] Filtros: **tipo de contrato** (Diária/Empreitada) e **tipo de serviço**
- [ ] Candidatura ao contrato
- [ ] Campo **Promocode** → ⏸️ backlog (§8)
- [ ] **Favoritar contrato** → ⏸️ backlog (§8) — o dashboard do Prestador (18/09/2026) já reserva
      um card de "Contratos Favoritos", mas não há botão de favoritar no mural nem endpoint
      ainda; entra junto quando essa tela ganhar o recurso

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
1. Cria a conta (/register/client) → completa o perfil, já autenticado
   (/register/client/complete) → validação de CNPJ → acesso Liberado
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
1. Cria a conta (/register/provider) → completa o perfil, já autenticado
   (/register/provider/complete): CPF, CNPJ/MEI, habilidades, áreas de atuação, experiência →
   documentos → acesso Liberado
2. Consulta o mural (/provider/opportunities)
3. Candidata-se a um contrato
4. É selecionado
5. Executa o serviço (aprova ou contesta faltas registradas)
6. Emite e anexa a Nota Fiscal
7. Recebe o valor após a aprovação da NF
```

---

## 6. Especificações Técnicas

### 6.1 Stack

| Camada | Tecnologia | Observações |
|---|---|---|
| **Frontend** | React + Vite | Em andamento |
| **CSS** | Tailwind CSS v4 | **Em uso** desde 17/09/2026 (config CSS-first, `@theme`) — telas de cadastro ainda em CSS puro por página |
| **Roteamento** | react-router-dom v7 | **Em uso** desde 17/09/2026 (`router.jsx`, `RequireAuth`) |
| **Ícones** | lucide-react | **Em uso** — não estava na stack original, ver `CLAUDE.md` Regra 2 |
| **Backend** | Java + Spring Boot | API RESTful, arquitetura em camadas |
| **Banco** | **PostgreSQL** | Modelagem relacional normalizada |
| **Segurança** | Spring Security + JWT + BCrypt | Acesso controlado por Roles |
| **Testes** | JUnit 5 (back) / Jest (front) | **Cobertura mínima de 70% — obrigatória** |
| **Versionamento** | Git + GitHub | Repositório público, branch por funcionalidade |
| **Hospedagem front** | Vercel ou GitHub Pages | TBD |
| **Hospedagem back** | TBD | Necessário servidor para Java |

### 6.2 Rotas (conforme Figma)

**Site institucional**: `/` (Home + About + Details) · `/business` (Empresas) · `/partners` (Prestadores MEI)

**Aplicação**: `/login` · `/register/client` · `/register/client/complete` ·
`/register/provider` · `/register/provider/complete` · `/client/contracts/new` ·
`/contracts/{uuid}` · `/provider/opportunities` · `/client/profile/{uuid}` ·
`/client/profile/{uuid}/billing` · `/provider/profile/{uuid}` · `/admin` *(backlog)*

⚠️ **Cadastro em duas etapas** (decisão de 17/09/2026, ver `Figma.log` Sessão 11):
`/register/client` e `/register/provider` só criam a conta (login) — campos simplificados.
`/register/client/complete` e `/register/provider/complete` completam o perfil, já autenticado
(exigem login e o papel dono da conta), e não têm frame próprio no Figma — são as telas de
cadastro completo que o design já desenhava para `/register/client`/`/register/provider`,
só que agora acessadas depois da conta existir.

Breakpoints desenhados: **Desktop 1440px** e **Mobile 375px**.

### 6.3 Banco de Dados (estrutura conceitual)

| Tabela | Conteúdo |
|---|---|
| `usuario` | `login` (CNPJ, CPF ou email), senha, `role`, status de acesso, data de cadastro |
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
| `log_auditoria` | quem fez o quê, quando e sobre qual registro — obrigatório para toda ação de `ADMIN` |
| `apuracao_taxa_mensal` | por cliente/mês: dias agenciados apurados (agregação de `dia_contrato`) e **faixa vigente no mês seguinte** |

**~18 tabelas.** Convenções em `CLAUDE.md`. Transações ACID obrigatórias em toda movimentação
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

### Adiado em 15/09/2026
- ⏸️ **Login por CNPJ / CPF**. No MVP a credencial é **email + senha** para todos os papéis.
- ⏸️ **Vários usuários por empresa cliente**, com papéis distintos (`CLIENTE_ADMIN` /
  `CLIENTE_ANALISTA`). Exige o vínculo `usuario_cliente`, fluxo de convite e telas de gestão de
  equipe — nada disso existe no Figma. No MVP vale **um login por empresa**.

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
- ⏸️ **Favoritar contrato** — botão no mural de oportunidades (§4.6) para o Prestador marcar um
  contrato sem se candidatar ainda; sem UI, endpoint ou modelo de dados hoje

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
- [ ] **Mecanismo de autorização**: enum `role` + `@PreAuthorize`, ou tabela de permissões
      configurável? *(adiado na Sessão 3 — "vamos verificar depois")*
- [ ] **Auditoria das ações de `ADMIN`** — confirmar `log_auditoria` e a regra de que recálculo
      financeiro após a seleção gera lançamento compensatório, nunca ajuste silencioso.
- [ ] **Endereço da obra** — o contrato só tem cidade e estado. Falta o endereço de execução,
      necessário agora que as partes se falam direto.

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

- **`CLAUDE.md`** — convenções de código e regras de trabalho
- **`BACKEND_ANALISE.md`** — diagnóstico do repositório do backend, o que já foi implementado no
  front e o backlog de endpoints por módulo
- **Figma**: `ONnLf1dmAXa8SsZfIzYd4p` — protótipo
- **`Figma.log`** — histórico de decisões e o "porquê" de cada uma. **Local, não versionado**
  (decisão de 17/09/2026) — existe só nesta máquina, não é sincronizado entre repositórios.
  Nenhuma regra deste PRD depende dele.

### Repositórios
| Repo | Conteúdo |
|---|---|
| `Servico_Ja` | frontend React + Vite · **originais** de `PRD.md`, `BACKEND_ANALISE.md` |
| `Servco-Ja-Back` | API Spring Boot · **cópias** dos mesmos dois documentos |

⚠️ Ao mudar uma regra de negócio, atualize **os dois repositórios no mesmo dia**. Foi a
divergência entre eles que fez o backend nascer sobre o modelo errado.

---

**Nota**: este PRD é vivo. Qualquer mudança deve ser comunicada ao time. Em caso de divergência
entre este documento e o Figma, **este documento prevalece** — o Figma é protótipo.
