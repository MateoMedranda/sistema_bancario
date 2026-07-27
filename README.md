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
El sistema adopta una arquitectura basada en **Microservicios Híbridos (Síncronos y Asíncronos)** sobre **NestJS 10**, orquestada a través de un **API Gateway** centralizado que administra la seguridad (JWT / Bcrypt / RBAC), el enrutamiento multiprotocolo (**HTTP REST**, **gRPC sobre HTTP/2** y **TCP/RPC**) y la mensajería asíncrona orientada a eventos (**Redis Pub/Sub** y **RabbitMQ AMQP**):

- <details><summary>🏛️ Ver Diagrama de Arquitectura del Sistema Bancario</summary>
  <br/>
  <img src="docs/arquitectura_final.png" alt="Diagrama de Arquitectura de Microservicios" width="850"/>
  </details>

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

Durante la prueba se analizaron dos flujos de comunicación dentro del sistema:

- **Síncrono (TCP):** Gateway → Microservicio Transacciones → Microservicio Cuentas.
  
  El Gateway realiza una petición directa mediante TCP y espera la respuesta del servicio dependiente antes de responder al cliente.

- **Asíncrono (Redis):** Gateway → Redis → Microservicio Usuarios.

  El Gateway publica un evento en Redis y responde inmediatamente sin esperar que el consumidor procese el mensaje.

### 📈 Latencia (con `benchmark.js`)

Se utilizó el script `benchmark.js` para ejecutar múltiples peticiones POST contra ambos flujos y medir la latencia promedio, percentil 95 (p95) y tiempo máximo de respuesta.

| Camino | Promedio (ms) | p95 (ms) | Máx (ms) |
|---|---:|---:|---:|
| TCP (Transacciones) | 4.59 | 6 | 73 |
| Redis (Usuarios) | 2.69 | 3 | 73 |

### 🧨 Acoplamiento temporal

Se realizó una prueba deteniendo el microservicio Cuentas, encargado del segundo salto de la cadena síncrona.

Inicialmente, con todos los servicios activos, el endpoint `/api/transacciones` respondió correctamente con código HTTP **201 Created**, demostrando que el flujo síncrono funcionaba cuando todas las dependencias estaban disponibles.

Posteriormente, se detuvo el microservicio Cuentas mediante Docker Compose. Al enviar nuevamente una petición al endpoint `/api/transacciones`, el Gateway no pudo completar la comunicación TCP con el microservicio caído, generando un error HTTP **500 Internal Server Error** debido a la dependencia temporal existente entre los servicios.

En contraste, el endpoint `/api/usuarios/evento` continuó respondiendo correctamente con código HTTP **200 OK**, incluso con el consumidor detenido, debido a que el Gateway únicamente publica el evento en Redis y no espera una respuesta inmediata del microservicio Usuarios.

Esto demuestra que el modelo basado en eventos desacopla temporalmente al productor y al consumidor, permitiendo que el sistema continúe aceptando solicitudes aunque el consumidor no se encuentre disponible en ese momento.

### Evidencias

#### Flujo TCP funcionando (HTTP 201 Created)

![TCP funcionando](docs/evidencia_tcp_funcionando.png)

#### Flujo Redis funcionando (HTTP 200 OK)

![Redis funcionando](docs/evidencia_redis_funcionando.png)

#### TCP con microservicio Cuentas detenido (HTTP 500 Internal Server Error)

![TCP fallando](docs/evidencia_tcp_fallando.png)

#### Redis con consumidor detenido (HTTP 200 OK)

![Redis desacoplado](docs/evidencia_redis_desacoplado.png)

### 🧠 Análisis

El flujo síncrono presentó mayor latencia debido a que la solicitud atraviesa una cadena de microservicios mediante TCP, acumulando el tiempo de procesamiento y comunicación en cada salto.

Cada servicio debe completar su operación antes de devolver la respuesta al cliente, por lo que una falla o demora en uno de los servicios dependientes afecta directamente al flujo completo.

En contraste, el flujo asíncrono mediante Redis reduce la latencia percibida porque el Gateway únicamente publica un evento y responde sin esperar el procesamiento del consumidor.

Este comportamiento evidencia el concepto de acoplamiento temporal: en una comunicación síncrona los servicios deben estar disponibles simultáneamente para completar una operación, mientras que en un modelo basado en eventos el productor y consumidor pueden operar de forma independiente.


---

## 🟡 Avance 2 — Comunicación: gRPC + 2.º transporte + excepciones · `tag v2-avance2`
### gRPC (contrato + monorepo)
El microservicio de Transacciones consume el contrato definido en `proto/cuentas.proto` a través de `CUENTAS_SERVICE`, usando gRPC para validar cuentas antes de registrar una transacción. La comunicación se adapta al patrón monorepo NestJS con `ClientsModule.registerAsync`, donde `protoPath` apunta al contrato y la URL del servicio se resuelve mediante variables de entorno.

### Segundo transporte
Se incorporó RabbitMQ como segundo transporte asincrónico con cola `auditoria_queue`. En el flujo implementado, Transacciones publica el evento `auditar_transaccion` y Usuarios lo consume en un `EventPattern` de RabbitMQ, manteniendo el transporte Redis ya usado para eventos de usuario.

### 🔁 Comparación de transportes
| Transporte | Tipo | Patrón | Uso en el proyecto |
|---|---|---|---|
| TCP | Síncrono | Petición-respuesta | Comunicación principal entre Gateway y Transacciones |
| Redis | Asíncrono | PUB/SUB | Consumidor de eventos de usuario en Usuarios |
| RabbitMQ | Asíncrono | Queue / PUB-SUB | Cola `auditoria_queue` para auditoría de transacciones |
| gRPC | Síncrono | Contrato/RPC | Validación de cuentas entre Transacciones y Cuentas |

En el sistema bancario, TCP y gRPC se usan para operaciones que requieren respuesta inmediata y contrato explícito, mientras que Redis y RabbitMQ se usan para desacoplar procesos en segundo plano y evitar bloquear al emisor.

### 🧯 Manejo de excepciones
La llamada a `validateCuenta` en el servicio de Transacciones se encapsuló con `lastValueFrom` y `try/catch` para convertir una falla de comunicación o una cuenta inexistente en una respuesta controlada del servicio, sin derrumbar el proceso. El resultado esperado en la capa de negocio es una `NotFoundException` clara para el cliente, en lugar de una excepción no manejada que corte el microservicio.

### 📸 Evidencias de Avance 2

- <details><summary>💓 Ver Health Check del API Gateway</summary>
  <br/>
  <img src="docs/avance2_health_gateway.png" alt="Health Gateway" width="750"/>
  </details>

- <details><summary>💸 Ver Transacción válida vía HTTP al Gateway</summary>
  <br/>
  <img src="docs/avance2_transaccion_ok.png" alt="Transacción válida" width="750"/>
  </details>

- <details><summary>🛡️ Ver Error controlado cuando la cuenta no existe (404 Not Found)</summary>
  <br/>
  <img src="docs/avance2_transaccion_error_controlado.png" alt="Error controlado" width="750"/>
  </details>

- <details><summary>🐰 Ver Logs del consumidor RabbitMQ en Usuarios</summary>
  <br/>
  <img src="docs/avance2_rabbitmq_logs.png" alt="RabbitMQ logs" width="750"/>
  </details>

---

## 🔵 Avance 3 — Seguridad, observabilidad e integración (FINAL) · `tag v3-final`

### 🔐 Autenticación, Encriptación y Autorización (RBAC)
Se implementó una infraestructura de seguridad sin estado basada en **JSON Web Tokens (JWT RFC 7519)** con firma criptográfica HMAC-SHA256 (`HS256`) y un tiempo de vigencia controlado de **3600 segundos (1 hora)**. Para el almacenamiento seguro de credenciales en la base de datos (`UsuariosBDD`), se implementa el algoritmo **Bcrypt** con generación automática de un *Salt* de **10 rondas de entropía** (`bcrypt.genSalt(10)`), garantizando que contraseñas idénticas produzcan hashes completamente diferentes y neutralizando ataques de diccionario o tablas arcoíris.

El **API Gateway** centraliza el control de acceso y autorización sobre las rutas mediante dos Guards encadenados:
1. **`JwtAuthGuard`**: Intercepta la petición HTTP, valida el token Bearer en el encabezado `Authorization`, verifica la integridad de la firma y la vigencia temporal, e inyecta la identidad del usuario (`sub`, `username`, `role`) en el contexto de ejecución.
2. **`RolesGuard`**: Evalúa la política de Control de Acceso Basado en Roles (**RBAC**), contrastando los roles requeridos en los decoradores (`@Roles`) contra el rol asignado al token (`ADMIN`, `CLIENTE`, `CAJERO`, `AUDITOR`), permitiendo el paso (`200 OK`) o rechazando la petición (`403 Forbidden`).

En el directorio `tarea-3/` se adjunta la colección oficial de Postman (`Sistema_Bancario_Tarea3.postman_collection.json`), equipada con scripts automáticos que capturan el `access_token` generado tras el Login y lo asignan dinámicamente a la variable `{{jwt_token}}` para autenticar sin intervención manual el resto de peticiones:

- <details><summary>📦 Ver Colección de Postman y configuración automática de variables</summary>
  <br/>
  <img src="docs/Coleccion_Postman.png" alt="Colección de postman" width="750"/>
  </details>

- <details><summary>🔑 Ver Petición para generación de token JWT — POST /api/auth/login (HTTP 200 OK)</summary>
  <br/>
  <img src="docs/token_generado.png" alt="Petición para obtener el token" width="750"/>
  </details>

- <details><summary>✅ Ver Petición autorizada con rol admitido en endpoint protegido (HTTP 200 OK)</summary>
  <br/>
  <img src="docs/request_200.png" alt="Petición 200" width="750"/>
  </details>

- <details><summary>🚫 Ver Petición sin token de autenticación o token inválido (HTTP 401 Unauthorized)</summary>
  <br/>
  <img src="docs/request_401.png" alt="Petición 401" width="750"/>
  </details>

- <details><summary>🛑 Ver Petición con rol no admitido por políticas RBAC (HTTP 403 Forbidden)</summary>
  <br/>
  <img src="docs/request_403.png" alt="Petición 403" width="750"/>
  </details>

### 📊 Observabilidad Integral (Sentry)
Se integró el SDK oficial de **Sentry** (`@sentry/node` y `@sentry/profiling-node`) de forma distribuida en el API Gateway y en cada microservicio (`svc-usuarios`, `svc-transacciones`, `svc-cuentas`). El sistema captura automáticamente trazas de pila (*Stack Traces*) completas, latencias de peticiones gRPC/TCP/HTTP y excepciones no controladas, vinculando el contexto del error al microservicio de origen mediante la configuración centralizada de la variable `SENTRY_DSN`.

### 🔗 Integración Final del Sistema
La operación integral atraviesa de forma cohesiva los diversos protocolos del ecosistema: una solicitud HTTP/REST externa entra por el **API Gateway**, se autentica mediante JWT/Bcrypt y se enruta de forma síncrona vía **gRPC (HTTP/2)** al microservicio de **Transacciones**, el cual valida saldos en tiempo real con el servicio de **Cuentas**, consolida los registros ACID en **PostgreSQL** y emite eventos de dominio asíncronos en **RabbitMQ** para auditoría y en **Redis Pub/Sub** para notificaciones.

### 🏗️ Diagrama de Arquitectura Final
El siguiente diagrama presenta la arquitectura integral del **Sistema Bancario Distribuido**, ilustrando la interacción multiprotocolo entre el API Gateway, la capa de autenticación JWT y encriptación Bcrypt con Salt, los microservicios síncronos sobre **gRPC** y **TCP/RPC**, la mensajería asíncrona orientada a eventos con **Redis** y **RabbitMQ**, el aislamiento transaccional ACID en **PostgreSQL** (`Database-per-Service`) y el monitoreo centralizado con **Sentry**:

- <details><summary>🏛️ Ver Diagrama de Arquitectura Integral del Sistema Bancario</summary>
  <br/>
  <img src="docs/arquitectura_final.png" alt="Arquitectura Final" width="850"/>
  </details>
---

## 🎤 Defensa
✍️ <<Enlace a diapositivas + guion. Runbook de la demo (levantar → login → ruta protegida → operación integrada → error en Sentry). Preguntas frecuentes preparadas.>>

## 🏷️ Tags de entrega
- `v1-avance1` — 16-07-2026 · `v2-avance2` — 21-07-2026 · `v3-final` — 26-07-2026
