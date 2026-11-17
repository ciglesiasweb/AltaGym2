# Design

## Context

El repositorio solo contiene documentación, un `package.json` mínimo y un lockfile de pnpm. El manifiesto declara `pnpm@9.3.0`; no hay aplicaciones ni workspace Nx. El contexto técnico define Next.js para las APIs, Angular 22 para el frontend, y Nx para organizar ambas aplicaciones en el monorepo.

## Goals / Non-Goals

**Goals:**
- Dejar `apps/web` y `apps/api` como proyectos Nx identificables y ejecutables, con tareas `serve` y `build`.
- Mantener instalables las dependencias con versiones fijadas y un lockfile versionado.
- Hacer que la estrategia de estilos sea comprensible y evite que Tailwind altere los componentes Material.
- Proporcionar una ruta de salud API que permita verificar el arranque de `apps/api`.

**Non-Goals:**
- Crear librerías compartidas vacías antes de que exista código que reutilizar.
- Incorporar endpoints de negocio, autenticación, base de datos, despliegue o comportamiento del gimnasio.

## Decisions

### Workspace Nx integrado con aplicaciones `web` y `api`

Inicializar Nx en la raíz existente, conservando el repositorio y el manifiesto de pnpm. Generar `apps/web` con Angular 22 y `apps/api` con Next.js para las APIs. Mantener la configuración y los targets Nx junto a cada aplicación; reservar `libs/` para librerías que se justifiquen en cambios posteriores. Usar el plugin Angular de Nx para el frontend y `@nx/next` para el backend.

Antes de ejecutar cualquier generador o inicializar el workspace, resolver las versiones exactas de Nx, `@nx/angular`, `@nx/next`, Angular 22, Angular Material, TypeScript, Next.js, Node.js y pnpm. Contrastar la versión de Nx con la compatibilidad publicada para Angular 22 y Next.js, mantener alineadas con Nx las versiones de `@nx/angular` y `@nx/next`, verificar los `peerDependencies` de Angular Material y comprobar los rangos de TypeScript y Node.js admitidos por Angular, Nx y Next.js. Usar las matrices oficiales de compatibilidad y los `peerDependencies`/requisitos `engines` de los paquetes seleccionados; registrar en el README las versiones exactas y las fuentes consultadas. No continuar al scaffold si algún rango no coincide.

Estructura inicial esperada:

```text
apps/
  web/
    project.json
    src/
      app/
      main.ts
      index.html
      styles.scss
      tailwind.css
  api/
    project.json
    src/
      app/
        api/
          health/
            route.ts
nx.json
package.json
pnpm-lock.yaml
tsconfig.base.json
```

Documentar la matriz validada de versiones exactas de Node.js, pnpm, Nx, `@nx/angular`, `@nx/next`, Angular 22, Angular Material, TypeScript y Next.js en el README raíz. Incluir los comandos de instalación, `pnpm nx serve web`, `pnpm nx build web --configuration=production`, `pnpm nx serve api` y `pnpm nx build api --configuration=production`. Fijar las versiones probadas en el manifiesto y conservar las dependencias en el lockfile.

Se elige renderizado en cliente para `apps/web`, una aplicación interna sin contenido público indexable. `apps/api` no sirve una interfaz; queda limitada a Route Handlers. Añadir SSR al frontend supondría configurar y validar un servidor que no necesita ningún requisito actual.

### Next.js como aplicación API

Usar la aplicación Next.js generada por `@nx/next` como proyecto `api` del mismo workspace. Definir `GET /api/health` mediante un Route Handler del App Router en `apps/api/src/app/api/health/route.ts`; responder con HTTP 200 y el JSON `{"status":"ok"}`. Esta única ruta permite comprobar que la aplicación puede arrancar y atender peticiones sin incorporar acceso a datos, autenticación ni endpoints de negocio.

### Material es dueño del tema; Tailwind se limita a la maquetación

Definir un único tema global de Angular Material en `apps/web/src/styles.scss`, con las variables de color, tipografía y densidad que consuman los componentes Material. Cargar el CSS global de Material antes de `tailwind.css`. Mantener las reglas de componentes Material en sus estilos propios y no usar utilidades Tailwind para sobrescribir sus elementos internos.

Integrar Tailwind CSS v4 mediante PostCSS y `apps/web/src/tailwind.css`. Importar `tailwindcss/theme.css` y `tailwindcss/utilities.css` en las capas `theme` y `utilities`, sin importar `tailwindcss/preflight.css`: Preflight normaliza estilos globales (por ejemplo, márgenes y encabezados) y puede interferir con la presentación de una biblioteca de componentes. Usar utilidades Tailwind para contenedores, distribución, espaciado y comportamiento responsive; el tema Material seguirá siendo la fuente de verdad para la apariencia de sus componentes. Configurar la detección de fuentes para `apps/web/src` a fin de que Nx incluya las clases usadas en las plantillas.

La pantalla inicial incluirá un botón Material con el tema aplicado y un contenedor con una utilidad de espaciado Tailwind. Esa combinación permitirá comprobar visualmente ambos sistemas al servir la aplicación y confirmar que los dos estilos se emitieron en producción, sin introducir una funcionalidad de negocio.

### Dependencias y validación reproducibles

Usar `@nx/angular` y `@nx/next` para scaffold y targets, Angular Material de la misma generación mayor que Angular, y Tailwind CSS v4 con su integración PostCSS. Versionar manifiesto y lockfile juntos. Fijar en el repositorio una versión de Node compatible con Angular 22 y Next.js y una versión exacta de pnpm compatible con el workspace; no depender de instalaciones globales de Nx, Angular CLI ni Next.js.

Validar la instalación con `pnpm install --frozen-lockfile`, servir las aplicaciones con `pnpm nx serve web` y `pnpm nx serve api`, y compilar en producción con `pnpm nx build web --configuration=production` y `pnpm nx build api --configuration=production`. En el servidor web, comprobar la presentación de la pantalla inicial; en la API, verificar `GET /api/health` devuelve HTTP 200 y `{"status":"ok"}`. Confirmar que las compilaciones de producción terminan correctamente y que el CSS de `web` contiene el tema Material y las utilidades Tailwind esperadas.

## Risks / Trade-offs

- [Las versiones de Nx, sus plugins, Angular, Next.js o Node pueden ser incompatibles entre sí] → Verificar la matriz de versiones exactas y sus rangos publicados antes del scaffold, mantener alineadas las versiones de los plugins Nx y probar ambos proyectos.
- [Un orden o configuración de CSS incorrectos puede ocultar utilidades o alterar Material] → Mantener Material como propietario del tema, omitir Preflight, limitar Tailwind a la maquetación y validar ambos en la pantalla de demostración y en el CSS compilado.
- [El lockfile puede quedar desincronizado del manifiesto] → Generarlo con la versión de pnpm declarada y verificar que `pnpm install --frozen-lockfile` no lo modifica.
- [La ruta de salud podría confundirse con un endpoint funcional de producto] → Mantener su respuesta estática y no añadir acceso a Prisma, Neon, Auth0 ni lógica de negocio.

## Migration Plan

No hay aplicaciones ni datos que migrar. Añadir la configuración del workspace preservando la documentación y la dependencia de OpenSpec existentes; incorporar ambas aplicaciones y el manifiesto y lockfile actualizados en el mismo cambio. Para revertir, retirar las aplicaciones y la configuración Nx agregadas y restaurar el manifiesto y lockfile anteriores, sin afectar la documentación del producto.
