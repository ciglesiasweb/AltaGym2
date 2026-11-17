# Proposal

## Why

El repositorio contiene documentación de producto y un manifiesto mínimo de pnpm, pero aún no una estructura ejecutable para el monorepo aprobado. Hace falta establecer una base reproducible con aplicaciones separadas para el frontend Angular y las APIs Next.js, antes de añadir funcionalidades de negocio.

## What Changes

- Inicializar el repositorio como workspace integrado de Nx gestionado con pnpm, con `apps/web` en Angular 22 y `apps/api` en Next.js.
- Añadir la configuración mínima para instalar desde un clon limpio, iniciar ambas aplicaciones y generar sus compilaciones de producción.
- Integrar Angular Material y Tailwind CSS en `apps/web`, con una comprobación visible de que el tema y las utilidades de ambos se aplican conjuntamente.
- Añadir `GET /api/health` en `apps/api`, que devuelva HTTP 200 y `{"status":"ok"}` como comprobación de arranque.
- Mantener ambas aplicaciones como una base técnica sin funcionalidades de negocio.

## Capabilities

### New Capabilities
- `frontend-foundation`: instalación reproducible, arranque, compilación y presentación base de `apps/web` con Angular Material y Tailwind CSS.
- `api-foundation`: arranque, endpoint de salud y compilación de producción de `apps/api`.

### Modified Capabilities
- Ninguna.

## Impact

Afecta el manifiesto y lockfile de pnpm, la configuración raíz de Nx, las aplicaciones `apps/web` y `apps/api`, y los estilos globales del frontend. Solo incorpora el endpoint técnico de salud; Prisma, Neon, Auth0 y los endpoints de negocio se reservan para cambios posteriores.
