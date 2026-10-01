# AeroScan - Triagem de Ocorrências

Mini central de ocorrências para acompanhamento de alertas enviados por drones em diferentes sites.

O sistema permite registrar ocorrências, agrupar alertas repetidos, ordenar por prioridade e acompanhar cada ocorrência até sua resolução.

## Tecnologias

### Backend

- Node.js
- TypeScript
- Express
- MongoDB
- Mongoose
- Zod
- Jest
- Docker

### Frontend

- React
- TypeScript
- Vite

## Estrutura do projeto

```text
aeroscan-occurrences/
├── backend/
├── frontend/
├── frontend-dist/
├── docker-compose.yml
└── README.md
```

- `backend/`: código-fonte da API.
- `frontend/`: código-fonte da aplicação React.
- `frontend-dist/`: frontend compilado em HTML, CSS e JavaScript.
- `docker-compose.yml`: configuração utilizada para executar o backend e o MongoDB.

### Organização do frontend

O frontend foi organizado em componentes para separar responsabilidades da interface:

- `components/Header.tsx`: cabeçalho e identificação do sistema.
- `components/SummaryCards.tsx`: resumo das ocorrências.
- `components/OccurrenceFilters.tsx`: filtros por status e site.
- `components/OccurrenceList.tsx`: composição da lista de ocorrências.
- `components/OccurrenceCard.tsx`: apresentação individual de uma ocorrência e suas ações.
- `components/ResolveOccurrenceModal.tsx`: modal para informar a observação necessária na resolução.
- `services/occurrences.ts`: comunicação do frontend com a API.
- `styles/App.css`: estilos da aplicação.
- `App.tsx`: gerenciamento do estado e orquestração das operações da tela.

## Como rodar o projeto

### Pré-requisitos

Para executar o projeto, é necessário ter:

- Docker
- Docker Compose
- Node.js 20.19+ ou Node.js 22+
- Python 3, caso queira servir o frontend compilado localmente

### Backend com Docker

Na raiz do projeto, execute:

```bash
docker compose up -d --build
```

O comando irá:

- construir a imagem do backend;
- iniciar o backend;
- iniciar o MongoDB.

Para verificar os containers:

```bash
docker compose ps
```

A API ficará disponível em:

```text
http://localhost:3000
```

O MongoDB ficará disponível em:

```text
localhost:27017
```

Para testar a API:

```bash
curl http://localhost:3000/occurrences
```

Para parar os containers:

```bash
docker compose down
```

> Não é necessário executar `docker compose down -v`, pois isso também removeria os volumes persistidos do MongoDB.

## Backend localmente

Também é possível executar o backend diretamente com Node.js, desde que exista uma instância do MongoDB disponível.

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

A API ficará disponível em:

```text
http://localhost:3000
```

## Frontend em desenvolvimento

Com o backend rodando, entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

Por padrão, a aplicação ficará disponível em:

```text
http://localhost:5173
```

O frontend utiliza a API disponível em:

```text
http://localhost:3000
```

## Frontend compilado

A versão compilada do frontend está disponível na pasta:

```text
frontend-dist/
```

Essa pasta contém os arquivos HTML, CSS e JavaScript já gerados pelo Vite, portanto não é necessário executar um novo build para utilizá-la.

Com o backend já rodando, execute na raiz do projeto:

```bash
python3 -m http.server 4173 --directory frontend-dist
```

Depois acesse:

```text
http://localhost:4173
```

O frontend utiliza a API disponível em:

```text
http://localhost:3000
```

### Gerar novamente o frontend compilado

Caso seja necessário gerar uma nova versão dos arquivos compilados:

```bash
cd frontend
npm install
npm run build
```

Os arquivos serão gerados em:

```text
frontend/dist/
```

Após o build, copie o conteúdo de `frontend/dist/` para `frontend-dist/`.

## API

### POST /occurrences

Registra uma nova ocorrência.

Exemplo de requisição:

```json
{
  "siteId": "site-01",
  "droneId": "drone-01",
  "type": "intrusion",
  "severity": 3,
  "detectedAt": "2026-09-30T15:30:00.000Z"
}
```

Se já existir uma ocorrência aberta com o mesmo `siteId` e `type` dentro da janela de 10 minutos:

- uma nova ocorrência não é criada;
- o `count` da ocorrência existente é incrementado;
- a `severity` aumenta em 1;
- a severidade nunca ultrapassa o valor 5.

Os tipos de ocorrência e seus respectivos pesos são:

| Tipo | Peso |
| --- | ---: |
| `intrusion` | 3 |
| `perimeter_breach` | 2 |
| `low_battery` | 1 |
| `signal_loss` | 1 |

### GET /occurrences

Lista as ocorrências.

Os filtros `status` e `siteId` são opcionais.

Exemplos:

```text
GET /occurrences
GET /occurrences?status=open
GET /occurrences?siteId=site-01
GET /occurrences?status=open&siteId=site-01
```

A prioridade é calculada utilizando:

```text
priority = severity × peso do tipo
```

As ocorrências são ordenadas pela maior prioridade.

Em caso de empate, a ocorrência com `detectedAt` mais recente aparece primeiro.

### PATCH /occurrences/:id/status

Altera o status de uma ocorrência.

O fluxo permitido é:

```text
open → acknowledged → resolved
```

Para alterar uma ocorrência de `open` para `acknowledged`:

```json
{
  "status": "acknowledged"
}
```

Para alterar de `acknowledged` para `resolved`, o campo `note` é obrigatório:

```json
{
  "status": "resolved",
  "note": "Ocorrência verificada e resolvida pela equipe de segurança."
}
```

Uma transição inválida retorna HTTP `409`.

## Testes

### Testes automatizados

Entre na pasta do backend:

```bash
cd backend
```

Execute:

```bash
npm test
```

Os testes automatizados cobrem as principais regras de negócio, casos de uso e endpoints HTTP.

### Testes de integração com MongoDB

Com o MongoDB disponível, execute:

```bash
npm run test:integration
```

Os testes de integração validam operações reais do repositório MongoDB, incluindo:

- criação e busca de ocorrências;
- busca de ocorrência aberta recente;
- filtros por `siteId` e `status`;
- incremento concorrente do `count`.

### Verificação de tipos

Para verificar o TypeScript:

```bash
npx tsc --noEmit
```

## Como usei IA

Utilizei o ChatGPT como ferramenta de apoio durante o desenvolvimento, principalmente para discutir decisões de arquitetura, revisar regras de negócio, elaborar cenários de teste e auxiliar na investigação de erros.

Um exemplo de prompt utilizado foi:

> Como posso tornar atômico no MongoDB o agrupamento de ocorrências concorrentes, incrementando `count` e `severity` sem perder atualizações?

Durante essa implementação, uma das sugestões iniciais utilizava um update baseado em aggregation pipeline no Mongoose sem configurar a opção `updatePipeline: true`.

Ao executar a aplicação, essa implementação gerou um erro em runtime. O problema foi identificado durante os testes e a operação foi corrigida adicionando a configuração necessária.

Após a correção, o comportamento foi validado novamente através dos testes de integração.

As sugestões fornecidas pela IA foram utilizadas como apoio e revisadas através da execução da aplicação, análise dos erros e testes automatizados.

## Premissas

Algumas decisões foram tomadas em pontos que não estavam totalmente definidos no enunciado:

- O frontend representa a visão do gestor de segurança.
- O cadastro das ocorrências é realizado através da API pelos sistemas responsáveis pelos drones, portanto não foi adicionada uma tela de cadastro manual no frontend.
- O agrupamento considera `siteId` e `type`, conforme definido no desafio.
- O `droneId` não participa da identificação de ocorrências repetidas.
- Apenas ocorrências com status `open` podem ser agrupadas.
- A severidade de uma ocorrência agrupada aumenta em 1 até o limite máximo de 5.
- A prioridade é calculada no backend e retornada para o frontend.
- O frontend utiliza `http://localhost:3000` como endereço padrão da API.
- Além do filtro por status solicitado no frontend, também foi disponibilizado filtro por `siteId`, aproveitando o suporte já existente no endpoint de listagem.
- O campo `count` é exibido na interface para indicar a frequência da ocorrência.
- O frontend compilado é disponibilizado em `frontend-dist/` para atender à exigência de entrega dos arquivos estáticos.