# Bitácora — Examen Final

## 0. Identificación

| | |
|---|---|
| **Nombre** | Erick Obando |
| **Usuario GitHub** | @Tenkenoz |
| **Grupo / Proyecto** | Grupo 7 — Sistema Bancario EMM |
| **Actividad asignada** | C — Consumidor asíncrono idempotente |
| **Rama** | `exam/Tenkenoz` |
| **Tag** | `examen-Tenkenoz` |
| **Pull Request** | *(pendiente)* |
| **Tarjeta Kanban** | *(enlace)* |
| **¿Hiciste el Paso 0?** | No — la base de un publisher de eventos ya existía en `transacciones.service.ts:96` |

---

## 1. Qué construí

El microservicio Usuarios ahora consume eventos `transaccion-creada` de forma idempotente. Cuando un evento llega dos veces (reentrega de Redis), el consumidor detecta el `eventId` duplicado, lo descarta con un log claro y no crea un registro repetido en la base de datos. Si el evento es nuevo, se persiste en una tabla `AuditLog` con el `eventId` único. El publisher en Transacciones ahora incluye un `eventId` (UUID) en el payload del evento para permitir el rastreo.

---

## 2. Anclaje con el repositorio de mi grupo — obligatorio (C2)

| Código preexistente | Archivo:línea | Cómo me conecto con él |
|---|---|---|
| Publisher del evento `transaccion-creada` | `apps/transacciones/src/transacciones/transacciones.service.ts:96` | Agrego `eventId` al payload que ya emitía en esa línea |
| Consumer `@EventPattern('transaccion-creada')` | `apps/usuarios/src/usuarios/usuarios.controller.ts:33` | El handler delega a `processEvento()` que ahora verifica idempotencia |
| Método `processEvento()` | `apps/usuarios/src/usuarios/usuarios.service.ts:41` | Modifico la lógica para que `eventId` se verifique antes de `type === 'create'` |
| Entity pattern `Usuario` | `apps/usuarios/src/usuarios/entities/usuario.entity.ts` | Sigo la misma convención (UUID PK, columnas TypeORM, `CreateDateColumn`) para `AuditLog` |
| `TypeOrmModule.forFeature` | `apps/usuarios/src/usuarios/usuarios.module.ts:8` | Registro la nueva entity `AuditLog` junto a `Usuario` |
| Configuración Redis en Usuarios | `apps/usuarios/src/main.ts:24-33` | No la modifico; el consumer Redis ya estaba conectado |

**¿Qué convención del repositorio seguí para que mi código no desentone?**
Seguí la misma estructura de entity (UUID primary key, columnas con `@Column`, `@CreateDateColumn`), el mismo patrón de inyección de repositorio con `@InjectRepository`, y el mismo estilo de logs con `Logger` y prefijo del nombre del servicio.

**¿Qué NO dupliqué, pudiendo hacerlo?**
No creé un nuevo消费者 Redis ni un nuevo módulo. Extendí el `processEvento()` existente en `usuarios.service.ts:41` y registré la entity en el módulo que ya existía.

---

## 3. Decisiones técnicas

### Decisión 1
- **Qué decidí:** Verificar `eventId` ANTES de la rama `type === 'create'` en `processEvento()`
- **Alternativa que descarté:** Poner la verificación de `eventId` después de la rama `type === 'create'`
- **Por qué:** Si el evento tiene `type: "create"` y `name` (como los eventos de prueba), entra primero por la rama de creación de usuario y nunca llega a la verificación de idempotencia. Poniendo `eventId` primero, cualquier evento con identificador único pasa por el filtro de duplicados sin importar sus otros campos.

### Decisión 2
- **Qué decidí:** Usar una entity `AuditLog` separada en vez de agregar un campo `eventId` a la entity `Usuario`
- **Alternativa que descarté:** Agregar una columna `eventId` a la tabla `usuario` existente
- **Por qué:** La tabla `usuario` tiene un dominio claro (datos de usuarios) y restricciones UNIQUE en `email` e `identityId`. Mezclar eventos de auditoría con datos de usuarios rompería la responsabilidad única. Un `AuditLog` separado es extensible y no afecta las migraciones existentes.

---

## 4. Las 3 preguntas de mi actividad

**Pregunta 1: ¿Por qué la garantía "al menos una vez" obliga a que la idempotencia viva en el consumidor y no en el publisher?**

> Porque el publisher no controla cuántas veces el broker entrega el mensaje. Redis y RabbitMQ pueden reenviar un evento por reconexión, nack o timeout. Si la idempotencia viviera en el publisher, el consumidor seguiría procesando duplicados cada vez que el broker reenvía. El consumidor es quien aplica el efecto (persistir en BD), y es quien tiene la información para decidir si ya procesó ese evento.

**Pregunta 2: ¿Dónde guardas la clave procesada, y qué ocurre si el proceso muere entre aplicar el efecto y guardar la clave? ¿Qué harías para cerrar esa ventana?**

> Guardo la clave en la tabla `audit_log` de PostgreSQL con un `eventId` único. Si el proceso muere entre `this.repo.save(usuario)` y `this.auditLogRepo.save(log)`, el evento se perdería. Para cerrar esa ventana usaría una transacción de BD que atomice ambas operaciones, o un patrón outbox donde el evento y la clave se persisten juntos en la misma transacción.

**Pregunta 3: ¿Qué diferencia hay entre reintentar un mensaje y mandarlo a una cola de mensajes muertos (DLQ)? ¿Cuándo conviene cada uno?**

> Reintentar intenta procesar el mismo mensaje de nuevo, esperando que el error fue temporal (caída de BD, timeout). Conviene cuando el error es transitorio. Una DLQ captura mensajes que fallaron después de todos los reintentos, para inspección manual. Conviene cuando el error es permanente (payload corrupto, lógica de negocio). En mi implementación, si el consumidor falla, NestJS con Redis reenviará el mensaje. Si falla múltiples veces, debería configurar una DLQ en RabbitMQ para `auditar_transaccion`.

---

## 5. Uso de Inteligencia Artificial — obligatorio

**¿Usaste IA en este examen?** ☑ Sí ☐ No

| # | Qué le pedí | Qué me devolvió | Qué corregí, adapté o descarté — y por qué |
|:--:|---|---|---|
| 1 | Plan de implementación para actividad C (consumidor idempotente) con análisis del repo | Plan detallado con 5 pasos, archivos a tocar, entity AuditLog, y tests | Ajusté el orden de las ramas en `processEvento()` porque el plan original ponía `eventId` después de `type: "create"`, y los eventos de prueba tienen ambos campos |
| 2 | Guía paso a paso para capturar evidencia antes/después con Docker y Postman | Instrucciones de login, envío de eventos, queries SQL, screenshots | Seguí las instrucciones tal cual, funcionaron correctamente |
| 3 | Script de tests de idempotencia con mocks de repositorio | 4 tests con `mockAuditLogRepo.findOne`, `.create`, `.save` | Los ejecuté con `npm test` y pasaron los 8 (3 existentes + 4 nuevos + 1 existente del controller) |

**¿En qué se equivocó respecto a mi repositorio?**
El plan inicial no consideró que los eventos de prueba tenían `type: "create"` y `name`, lo cual hacía que entraran por la rama de creación de usuario en vez de la de idempotencia. Lo detecté al ver los logs de Docker mostrando "Usuario creado" en vez de "Evento procesado en AuditLog". La corrección fue poner la verificación de `eventId` antes de la rama `type === 'create'`.

---

## 6. Evidencia

| Archivo | Qué demuestra |
|---|---|
| `antes-login.png` | Login exitoso con token JWT |
| `antes-evento-enviado.png` | Enviar mismo evento 2 veces sin idempotencia |
| `antes-duplicate-key.png` | Error `duplicate key` tragado silenciosamente por el consumer |
| `despues-evento-1.png` | Enviar evento con `eventId` (Postman) |
| `despues-idempotencia-log.png` | Logs: "procesado" en 1er envío + "duplicado descartado" en 2do |
| `despues-dos-distintos.png` | Dos eventos con IDs diferentes enviados |
| `despues-audit-3filas.png` | BD con 3 registros: 1 del duplicado + 2 de eventos distintos |

**Cómo reproducir mi cambio desde cero:**

```bash
# 1. Levantar sistema
docker compose -f tarea-3/docker-compose.yml up -d --build

# 2. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 3. Enviar mismo evento 2 veces
curl -X POST http://localhost:3000/api/usuarios/evento \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"type":"create","eventId":"test-001","name":"prueba"}'

# Repetir el mismo comando

# 4. Verificar solo 1 registro en audit_log
docker exec -it tarea-3-db-1 psql -U postgres -d UsuariosBDD \
  -c "SELECT * FROM audit_log WHERE eventId='test-001';"
```

---

## 7. Prueba automatizada

| | |
|---|---|
| **Archivo de la prueba** | `apps/usuarios/src/usuarios/usuarios.service.spec.ts` |
| **Comando para ejecutarla** | `npm test -- --testPathPatterns="usuarios.service.spec"` |
| **Qué verifica** | 4 tests: evento nuevo se persiste, evento duplicado se descarta, dos eventos distintos crean 2 registros, camino `type: "create"` sin `eventId` sigue funcionando |
| **¿Falla sin mi cambio?** | Sí — sin el repositorio `AuditLog` inyectado, los tests de idempotencia fallan porque ` UsuariosService` no puede resolver `@InjectRepository(AuditLog)` |

*Pega la salida de la prueba pasando:*

```
Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        4.977 s
```

---

## 8. Estado final — honesto

**Funciona:**
- Evento con `eventId` enviado 2 veces → 1 solo registro en `audit_log`
- Dos eventos con `eventId` distintos → 2 registros en `audit_log`
- Evento sin `eventId` con `type: "create"` → crea usuario (camino original preservado)
- Tests automatizados pasan (8/8)

**No funciona / quedó incompleto:**
- La entity `audit_log` se creó automáticamente con `synchronize: true`, no con migración

**Cuál era mi siguiente paso:**
- Agregar migración de TypeORM para `audit_log` en vez de depender de `synchronize`
- Implementar DLQ para mensajes que fallen después de reintentos

---

## 9. Declaración

> Declaro que este trabajo es individual, que corresponde a la actividad que me fue asignada, y que la sección 5 refleja de forma completa y veraz el uso que hice de herramientas de Inteligencia Artificial durante el examen.

**Nombre:** Erick Obando
**Fecha:** 2026-07-27
