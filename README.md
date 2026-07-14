# EMM Bank System — Tarea 9: Camino Asincrono Redis

## Camino asincrono (Redis events)
```
Cliente HTTP -> Gateway(:3000) -> Redis emit -> (fire & forget)
                                                   |
                                                   v
                                              Usuarios consume
                                              (no bloquea al emisor)
```

- Patron: **Publisher/Subscriber** via Redis PUB/SUB
- Desacoplamiento temporal: el emisor no espera al consumidor
- Si Usuarios se cae, el Gateway aun retorna exito al cliente

## Ejecutar
```bash
cd tarea-1
docker compose up -d --build
curl http://localhost:3000/api/health
```

## Probar evento asincrono
```bash
curl -X POST http://localhost:3000/api/usuarios/evento \
  -H "Content-Type: application/json" \
  -d '{"type":"create","name":"Juan Perez","email":"juan@bank.com"}'
```

## Endpoints
| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /api/health | Health check del Gateway |
| POST | /api/usuarios/evento | Publicar evento Redis (no bloquea) |
