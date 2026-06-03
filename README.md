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

### Arquitetura de Autenticação e Segurança

O sistema utiliza autenticação customizada com bcrypt para hash de senhas e tokens base64 para sessão. O fluxo é:

1. **Registro** → `POST /api/auth/register` — cria usuário no PostgreSQL com senha hasheada via bcrypt.
2. **Login** → `POST /api/auth/login` — valida credenciais e retorna token + dados do usuário.
3. **Sessão** → Token e dados do usuário armazenados em `localStorage`.
4. **Autorização** — Roles (`user`, `manager`, `admin`) controlam acesso a rotas e funcionalidades.
5. **Middleware de Segurança** — Acesso a endpoints protegidos (ex: criação de salas) é validado pelo middleware customizado [requireAuth](file:///c:/Users/jose.valentim/Documents/GOODWORK/apps/backend/src/lib/auth-middleware.ts) a partir do header `Authorization: Bearer <token>`.
6. **Configuração de CORS** — O backend libera chamadas de origem cruzada a partir do frontend local (`http://localhost:5173`) via políticas declaradas em [next.config.mjs](file:///c:/Users/jose.valentim/Documents/GOODWORK/apps/backend/next.config.mjs).

> ⚠️ **Nota:** O projeto não depende mais do Supabase. Toda a persistência é feita via PostgreSQL local com driver `pg`.

---
## 📂 Estrutura do Projeto (Monorepo)

```text
GOODWORK/
├── apps/
│   ├── frontend/              # React 18 + Vite SPA
│   │   ├── src/
│   │   │   ├── components/    # Componentes React reutilizáveis
│   │   │   │   ├── layout/    # Sidebar, Header
│   │   │   │   ├── BookingConfirmationPopup.tsx
│   │   │   │   └── PresenceConfirmationModal.tsx  # Modal Alt+P
│   │   │   ├── context/       # Contextos React (AuthContext)
│   │   │   ├── lib/           # Utilitários (auth, api)
│   │   │   ├── mocks/         # Dados mock para apresentação
│   │   │   │   └── data.ts    # 6 salas, suprimentos, KPIs, reservas
│   │   │   ├── routes/        # Rotas TanStack Router
│   │   │   │   ├── __root.tsx
│   │   │   │   ├── _app.tsx   # Layout autenticado
│   │   │   │   ├── index.tsx  # Redirecionamento inicial
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   ├── forgot-password.tsx
│   │   │   │   ├── _app.dashboard.tsx
│   │   │   │   ├── _app.rooms.tsx
│   │   │   │   ├── _app.bookings.tsx
│   │   │   │   ├── _app.supplies.tsx
│   │   │   │   ├── _app.analytics.tsx
│   │   │   │   ├── _app.settings.tsx
│   │   │   │   └── _app.notifications.tsx
│   │   │   ├── main.tsx       # Entry point
│   │   │   └── styles.css     # Tailwind CSS
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.app.json
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── backend/               # Next.js 16 API
│       ├── src/app/api/       # API Routes
│       ├── lib/               # Database, Supabase client
│       ├── .env
│       └── package.json
├── infra/docker/init/         # Scripts SQL de inicialização
├── docker-compose.yml         # Desenvolvimento
├── docker-compose.prod.yml    # Produção
└── package.json               # Workspaces do monorepo
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
| `POST` | `/api/bookings` | Criar reserva (com geração de link Google Calendar e disparo de e-mail stub) |
| `PUT` | `/api/bookings/:id` | Atualizar reserva |
| `DELETE` | `/api/bookings/:id` | Cancelar reserva |
| `PATCH` | `/api/bookings/:id/confirm` | Confirmar presença em reserva pendente |
| `GET` | `/api/dashboard/kpis` | KPIs do dashboard |
| `GET` | `/api/notifications?user_id=:id` | Listar notificações |
| `POST` | `/api/notifications` | Criar notificação |
| `PATCH` | `/api/notifications` | Marcar como lida |
| `GET` | `/api/job-titles` | Listar cargos |
| `PUT` | `/api/users/:id` | Atualizar perfil |

---
## 🎮 Funcionalidades para Apresentação

### Modo Demo (Sem Backend)
O frontend possui **dados mock integrados** que permitem apresentar o sistema mesmo sem o backend ou banco de dados rodando:

- **Login**: Use qualquer email e senha (ex: `demo@goodwork.com` / `123456`)
- **Dashboard**: Gráficos com dados mock (ocupação semanal, reservas, receita vs meta)
- **Salas**: 6 salas com imagens, amenities, preços e disponibilidade
- **Suprimentos**: Controle de estoque com barras de progresso e itens críticos
- **Reservas**: Lista de reservas do dia com status

### Atalho Especial: Confirmação de Presença
Durante a apresentação, pressione **`Alt+P`** para abrir o modal de confirmação de presença:
- Mostra horário e data atual
- Animações suaves com Framer Motion
- Toast de sucesso ao confirmar
- Fecha automaticamente após confirmação

### Dados Mock Disponíveis
| Tipo | Quantidade | Descrição |
| :--- | :--- | :--- |
| Salas | 6 | Aurora, Boreal, Cosmos, Diamante, Estrela, Futuro |
| Suprimentos | 10 | Escritório, Copa, Eletrônicos |
| Reservas | 4 | Confirmadas e pendentes do dia |
| KPIs | 6 | Ocupação, reservas, receita, cancelamento |
| Notificações | 3 | Sucesso, warning, info |

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

- [x] Adicionar dados mock para apresentação sem backend
- [x] Modal de confirmação de presença (Alt+P)
- [x] Login com fallback mock
- [x] Middleware de autenticação customizado (`requireAuth`)
- [x] Habilitação de CORS no backend para requisições de origem cruzada do front local
- [x] Fluxo de confirmação de presença integrado no front (Status Pendente -> Confirmado)
- [x] Geração dinâmica de link de agendamento para Google Calendar
- [x] Serviço estruturado para envio de e-mails de agendamento (Simulação via Log/Console)
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