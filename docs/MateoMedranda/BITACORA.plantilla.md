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




---

## 2. Anclaje con el repositorio de mi grupo — **obligatorio (C2)**

*Código que YA existía y con el que mi cambio se conecta. Cita archivo y línea reales, verificables en el repo. Si dejas esta tabla vacía o con referencias inventadas, C2 no pasa de nivel 1.*

| Código preexistente | Archivo:línea | Cómo me conecto con él |
|---|---|---|
| | | |
| | | |
| | | |

**¿Qué convención del repositorio seguí para que mi código no desentone?**
*(nomenclatura, estructura de carpetas, forma de registrar módulos, estilo de manejo de errores…)*



**¿Qué NO dupliqué, pudiendo hacerlo?**
*(ej.: "no creé un guard nuevo, extendí el de `gateway/src/common/guards/jwt-auth.guard.ts:14`")*



---

## 3. Decisiones técnicas

*Al menos dos decisiones reales, con la alternativa que descartaste y por qué. Una decisión sin alternativa descartada no es una decisión.*

### Decisión 1
- **Qué decidí:**
- **Alternativa que descarté:**
- **Por qué:**

### Decisión 2
- **Qué decidí:**
- **Alternativa que descarté:**
- **Por qué:**

---

## 4. Las 3 preguntas de mi actividad

*Están al final de tu actividad en `ACTIVIDADES.md`. Cópialas y respóndelas. Se evalúa que las respuestas hablen de **tu** implementación y de **tu** sistema, no en general.*

**Pregunta 1:**

> *(respuesta)*

**Pregunta 2:**

> *(respuesta)*

**Pregunta 3:**

> *(respuesta)*

---

## 5. Uso de Inteligencia Artificial — **obligatorio**

**¿Usaste IA en este examen?**  ☐ Sí  ☐ No

> Usarla no penaliza. **No declararla anula este criterio completo (C5 = 0).**
> Si marcaste "No", firma igualmente la declaración del final.

| # | Qué le pedí | Qué me devolvió | Qué corregí, adapté o descarté — y por qué |
|:--:|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**¿En qué se equivocó respecto a mi repositorio?**
*(Casi siempre se equivoca en algo: inventa rutas, propone una librería que el proyecto no usa, ignora el guard/filtro que ya existe, asume otra versión del framework. Describe al menos un caso concreto y cómo lo detectaste.)*



---

## 6. Evidencia

| Archivo | Qué demuestra |
|---|---|
| `antes-….png` | |
| `despues-….png` | |
| | |

**Cómo reproducir mi cambio desde cero:**

```bash
# comandos exactos: levantar, autenticarse, ejecutar el caso
```

---

## 7. Prueba automatizada

| | |
|---|---|
| **Archivo de la prueba** | |
| **Comando para ejecutarla** | `` |
| **Qué verifica** | |
| **¿Falla sin mi cambio?** | Sí / No — *explica cómo lo comprobaste* |

*Pega la salida de la prueba pasando:*

```
```

---

## 8. Estado final — honesto

**Funciona:**
-

**No funciona / quedó incompleto:**
-

**Cuál era mi siguiente paso:**


> Declarar con precisión lo que no terminaste **conserva** los puntos de C2, C3, C4 y C5. Presentar como terminado algo que no funciona los pone en riesgo todos.

---

## 9. Declaración

> Declaro que este trabajo es individual, que corresponde a la actividad que me fue asignada, y que la sección 5 refleja de forma completa y veraz el uso que hice de herramientas de Inteligencia Artificial durante el examen.

**Nombre:**
**Fecha:**
