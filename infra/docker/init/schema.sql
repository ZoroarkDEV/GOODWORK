-- ============================================================================
-- GOODWORK DATABASE SCHEMA
-- Platform: PostgreSQL 16
-- Scope: Sprint 1 (Base DDL + Enums + Audit Logs + Triggers)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS DEFINITIONS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'canceled', 'finished');
CREATE TYPE supply_action AS ENUM ('increment', 'decrement', 'adjust', 'replenish');
CREATE TYPE notification_type AS ENUM ('booking', 'supply', 'general');

-- ============================================================================
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- TABLES DEFINITIONS
-- ============================================================================

-- 1. Tabela: users (Usuários da Plataforma)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NULL, -- Nullable para suportar login via OAuth/Social
    role user_role NOT NULL DEFAULT 'user',
    phone VARCHAR(20) NULL,
    avatar_url TEXT NULL,
    job_title VARCHAR(150) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Register update_updated_at trigger for users
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 1.1. Tabela: email_verification_tokens (Tokens de Verificação de E-mail)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);


-- 2. Tabela: rooms (Salas de Reunião / Coworking)
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(120) NOT NULL,
    description TEXT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    image_url TEXT NULL,
    amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Register update_updated_at trigger for rooms
CREATE TRIGGER trigger_update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 3. Tabela: bookings (Agendamentos e Reservas)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status booking_status NOT NULL DEFAULT 'pending',
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_booking_duration CHECK (end_time > start_time)
);

-- Register update_updated_at trigger for bookings
CREATE TRIGGER trigger_update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 4. Tabela: supplies (Estoque de Suprimentos)
CREATE TABLE IF NOT EXISTS supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_threshold INTEGER NOT NULL DEFAULT 5 CHECK (min_threshold >= 0),
    reorder_quantity INTEGER NOT NULL DEFAULT 10 CHECK (reorder_quantity >= 0),
    unit VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Register update_updated_at trigger for supplies
CREATE TRIGGER trigger_update_supplies_updated_at
    BEFORE UPDATE ON supplies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- 5. Tabela: supply_history (Histórico e Auditoria de Estoque)
CREATE TABLE IF NOT EXISTS supply_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supply_id UUID NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
    action supply_action NOT NULL,
    quantity_before INTEGER NOT NULL CHECK (quantity_before >= 0),
    quantity_after INTEGER NOT NULL CHECK (quantity_after >= 0),
    performed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 6. Tabela: notifications (Sistema de Notificações)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL DEFAULT 'general',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 7. Tabela: job_titles (Cargos dos Usuários)
CREATE TABLE IF NOT EXISTS job_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela: audit_logs (Logs Gerais de Segurança e Auditoria)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_data JSONB NULL,
    new_data JSONB NULL,
    performed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED DATA - INICIALIZAÇÃO DE ADMIN E EXEMPLOS (Para testes out-of-the-box)
-- ============================================================================

-- Seed 1. Administrador Padrão (Senha fictícia criptografada com bcrypt para 'admin123')
-- email_verified = TRUE para seed data (admin pré-verificado)
INSERT INTO users (id, name, email, password_hash, role, phone, active, email_verified)
VALUES (
    'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    'Administrador GOODWORK',
    'admin@goodwork.com',
    '$2b$12$6K7r47X/v1iK/rF5D5/B3OtDskhA6P4Jj2k/L4hF2v5O6P2B2B.qK',
    'admin',
    '(11) 99999-9999',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Seed 2. Manager Padrão (Senha fictícia criptografada com bcrypt para 'manager123')
-- email_verified = TRUE para seed data (manager pré-verificado)
INSERT INTO users (id, name, email, password_hash, role, phone, active, email_verified)
VALUES (
    'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    'Gerente Operacional',
    'gerente@goodwork.com',
    '$2b$12$6K7r47X/v1iK/rF5D5/B3OtDskhA6P4Jj2k/L4hF2v5O6P2B2B.qK',
    'manager',
    '(11) 88888-8888',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Seed 3. Salas de Teste Iniciais
INSERT INTO rooms (id, name, description, capacity, hourly_rate, image_url, amenities)
VALUES (
    'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    'Sala Executive Ocean',
    'Sala de reunião luxuosa com vista para o mar, ideal para reuniões executivas e conselhos.',
    12,
    150.00,
    '/images/rooms/room-01/cover.webp',
    '["tv", "wifi", "videoconferencia", "quadro", "cafeteira"]'::jsonb
) ON CONFLICT (id) DO NOT NOTHING;

INSERT INTO rooms (id, name, description, capacity, hourly_rate, image_url, amenities)
VALUES (
    'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    'Sala Focus Studio',
    'Ambiente aconchegante projetado para sprints de design, brainstorming e pequenos grupos.',
    6,
    80.00,
    '/images/rooms/room-02/cover.webp',
    '["wifi", "quadro", "tv", "cafeteira"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed 4. Suprimentos Iniciais para Teste
INSERT INTO supplies (id, name, category, quantity, min_threshold, reorder_quantity, unit)
VALUES (
    'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    'Café Gourmet em Grãos',
    'Cozinha',
    25,
    5,
    20,
    'kg'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO supplies (id, name, category, quantity, min_threshold, reorder_quantity, unit)
VALUES (
    'f6a7b8c9-d01e-2f3a-4b5c-6d7e8f9a0b1c',
    'Papel A4 Reciclado',
    'Escritório',
    4,
    10,
    30,
    'pct'
) ON CONFLICT (id) DO NOTHING;

-- Seed 5. Cargos Iniciais para Teste
INSERT INTO job_titles (id, name, category, active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Desenvolvedor', 'Tecnologia', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'Designer UX/UI', 'Design', TRUE),
    ('33333333-3333-3333-3333-333333333333', 'Product Manager', 'Gestão', TRUE),
    ('44444444-4444-4444-4444-444444444444', 'Scrum Master', 'Gestão', TRUE),
    ('55555555-5555-5555-5555-555555555555', 'Analista de Marketing', 'Marketing', TRUE),
    ('66666666-6666-6666-6666-666666666666', 'Analista Financeiro', 'Financeiro', TRUE),
    ('77777777-7777-7777-7777-777777777777', 'Administrador', 'Administrativo', TRUE),
    ('88888888-8888-8888-8888-888888888888', 'Recepcionista', 'Administrativo', TRUE)
ON CONFLICT (id) DO NOTHING;