# EMM Bank System — Core Bancario Distribuido

> MVP de arquitectura de microservicios · Sistemas Distribuidos · 6.° semestre · Tercer Parcial.

## Equipo
| Integrante | Rol | GitHub |
|---|---|---|
| Mateo Medranda | Backend / Arquitectura | @MateoMedranda |
| Erick Obando | Transportes / gRPC | @Tenkenoz |
| Moises Benalcazar | Seguridad / Observabilidad | @MoisesBenalcazar |
| Todos los miembros | Documentacion / QA | - |

## Descripcion del MVP

Sistema bancario distribuido ("Core Bancario") que gestiona usuarios, cuentas bancarias y transacciones financieras (depositos, retiros, transferencias).

- **MS 1 — Usuarios:** Consumidor de eventos asincronos via Redis.
- **MS 2 — Cuentas:** Administra cuentas bancarias. Segundo salto de la cadena TCP.
- **MS 3 — Transacciones:** Gestiona movimientos de dinero. Primer salto de la cadena TCP.
- **API Gateway:** Punto unico de entrada HTTP. Orquesta TCP + Redis.

## Stack
- **Framework:** NestJS 11 (TypeScript)
- **Sincrono:** TCP (cadena Gateway -> Transacciones -> Cuentas)
- **Asincrono:** Redis PUB/SUB (Gateway publica, Usuarios consume sin bloquear)
- **BD:** PostgreSQL 16 (TypeORM)
- **Contenedores:** Docker Compose (multi-stage builds, node:20-alpine)
- **Validacion:** class-validator + ValidationPipe
- **Manejo de errores:** Exception Filters + NestJS Exceptions

## Como ejecutar

```bash
cd tarea-1
docker compose up -d --build
curl http://localhost:3000/api/health
```

## Arquitectura

```
                        +----------------------------------------------+
                        |            API Gateway (:3000)                |
                        |        HTTP + TCP Client + Redis Pub          |
                        +----------+-----------------------+-----------+
                                   |                       |
                    +--------------+                       +--------------+
                    | (TCP)                                             | (Redis)
                    v                                                   v
        +-----------------------+                         +-----------------------+
        | Transacciones (:4003) |                         |    Usuarios (Redis)   |
        |  TCP Microservice     |                         |   Event Subscriber    |
        +----------+------------+                         +-----------------------+
                   | (TCP)                                         ^
                   v                                               |
        +-----------------------+        Publica evento (no bloquea)
        |    Cuentas (:4002)    |----------------------------------+
        |  TCP Microservice     |
        +-----------------------+
                   |
                   v
        +-----------------------+
        |   PostgreSQL (5432)   |
        |   3 BDD separadas     |
        +-----------------------+
```

### Camino SINCRONO (TCP)
```
Cliente HTTP -> Gateway -> TCP -> Transacciones -> TCP -> Cuentas
```
- Patron: **Request-Response** via TCP
- Acoplamiento temporal: si Cuentas se cae, toda la cadena falla
- La latencia se acumula en cada salto

### Camino ASINCRONO (Redis)
```
Cliente HTTP -> Gateway -> Redis emit -> (fire & forget) -> Usuarios consume
```
- Patron: **Publisher/Subscriber** via Redis PUB/SUB
- Desacoplamiento temporal: el emisor no espera al consumidor
- Si Usuarios se cae, el Gateway aun retorna exito

## Manejo de excepciones

- **AllExceptionsFilter:** Captura todas las excepciones en el Gateway y retorna respuesta HTTP estructurada
- **Propagacion TCP:** Las excepciones de Cuentas se propagan a Transacciones y de Transacciones al Gateway
- **Try-catch:** Los controladores TCP y Redis manejan errores con try-catch

## Probar evento asincrono
```bash
curl -X POST http://localhost:3000/api/usuarios/evento \
  -H "Content-Type: application/json" \
  -d '{"type":"create","name":"Juan Perez","email":"juan@bank.com"}'
```

## Endpoints
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /api/health | Health check |
| POST | /api/transacciones | Crear transaccion (TCP chain) |
| GET | /api/transacciones | Listar transacciones |
| GET | /api/transacciones/:id | Obtener transaccion |
| POST | /api/usuarios/evento | Publicar evento Redis (no bloquea) |
