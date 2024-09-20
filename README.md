## Levantar app:

- Development

```bash
docker compose up app --build
```

- Produccion

```bash
docker compose up production --build
```

## Generar docu de swagger

```bash
npx ts-node src/swagger.ts
```

- Luego para acceder, una vez este el servicio online, ir a:
  - url/api-docs
