# Proposal

## Why

El repositorio contiene documentación de producto y un manifiesto mínimo de pnpm, pero aún no una aplicación ni una estructura ejecutable. Hace falta convertir el stack aprobado en una base reproducible para que los cambios posteriores puedan construir sobre una aplicación Angular coherente y verificable.

## What Changes

- Inicializar el repositorio como workspace integrado de Nx gestionado con pnpm y con una aplicación web Angular 22.
- Añadir la configuración mínima para instalar desde un clon limpio, iniciar la aplicación en desarrollo y generar una compilación de producción.
- Integrar Angular Material y Tailwind CSS en la aplicación, con una comprobación visible de que el tema y las utilidades de ambos se aplican conjuntamente.
- Mantener la aplicación como una base técnica sin flujos, modelos ni integraciones de negocio.

## Capabilities

### New Capabilities
- `frontend-foundation`: instalación reproducible, arranque, compilación y presentación base de la aplicación Angular con Angular Material y Tailwind CSS.

### Modified Capabilities
- Ninguna.

## Impact

Afecta el manifiesto y lockfile de pnpm, la configuración raíz de Nx, la configuración de la aplicación Angular y sus estilos globales. No incorpora APIs Next.js, persistencia Prisma/Neon, autenticación Auth0 ni funcionalidades del gimnasio; se reservan para cambios posteriores.
