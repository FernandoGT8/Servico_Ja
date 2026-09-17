# Análise do Backend — `Servco-Ja-Back`

**Data**: 15/09/2026
**Repositório**: `github.com/FernandoGT8/Servco-Ja-Back`
**Commits**: 3 (`Primeiros passos` → `Implementar autenticação JWT` → `Atualizar configurações do banco`)
**Referência**: `PRD.md` (fonte de verdade das regras de negócio) · este arquivo (fonte de
verdade do que está implementado e do backlog de endpoints). `Figma.log` (histórico de decisões
e o "porquê" de cada uma) é **local, não versionado** — útil como contexto extra para quem tem o
arquivo à mão, mas nenhuma regra aqui depende dele: tudo que importa para o backend está escrito
diretamente nas seções abaixo.

---

## 1. O que existe hoje

Spring Boot com estrutura em camadas, 16 arquivos Java, **uma única entidade**:

```
config/SecurityConfig.java      BCrypt + CORS
controller/UsuarioController.java  8 endpoints
dto/                            4 DTOs (login, registro, response)
entity/Usuario.java             ENTIDADE ÚNICA
entity/TipoUsuario.java         enum ADMIN | CORPORACAO | TRABALHADOR
exception/UsuarioJaExisteException.java
repository/UsuarioRepository.java
security/JwtService.java        gera e valida tokens
security/SecurityFilter.java    SecurityFilterChain
service/UsuarioService.java     registro, login, ativar/desativar, listagens
validator/DocumentoValidator.java  CPF e CNPJ por dígito verificador
resources/db/schema.sql         1 tabela
```

**Cobertura funcional**: cadastro e login. Nada de contrato, crédito, candidatura, nota fiscal
ou apuração — ou seja, **o núcleo do produto ainda não começou**.

---

## 2. O que o backend CONFIRMA das decisões que tomamos

Boa notícia primeiro: o que está feito não contraria o modelo fechado nas sessões 1–3.

| Decisão | Situação no código |
|---|---|
| **Login por email** (decisão 25) | ✅ já é assim — `email` é `UNIQUE` e `autenticar()` busca por email. **Zero retrabalho.** |
| **Roles em vez de herança de classes** | ✅ `TipoUsuario` é um enum simples numa coluna. Nenhuma herança JPA foi usada — exatamente o que recomendamos. |
| **Auditoria das ações de ADMIN** | ✅ embrião pronto: `criado_por` e `atualizado_por` já existem na tabela |
| **Stack do PRD §6.1** | ✅ Spring Boot + PostgreSQL + JWT + BCrypt + camadas controller→service→repository→entity |
| **Convenções do CLAUDE.md** | ✅ pacotes `br.com.servicoja.*`, tabela `snake_case` singular, índices `idx_tabela_coluna` |
| **Validação de CPF/CNPJ** | ✅ `DocumentoValidator` implementa os dígitos verificadores corretamente, sem dependência externa |

**`DocumentoValidator` é a peça mais bem resolvida do repositório** — aproveitável inteira,
sem mudanças.

---

## 3. Problemas encontrados

### 🔴 Crítico

#### 3.1 A segurança está desligada
`SecurityFilter.java`:
```java
.authorizeHttpRequests(authz -> authz
    .anyRequest().permitAll()
)
```
**Todos os endpoints são públicos.** O JWT é **gerado** no login, mas nunca verificado:
`JwtService.validateToken()`, `getEmailFromToken()` e `getUserIdFromToken()` **não são chamados
em lugar nenhum** do projeto, e não há filtro (`OncePerRequestFilter`) registrado na cadeia.

Consequências concretas, hoje, sem token nenhum:
- `PUT /api/usuarios/{id}/desativar` — **qualquer pessoa desativa qualquer usuário**
- `GET /api/usuarios/tipo/CORPORACAO` — **dump de todos os clientes**
- `GET /api/usuarios/email/{email}` — **enumeração de contas por email**

A autenticação existe de fachada. **Nada disso pode ir para produção**, e a matriz de permissões
do `PRD.md` §3.6 não tem onde se apoiar enquanto isso não for corrigido.

#### 3.2 Credenciais commitadas e publicadas
`src/main/resources/application.properties` está **versionado e no GitHub**:
```properties
spring.datasource.password=123@Pimenta
jwt.secret=sua_chave_super_secreta_aqui_mude_em_producao_com_min_32_caracteres_segura_123456
```
O `.gitignore` até ignora `application-local.properties` e `application-dev.properties` — mas
não o arquivo principal, que é justamente o que tem os segredos.

Com o `jwt.secret` conhecido, **qualquer pessoa forja um token válido** para qualquer usuário.

**O que fazer**:
1. Trocar a senha do Postgres e gerar um novo `jwt.secret`
2. Mover os dois para variáveis de ambiente: `${JWT_SECRET}`, `${DB_PASSWORD}`
3. Adicionar `application.properties` ao `.gitignore` e versionar um
   `application.properties.example` sem valores
4. Remover do histórico do Git (`git filter-repo` ou BFG) e forçar o push — trocar a senha
   sozinho não basta, o valor antigo continua no histórico público

---

### 🟠 Alto

#### 3.3 O modelo de dados não comporta o produto
Existe **1 tabela**. O `PRD.md` §6.3 pede **~18**. E a tabela existente segue um padrão que vai
atrapalhar: `usuario` acumula os campos dos dois perfis como colunas anuláveis
(`cnpj`, `razao_social`, `cpf`, `data_nascimento`), sem nenhuma restrição garantindo que um
`CORPORACAO` tenha CNPJ e um `TRABALHADOR` tenha CPF — a validação existe só no service.

O modelo fechado separa `usuario` (credencial + papel + status) de `cliente` e `prestador`
(dados de negócio), porque o prestador tem CNAE, habilidades, documentos e biografia que não
cabem numa tabela compartilhada.

Faltam inteiras: `contrato`, `dia_contrato`, `candidatura`, `conta_credito`,
`transacao_credito`, `nota_fiscal`, `apuracao_taxa_mensal`, `documento`, `habilidade`,
`prestador_habilidade`, `curso`, `tipo_servico`, `log_auditoria`.

#### 3.4 Duas fontes de verdade para o schema
`spring.jpa.hibernate.ddl-auto=update` **e** um `db/schema.sql` que não está ligado a nada
(não há `spring.sql.init.*` configurado). O Hibernate vai criar e alterar tabelas sozinho a
partir das entidades, e o `.sql` vira documentação que envelhece em silêncio.

Num projeto cujo entregável inclui um diagrama ER defendido numa banca, isso é um problema.
**Recomendação**: migração versionada (Flyway) e `ddl-auto=validate`. É dependência nova —
precisa do seu OK antes.

#### 3.5 Papéis desatualizados
```java
ADMIN("Administrador")
CORPORACAO("Empresa Contratante")
TRABALHADOR("Empresa Prestadora")   // ← descrição errada
```
O modelo fechado tem **4 papéis**: `ADMIN` · `ANALISTA` · `CLIENTE` · `PRESTADOR`.
Falta o `ANALISTA`, e a descrição `"Empresa Prestadora"` contradiz a regra nº 1 do `CLAUDE.md`:
**o prestador é sempre individual**, nunca empresa com funcionários.

#### 3.6 `ativo` booleano não expressa o status de acesso
O PRD define três estados — `Pendente` · `Liberado` · `Bloqueado` — e `Pendente` tem regra
própria (navega, mas não transaciona). Um booleano não representa isso.

#### 3.7 O token não carrega o papel
```java
.subject(email).claim("userId", userId)
```
Sem `role` no token, cada request protegido precisaria ir ao banco só para descobrir o papel.
Quando a autorização for implementada, a claim precisa entrar.

#### 3.8 Zero testes
Nenhum arquivo de teste, embora `spring-boot-starter-test` e `spring-security-test` já estejam
no `pom.xml`. A meta obrigatória é **70% de cobertura** (`PRD.md` §6.1).

`DocumentoValidator` é o melhor ponto de partida: lógica pura, sem dependências, alto valor por
teste escrito.

---

### 🟡 Médio

#### 3.9 Bug — email duplicado devolve HTTP 500
`UsuarioJaExisteException extends RuntimeException`, mas o controller só trata
`IllegalArgumentException | IllegalStateException`:
```java
} catch (IllegalArgumentException | IllegalStateException e) {
    return ResponseEntity.badRequest().body(...);
} catch (Exception e) {
    return ResponseEntity.status(500).body(errorResponse("Erro ao registrar usuário"));
}
```
Cadastrar com email, CPF ou CNPJ já existente cai no `catch` genérico e retorna
**500 "Erro ao registrar usuário"** em vez de **409 Conflict** com a mensagem real. O usuário
final não descobre que o problema é o email repetido.

#### 3.10 Validação de CNPJ é só o dígito verificador
`DocumentoValidator.validarCNPJ()` confere se o número é bem-formado — não se o CNPJ está
**ATIVO / INAPTO / BAIXADO**, que é o que o PRD exige e o que preenche razão social, CNAE e
endereço automaticamente. A consulta à Receita ainda não existe.

Vale lembrar que o papel `ANALISTA` foi criado justamente para o fallback manual **quando essa
API falhar** — hoje só existe o fallback, não a API.

#### 3.11 Padronização
- `@Autowired` em campo no controller, injeção por construtor no service — escolher um
- `try/catch` repetido em cada método do controller → `@RestControllerAdvice` centraliza
- `Usuario.java` tem ~100 linhas de getters/setters manuais apesar de o **Lombok já estar no
  `pom.xml`** e a classe já usar `@NoArgsConstructor`/`@AllArgsConstructor` — `@Getter @Setter`
  elimina tudo isso

---

## 4. Ordem sugerida de correção

| # | Ação | Por quê agora |
|---|---|---|
| 1 | Rotacionar segredos, tirar do Git e do histórico | está público; cada dia que passa é pior |
| 2 | Implementar o filtro JWT e fechar os endpoints | sem isso não existe autorização nenhuma |
| 3 | Fechar o diagrama ER e migrar para schema versionado | tudo o que vem depois depende do modelo |
| 4 | Ajustar papéis (4), status de acesso (3 estados) e claim de `role` | base da matriz de permissões |
| 5 | Corrigir o 500 do cadastro duplicado | bug de 5 minutos, afeta a primeira tela que o usuário vê |
| 6 | Testes de `DocumentoValidator` e `UsuarioService` | começa a contar para os 70% |
| 7 | Entidades do núcleo: contrato, crédito, candidatura, dia_contrato | o produto de fato |

---

## 5. Pendência de sincronização

O repositório do backend carrega **cópias desatualizadas** de `PRD.md` (v1.0) e `CLAUDE.md` —
os documentos que descrevem o produto errado (chat, assinatura digital, avaliação bilateral,
disputas, multas). Também há `API_ENDPOINTS.md` e `RESUMO_IMPLEMENTACAO.md` escritos sobre essa
base.

Enquanto os dois repositórios tiverem specs divergentes, alguém vai codar pela versão errada.
Decidir onde a documentação mora — repositório único, submódulo ou cópia sincronizada — antes
de escrever mais código.

---

## 6. Backlog de endpoints — módulo de Contrato (17/09/2026)

O front do módulo de Contrato (`ContractNew.jsx`, `ContractDetailAdmin.jsx`,
`ContractDetailClient.jsx`, `ContractDetailProvider.jsx`) já está implementado e cada ação que
depende do backend está marcada com `TODO` no código — nenhuma delas tem endpoint ainda. Lista
completa, para não perder nenhuma na hora de implementar o núcleo do produto (item 7 da tabela
da seção 4). Decisões de UI referenciadas estão em `Figma.log` §13–§15.

| # | Ação (tela) | Endpoint proposto | Quem chama | Observações |
|---|---|---|---|---|
| 1 | Criar rascunho (`ContractNew`) | `POST /api/contratos` (`status: RASCUNHO`) | `CLIENTE` | Body: tipo, tipoServico, cidade, estado, datas, valor de entrada (por dia ou total), dias de trabalho/folga, operação (6 booleanos), cursos, habilidades, descrição estruturada (4 campos). API **calcula e ignora no request** o valor oposto, `quantidadeDiarias` e `percentualTaxa` (congelado pela faixa vigente do cliente, PRD §2.2) — regra 13. |
| 2 | Publicar contrato (`ContractNew`) | mesmo endpoint, `status: AGUARDANDO_PRESTADORES` | `CLIENTE` | Mesmo body do #1; só muda o status de gravação. |
| 3 | Buscar contrato (`ContractDetail*`, as 3 visões) | `GET /api/contratos/{uuid}` | `CLIENTE` dono · `PRESTADOR` (candidatou-se ou vendo o mural) · `ADMIN`/`ANALISTA` | **O backend deve filtrar a resposta por papel** — não mandar `percentualTaxa`/`valorTaxa`/`notaFiscal`/`candidaturas` para quem não é Cliente/Admin (hoje o front só não exibe; o certo é nem vir). |
| 4 | Editar contrato — Cliente (`ContractDetailClient`) | `PUT/PATCH /api/contratos/{uuid}` | `CLIENTE` | Body só com o que esse papel edita: `descricao`, `cursosExigidos`, `habilidadesDesejadas`, `diasFalta`. API rejeita qualquer outro campo. |
| 5 | Editar contrato — Admin (`ContractDetailAdmin`) | mesmo endpoint | `ADMIN`/`ANALISTA` | Body: `status` (um dos 8 estados do ciclo de vida, PRD §4.7 — **sem validação de transição no front**, o backend decide o que é permitido), `tipoServico`, o valor de entrada (por dia ou total), `notaFiscal` (upload). Toda edição de `ADMIN` gera `log_auditoria` (regra 14). |
| 6 | Adicionar dias (`ContractDetailAdmin`/`ContractDetailClient`) | `POST /api/contratos/{uuid}/dias` | `CLIENTE` ou `ADMIN`/`ANALISTA` | Modal pede uma nova `dataEncerramento` e estende o contrato. **Regras confirmadas em 17/09/2026**: (1) permitido em qualquer status que não seja final (`Concluído`/`Pago`/`Cancelado` — front já desabilita o botão nesses casos, mas o backend deve validar de novo); (2) não altera nenhum `dia_contrato` já registrado; (3) **Diária**: `valor_total` é campo calculado, então atualiza sozinho conforme novos `dia_contrato` do tipo `TRABALHO` forem registrados no período estendido — nenhum recálculo manual aqui; (4) **Empreitada**: `valor_total` é fechado, então o body também carrega `valorAdicionalDias` (valor do período restante) que o backend **soma** ao `valor_total` existente. O front só captura os dois campos (`novaDataEncerramento`, `valorAdicionalDias` quando Empreitada) e não faz nenhuma dessas contas — fica tudo a cargo do backend. |
| 7 | Candidatar-se (`ContractDetailProvider`) | `POST /api/contratos/{uuid}/candidaturas` | `PRESTADOR` | Exige status de acesso `Liberado` e contrato em `Aguardando Prestadores`. |
| 8 | Selecionar prestador (`ContractDetailAdmin`/`ContractDetailClient`) | `POST /api/contratos/{uuid}/candidaturas/{candidaturaId}/selecionar` | `CLIENTE` ou `ADMIN`¹ | Ação financeira irreversível: reserva `RESERVA_SERVICO` + `RESERVA_TAXA` (regra 5/§2.1), exige saldo ≥ serviço + taxa, grava `Selecionado` + `Data de Seleção`. Em nome do Cliente por `ADMIN` exige `log_auditoria`. |
| 9 | Pagamento final (`ContractDetailAdmin`) | `POST /api/contratos/{uuid}/pagamento-final` | `ADMIN`/`ANALISTA` | Aprova a NF, libera `LIBERACAO_PRESTADOR` e cobra `COBRANCA_TAXA` no mesmo evento (PRD §4.7 estado 7, regra 5). Front hoje só habilita o botão se houver arquivo de NF anexado — o backend deve validar de novo, não confiar só na UI. |
| 10 | Finalizar contrato (`ContractDetailAdmin`) | `POST /api/contratos/{uuid}/finalizar` | `ADMIN`/`ANALISTA` | Fecha a execução, status final (PRD §4.7 estado 5). |
| 11 | Catálogo de tipos de serviço | `GET /api/tipos-servico` | qualquer autenticado | Hoje é a constante local `TIPOS_SERVICO` em `src/data/catalogos.js`. Editável pelo `ADMIN` quando `/admin` (backlog) existir. |
| 12 | Catálogo de cursos | `GET /api/cursos` | qualquer autenticado | Idem, constante `CURSOS` no mesmo arquivo. |

¹ mesma observação de rodapé da matriz do `PRD.md` §3.6: ação de `ADMIN` em nome de terceiro
exige registro em `log_auditoria`.

---

## 7. Backlog de endpoints — módulo de Perfil do Cliente (17/09/2026)

`ClientProfile.jsx` virou um dispatcher (`ClientProfileAdmin.jsx` / `ClientProfileClient.jsx`),
mesmo padrão do módulo de Contrato (seção 6). Cada ação já está marcada com `TODO` no front — sem
endpoint ainda. Decisões de UI referenciadas estão em `Figma.log` Sessão 7.

| # | Ação (tela) | Endpoint proposto | Quem chama | Observações |
|---|---|---|---|---|
| 1 | Buscar perfil (`ClientProfileAdmin`/`ClientProfileClient`/`ClientProfileProvider`) | `GET /api/clientes/{uuid}` | `CLIENTE` dono · `ADMIN`/`ANALISTA` · `PRESTADOR` selecionado e ativo | O código anterior lia dados do usuário **logado** em vez do Cliente **sendo visto** (bug de origem, ver `Figma.log` Sessão 7 nota 45) — o backend deve devolver o Cliente do `{uuid}`, não o usuário do token. **Filtrar por papel**: campos de Documentação completos (endereço, CNAE, atividades secundárias) e Segmento/Tipos de Profissional só para `ADMIN`/`ANALISTA` — a visão do `CLIENTE` é mais enxuta (PRD §4.2). Para `PRESTADOR`, devolver **só** nomeEmpresa/responsavel/telefone/emailCorporativo/sobre — nunca Documentação, Financeiro ou Contratos — **e apenas se ele estiver selecionado e com contrato ativo com esse Cliente** (PRD §4.3/regra 16, `Figma.log` Sessão 8); caso contrário, 403/404. Essa checagem de "selecionado e ativo" (candidatura com `selecionado = true` num contrato cujo status não seja `Cancelado`) ainda não tem definição de corte exata — ver nota da Sessão 8 sobre o que conta como "ativo". |
| 2 | Editar perfil — Admin (`ClientProfileAdmin`) | `PUT/PATCH /api/clientes/{uuid}` | `ADMIN` (não `ANALISTA` — PRD §3.6 nota ³) | Body só com o que esse papel edita: foto, `cnpj`, `dadosGerais` (nome, segmento, tiposProfissional, responsável, telefone, emailCorporativo), `sobre`. API rejeita Documentação/Financeiro/data de cadastro no corpo. Edição de `ADMIN` em perfil de terceiro gera `log_auditoria` (regra 14). |
| 3 | Editar perfil — Cliente (`ClientProfileClient`) | mesmo endpoint | `CLIENTE` dono | Body só com foto, senha, `dadosGerais` (nome, responsável, telefone, emailCorporativo), `sobre`. `cnpj` nunca entra — vem do cadastro; API rejeita se vier no corpo. |
| 4 | Verificar CNPJ (`ClientProfileAdmin`) | `POST /api/clientes/{uuid}/verificar-cnpj` | `ADMIN`/`ANALISTA` | Integra com **sintegrapi.com.br** (10 consultas grátis/mês, tempo real da Receita) como principal e **brasilapi.com.br** (grátis, sem limite, até 45 dias de atraso) como fallback quando o limite mensal estourar. Grava o resultado em Documentação — nunca editável manualmente (regra 13/PRD §4.5). |
| 5 | Alterar status de acesso (`ClientProfileAdmin`) | `PUT /api/clientes/{uuid}/status` | `ADMIN`/`ANALISTA` | Body: `novoStatus` (`Pendente`/`Liberado`/`Bloqueado`). Mover para `Liberado` exige validar CNPJ `ATIVO` **e** Capital Social mínimo de R$ 10.000 (PRD §3.5) — o front só envia o destino escolhido, quem valida é o backend. Gera `log_auditoria`. |
| 6 | Adicionar créditos bônus (`ClientProfileAdmin`) | `POST /api/clientes/{uuid}/creditos/bonus` | `ADMIN` (não `ANALISTA`) | Body: `valor`. Grava uma linha em `transacao_credito` **sem cobrança** (tipo a definir, ex. `BONUS_ADMIN`) — distinta da compra paga que o próprio Cliente faz em `/client/profile/{uuid}/billing` (`ClientBilling.jsx`, já coberta pela seção 4.4 do PRD). Gera `log_auditoria` (regra 14). |

Nenhum desses seis pontos está implementado hoje — a única entidade que existe é `usuario`
(seção 1), sem `cliente` nem `transacao_credito`. Entram junto com a seção 4 item 7 (entidades do
núcleo).

---

## 8. Backlog de endpoints — Cadastro em duas etapas (17/09/2026)

### O que já foi implementado no front

O cadastro de Cliente e Prestador foi dividido em duas telas — a conta é criada primeiro
(nome/telefone/email/senha), o resto do perfil é preenchido depois, já autenticado:

- **Primeira etapa** (`pages/FirstRegister/`) — `FirstRegisterClient.jsx` e
  `FirstRegisterProvider.jsx`, rotas `/register/client` e `/register/provider`. Só criam a
  conta: chamam `POST /api/usuarios/registrar` (já existe, sem mudança de contrato) + login
  automático, e navegam para a segunda etapa.
- **Segunda etapa** (`pages/Register/`) — `RegisterClient.jsx` e `RegisterProvider.jsx`, rotas
  `/register/client/complete` e `/register/provider/complete` (protegidas: exigem estar
  autenticado com o papel `CLIENTE`/`PRESTADOR`, respectivamente). Completam o resto do perfil,
  mas **ficaram sem endpoint algum** — só a criação de conta da primeira etapa é uma chamada
  real hoje.
- Cada etapa tem sua própria pasta com um `*Fields.jsx` (átomos de UI: campo de texto, select,
  radio, checkbox) e um `*fieldsUtils.js` (classes Tailwind compartilhadas) — puramente
  organização de front, não afeta contrato de API.
- Bug corrigido de passagem: o Prestador mandava `tipo: 'TRABALHADOR'` no cadastro (não existe
  no enum); agora manda `'PRESTADOR'`.

### O que falta implementar no backend

| # | Ação (tela) | Endpoint | Quem chama | Observações |
|---|---|---|---|---|
| 1 | Criar conta (`FirstRegisterClient`/`FirstRegisterProvider`) | `POST /api/usuarios/registrar` (já existe) | público | Sem mudança de contrato: `nome`, `email`, `telefone`, `senha`, `senhaConfirm`, `tipo` (`CLIENTE`/`PRESTADOR`). O front só passou a chamar isso **antes** de coletar o resto do perfil — não depois. |
| 2 | Completar perfil do Cliente (`RegisterClient`, `/register/client/complete`) | `PATCH /api/clientes/{uuid}` (mesmo endpoint da seção 7, ação 2/3) | `CLIENTE` dono, recém-criado (status `Pendente`) | Body: segmento, tipoProfissionalInteresse, cargo, nomeEmpresa, cnpj, tamanhoOperacao, jaTrabalhaTerceirizados, motivoCadastro. Preenche Dados Gerais/Documentação do PRD §4.2 pela primeira vez — depois disso o fluxo normal de edição (seção 7) assume. |
| 3 | Completar perfil do Prestador (`RegisterProvider`, `/register/provider/complete`) | `PATCH /api/prestadores/{uuid}` (endpoint novo, ainda não coberto por nenhuma seção) | `PRESTADOR` dono, recém-criado (status `Pendente`) | Body: cpf, estado, cidade, meiCnpj/cnpj, clt, disponibilidade, areaAtuacao (até 5), experiencia, nivelConhecimento, terceirizado, motivo. Sem entidade `prestador` ainda (só `usuario`, seção 1) — entra junto com o núcleo (seção 4 item 7). |

Front hoje não chama nenhum dos itens 2/3 de verdade — `handleCompleteProfile` nas duas telas é
`TODO` e só navega para a Home do papel (`getHomeRoute`), igual ao padrão já usado no restante do
módulo de Perfil (seção 7).
