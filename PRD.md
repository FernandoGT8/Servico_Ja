# PRD - Serviço Já
**Product Requirements Document**

**Data**: 06/09/2026  
**Versão**: 1.0  
**Status**: Em Desenvolvimento  
**Deadline**: 31/10/2026

---

## 1. Visão Geral

### Missão
Conectar empresas que precisam de serviços com outras empresas que prestam serviços, criando um marketplace B2B confiável, seguro e eficiente.

### Problema
Empresas enfrentam dificuldades para encontrar prestadores de serviços especializados de forma rápida e segura, sem riscos de fraude ou descumprimento de contrato.

### Solução
Uma plataforma web que centraliza a busca, negociação, contratação e pagamento de serviços entre empresas, com validações rigorosas, contratos digitais e sistema de avaliação bilateral.

---

## 2. Público-Alvo

### Portais e Papéis

#### 2.1 Administrador
- **Quem**: Time de desenvolvimento do projeto
- **Acesso**: Exclusivo, painel administrativo privado
- **Responsabilidades**:
  - Gerenciar categorias de serviços
  - Monitorar e resolver disputas entre usuários
  - Validar dados de empresas (CNPJ)
  - Auditar transações
  - Gerenciar suporte e atendimento

#### 2.2 Corporação (Empresa Contratante)
- **Quem**: Empresas que precisam de serviços
- **Fluxo**:
  - Cadastro e validação de CNPJ
  - Busca por prestadores com filtros
  - Solicitação de serviços
  - Negociação e contratação
  - Pagamento e avaliação

#### 2.3 Trabalhador (Empresa Prestadora)
- **Quem**: Empresas que prestam serviços
- **Fluxo**:
  - Cadastro com validação de CPF/CNPJ
  - Publicação de serviços/especialidades
  - Resposta a solicitações com propostas
  - Execução de serviços
  - Recebimento e avaliação

---

## 3. Escopo

### Funcionalidades Principais (MVP Completo)

#### 3.1 Autenticação e Cadastro
- [ ] Login e cadastro para 3 portais distintos
- [ ] Validação de CNPJ (formato + regularidade)
- [ ] Validação de CPF
- [ ] Cadastro em 2 fases:
  - **Fase 1**: Cadastro simples (acesso ao site, busca)
  - **Fase 2**: Perfil completo (podem solicitar/prestar serviços)
- [ ] Recuperação de senha
- [ ] JWT para autenticação (sugestão técnica)

#### 3.2 Gestão de Categorias e Filtros
- [ ] Plataforma escalável para qualquer categoria de serviço
- [ ] Tipos de profissionais/especialidades (a definir conforme evolução)
- [ ] Filtros avançados de busca:
  - Categoria de serviço
  - Preço (mín/máx)
  - Localização/região
  - Tempo de execução
  - Avaliação/rating
  - Disponibilidade

#### 3.3 Sistema de Busca e Matching
- [ ] Busca por categoria + especialidade
- [ ] Publicação de serviços por prestadores
- [ ] Matching/recomendação (critério a definir)
- [ ] Visualização detalhada de prestador:
  - Portfolio/histórico de serviços
  - Avaliações e reviews
  - Disponibilidade
  - Preços

#### 3.4 Ciclo de Vida de um Serviço

**Estados possíveis:**
1. **Aberto** — Corporação criou solicitação, aguardando propostas
2. **Proposta Recebida** — Trabalhador(es) enviou(ram) proposta(s)
3. **Negociando** — Em contato via chat
4. **Contrato Aceito** — Ambos assinaram o contrato digital
5. **Em Execução** — Serviço sendo realizado
6. **Concluído** — Finalizado, aguardando pagamento/avaliação
7. **Pago** — Pagamento confirmado
8. **Avaliado** — Ambos avaliaram
9. **Cancelado** — Cancelamento com multa por quebra de contrato

- [ ] Transições entre estados
- [ ] Rastreamento de progresso
- [ ] Notificações de mudança de estado

#### 3.5 Chat e Comunicação
- [ ] Chat integrado entre Corporação e Trabalhador
- [ ] Histórico de conversa persistente
- [ ] Notificações de mensagens
- [ ] Ativa após match/proposta aceita

#### 3.6 Contratos Digitais e Assinaturas
- [ ] Geração automática de contrato
- [ ] Termos e condições customizáveis
- [ ] Assinatura digital de ambas as partes
- [ ] Armazenamento seguro de contratos
- [ ] Download/visualização de contrato

#### 3.7 Sistema de Pagamento
- [ ] Pagamento via plataforma (nenhum pagamento fora)
- [ ] **TBD com o grupo**:
  - Momento do pagamento (pré, pós, escrow)
  - Processamento (simulado ou integração real com gateway)
  - Fluxo de reembolso
- [ ] Segurança contra fraude
- [ ] Recibos e comprovantes

#### 3.8 Sistema de Avaliação e Reviews
- [ ] Avaliações bilaterais:
  - Corporação avalia Trabalhador
  - Trabalhador avalia Corporação
- [ ] Escala de avaliação (TBD - sugestão: 1-5 estrelas)
- [ ] Comentário obrigatório (TBD)
- [ ] Histórico de avaliações público
- [ ] Sistema de reputação

#### 3.9 Validações e Segurança
- [ ] Validação de CNPJ (verificar se está ativo/regular)
- [ ] Validação de CPF
- [ ] Validação de email (confirmação)
- [ ] Confirmação de telefone (TBD)
- [ ] Validação de dados de empresa
- [ ] Proteção contra fraude
- [ ] Rate limiting para requisições
- [ ] Sanitização de inputs

#### 3.10 Painel Administrativo
- [ ] Dashboard com métricas:
  - Total de usuários
  - Total de serviços
  - Receita/volume
  - Disputas pendentes
- [ ] Gerenciamento de usuários
- [ ] Aprovação/bloqueio de usuários
- [ ] Resolução de disputas (TBD com grupo)
- [ ] Logs de atividades
- [ ] Gerenciamento de categorias

#### 3.11 Cancelamento e Multas
- [ ] Cancelamento permitido em qualquer estado
- [ ] **TBD com o grupo**:
  - Cálculo de multa (% ou valor fixo)
  - Quem recebe a multa (plataforma ou outra parte)
  - Condições de cancelamento sem multa

---

## 4. Fluxos de Usuário

### 4.1 Fluxo: Corporação Solicita Serviço

```
1. Login/Cadastro
2. Completar perfil (Fase 2)
3. Buscar serviço com filtros
4. Visualizar perfis de prestadores
5. Enviar solicitação/RFQ (Request for Quote)
6. Receber propostas de prestadores
7. Negociar via chat
8. Revisar e aceitar contrato
9. Assinar contrato digitalmente
10. Acompanhar execução do serviço
11. Confirmar conclusão
12. Efetuar pagamento
13. Avaliar prestador
14. Finalizador
```

### 4.2 Fluxo: Trabalhador Presta Serviço

```
1. Login/Cadastro
2. Completar perfil (Fase 2)
3. Publicar serviços/especialidades
4. Receber notificações de solicitações
5. Enviar proposta com preço e prazo
6. Negociar via chat
7. Revisar e aceitar contrato
8. Assinar contrato digitalmente
9. Executar serviço
10. Marcar como concluído
11. Receber pagamento
12. Ser avaliado
13. Avaliar corporação
```

---

## 5. Especificações Técnicas

### 5.1 Stack Tecnológico

| Camada | Tecnologia | Observações |
|--------|-----------|------------|
| **Frontend** | React + Vite | Iniciado |
| **CSS** | Tailwind CSS | Configurado |
| **Backend** | Java + Spring Boot | A implementar |
| **Banco de Dados** | PostgreSQL | A configurar |
| **Autenticação** | JWT | Recomendado |
| **Hospedagem Frontend** | Vercel ou GitHub Pages | TBD |
| **Hospedagem Backend** | TBD | Necessário servidor para Java |
| **Comunicação Real-time** | WebSocket ou Polling | Para chat e notificações |

### 5.2 Banco de Dados (Estrutura Conceitual)

**Entidades principais:**
- `users` — Usuários (admin, corporação, trabalhador)
- `empresas` — Dados de empresas/corporações
- `prestadores` — Dados de prestadores
- `categorias` — Categorias de serviços
- `servicos` — Publicação de serviços por prestador
- `solicitacoes` — Solicitações de serviço
- `propostas` — Propostas de prestadores
- `contratos` — Contratos digitais
- `chats` — Mensagens entre partes
- `pagamentos` — Histórico de pagamentos
- `avaliacoes` — Reviews bilaterais
- `disputas` — Registros de disputas

---

## 6. Decisões Pendentes (TBD)

### Críticas (Definir com o Grupo)

- [ ] **Momento do Pagamento**: Pré-pagamento, pós-pagamento, ou escrow?
- [ ] **Integração de Pagamento**: Gateway real (Stripe, PayPal) ou simulado?
- [ ] **Cálculo de Multa**: Percentual? Valor fixo? Escala progressiva?
- [ ] **Resolução de Disputas**: Processo arbitral? Automático? Manual por admin?
- [ ] **Reembolso**: Em que circunstâncias? Retenção de multa?
- [ ] **Limite de Serviços Simultâneos**: Há limite por usuário?
- [ ] **Bloqueio de Usuários**: Após quantas avaliações ruins?

### Secundárias (A Meu Critério)

- [ ] **Escala de Avaliação**: 1-5 estrelas? 1-10? Outra?
- [ ] **Avaliação Obrigatória**: Pode deixar em branco ou é obrigatória?
- [ ] **Notificações**: Email, SMS, push in-app?
- [ ] **Recomendação de Prestadores**: Algoritmo simples ou ML?
- [ ] **Geolocalização**: Usar para sugerir prestadores próximos?

---

## 7. Restrições e Fora do Escopo

### Fora do Escopo (v1)

- [ ] App mobile (web only)
- [ ] Multi-idioma (português apenas)
- [ ] Integração com redes sociais
- [ ] Sistema de referência/afiliação
- [ ] Subscriptions/planos VIP
- [ ] Gestão de RH para prestadores
- [ ] Análise de dados avançada

### Possível Futuro (v2+)

- [ ] App mobile iOS/Android
- [ ] Multi-idioma
- [ ] Integração com gateway de pagamento real
- [ ] Recomendação com ML
- [ ] Notificações push
- [ ] API pública para integrações

---

## 8. Timeline e Milestones

**Deadline Final**: 31/10/2026 (~55 dias a partir de 06/09/2026)

### Sugestão de Milestones

| Marco | Data Sugerida | Entregas |
|-------|---------------|----------|
| **MVP Backend** | 15/09 | Autenticação, CRUD de usuários |
| **MVP Frontend** | 20/09 | Login, cadastro, home |
| **Busca e Filtros** | 25/09 | Sistema de busca funcional |
| **Chat** | 30/09 | Chat integrado |
| **Contratos** | 10/10 | Assinatura digital |
| **Pagamento** | 15/10 | Integração (real ou simulada) |
| **Avaliações** | 20/10 | Sistema de reviews |
| **Admin Panel** | 25/10 | Painel administrativo |
| **Testes e Deploy** | 31/10 | Testes, otimização, deploy |

---

## 9. Equipe

- **Tamanho**: 5 pessoas
- **Perfil**: Generalistas (sem especialistas profundos)
- **Implicação**: Documentação clara, arquitetura simples, comunicação constante

---

## 10. Critérios de Aceitação

O projeto será considerado **completo** quando:

- ✅ Todos os 3 portais funcionarem (Admin, Corporação, Trabalhador)
- ✅ Autenticação com validações implementadas
- ✅ Busca com filtros avançados operacional
- ✅ Chat integrado entre partes
- ✅ Contratos digitais com assinatura
- ✅ Sistema de pagamento (simulado ou real)
- ✅ Avaliação bilateral funcional
- ✅ Admin panel com controle
- ✅ Banco de dados PostgreSQL normalizado
- ✅ Deploy em produção (Vercel + servidor backend)
- ✅ Documentação técnica completa

---

## 11. Próximos Passos

1. **Validar PRD com o grupo** — Revisar todas as funcionalidades e decisões pendentes
2. **Definir decisões TBD** — Especialmente pagamento, multas e resolução de disputas
3. **Criar diagrama ER** — Estrutura completa do banco de dados
4. **Iniciar desenvolvimento** — Backend e frontend em paralelo
5. **Setup de CI/CD** — GitHub Actions para testes automáticos
6. **Iterar conforme necessário** — Este PRD é vivo e pode evoluir

---

## Notas

- Este PRD é versão 1.0 e será atualizado conforme o projeto evolui
- Qualquer mudança deve ser comunicada ao time
- Decisões críticas devem ser levantadas com o grupo antes de implementação
- Documentação será mantida em sync com o código

