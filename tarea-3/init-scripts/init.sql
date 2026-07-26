-- =============================================================================
--  init.sql — Inicialización de Bases de Datos, Tablas y Carga Inicial de Datos
--  Sistema Bancario - Tarea 3 (Autenticación JWT, Hashing y Microservicios)
-- =============================================================================

SELECT 'CREATE DATABASE "TransaccionesBDD"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'TransaccionesBDD')\gexec

SELECT 'CREATE DATABASE "CuentasBDD"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'CuentasBDD')\gexec

SELECT 'CREATE DATABASE "UsuariosBDD"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'UsuariosBDD')\gexec

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ESQUEMA Y SEED DE CUENTAS BANCARIAS ("CuentasBDD")
-- ─────────────────────────────────────────────────────────────────────────────
\c "CuentasBDD"

CREATE TABLE IF NOT EXISTS cuenta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" VARCHAR(200) NOT NULL,
    "accountNumber" VARCHAR(10) NOT NULL UNIQUE,
    type VARCHAR(200) NOT NULL,
    balance NUMERIC(14,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Cuenta principal de ahorro (saldo $1000) perteneciente a 'a1111111-1111-1111-1111-111111111111' (cliente)
INSERT INTO cuenta (id, "userId", "accountNumber", type, balance, status) 
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a1111111-1111-1111-1111-111111111111', '1234567890', 'AHORROS', 1000.00, 'ACTIVE')
ON CONFLICT (id) DO UPDATE 
SET balance = EXCLUDED.balance, status = EXCLUDED.status;

-- Cuenta corriente secundaria (saldo $500) para pruebas de transferencias
INSERT INTO cuenta (id, "userId", "accountNumber", type, balance, status) 
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'a1111111-1111-1111-1111-111111111111', '0987654321', 'CORRIENTE', 500.00, 'ACTIVE')
ON CONFLICT (id) DO UPDATE 
SET balance = EXCLUDED.balance, status = EXCLUDED.status;

-- Cuenta compatible con 'user1' para pruebas legacy
INSERT INTO cuenta (id, "userId", "accountNumber", type, balance, status) 
VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33', 'user1', '1111111111', 'AHORROS', 1000.00, 'ACTIVE')
ON CONFLICT (id) DO UPDATE 
SET balance = EXCLUDED.balance, status = EXCLUDED.status;

-- Cuenta compatible con 'user-1' para pruebas legacy
INSERT INTO cuenta (id, "userId", "accountNumber", type, balance, status) 
VALUES ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 'user-1', '2222222222', 'AHORROS', 1000.00, 'ACTIVE')
ON CONFLICT (id) DO UPDATE 
SET balance = EXCLUDED.balance, status = EXCLUDED.status;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ESQUEMA Y SEED DE USUARIOS ("UsuariosBDD")
-- ─────────────────────────────────────────────────────────────────────────────
\c "UsuariosBDD"

CREATE TABLE IF NOT EXISTS usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    "identityId" VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(200) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "adminId" VARCHAR(200) NOT NULL DEFAULT 'system',
    "ipAddress" VARCHAR(30) NOT NULL DEFAULT '127.0.0.1',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now()
);

-- Usuario CLIENTE (id: 'user1', password: 'cliente123', hash bcrypt 10 rondas)
INSERT INTO usuario (id, name, "identityId", email, "passwordHash", role, status, "twoFactorEnabled", "adminId", "ipAddress")
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'cliente',
    '0901234567',
    'cliente@banco.com',
    '$2b$10$aqCTObCAVm9LdQlpE1zvlOkfaPUFVUyTq5DsTm6aLVFpguVdXJEk6',
    'CLIENTE',
    'ACTIVE',
    false,
    'system',
    '127.0.0.1'
)
ON CONFLICT (email) DO UPDATE 
SET "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;

-- Usuario ADMIN (password: 'admin123')
INSERT INTO usuario (id, name, "identityId", email, "passwordHash", role, status, "twoFactorEnabled", "adminId", "ipAddress")
VALUES (
    'a2222222-2222-2222-2222-222222222222',
    'admin',
    '0900000001',
    'admin@banco.com',
    '$2b$10$OZSfNDK0eqR7qtJoA8AKFuHPFhl7OPJlhsb5IMPaqmF5RQqwxKdDi',
    'ADMIN',
    'ACTIVE',
    false,
    'system',
    '127.0.0.1'
)
ON CONFLICT (email) DO UPDATE 
SET "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;

-- Usuario CAJERO (password: 'cajero123')
INSERT INTO usuario (id, name, "identityId", email, "passwordHash", role, status, "twoFactorEnabled", "adminId", "ipAddress")
VALUES (
    'a3333333-3333-3333-3333-333333333333',
    'cajero',
    '0900000002',
    'cajero@banco.com',
    '$2b$10$IMQTPomNAmkj/7YqKT3wYO8IYX9X0YTBlDCjhEByOVwT/g34/qDfK',
    'CAJERO',
    'ACTIVE',
    false,
    'system',
    '127.0.0.1'
)
ON CONFLICT (email) DO UPDATE 
SET "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;

-- Usuario AUDITOR (password: 'auditor123')
INSERT INTO usuario (id, name, "identityId", email, "passwordHash", role, status, "twoFactorEnabled", "adminId", "ipAddress")
VALUES (
    'a4444444-4444-4444-4444-444444444444',
    'auditor',
    '0900000003',
    'auditor@banco.com',
    '$2b$10$p2o.Gsg49RnjsIeE6nIg4ehFdjnRoB/S9ukPPNBqa3UcDi18h4CvG',
    'AUDITOR',
    'ACTIVE',
    false,
    'system',
    '127.0.0.1'
)
ON CONFLICT (email) DO UPDATE 
SET "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, status = EXCLUDED.status;
