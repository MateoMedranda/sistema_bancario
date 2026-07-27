# Bitácora — Examen Final

> **Cópiame a `docs/examen/<tu-usuario-github>/BITACORA.md` y rellena todas las secciones.**
> Es obligatoria. Sin ella, C5 = nivel 1. Sin la sección 5 (uso de IA), **C5 = 0**.
> Escribe en primera persona y sé concreto: los "archivo:línea" se verifican.

---

## 0. Identificación

| | |
|---|---|
| **Nombre** | Mateo Medranda |
| **Usuario GitHub** | @MateoMedranda |
| **Grupo / Proyecto** | Grupo 7 Sistema Bancario EMM |
| **Actividad asignada** | B. Nuevo salto síncrono con contrato |
| **Rama** | `exam/MateoMedranda` |
| **Tag** | `examen-MateoMedranda` |
| **Pull Request** | *(enlace)* |
| **Tarjeta Kanban** | *(enlace)* |
| **¿Hiciste el Paso 0?** | Sí / No — *si no, indica el archivo donde la base ya existía* |

---

## 1. Qué construí

*Tres a cinco frases. Qué hace ahora el sistema que antes no hacía. Sin copiar el enunciado.*

**FASE 1**
*Primero hice un análisis del sistema actual, con su arquitectura, percatandome de que el punto de modificación debe ser agregar un nuevo endpoint que me permita obtener el balance de las cuentas, un servicio que no existe actualmente y que si se quisiera implementar se debería duplicar los datos de la tabla cuentas en la tabla de transacciones, o en la bdd_transacciones, algo que no permitiría tener una verdad única, por lo que el punto debe ser comunicar el svc-transacciones con el svc-cuentas y de esa forma obtener la verdad única del balance mediante un salto síncrono con contrato*

**FASE 2**
*Fue necesario definir una nueva estructura de respuesta, para lo cual una petición de balance debería poder devolver el id de la cuenta bancaría, el número de cuenta, el estatus y también el balance que viene a ser el dato principal, para lo cual dentro de [libs/contracts/cuentas.proto](../../libs/contracts/src/proto/cuentas.proto) agregué la nueva estructura BalanceResponse y también el nuevo procedimiento GetAvailableBalance, por último dentro de esta fase se agregó el método a la interfaz CuentasServiceGrpc en  [apps/transacciones/src/transacciones/transacciones.service.ts](../../apps/transacciones/src/transacciones/transacciones.service.ts) el cual va a permitir usar dentro del servicio el contrato*

**FASE 3**
*Para esta fase fue necesario definir un poco de lógica de negocio y validaciones, implementando el método GetAvailableBalance que fue definido en la interfaz en la fase anterior, en el mismo método implementado, coloqué algunas validaciones, como la estructura del id enviado dentro de la petición, validación sobre un id vacío enviado y validación de una búsqueda con el id enviado pero que no existe en los registros de la BDD, para esto use códigos 400 para bd request, y 404 para not found en [apps/cuentas/src/cuentas/cuentas.service.ts](../../apps/cuentas/src/cuentas/cuentas.service.ts), también hice una exposición del endpoint gRPC registrando la acción del nuevo controlador asociado al nuevo servicio en [apps/cuentas/src/cuentas/cuentas.controller.ts](../../apps/cuentas/src/cuentas/cuentas.controller.ts)*

**FASE 4**
*Para esta fase ya tomé en cuenta el consumo de gRPC y el manejo de errores en Transacciones, implementando getCuentaBalance(id: string) utilizando lastValueFrom sobre el servicio gRPC. Coloqué un log al principio del método y también utilicé un try/catch para manejo de excepciones, pero no solo eso, sino que por cada validación se desarrollo una respuesta personalizada con el código correspondiente. También registré el manejador TCP para escuchar peticiones del Gateway y agregué el puente TCP hacia el microservicio de Transacciones, por último expuse la ruta REST GET /api/cuentas/:id/balance, protegida por el decorador de roles @Roles(...) para control de acceso*

**FASE 5**
*Para esta fase ya tomé en cuenta el consumo de gRPC y el manejo de errores en Transacciones, implementando getCuentaBalance(id: string) utilizando lastValueFrom sobre el servicio gRPC. Coloqué un log al principio del método y también utilicé un try/catch para manejo de excepciones, pero no solo eso, sino que por cada validación se desarrollo una respuesta personalizada con el código correspondiente. También registré el manejador TCP para escuchar peticiones del Gateway y agregué el puente TCP hacia el microservicio de Transacciones, por último expuse la ruta REST GET /api/cuentas/:id/balance, protegida por el decorador de roles @Roles(...) para control de acceso*



---

## 2. Anclaje con el repositorio de mi grupo — **obligatorio (C2)**

*Código que YA existía y con el que mi cambio se conecta. Cita archivo y línea reales, verificables en el repo. Si dejas esta tabla vacía o con referencias inventadas, C2 no pasa de nivel 1.*

| Código preexistente | Archivo:línea | Cómo me conecto con él |
|---|---|---|
|Contrato gRPC (CuentasService) | libs/contracts/src/proto/cuentas.proto:4-8|Hice una extensión de este contrato existente agregando la firma de GetAvailableBalance y la definición de su respectivo DTO BalanceResponse.|
|Registro del Cliente gRPC (CUENTAS_SERVICE)|apps/transacciones/src/transacciones/transacciones.module.ts:13-26 |Modifiqué el servicio consumidor que ya inyecta este cliente para recuperar la interfaz actualizada y poder llamar al nuevo método vía gRPC. |
|Cliente de Transacciones TCP (TRANSACCIONES_SERVICE)|apps/sistema_bancario/src/app.module.ts:16-28|Usé este cliente preexistente en el Gateway para enviar el mensaje TCP 'get-cuenta-balance' hacia el servicio de Transacciones|
|Filtro de excepciones global (AllExceptionsFilter)|apps/sistema_bancario/src/filters/all-exceptions.filter.ts:13-25|Este filtro global del Gateway captura de forma nativa la RpcException con status 400, 404 o 503 generada en Transacciones y la mapea al código HTTP correspondiente en el cliente.|


**¿Qué convención del repositorio seguí para que mi código no desentone?**
*(nomenclatura, estructura de carpetas, forma de registrar módulos, estilo de manejo de errores…)*

Para el manejo de la estructura de carpetas no fue necesario modificar ni agregar nuevos archivos, sino trabajar sobre los existentes, para o cual utilicé la convención de agregar cambios necesarios manteniendo el estilo cammel case, y el registro de módulos mediante interfaces, así como los nuevos métodos con un manejo de errores tomando en cuenta el statusCode, el message para transmitir una razón clara del error y el tipo de error que dió.

**¿Qué NO dupliqué, pudiendo hacerlo?**
*(ej.: "no creé un guard nuevo, extendí el de `gateway/src/common/guards/jwt-auth.guard.ts:14`")*



---

## 3. Decisiones técnicas

*Al menos dos decisiones reales, con la alternativa que descartaste y por qué. Una decisión sin alternativa descartada no es una decisión.*

### Decisión 1
- **Qué decidí:** Decidí usar una expresión regular robusta para la validación del UUID (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`) en el microservicio propietario (Cuentas) y arrojar una `RpcException` con status `400 Bad Request` antes de realizar consultas a la base de datos PostgreSQL.
- **Alternativa que descarté:** Dejar la validación de UUID únicamente al validador implícito de la base de datos PostgreSQL (TypeORM).
- **Por qué:** Si la base de datos recibe un formato de UUID inválido, lanza un error de base de datos (`QueryFailedError`), lo cual generaría un error interno del servidor (500) no deseado. Hacer la validación en la capa de negocio permite retornar un código 400 de forma controlada y óptima sin sobrecargar la base de datos con peticiones mal formadas.

### Decisión 2
- **Qué decidí:** Decidí implementar una traducción basada en el parseo del string de error gRPC (verificando la presencia de palabras clave como `"no encontrada"` o `"UUID"`) en `TransaccionesService` para mapear los errores con código gRPC `2 UNKNOWN` a excepciones `RpcException` con estatus `404` y `400`.
- **Alternativa que descarté:** Confiar únicamente en que el cliente gRPC de NestJS tradujera los códigos numéricos `5` y `3` automáticamente en todos los casos de comunicación gRPC en vivo.
- **Por qué:** NestJS encapsula las excepciones RPC no atrapadas en un código genérico `2 UNKNOWN` con el mensaje original en la red. Si solo hubiéramos mapeado los códigos numéricos `5` y `3`, en las pruebas extremo a extremo en vivo el Gateway habría recibido siempre un error 500. Al analizar el mensaje descriptivo y usar expresiones regulares para limpiar el prefijo de transporte, logramos retornar códigos HTTP exactos (404/400) tanto en los tests unitarios mockeados como en el despliegue real en Docker.

---

## 4. Las 3 preguntas de mi actividad

*Están al final de tu actividad en `ACTIVIDADES.md`. Cópialas y respóndelas. Se evalúa que las respuestas hablen de **tu** implementación y de **tu** sistema, no en general.*

**Pregunta 1: ¿Por qué el contrato debe vivir en un lugar compartido y no duplicado dentro de cada servicio?**

> *(Debe vivir en un lugar compartido para evitar duplicidad, generalmente se suelten tener varios servicios que consuman un contrato, algo similar se puede ver en arquitecturas donde en lugar de libs usan shared para archivos o código compartido, un ejemplo puede ser un sistema de reportería en pdf con Quest pdf, el servicio de reportería permitirá generar pdfs, pero al ser genéricos todos los servicios pueden consumir el contrato sin necesidad de duplicar)*

**Pregunta 2: ¿Qué código de error del transporte elegiste para "no encontrado" y a qué código HTTP lo mapeas? ¿Por qué no es correcto devolver 500?**

> *(Seleccioné el not found con valor de code 5 o http code 404, con el fin de personalizar el mensaje enviado y demostrar que no se encontró el recurso solicitado, no es correcto utilizar el error 500 porque este representa un fallo interno del servidor, lo cual no tiene nada que ver con not found ya que funcionó de forma adecuada, solo que no encontró el recurso)*

**Pregunta 3: Si mañana añades un campo nuevo al contrato, ¿siguen funcionando los clientes que no lo conocen? ¿Por qué?**

> *(Si siguen funcionando ya que se usa la característica de diseño  Protocol Buffers (protobuf), si el servidor envía un nuevo campo con el tag 7, un cliente antiguo que solo conoce hasta el tag 6 recibirá el mensaje, verá el tag 7, no lo reconocerá y simplemente lo ignorará y omitirá durante la deserialización, en lugar de lanzar una excepción o fallar, es un efecto útil si necesitamos que la respuesta a deserializar contenga nuevos campos para un uso específico sin dañar las demás funcionalidades.)*




---

## 5. Uso de Inteligencia Artificial — **obligatorio**

**¿Usaste IA en este examen?**  ✅ Sí  ☐ No

> Usarla no penaliza. **No declararla anula este criterio completo (C5 = 0).**
> Si marcaste "No", firma igualmente la declaración del final.

| # | Qué le pedí | Qué me devolvió | Qué corregí, adapté o descarté — y por qué |
|:--:|---|---|---|
| 1 |Pedí un análisis sobre la nueva funcionalidad, considerando la posibilidad de colocar el salto síncrono entre cuentas y transacciones |Me dió un plan de implementación con el fin de integrar el sistema de balances | Decidí tomar la sugerencia del endpoint, pero adapté la implementación a 5 fases basadas en la definición de estructuras e interfaces, luego la implementación con manejo de errores, luego la exposición de la ruta y por último las pruebas automatizadas|
| 2 |Pedí autocompletar algunos pasos largos como la definición de errores en el servicio con validaciones por tipe | me ayudo completando la tarea repetitiva y dejó listo para poder revisar y realizar el commit|Decidí dejar como se encontraba pues las validaciones estaban correctas|

**¿En qué se equivocó respecto a mi repositorio?**
*(Casi siempre se equivoca en algo: inventa rutas, propone una librería que el proyecto no usa, ignora el guard/filtro que ya existe, asume otra versión del framework. Describe al menos un caso concreto y cómo lo detectaste.)*

Se equivocó con la forma de levantar el proyecto, como el sistema se encuentra con un docker compose en tarea-3, este permite levantar el ambiente de forma inmediata, ejecutando scripts que inicializan datos en las BDD con el fin de que funcione correctamente el sistema, mientras yo desarrollaba la planificación y hacia los commits, decidí dejar que la IA gestione el despliegue en docker y monitoree el estado de la construcción de las imagenes, para que corrija algunos errores, pero no detecto los datos que debían ingresarse en BDD, proponiendo generar hardcoding con datos falsos.

---

## 6. Evidencia

## 6. Evidencia

| Archivo | Qué demuestra |
|---|---|
| `antes-sin-metodo.txt` | Demuestra que el método no existía en el contrato `.proto` y la ruta de balance en el Gateway retornaba un error 404. |
| `despues-caso-ok.png` | Captura de llamada exitosa extremo a extremo al endpoint `GET /api/cuentas/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/balance` con JWT, mostrando balance de $1000 (status 200). |
| `despues-caso-error.png` | Captura de llamada con ID inexistente a `GET /api/cuentas/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99/balance` retornando un error controlado 404 Not Found. |
| `despues-caso-error-400.png` | Captura de llamada con formato inválido a `GET /api/cuentas/invalid-uuid/balance` retornando un error controlado 400 Bad Request. |
| `despues-caso-servicio-caido.png` | Captura de llamada con el microservicio Cuentas detenido, retornando un error controlado 503 Service Unavailable sin colgar el consumidor. |

**Cómo reproducir mi cambio desde cero:**

```bash
# 1. Levantar la infraestructura fresca limpiando volúmenes antiguos
cd tarea-3
docker compose down -v
docker compose up -d

# 2. Obtener token JWT mediante autenticación
curl -s -X POST -H "Content-Type: application/json" -d "{\"username\":\"cliente\",\"password\":\"cliente123\"}" http://localhost:3000/api/auth/login

# 3. Caso OK (Obtener balance de cuenta semilla):
curl -s -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:3000/api/cuentas/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/balance

# 4. Caso Error (Cuenta inexistente):
curl -s -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:3000/api/cuentas/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99/balance

# 5. Caso Error (UUID inválido):
curl -s -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:3000/api/cuentas/invalid-uuid/balance
```

---

## 7. Prueba automatizada


| | |
|---|---|
| **Archivo de la prueba** | `apps/transacciones/src/transacciones/transacciones.service.spec.ts` |
| **Comando para ejecutarla** | `npx jest apps/transacciones/src/transacciones/transacciones.service.spec.ts` |
| **Qué verifica** | Mocks de gRPC y validación de que TransaccionesService traduce los códigos de transporte gRPC (5 NOT_FOUND, 3 INVALID_ARGUMENT, 14 UNAVAILABLE) a excepciones RpcException tipadas (404, 400 y 503) sin arrojar errores no controlados. |
| **¿Falla sin mi cambio?** | Sí, ya que al compilar la clase el método `getCuentaBalance` no estaría definido en el servicio de Transacciones, y no habría control ni mapeo de excepciones gRPC. |


*Pega la salida de la prueba pasando:*

```
Hubo un error en la prueba
```

---

## 8. Estado final — honesto

**Funciona:**
- Funciona el endpoint correctamente y el contrado, toda la funcionalidad esta operativa

**No funciona / quedó incompleto:**
- lo que se quedó incompleto o no funcional fueron las pruebas automatizadas, als cuales no se alcanzaron a probar ni a tomar evidencia solida

**Cuál era mi siguiente paso:**
Era validar correctamente todo el código con pruebas exhaustivas y validar las pruebas automatizadas

> Declarar con precisión lo que no terminaste **conserva** los puntos de C2, C3, C4 y C5. Presentar como terminado algo que no funciona los pone en riesgo todos.

---

## 9. Declaración

> Declaro que este trabajo es individual, que corresponde a la actividad que me fue asignada, y que la sección 5 refleja de forma completa y veraz el uso que hice de herramientas de Inteligencia Artificial durante el examen.

**Nombre: Mateo Medranda**
**Fecha: 27/07/2026**
