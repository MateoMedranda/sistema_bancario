CREATE DATABASE "TransaccionesBDD";
CREATE DATABASE "CuentasBDD";

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

INSERT INTO cuenta (id, "userId", "accountNumber", type, balance, status) 
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user1', '1234567890', 'AHORROS', 1000, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
