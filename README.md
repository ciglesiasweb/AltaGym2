# Orquestator-gym

Orquestator-gym es un laboratorio de desarrollo agéntico para AltaGym: un
workspace Nx que reúne un frontend Angular 22, una API Next.js y el flujo de
especificación de OpenSpec.

## Estado actual

El producto previsto es una aplicación de reservas para un gimnasio: debe
permitir consultar clases y reservar o cancelar plazas y sesiones privadas.
El workspace ya incluye un primer recorrido de reservas grupales para clientes:
consultas autenticadas, confirmación idempotente y sus pantallas web. La API
también expone `GET /api/health`, que devuelve `{"status":"ok"}`. La cancelación,
la lista de espera, las operaciones de recepción y la orquestación de agentes
siguen fuera de la capacidad implementada.

## Requisitos y versiones

Usa Node.js `24.22.2` y pnpm `12.21.0`, la versión fijada por
`package.json` y `pnpm-lock.yaml`. Las versiones principales son:

| Herramienta | Versión |
| --- | --- |
| Nx, `@nx/angular`, `@nx/next` | 24.0.6 |
| Angular | 22.2.6 |
| Angular Material y CDK | 22.2.7 |
| Next.js | 16.4.6 |
| TypeScript | 6.0.3 |
| OpenSpec | 2.0.0 |

## Arrancar y verificar

Desde la raíz del repositorio:

```sh
pnpm install --frozen-lockfile
```

Arranca el frontend Angular en `http://localhost:4200`:

```sh
pnpm nx serve web
```

Arranca la API Next.js en la URL que indique Nx, normalmente
`http://localhost:3000`, y comprueba su endpoint de salud:

```sh
pnpm nx serve api
curl http://localhost:3000/api/health
```

El resultado esperado es `{"status":"ok"}` con HTTP 200.

Comprobaciones no interactivas:

```sh
pnpm nx test web
pnpm exec vitest run apps/api/src
pnpm nx build web --configuration=production
pnpm nx build api --configuration=production
```

Las pruebas de integración de reservas requieren una base PostgreSQL aislada,
distinta de `DATABASE_URL` e identificada por `TEST_DATABASE_URL` con el token
`test` en el host o en el nombre de la base de datos. El runner carga `.env`,
aplica las migraciones antes de ejecutar la suite y rechaza destinos ambiguos:

```sh
pnpm test:api:integration
```

Si el destino es realmente exclusivo y desechable para pruebas, pero coincide
con `DATABASE_URL` o no tiene ese marcador, se puede confirmar solo para una
ejecución configurando `CONFIRM_TEST_DATABASE_ISOLATED=true` en el entorno del
proceso. No guardes esa confirmación en `.env`.

La compilación Angular genera sus artefactos en `dist/apps/web`. Para
validar OpenSpec y ver qué cambios están activos:

```sh
pnpm exec openspec list
pnpm exec openspec validate --specs
```

Cuando exista un cambio activo, valida sus artefactos con
`pnpm exec openspec validate <nombre-del-cambio> --strict`.

## Mapa del repositorio

- **Angular:** `apps/web/` contiene la aplicación web; el código está en
  `apps/web/src/`, la configuración Nx en `apps/web/project.json` y el
  objetivo de producción es `web:build:production`.
- **Next.js:** `apps/api/` contiene la API; sus rutas están en
  `apps/api/src/app/`, incluido `apps/api/src/app/api/health/route.ts`, y la
  configuración Nx está en `apps/api/project.json`.
- **OpenSpec:** `openspec/config.yaml` define el flujo; los requisitos están
  en `openspec/specs/` y la base inicial archivada, con su propuesta y tareas,
  está en `openspec/changes/archive/2026-11-17-inicializar-base-aplicacion/`.
- **Producto:** `docs/PRODUCT.md` describe el alcance de la aplicación de
  reservas; `docs/TECHNICAL_CONTEXT.md` recoge las decisiones técnicas.

Para las reglas de colaboración de agentes, consulta
[`AGENTS.md`](AGENTS.md).
