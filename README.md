# EMM Bank System — Tarea 10: Manejo de Excepciones

## Manejo de excepciones en la capa de servicios

### Exception Filter Global (Gateway)
Archivo: `apps/sistema_bancario/src/filters/all-exceptions.filter.ts`

Captura TODAS las excepciones (HTTP y de microservicios TCP) y retorna:
```json
{
  "statusCode": 404,
  "timestamp": "2026-07-14T...",
  "path": "/api/transacciones/123",
  "method": "GET",
  "message": "Transaccion con ID 123 no encontrada"
}
```

### Propagacion de excepciones via TCP
```
Cuentas (NotFoundException) 
  -> Transacciones (propaga via TCP)
    -> Gateway (AllExceptionsFilter captura)
      -> Cliente HTTP recibe respuesta estructurada
```

### Ejemplo: cuenta no encontrada
```bash
curl http://localhost:3000/api/transacciones/nonexistent-id
# Retorna: { "statusCode": 404, "message": "Transaccion con ID nonexistent-id no encontrada" }
```

### Ejemplo: cadena TCP falla
```bash
# Si Cuentas se cae, Transacciones retorna error, Gateway lo captura
curl http://localhost:3000/api/transacciones
# Gateway retorna: { "statusCode": 500, "message": "Error interno del servidor" }
```

## Ejecutar
```bash
cd tarea-1
docker compose up -d --build
curl http://localhost:3000/api/health
```
