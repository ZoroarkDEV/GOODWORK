# GOODWORK 🚀

> **Plataforma SaaS Premium de Gerenciamento de Coworking**
>
> Uma solução ponta a ponta focada em agendamento inteligente de salas, gestão operacional de suprimentos, KPIs gerenciais avançados, automação de notificações, integração nativa com Google Calendar e uma experiência de usuário (UX/UI) moderna e premium.

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
| **Banco de Dados** | PostgreSQL (via Docker) | Persistência de dados relacional |
| **Autenticação** | bcryptjs + JWT (email/senha) | Sessão com controle de roles (user/manager/admin) |
| **Estado** | TanStack Query | Gerenciamento de cache e server-state |
| **UI** | Tailwind CSS v4 + Framer Motion | Design system premium com animações |
| **Infraestrutura** | Docker | Padronização e isolamento do ambiente |

---

## 📂 Estrutura do Projeto (Monorepo)

```text
goodwork/
├── apps/
│   ├── frontend/         # React 18 + Vite SPA
│   └── backend/          # Next.js 16 API
├── packages/             # (futuro) Componentes e tipos compartilhados
├── infra/
│   └── docker/           # Configuração de containers
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
>
> ⚠️ **Não subimos a pasta `node_modules` para o Git.** O comando acima é obrigatório após o clone.

### 3. Configurar o Banco de Dados (PostgreSQL via Docker)

O projeto inclui um `docker-compose.yml` com PostgreSQL configurado. Para iniciar:

```bash
docker-compose up -d
```

Isso criará um container com:
- **Host:** `localhost`
- **Porta:** `5432`
- **Database:** `goodwork_db`
- **Usuário:** `goodwork_admin`
- **Senha:** `goodwork_secure_pass`

> 💡 Para verificar se o banco está rodando: `docker ps` — procure por um container com postgres.

#### 3.1. Criar as Tabelas

Com o banco rodando, conecte-se a ele (via pgAdmin, DBeaver ou terminal) e execute o schema:

```sql
-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(150) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  password_hash text,
  role varchar(20) DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin')),
  phone varchar(20),
  avatar_url text,
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Tabela de salas
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL,
  description text,
  capacity integer NOT NULL,
  hourly_rate decimal(10,2) NOT NULL,
  image_url text,
  amenities jsonb DEFAULT '[]',
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Tabela de reservas
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id),
  user_id uuid REFERENCES users(id),
  start_time timestamp NOT NULL,
  end_time timestamp NOT NULL,
  total_price decimal(10,2),
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'canceled', 'finished')),
  notes text,
  created_at timestamp DEFAULT now()
);

-- Tabela de suprimentos
CREATE TABLE IF NOT EXISTS supplies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(150) NOT NULL,
  category varchar(100),
  quantity integer DEFAULT 0,
  min_threshold integer DEFAULT 0,
  reorder_quantity integer DEFAULT 0,
  unit varchar(20),
  active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- Tabela de histórico de suprimentos
CREATE TABLE IF NOT EXISTS supply_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id uuid REFERENCES supplies(id),
  action varchar(50) NOT NULL,
  quantity_before integer,
  quantity_after integer,
  performed_by uuid REFERENCES users(id),
  created_at timestamp DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  type varchar(50) DEFAULT 'general',
  title varchar(200) NOT NULL,
  message text,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp DEFAULT now()
);

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity varchar(100) NOT NULL,
  entity_id uuid,
  action varchar(50) NOT NULL,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid REFERENCES users(id),
  created_at timestamp DEFAULT now()
);
```

### 4. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo e ajuste se necessário:

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env
```

O arquivo `apps/backend/.env` já vem configurado para o Docker local:

```env
DATABASE_URL=postgresql://goodwork_admin:goodwork_secure_pass@localhost:5432/goodwork_db
```

> ⚠️ **Não altere** o `DATABASE_URL` se estiver usando o Docker Compose padrão.

### 5. Iniciar Backend e Frontend

#### Opção A: Rodar ambos simultaneamente (recomendado para QA)

Abra **dois terminais**:

**Terminal 1 — Backend (porta 3000):**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 — Frontend (porta 5173):**
```bash
cd apps/frontend
npm run dev
```

#### Opção B: Rodar tudo de uma vez (raiz do monorepo)

```bash
npm run dev
```

> Isso inicia backend e frontend em paralelo.

### 6. Acessar a Aplicação

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Frontend** | http://localhost:5173 | Interface principal (React + Vite) |
| **Backend** | http://localhost:3000 | API REST (Next.js) |
| **API Rooms** | http://localhost:3000/api/rooms | Endpoint de salas |
| **API Bookings** | http://localhost:3000/api/bookings | Endpoint de reservas |

### 7. Criar Conta e Testar

1. Acesse http://localhost:5173/register
2. Crie uma conta como **Membro** ou **Gestor**
3. Faça login
4. Explore as funcionalidades:
   - **Membro:** Salas, Agendamentos, Notificações, Configurações
   - **Gestor:** Dashboard, Analytics, Suprimentos + todas as rotas de membro

---

## 💾 Estrutura do Banco de Dados

### Tabela: `users`
| Campo | Tipo | Regras |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `name` | `varchar(150)` | Obrigatório |
| `email` | `varchar(255)` | Único, Obrigatório |
| `password_hash` | `text` | Hash bcrypt |
| `role` | `enum` | `user` \| `manager` \| `admin` |
| `phone` | `varchar(20)` | Opcional |
| `active` | `boolean` | Default `true` |
| `created_at` | `timestamp` | Automático |

### Tabela: `rooms`
| Campo | Tipo | Regras |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `name` | `varchar(120)` | Obrigatório |
| `description` | `text` | Opcional |
| `capacity` | `integer` | Obrigatório |
| `hourly_rate` | `decimal` | Obrigatório |
| `image_url` | `text` | Opcional |
| `amenities` | `jsonb` | Default `[]` |
| `active` | `boolean` | Default `true` |

### Tabela: `bookings`
| Campo | Tipo | Regras |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `room_id` | `uuid` | FK → rooms.id |
| `user_id` | `uuid` | FK → users.id |
| `start_time` | `timestamp` | Obrigatório |
| `end_time` | `timestamp` | Obrigatório |
| `total_price` | `decimal` | Calculado |
| `status` | `enum` | `pending` \| `confirmed` \| `canceled` \| `finished` |

### Tabela: `supplies`
| Campo | Tipo | Regras |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `name` | `varchar` | Obrigatório |
| `category` | `varchar` | Opcional |
| `quantity` | `integer` | Default 0 |
| `min_threshold` | `integer` | Default 0 |
| `unit` | `varchar` | Opcional |
| `active` | `boolean` | Default `true` |

### Tabela: `supply_history`
| Campo | Tipo | Regras |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `supply_id` | `uuid` | FK → supplies.id |
| `action` | `enum` | Tipo de movimentação |
| `quantity_before` | `integer` | Antes da ação |
| `quantity_after` | `integer` | Após a ação |
| `performed_by` | `uuid` | FK → users.id |

### Tabela: `notifications`
| Campo | Tipo | Regras |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `user_id` | `uuid` | FK → users.id |
| `type` | `enum` | `booking` \| `supply` \| `general` |
| `title` | `varchar` | Obrigatório |
| `message` | `text` | Opcional |
| `read` | `boolean` | Default `false` |

### Tabela: `audit_logs`
| Campo | Tipo | Regras |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `entity` | `varchar` | Entidade afetada |
| `entity_id` | `uuid` | ID do registro |
| `action` | `varchar` | Operação executada |
| `old_data` | `jsonb` | Payload anterior |
| `new_data` | `jsonb` | Payload posterior |
| `performed_by` | `uuid` | FK → users.id |

---

## 🧠 Regras de Negócio Fundamentais

### Reservas
1. **Duração Mínima:** 30 minutos.
2. **Duração Máxima:** 8 horas contínuas.
3. **Antecedência Máxima:** 30 dias.
4. **Cancelamento:** Permitido sem penalidades até 2 horas antes do início.
5. **Conflito de Reservas:** Expressamente não permitido.

#### Algoritmo de Prevenção de Conflitos:
Uma reserva desejada (`[start_time, end_time]`) é considerada **inválida** se colidir com qualquer reserva existente na mesma sala:
```
start_time < existing_end AND end_time > existing_start
```

### Controle de Estoque de Suprimentos
- **Disparo de Alertas:** Se `quantity < min_threshold`, alerta automático é gerado.
- **Deleção Segura:** Soft Delete (`active = false`).
- **Histórico Obrigatório:** Toda alteração de estoque gera registro em `supply_history`.

### Controle de Acesso (ACL & Roles)

```
User (Membro)  → Fazer reservas, ver perfil, receber notifications
Manager (Gestor) → Operação geral, gerenciar suprimentos, visualizar KPIs, cadastrar salas
Admin → Controle total do sistema, auditoria geral, gerir permissões
```

---

## 🌐 Endpoints de API (Arquitetura REST)

### Autenticação (`/api/auth`)
* `POST /api/auth/register` - Cadastro de novos usuários (email/senha com bcrypt).
* `POST /api/auth/login` - Login com e-mail e senha (retorna token + role).

### Salas (`/api/rooms`)
* `GET /api/rooms` - Lista todas as salas ativas.
* `GET /api/rooms/:id` - Detalha uma sala específica.
* `POST /api/rooms` - Cadastro de nova sala *(Manager/Admin)*.
* `PUT /api/rooms/:id` - Atualização dos dados da sala *(Manager/Admin)*.
* `DELETE /api/rooms/:id` - Inativação da sala (Soft Delete) *(Manager/Admin)*.
* `GET /api/rooms/:id/availability?startDate=...&endDate=...` - Verifica disponibilidade.
* `POST /api/rooms/:id/image` - Upload de imagem da sala *(Manager/Admin)*.

### Reservas (`/api/bookings`)
* `GET /api/bookings` - Lista todas as reservas.
* `POST /api/bookings` - Criação de reserva (com validação de conflitos).
* `PUT /api/bookings/:id` - Atualização de reserva.
* `DELETE /api/bookings/:id` - Cancelamento da reserva (com validação das 2h).

### Suprimentos (`/api/supplies`)
* `GET /api/supplies` - Lista os insumos operacionais cadastrados.
* `POST /api/supplies` - Cadastro de novos itens *(Manager/Admin)*.
* `PUT /api/supplies/:id` - Entrada/Saída de quantidades *(Manager/Admin)*.
* `DELETE /api/supplies/:id` - Inativação de suprimento *(Manager/Admin)*.

---

## 📈 Dashboard Gerencial & KPIs

### Indicadores Operacionais e Financeiros
- **Taxa de Ocupação:** Horas Reservadas / Horas Disponíveis no Período
- **Receita por Sala:** Soma das reservas confirmadas
- **Ticket Médio:** Receita Total / Total de Reservas
- **Taxa de Cancelamento:** Reservas Canceladas / Total de Reservas Solicitadas

### Indicadores de Estoque
- **Itens Críticos:** Suprimentos abaixo do `min_threshold`.
- **Consumo Médio:** Vazão mensal de suprimentos.
- **Previsão de Ruptura:** Estimativa de quando o estoque zerará.

---

## 🎨 Diretrizes de UI/UX

### Design Tokens

| Token | Padrões |
| :--- | :--- |
| **Colors** | `primary` (Navy/Slate), `secondary` (Teal/Emerald), `danger` (Crimson suave) |
| **Spacing** | Grid 4px (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`) |
| **Radius** | `card` (12px), `button` (8px), `modal` (16px) |
| **Typography** | Inter (títulos e corpo) |
| **Shadows** | `soft` (botões), `medium` (cards), `hard` (modais) |

### Bibliotecas de UI
- **Estilização:** Tailwind CSS v4
- **Micro-interações:** Framer Motion
- **Ícones:** Lucide Icons
- **Gráficos:** Recharts
- **Notificações:** Sonner

---

## 📅 Roadmap Técnico

| Sprint | Período | Escopo | Status |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | 2026-05-20 a 2026-05-27 | Fundação (Docker, Auth, Stack) | ✅ Completa |
| **Sprint 2** | 2026-05-28 a 2026-06-04 | CRUD Salas, Upload Imagens, Disponibilidade | ✅ Completa |
| **Sprint 3** | 2026-06-05 a 2026-06-12 | Calendário, Validação Conflitos, Checkout | ✅ Completa |
| **Sprint 4** | 2026-06-13 a 2026-06-20 | Dashboard com KPIs reais | 🔜 Pendente |
| **Sprint 5** | 2026-06-21 a 2026-06-28 | Suprimentos CRUD, Auditoria, Alertas | 🔜 Pendente |
| **Sprint 6** | 2026-06-29 a 2026-07-06 | Google Calendar, Email, Push Notifications | 🔜 Pendente |

---

## 🔒 Segurança

- **Senhas:** Hash com bcryptjs (12 rounds).
- **Sessão:** Token armazenado em localStorage com persistência.
- **Validação:** E-mail validado com regex no backend.
- **ACL:** Rotas protegidas por role (user/manager/admin).
- **Rate Limit:** Recomendado para rotas de auth em produção.