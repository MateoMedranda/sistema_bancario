# EMM Bank System — Tarea 8: Camino Sincrono TCP

## Camino sincrono (TCP chain)
```
Cliente HTTP -> Gateway(:3000) -> TCP -> Transacciones(:4003) -> TCP -> Cuentas(:4002)
```

- Patron: **Request-Response** via TCP
- La latencia se acumula: latencia(Gateway->Transacciones) + latencia(Transacciones->Cuentas)
- Acoplamiento temporal: si Cuentas se cae, toda la cadena falla

## Ejecutar
```bash
cd tarea-1
docker compose up -d --build
curl http://localhost:3000/api/health
```

## Endpoints
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /api/health | Health check del Gateway |
| POST | /api/transacciones | Crear transaccion (cadena TCP) |
| GET | /api/transacciones | Listar transacciones |
| GET | /api/transacciones/:id | Obtener transaccion por ID |
