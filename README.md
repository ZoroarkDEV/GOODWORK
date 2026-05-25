# GOODWORK 🚀

> **Plataforma SaaS Premium de Gerenciamento de Coworking**
>
> Uma solução ponta a ponta focada em agendamento inteligente de salas, gestão operacional de suprimentos, KPIs gerenciais avançados, automação de notificações e uma experiência de usuário (UX/UI) moderna e premium.

---
## 📌 Visão Executiva e Recursos Core

- 📅 **Agendamento inteligente de salas** com prevenção de conflitos em tempo real.
- ⚙️ **Gestão operacional e controle de suprimentos** com histórico de auditoria.
- 📊 **Dashboard gerencial** com KPIs operacionais, financeiros e de estoque.
- 🔔 **Automação de notificações** multicanal (Push, E-mail, Realtime).
- 🗓️ **Integração bidirecional com Google Calendar**.
- 💎 **Interface Premium & Responsiva** desenvolvida com atenção milimétrica aos detalhes visuais (Pixel-Oriented).

---
## 🌐 Idioma dos Commits

Este projeto adota **commits em inglês** como padrão. A escolha alinha o repositório com as convenções do mercado de software, facilita a colaboração em projetos open-source e mantém a consistência com termos técnicos universais (ex: `feat`, `fix`, `refactor`, `chore`).

---
## 🛠️ Arquitetura Geral do Sistema

### Stack Principal

| Camada | Tecnologia | Objetivo |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + Tailwind CSS v4 | SPA responsiva de alta performance |
| **Backend** | Next.js 16 | APIs REST robustas |
| **Banco de Dados** | PostgreSQL 16 (via Docker) | Persistência de dados relacional |
| **Autenticação** | Custom Auth (bcrypt + token) | Sessão com controle de roles (user/manager/admin) |
| **Estado** | TanStack Query | Gerenciamento de cache e server-state |
| **UI** | Tailwind CSS v4 + Framer Motion | Design system premium com animações |
| **Infraestrutura** | Docker + Docker Compose | Padronização e isolamento do ambiente |

### Arquitetura de Autenticação

O sistema utiliza autenticação customizada com bcrypt para hash de senhas e tokens base64 para sessão. O fluxo é:

1. **Registro** → `POST /api/auth/register` — cria usuário no PostgreSQL com senha hasheada via bcrypt.
2. **Login** → `POST /api/auth/login` — valida credenciais e retorna token + dados do usuário.
3. **Sessão** → Token e dados do usuário armazenados em `localStorage`.
4. **Autorização** — Roles (`user`, `manager`, `admin`) controlam acesso a rotas e funcionalidades.

> ⚠️ **Nota:** O projeto não depende mais do Supabase. Toda a persistência é feita via PostgreSQL local com driver `pg`.

---
## 📂 Estrutura do Projeto (Monorepo)

```text
GOODWORK/
├── apps/
│   ├── frontend/         # React 18 + Vite SPA
│   └── backend/          # Next.js 16 API
├── packages/             # (futuro) Componentes e tipos compartilhados
├── infra/
│   └── docker/           # Configuração do banco de dados
│       └── init/
│           └── schema.sql  # DDL + seed data
├── docker-compose.yml         # Ambiente de desenvolvimento
├── docker-compose.prod.yml    # Ambiente de produção/local
├── package.json               # Workspaces do monorepo
└── README.md
```

---
## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado na sua máquina:

| Ferramenta | Versão Mínima | Download |
| :--- | :--- | :--- |
| **Node.js** | 18.x ou superior | [nodejs.org](https://nodejs.org/) |
| **Git** | 2.x ou superior | [git-scm.com](https://git-scm.com/) |
| **Docker Desktop** | 4.x ou superior | [docker.com](https://www.docker.com/products/docker-desktop/) |

> 💡 **Dica:** Para verificar se já tem tudo instalado, rode:
> ```bash
> node --version
> git --version
> docker --version
> ```

---
## 🚀 Instalação e Execução (Guia do QA)

Siga os passos abaixo **em ordem** para ter o projeto rodando localmente.

### 1. Clonar o Repositório

```bash
git clone https://github.com/ZoroarkDEV/GOODWORK.git
cd GOODWORK
```

### 2. Instalar Todas as Dependências

O projeto usa um monorepo com workspaces. Um único comando instala tudo:

```bash
npm install
```

> ⏳ Isso pode levar alguns minutos. O npm instalará as dependências de `apps/frontend` e `apps/backend` automaticamente.
> ⚠️ **Não subimos a pasta `node_modules` para o Git.** O comando acima é obrigatório após o clone.

### 3. Configurar o Banco de Dados (PostgreSQL via Docker)

```bash
docker compose -f docker-compose.yml up -d
```

> Isso criará o container `goodwork-postgres` com o banco `goodwork_db`, usuário `goodwork_admin` e senha `goodwork_secure_pass`.
> O schema e os dados de seed são criados automaticamente via `infra/docker/init/schema.sql`.

### 4. Executar Frontend e Backend (Desenvolvimento)

```bash
# Em um terminal, rode o backend:
npm run dev --workspace=apps/backend

# Em outro terminal, rode o frontend:
npm run dev --workspace=apps/frontend
```

> O frontend estará disponível em `http://localhost:5173` (porta padrão do Vite).
> O backend estará disponível em `http://localhost:3000`.

### 5. Deploy para Produção (Docker Compose)

Para fazer deploy local com Docker (frontend + backend + banco):

```bash
# Construir e subir todos os serviços
docker compose -f docker-compose.prod.yml up -d --build

# Parar todos os serviços
docker compose -f docker-compose.prod.yml down

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

> Isso criará:
> - `goodwork-postgres` (porta 5432) — Banco de dados PostgreSQL
> - `goodwork-backend` (porta 3000) — API Next.js
> - `goodwork-frontend` (porta 80) — Frontend React servido via Nginx
>
> Acesse: **http://localhost** (frontend) e **http://localhost:3000/api/health** (backend health check)

---
## 🧪 Testes e Validação

Após a instalação, verifique se tudo está funcionando:

### Health Check do Backend

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "service": "GOODWORK Backend API",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "database": {
    "status": "connected",
    "time": "2025-01-01T00:00:00.000Z"
  }
}
```

### Verificar Banco de Dados

```bash
docker ps | grep goodwork-postgres
```

### Credenciais de Teste (Seed Data)

| Papel | E-mail | Senha |
| :--- | :--- | :--- |
| **Admin** | admin@goodwork.com | admin123 |
| **Manager** | gerente@goodwork.com | manager123 |

> ⚠️ As senhas de seed usam o mesmo hash bcrypt. Para produção, gere novos hashes com `bcrypt.hash('sua_senha', 12)`.

### Endpoints da API

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Registrar novo usuário |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/rooms` | Listar salas ativas |
| `POST` | `/api/rooms` | Criar sala |
| `GET` | `/api/rooms/:id` | Detalhes da sala |
| `PUT` | `/api/rooms/:id` | Atualizar sala |
| `DELETE` | `/api/rooms/:id` | Inativar sala (soft delete) |
| `GET` | `/api/rooms/:id/availability` | Verificar disponibilidade |
| `GET` | `/api/bookings` | Listar reservas |
| `POST` | `/api/bookings` | Criar reserva |
| `PUT` | `/api/bookings/:id` | Atualizar reserva |
| `DELETE` | `/api/bookings/:id` | Cancelar reserva |
| `GET` | `/api/dashboard/kpis` | KPIs do dashboard |
| `GET` | `/api/notifications?user_id=:id` | Listar notificações |
| `POST` | `/api/notifications` | Criar notificação |
| `PATCH` | `/api/notifications` | Marcar como lida |
| `GET` | `/api/job-titles` | Listar cargos |
| `PUT` | `/api/users/:id` | Atualizar perfil |

---
## 📦 Estrutura de Pastas

- `apps/frontend/` — Código fonte do frontend React + Vite
- `apps/backend/` — Código fonte do backend Next.js
- `infra/docker/init/` — Scripts SQL de inicialização do banco
- `docker-compose.yml` — Configuração de desenvolvimento
- `docker-compose.prod.yml` — Configuração de produção

---
## 🔧 Configurações de Ambiente

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=postgresql://goodwork_admin:goodwork_secure_pass@localhost:5432/goodwork_db
NODE_ENV=development
```

### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

> 💡 Em produção (Docker), o Nginx faz proxy das requisições `/api` para o backend, então o frontend usa `/api` diretamente sem necessidade de configurar URL.

---
## 🔄 Atualizações Futuras

- [ ] Implementar CI/CD com GitHub Actions
- [ ] Adicionar JWT com assinatura adequada (substituir token base64)
- [ ] Adicionar refresh tokens
- [ ] Configurar Nginx como proxy reverso com SSL
- [ ] Adicionar certificado SSL com Let's Encrypt
- [ ] Integração contínua com testes automatizados
- [ ] Adicionar suporte a múltiplos bancos (MySQL, SQLite)

---
## 📄 Licença

MIT