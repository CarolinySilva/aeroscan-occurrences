# AeroScan Occurrences

Sistema full stack para gerenciamento de ocorrências detectadas por drones em áreas monitoradas.

A aplicação recebe eventos enviados pelos drones, identifica ocorrências repetidas dentro de uma janela de tempo, calcula sua prioridade operacional e permite acompanhar o ciclo de atendimento até a resolução.

O projeto foi desenvolvido com foco em:

- separação de responsabilidades;
- regras de negócio isoladas da infraestrutura;
- testabilidade;
- validação dos dados recebidos;
- tratamento consistente de erros;
- facilidade de manutenção e evolução.

---

## Status do projeto

| Componente | Status |
|---|---|
| Backend API | ✅ Concluído |
| MongoDB | ✅ Integrado |
| Validação HTTP | ✅ Concluída |
| Testes automatizados | ✅ 29 testes |
| Docker | ✅ Configurado |
| Frontend | 🚧 Em desenvolvimento |
| Build estática do frontend | 🚧 Pendente |

---

## Requisitos atendidos

### Backend

- [x] `POST /occurrences`
- [x] Cadastro de ocorrências
- [x] Agrupamento de ocorrências repetidas
- [x] Janela de agrupamento de 10 minutos
- [x] Incremento do `count`
- [x] Incremento da `severity`
- [x] Limite máximo de severity igual a 5
- [x] `GET /occurrences`
- [x] Filtro por `status`
- [x] Filtro por `siteId`
- [x] Ordenação por prioridade
- [x] Desempate pela ocorrência mais recente
- [x] `PATCH /occurrences/:id/status`
- [x] Fluxo `open -> acknowledged -> resolved`
- [x] `note` obrigatória para resolução
- [x] HTTP `409` para transições inválidas
- [x] HTTP `404` para ocorrência inexistente
- [x] HTTP `400` para dados inválidos
- [x] Persistência com MongoDB
- [x] Docker
- [x] Testes automatizados

### Frontend

- [ ] Listagem de ocorrências
- [ ] Filtro por status
- [ ] Filtro por site
- [ ] Exibição de severity
- [ ] Exibição de prioridade
- [ ] Exibição do count
- [ ] Acknowledge da ocorrência
- [ ] Resolve com note
- [ ] Build estática em `frontend-dist/`

---

# Tecnologias

## Backend

- Node.js
- TypeScript
- Express
- MongoDB
- Mongoose
- Zod
- Jest
- Supertest
- Docker

## Frontend

- React
- TypeScript
- Vite

---

# Arquitetura

O backend foi estruturado em camadas, inspirado em princípios de Clean Architecture e Domain-Driven Design, mantendo a implementação adequada ao tamanho do desafio.

O objetivo principal foi impedir que regras de negócio importantes ficassem acopladas diretamente ao Express ou ao MongoDB.

```text
HTTP Request
     |
     v
Express Route
     |
     v
Controller
     |
     v
Zod Validation
     |
     v
Use Case
     |
     v
Domain
     |
     v
Repository Interface
     |
     v
MongoOccurrenceRepository
     |
     v
Mongoose
     |
     v
MongoDB
```

## Domain

A camada de domínio concentra regras que devem continuar válidas independentemente da forma como a aplicação é acessada.

Exemplos:

- severity entre 1 e 5;
- incremento de severity em ocorrências repetidas;
- incremento do count;
- transições de status;
- obrigatoriedade de note ao resolver;
- cálculo de prioridade.

## Application

A camada de aplicação contém os casos de uso responsáveis por coordenar cada fluxo.

Atualmente:

```text
RegisterOccurrence
ListOccurrences
ChangeOccurrenceStatus
```

Os casos de uso dependem da abstração `OccurrenceRepository`, e não diretamente do MongoDB.

## Infrastructure

A infraestrutura contém os detalhes externos da aplicação:

- Express;
- controllers;
- rotas;
- schemas Zod;
- middleware de erros;
- implementação Mongo do repository;
- Mongoose;
- conexão com MongoDB.

---

# Estrutura do projeto

```text
aeroscan-occurrences/
│
├── backend/
│   ├── src/
│   │   ├── application/
│   │   │   ├── ports/
│   │   │   │   └── OccurrenceRepository.ts
│   │   │   │
│   │   │   └── use-cases/
│   │   │       ├── RegisterOccurrence.ts
│   │   │       ├── ListOccurrences.ts
│   │   │       └── ChangeOccurrenceStatus.ts
│   │   │
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── Occurrence.ts
│   │   │   │
│   │   │   ├── enums/
│   │   │   │   ├── OccurrenceStatus.ts
│   │   │   │   └── OccurrenceType.ts
│   │   │   │
│   │   │   ├── errors/
│   │   │   │   ├── DomainError.ts
│   │   │   │   └── OccurrenceNotFoundError.ts
│   │   │   │
│   │   │   └── services/
│   │   │       └── PriorityCalculator.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── database/
│   │   │   │   └── mongoose/
│   │   │   │       ├── connection.ts
│   │   │   │       └── OccurrenceModel.ts
│   │   │   │
│   │   │   ├── http/
│   │   │   │   ├── controllers/
│   │   │   │   ├── middlewares/
│   │   │   │   ├── routes/
│   │   │   │   └── schemas/
│   │   │   │
│   │   │   └── repositories/
│   │   │       └── MongoOccurrenceRepository.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── tests/
│   │   ├── application/
│   │   ├── domain/
│   │   └── http/
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
├── frontend-dist/
├── docker-compose.yml
└── README.md
```

---

# Regras de negócio

## Cadastro de ocorrência

Uma ocorrência possui:

```text
siteId
droneId
type
severity
detectedAt
status
count
note
```

Toda nova ocorrência começa com:

```text
status = open
count = 1
```

---

## Tipos de ocorrência

Os tipos disponíveis são:

```text
intrusion
perimeter_breach
low_battery
signal_loss
```

---

## Agrupamento de ocorrências

Antes de criar uma nova ocorrência, a aplicação verifica se existe uma ocorrência:

- com o mesmo `siteId`;
- com o mesmo `type`;
- com status `open`;
- registrada dentro dos últimos 10 minutos.

Caso exista, uma nova ocorrência não é criada.

A ocorrência existente é atualizada:

```text
count = count + 1
severity = severity + 1
```

A severity nunca ultrapassa:

```text
5
```

### Exemplo

Estado inicial:

```json
{
  "type": "intrusion",
  "severity": 3,
  "count": 1
}
```

Novo evento equivalente dentro da janela de 10 minutos:

```json
{
  "type": "intrusion",
  "severity": 4,
  "count": 2
}
```

---

# Cálculo de prioridade

A prioridade não é armazenada no banco.

Ela é calculada a partir de:

```text
priority = severity * peso do tipo
```

Pesos:

| Tipo | Peso |
|---|---:|
| `intrusion` | 3 |
| `perimeter_breach` | 2 |
| `low_battery` | 1 |
| `signal_loss` | 1 |

Exemplo:

```text
type = intrusion
severity = 3

priority = 3 * 3
priority = 9
```

As ocorrências são ordenadas por:

```text
1. maior prioridade
2. detectedAt mais recente
```

---

# Ciclo de status

O fluxo permitido é:

```text
open
  |
  v
acknowledged
  |
  v
resolved
```

Não são permitidas transições como:

```text
open -> resolved
resolved -> acknowledged
acknowledged -> acknowledged
```

Uma ocorrência também só pode ser resolvida quando uma `note` é informada.

---

# API

Base URL local:

```text
http://localhost:3000
```

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/occurrences` | Cria ou agrupa ocorrência |
| `GET` | `/occurrences` | Lista ocorrências |
| `PATCH` | `/occurrences/:id/status` | Atualiza status |

---

# Health check

```http
GET /health
```

Resposta:

```json
{
  "status": "ok"
}
```

---

# POST /occurrences

Registra uma ocorrência.

```http
POST /occurrences
```

Body:

```json
{
  "siteId": "site-01",
  "droneId": "drone-01",
  "type": "intrusion",
  "severity": 3,
  "detectedAt": "2026-09-29T20:00:00.000Z"
}
```

Quando uma nova ocorrência é criada:

```text
201 Created
```

Exemplo:

```json
{
  "grouped": false,
  "occurrence": {
    "id": "78e0b941-2da6-4cdc-bddb-868363785e96",
    "siteId": "site-01",
    "droneId": "drone-01",
    "type": "intrusion",
    "severity": 3,
    "detectedAt": "2026-09-29T20:00:00.000Z",
    "status": "open",
    "count": 1
  }
}
```

Quando a ocorrência é agrupada a uma já existente:

```text
200 OK
```

Exemplo:

```json
{
  "grouped": true,
  "occurrence": {
    "id": "78e0b941-2da6-4cdc-bddb-868363785e96",
    "siteId": "site-01",
    "droneId": "drone-01",
    "type": "intrusion",
    "severity": 4,
    "status": "open",
    "count": 2
  }
}
```

---

# GET /occurrences

Lista ocorrências.

```http
GET /occurrences
```

Exemplo:

```json
[
  {
    "id": "78e0b941-2da6-4cdc-bddb-868363785e96",
    "siteId": "site-01",
    "droneId": "drone-01",
    "type": "intrusion",
    "severity": 3,
    "detectedAt": "2026-09-29T20:00:00.000Z",
    "status": "open",
    "count": 1,
    "priority": 9
  }
]
```

## Filtro por status

```http
GET /occurrences?status=open
```

## Filtro por site

```http
GET /occurrences?siteId=site-01
```

## Filtros combinados

```http
GET /occurrences?status=open&siteId=site-01
```

---

# PATCH /occurrences/:id/status

Altera o status de uma ocorrência.

## Acknowledge

```http
PATCH /occurrences/:id/status
```

```json
{
  "status": "acknowledged"
}
```

## Resolve

```http
PATCH /occurrences/:id/status
```

```json
{
  "status": "resolved",
  "note": "Ocorrência verificada pela equipe"
}
```

---

# Validação dos dados

Os dados recebidos pela API são validados em runtime utilizando Zod.

Isso impede que valores inválidos cheguem aos casos de uso.

Exemplo de requisição inválida:

```json
{
  "siteId": "",
  "droneId": "drone-01",
  "type": "banana",
  "severity": 99,
  "detectedAt": "data-invalida"
}
```

Resposta:

```text
400 Bad Request
```

```json
{
  "message": "Invalid request data",
  "issues": [
    {
      "field": "siteId",
      "message": "Too small: expected string to have >=1 characters"
    },
    {
      "field": "type",
      "message": "Invalid option"
    },
    {
      "field": "severity",
      "message": "Too big: expected number to be <=5"
    },
    {
      "field": "detectedAt",
      "message": "Invalid ISO datetime"
    }
  ]
}
```

---

# Tratamento de erros

A API utiliza um middleware centralizado para transformar erros internos em respostas HTTP consistentes.

| Erro | HTTP |
|---|---:|
| Dados inválidos | `400 Bad Request` |
| Ocorrência inexistente | `404 Not Found` |
| Transição inválida | `409 Conflict` |
| Erro inesperado | `500 Internal Server Error` |

## Ocorrência inexistente

```json
{
  "message": "Occurrence not found"
}
```

HTTP:

```text
404 Not Found
```

## Transição inválida

Exemplo:

```text
open -> resolved
```

Resposta:

```json
{
  "message": "Only acknowledged occurrences can be resolved"
}
```

HTTP:

```text
409 Conflict
```

---

# Persistência

O projeto utiliza MongoDB através do Mongoose.

A entidade de domínio não depende diretamente do Mongoose.

A comunicação ocorre através da abstração:

```text
OccurrenceRepository
```

e da implementação:

```text
MongoOccurrenceRepository
```

Essa separação permite que os casos de uso sejam testados utilizando repositories em memória.

---

# Índices

O model possui índice direcionado à busca utilizada na regra de agrupamento:

```text
siteId
type
status
detectedAt
```

Essa consulta é utilizada para localizar ocorrências abertas recentes com mesmo site e tipo.

---

# Executando com Docker

O projeto possui Docker Compose para subir:

```text
MongoDB
Backend
```

Na raiz:

```bash
docker compose up --build
```

A API fica disponível em:

```text
http://localhost:3000
```

Para parar:

```bash
docker compose down
```

---

# Executando localmente

## Pré-requisitos

- Node.js 22+
- npm
- MongoDB ou Docker

Entre no backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie:

```text
backend/.env
```

Com:

```env
MONGODB_URI=mongodb://localhost:27017/aeroscan
PORT=3000
```

Execute:

```bash
npm run dev
```

Servidor:

```text
http://localhost:3000
```

---

# Scripts

## Desenvolvimento

```bash
npm run dev
```

## Testes

```bash
npm test
```

## Type checking

```bash
npx tsc --noEmit
```

## Build

```bash
npm run build
```

---

# Testes automatizados

Atualmente o backend possui:

```text
6 test suites
29 tests
```

Todos os testes estão passando.

A estratégia foi dividida em três níveis.

## Domain

Valida regras da entidade e serviços de domínio.

Exemplos:

- transições de status;
- severity;
- count;
- obrigatoriedade de note;
- cálculo de prioridade.

## Application

Valida os casos de uso utilizando um repository em memória.

Isso permite testar:

```text
RegisterOccurrence
ListOccurrences
ChangeOccurrenceStatus
```

sem depender do MongoDB.

## HTTP

A camada HTTP utiliza:

```text
Jest
+
Supertest
```

O Jest executa e valida os testes.

O Supertest simula requisições HTTP contra a aplicação Express.

Entre os cenários testados estão:

- health check;
- rejeição de payload inválido.

---

# Decisões técnicas

## Repository Pattern

Os casos de uso não dependem diretamente do MongoDB.

Eles dependem da interface:

```text
OccurrenceRepository
```

Isso reduz acoplamento e facilita testes.

---

## Regras de negócio no domínio

Regras como:

```text
severity <= 5

open -> acknowledged

acknowledged -> resolved

note obrigatória ao resolver
```

não ficam nos controllers.

Elas pertencem à entidade `Occurrence`.

Isso impede que a mesma regra precise ser reimplementada caso outra interface de entrada seja adicionada futuramente.

---

## Controllers enxutos

Os controllers são responsáveis principalmente por:

```text
receber request
validar dados
chamar use case
retornar response
```

Eles não concentram regras de negócio.

---

## Validação em runtime

TypeScript garante segurança durante o desenvolvimento, mas não controla os dados que chegam através da rede.

Por isso, o projeto utiliza Zod para validar dados reais recebidos pela API.

---

## Erros tipados

Erros conhecidos possuem tipos específicos.

Por exemplo:

```text
OccurrenceNotFoundError
DomainError
ZodError
```

O middleware HTTP transforma esses erros nas respostas adequadas.

---

## Prioridade derivada

A prioridade não é persistida no MongoDB porque pode ser calculada a partir de:

```text
severity
+
type
```

Isso evita armazenar um valor redundante que poderia ficar inconsistente.

---

# Premissas

Durante a implementação foram consideradas as seguintes premissas:

- `siteId` e `type` determinam se eventos podem ser agrupados;
- `droneId` não faz parte da regra de agrupamento;
- somente ocorrências `open` podem receber repetição;
- a janela de agrupamento é de 10 minutos;
- severity aumenta em 1 a cada agrupamento;
- severity possui valor máximo igual a 5;
- count inicia em 1;
- toda ocorrência inicia como `open`;
- uma ocorrência `open` pode apenas ir para `acknowledged`;
- uma ocorrência `acknowledged` pode apenas ir para `resolved`;
- `resolved` é o estado final;
- `note` é obrigatória para resolver;
- prioridade é calculada em runtime;
- em empate de prioridade, a ocorrência mais recente aparece primeiro.

---

# Trade-offs

O projeto busca equilíbrio entre organização e simplicidade.

Algumas decisões foram mantidas propositalmente simples para o escopo do desafio.

## Ordenação

Atualmente as ocorrências são recuperadas pelo repository e a prioridade é calculada na aplicação.

Para volumes muito maiores, essa estratégia poderia ser reavaliada para realizar paginação e parte da ordenação diretamente no banco.

## Concorrência no agrupamento

A implementação consulta uma ocorrência aberta recente antes de decidir entre criar ou agrupar.

Em um ambiente com alto volume de eventos simultâneos, duas requisições concorrentes poderiam consultar o banco antes da persistência da outra.

Uma evolução possível seria implementar uma estratégia atômica no MongoDB para garantir consistência sob alta concorrência.

## Testes de integração

Os testes de domínio e aplicação utilizam repositories em memória.

A infraestrutura Mongo foi validada durante o desenvolvimento através da execução real da aplicação.

Como evolução, poderiam ser adicionados testes automatizados de integração utilizando uma instância isolada do MongoDB.

---

# Possíveis evoluções

Em um ambiente de produção, poderiam ser adicionados:

- paginação;
- autenticação;
- autorização;
- rate limiting;
- logs estruturados;
- correlation IDs;
- métricas;
- tracing;
- cache;
- testes de integração com MongoDB;
- tratamento atômico de concorrência;
- documentação OpenAPI/Swagger;
- CI/CD;
- health checks mais completos;
- graceful shutdown;
- versionamento da API.

---

# Frontend

O frontend está sendo desenvolvido utilizando:

```text
React
TypeScript
Vite
```

A aplicação será composta por uma tela principal para acompanhamento das ocorrências.

Entre as funcionalidades previstas:

- visualização das ocorrências;
- severity;
- prioridade;
- count;
- filtros;
- acknowledge;
- resolve;
- inclusão de note;
- atualização da interface após mudanças de status.

---

# Build estática do frontend

Após a conclusão do frontend, a versão compilada será disponibilizada em:

```text
frontend-dist/
```

Essa seção será atualizada ao finalizar a interface.

---

# Como usei IA

A inteligência artificial foi utilizada como ferramenta de apoio ao desenvolvimento.

Entre os usos:

- discussão de alternativas de arquitetura;
- revisão de decisões técnicas;
- apoio na identificação de edge cases;
- elaboração e revisão de cenários de teste;
- revisão de tratamento de erros;
- apoio na documentação;
- discussão de possíveis trade-offs.

As sugestões não foram incorporadas automaticamente.

Cada alteração foi validada através de uma ou mais estratégias:

```text
revisão do código
TypeScript type checking
testes automatizados
build
testes manuais via Postman
execução com MongoDB
```

---

# Critérios de qualidade adotados

Durante o desenvolvimento foram priorizados:

- código tipado;
- separação de responsabilidades;
- baixo acoplamento;
- regras de negócio testáveis;
- erros previsíveis;
- validação de entrada;
- nomes explícitos;
- commits incrementais;
- branches por funcionalidade;
- testes antes da integração na branch de desenvolvimento.

O desenvolvimento foi realizado através de branches de feature integradas progressivamente à branch `dev`.

---

# Autor

**Caroliny Silva**
# AeroScan Occurrences

Sistema full stack para gerenciamento de ocorrências detectadas por drones em áreas monitoradas.

A aplicação permite registrar ocorrências, agrupar eventos repetidos, calcular prioridade e acompanhar o fluxo de atendimento:

```text
open -> acknowledged -> resolved
```

---

## Status

| Componente | Status |
|---|---|
| Backend | ✅ Concluído |
| MongoDB | ✅ Integrado |
| Docker | ✅ Configurado |
| Testes | ✅ 29 testes |
| Frontend | 🚧 Em desenvolvimento |
| Build estática | 🚧 Pendente |

---

## Stack

### Backend

- Node.js
- TypeScript
- Express
- MongoDB
- Mongoose
- Zod
- Jest
- Supertest
- Docker

### Frontend

- React
- TypeScript
- Vite

---

## Arquitetura

O backend foi organizado em camadas para manter as regras de negócio desacopladas do Express e do MongoDB.

```text
HTTP Request
    |
    v
Routes
    |
    v
Controllers
    |
    v
Use Cases
    |
    v
Domain
    |
    v
Repository
    |
    v
MongoDB
```

Principais responsabilidades:

- **Domain:** regras de negócio e transições de status;
- **Application:** casos de uso;
- **Infrastructure:** HTTP, MongoDB e implementações externas.

---

## Regras de negócio

Uma ocorrência contém:

```text
siteId
droneId
type
severity
detectedAt
status
count
note
```

Novas ocorrências começam com:

```text
status = open
count = 1
```

### Agrupamento

Se existir uma ocorrência:

- com mesmo `siteId`;
- com mesmo `type`;
- com status `open`;
- dentro dos últimos 10 minutos;

a nova ocorrência não é criada.

Nesse caso:

```text
count = count + 1
severity = severity + 1
```

A severity nunca ultrapassa `5`.

---

## Prioridade

A prioridade é calculada através de:

```text
priority = severity × peso do tipo
```

| Tipo | Peso |
|---|---:|
| `intrusion` | 3 |
| `perimeter_breach` | 2 |
| `low_battery` | 1 |
| `signal_loss` | 1 |

As ocorrências são ordenadas por:

1. maior prioridade;
2. `detectedAt` mais recente em caso de empate.

---

## API

Base URL:

```text
http://localhost:3000
```

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/occurrences` | Cria ou agrupa ocorrência |
| `GET` | `/occurrences` | Lista ocorrências |
| `PATCH` | `/occurrences/:id/status` | Atualiza status |

### Criar ocorrência

```http
POST /occurrences
```

```json
{
  "siteId": "site-01",
  "droneId": "drone-01",
  "type": "intrusion",
  "severity": 3,
  "detectedAt": "2026-09-29T20:00:00.000Z"
}
```

### Listar

```http
GET /occurrences
```

Filtros opcionais:

```http
GET /occurrences?status=open
GET /occurrences?siteId=site-01
GET /occurrences?status=open&siteId=site-01
```

### Atualizar status

```http
PATCH /occurrences/:id/status
```

Acknowledge:

```json
{
  "status": "acknowledged"
}
```

Resolve:

```json
{
  "status": "resolved",
  "note": "Ocorrência verificada pela equipe"
}
```

O fluxo permitido é:

```text
open -> acknowledged -> resolved
```

Uma ocorrência só pode ser resolvida com `note`.

---

## Validação e erros

A entrada da API é validada com Zod.

Respostas esperadas:

| Situação | Status |
|---|---:|
| Payload inválido | `400` |
| Ocorrência inexistente | `404` |
| Transição inválida | `409` |
| Erro inesperado | `500` |

---

## Como rodar

### Docker

Na raiz:

```bash
docker compose up --build
```

A API estará disponível em:

```text
http://localhost:3000
```

Para parar:

```bash
docker compose down
```

### Localmente

```bash
cd backend
npm install
npm run dev
```

Crie `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/aeroscan
PORT=3000
```

---

## Testes

O backend possui:

```text
6 test suites
29 tests
```

Executar:

```bash
cd backend
npm test
```

Type checking:

```bash
npx tsc --noEmit
```

Build:

```bash
npm run build
```

Os testes cobrem:

- regras de domínio;
- casos de uso;
- validação HTTP;
- rotas com Jest + Supertest.

---

## Estrutura

```text
backend/
├── src/
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   ├── app.ts
│   └── server.ts
│
├── tests/
├── Dockerfile
└── package.json

frontend/
frontend-dist/

docker-compose.yml
README.md
```

---

## Decisões técnicas

- regras de negócio centralizadas no domínio;
- Repository Pattern para desacoplar aplicação e MongoDB;
- Zod para validação em runtime;
- middleware centralizado de erros;
- prioridade calculada em runtime, sem valor duplicado no banco;
- repositories em memória nos testes de aplicação.

---

## Premissas

- `siteId` e `type` definem o agrupamento;
- `droneId` não participa da regra de agrupamento;
- somente ocorrências `open` podem ser agrupadas;
- janela de agrupamento de 10 minutos;
- severity máxima igual a 5;
- `note` obrigatória ao resolver;
- `resolved` é o estado final.

---

## Possíveis evoluções

- paginação;
- autenticação e autorização;
- logs estruturados;
- Swagger/OpenAPI;
- CI/CD;
- testes de integração com MongoDB;
- tratamento atômico de concorrência no agrupamento.

---

## Frontend

O frontend utiliza React, TypeScript e Vite.

A interface permitirá:

- visualizar ocorrências;
- filtrar por status e site;
- visualizar severity, priority e count;
- reconhecer ocorrência;
- resolver ocorrência com note.

A build estática será disponibilizada em:

```text
frontend-dist/
```

---

## Autor

**Caroliny Silva**

