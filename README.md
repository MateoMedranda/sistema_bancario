# EMM Bank System

> MVP de arquitectura de microservicios · Aplicaciones Distribuidas · 7.° semestre · Entrega por avances.

## 👥 Equipo
| Integrante | Rol | GitHub |
|---|---|---|
| Mateo Medranda | <<Backend / Arquitectura>> | @MateoMedranda |
| Erick Obando | <<Transportes / gRPC>> | @usuario |
| Moises Benalcázar | <<Seguridad / Observabilidad>> | @usuario |
| Todos los miembros | <<Documentación / QA>> | @usuario |

## 🧩 Descripción del MVP
✍️ Este sistema consiste en el diseño e implementación del núcleo transaccional básico para una plataforma bancaria distribuida ("Core Bancario"). El dominio se mantiene intencionalmente sencillo para focalizar el esfuerzo en la arquitectura de comunicación síncrona y asíncrona, el manejo de la latencia y el desacoplamiento, el sistema permitirá manejar diferentes roles como un administrador, auditor, cajero y socio o cliente, se manejará un proceso transaccional para depósitos, retiros y transferencias, así como el manejo de diferentes cuentas bancarias, es un proceso sencillo con 3 microservicios, donde existirá una comunicación entre transacciones y cuentas para poder validar cuentas existentes y activas.

Además el sistema contará con una base de datos en PostgreSQL, que puede conectarse de forma local, pero para levantamiento del entorno en producción, se tendrá una base levantada en Render, también con Redis se podrá manejar el control de eventos transaccionales para el funcionamiento asíncrono.

- **MS 1 — Usuarios:** Este microservicio gestiona usuarios (clientes, cajeros, auditores, administradores), autenticación, auditoría y configuración general. 
- **MS 2 — Cuentas:** Este microservicio se encarga de crear, consultar y administrar el estado de las cuentas bancarias (ahorros o corriente). 
- **MS 3 — Transacciones:** Este microservicio gestiona los movimientos de dinero (depósitos, retiros y transferencias). 
- **API Gateway:** punto único de entrada.

## 🛠️ Stack
- **Framework:** NestJS
- **Síncrono:** TCP · **Eventos:** Redis · **2.º transporte:** RabbitMQ/MQTT/NATS · **Contrato:** gRPC
- **Seguridad:** JWT + Guard · **Observabilidad:** Sentry
- **BD:** PostgreSQL · **Contenedores:** Docker Compose · **Estructura:** monorepo

## ▶️ Cómo ejecutar
1. Clonar el repositorio y configurar las variables de entorno basándose en el archivo `.env.example` (asegúrate de que el archivo `.env` quede en la raíz del proyecto).
2. Dado que el `docker-compose.yml` se encuentra dentro de la carpeta de la tarea y el `.env` en la raíz, debes usar el siguiente comando para levantar toda la infraestructura:
```bash
cd tarea-1
docker compose --env-file ../.env up -d --build
```
3. Para verificar que los contenedores están corriendo o ver los logs:
```bash
docker compose ps
docker compose logs -f
```
4. Para probar el sistema (Healthcheck del API Gateway):
```bash
curl http://localhost:3000/api/health
```

## 🏗️ Arquitectura
✍️ Diagrama de arquitectura
![Diagrama de Arquitectura de Microservicios](docs/Arquitectura_V2.png)

## 🧭 Metodología
- **Kanban:** Gestionamos las tareas usando GitHub Projects mediante un flujo de estados (Backlog, Por Hacer, En Progreso, En Revisión, Hecho) para hacer trazable el progreso.
  - 🔗 [Enlace al Tablero Kanban](https://github.com/users/MateoMedranda/projects/3/views/1)
  - <details><summary>📸 Ver captura del tablero</summary>
    <img src="docs/KANBAN.png" alt="Tablero Kanban" width="700"/>
    </details>

- **Ramificación (GitHub Flow):** Mantenemos la rama `main` protegida. Toda integración requiere aprobación obligatoria mediante *Pull Requests*. El desarrollo se realiza en ramas efímeras descriptivas y cada hito se congela usando **tags** (ej. `v1-avance1`).
  - <details><summary>📸 Ver evidencia de protección de la rama</summary>
    <img src="docs/Proteccion_Rama_Main.png" alt="Protección Rama Main" width="700"/>
    </details>

- **Commits Semánticos (Conventional Commits):** Usamos el formato `tipo(alcance): descripción` para mantener el historial del proyecto limpio y legible. Ejemplos reales de nuestro trabajo:
  - `feat(docker): agregar Dockerfiles para microservicios`
  - `fix(usuarios): corregir modulo faltante en produccion`
  - `docs(readme): agregar diagrama de arquitectura y kanban`

## 🗺️ Patrones y principios aplicados
- **API Gateway Pattern:** Para tener un único punto de entrada unificado y enrutar las peticiones.
- **Publisher/Subscriber (Event-Driven):** A través de Redis para aislar servicios no críticos (como notificaciones de usuarios).
- **Request-Response (TCP):** Para procesos transaccionales que requieren validación inmediata.
- **Single Responsibility Principle (SOLID - SRP):** Cada microservicio maneja su propia base de datos (aislamiento de datos) y sus propios DTOs.
- **Exception Filters:** Uso de bloques `try-catch` y filtros globales en NestJS para centralizar el manejo de errores.

---

## 🟢 Avance 1 — Acoplamiento temporal y latencia · `tag v1-avance1`
### Caminos
- **Síncrono (TCP):** Gateway → <<A>> → <<B>>.
- **Asíncrono (Redis):** Gateway publica evento; el consumidor procesa sin bloquear.

### 📈 Latencia (con `benchmark.js`)
| Camino | Promedio (ms) | p95 (ms) | Máx (ms) |
|---|---|---|---|
| Síncrono | << >> | << >> | << >> |
| Asíncrono | << >> | << >> | << >> |

### 🧨 Acoplamiento temporal
✍️ <<Al apagar <<B>>, la petición síncrona falla; el flujo asíncrono acepta la petición sin bloquearse (capturas).>>

### 🧠 Análisis
✍️ <<Por qué se suman las latencias y qué es el acoplamiento temporal según lo observado.>>

---

## 🟡 Avance 2 — Comunicación: gRPC + 2.º transporte + excepciones · `tag v2-avance2`
### gRPC (contrato + monorepo)
✍️ <<Contrato `.proto` y comunicación gRPC entre <<A>> y <<B>>. Control de errores con try/catch.>>

### Segundo transporte
✍️ <<Transporte elegido (<<RabbitMQ/MQTT/NATS>>) y flujo PUB/SUB o queue implementado.>>

### 🔁 Comparación de transportes
| Transporte | Tipo | Patrón | Uso en el proyecto |
|---|---|---|---|
| TCP | Síncrono | Petición-respuesta | << >> |
| Redis | Asíncrono | PUB/SUB | << >> |
| <<RabbitMQ/MQTT/NATS>> | Asíncrono | <<PUB/SUB o queue>> | << >> |
| gRPC | Síncrono | Contrato/RPC | << >> |

✍️ <<1 párrafo: cuándo conviene cada uno.>>

### 🧯 Manejo de excepciones
✍️ <<Qué errores se controlan y cómo (evidencia de un error que no tumba el servicio).>>

---

## 🔵 Avance 3 — Seguridad, observabilidad e integración (FINAL) · `tag v3-final`
### 🔐 Autenticación y autorización
✍️ <<Login que emite JWT; Guard que protege rutas. Evidencia: 200 con token, 401 sin token (y 403 por rol si aplica).>>

### 📊 Observabilidad (Sentry)
✍️ <<Qué se registra; captura del error en el panel de Sentry.>>

### 🔗 Integración final
✍️ <<Operación que atraviesa varios microservicios/transportes desde el Gateway.>>

### 🏗️ Diagrama final
✍️ <<Sistema integrado>>

---

## 🎤 Defensa
✍️ <<Enlace a diapositivas + guion. Runbook de la demo (levantar → login → ruta protegida → operación integrada → error en Sentry). Preguntas frecuentes preparadas.>>

## 🏷️ Tags de entrega
- `v1-avance1` — <<fecha>> · `v2-avance2` — <<fecha>> · `v3-final` — <<fecha>>
