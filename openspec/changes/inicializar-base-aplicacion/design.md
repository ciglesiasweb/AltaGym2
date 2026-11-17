# Design

## Context

El repositorio solo contiene documentación, un `package.json` mínimo y un lockfile de pnpm. El manifiesto declara `pnpm@9.3.0`; no hay aplicación Angular ni workspace Nx. El contexto técnico aprueba Angular 22, Nx, Angular Material y Tailwind CSS para el frontend, y menciona Next.js para APIs que quedan fuera de este cambio.

## Goals / Non-Goals

**Goals:**
- Dejar una aplicación identificable y ejecutable como proyecto Nx, con las tareas `serve` y `build`.
- Mantener instalables las dependencias con versiones fijadas y un lockfile versionado.
- Hacer que la estrategia de estilos sea comprensible y evite que Tailwind altere los componentes Material.

**Non-Goals:**
- Crear librerías compartidas vacías antes de que exista código que reutilizar.
- Incorporar SSR, APIs, autenticación, base de datos, despliegue o comportamiento del gimnasio.

## Decisions

### Workspace Nx integrado con una única aplicación `web`

Inicializar Nx en la raíz existente, conservando el repositorio y el manifiesto de pnpm, y generar una aplicación Angular 22 de renderizado en cliente bajo `apps/web`. Mantener la configuración del proyecto y los targets Nx junto a la aplicación; reservar `libs/` para librerías que se justifiquen en cambios posteriores. Usar versiones compatibles de Nx y Angular y mantener alineadas entre sí las dependencias del plugin Nx.

Antes de ejecutar cualquier generador o inicializar el workspace, resolver las versiones exactas de Nx, Angular 22, Angular Material, TypeScript y Node.js. Contrastar la versión concreta de Nx y su plugin Angular con Angular 22; verificar que la versión de Angular Material acepta esa versión de Angular, que TypeScript está dentro del rango admitido por Angular 22 y que Node.js satisface los rangos de Angular y Nx. Usar las matrices oficiales de compatibilidad y los `peerDependencies`/requisitos `engines` de los paquetes seleccionados, y registrar en el README la matriz exacta comprobada. No continuar al scaffold si algún rango no coincide.

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
nx.json
package.json
pnpm-lock.yaml
tsconfig.base.json
```

Documentar la matriz validada de versiones exactas de Node.js, pnpm, Nx, Angular 22, Angular Material y TypeScript, así como los comandos de instalación, `pnpm nx serve web` y `pnpm nx build web --configuration=production`, en el README raíz. Fijar las versiones probadas en el manifiesto y conservar las dependencias en el lockfile.

Se elige renderizado en cliente para esta base interna y sin contenido público indexable; añadir SSR supondría configurar y validar un servidor que no necesita ningún requisito actual.

### Material es dueño del tema; Tailwind se limita a la maquetación

Definir un único tema global de Angular Material en `apps/web/src/styles.scss`, con las variables de color, tipografía y densidad que consuman los componentes Material. Cargar el CSS global de Material antes de `tailwind.css`. Mantener las reglas de componentes Material en sus estilos propios y no usar utilidades Tailwind para sobrescribir sus elementos internos.

Integrar Tailwind CSS v4 mediante PostCSS y `apps/web/src/tailwind.css`. Importar `tailwindcss/theme.css` y `tailwindcss/utilities.css` en las capas `theme` y `utilities`, sin importar `tailwindcss/preflight.css`: Preflight normaliza estilos globales (por ejemplo, márgenes y encabezados) y puede interferir con la presentación de una biblioteca de componentes. Usar utilidades Tailwind para contenedores, distribución, espaciado y comportamiento responsive; el tema Material seguirá siendo la fuente de verdad para la apariencia de sus componentes. Configurar la detección de fuentes para `apps/web/src` a fin de que Nx incluya las clases usadas en las plantillas.

La pantalla inicial incluirá un botón Material con el tema aplicado y un contenedor con una utilidad de espaciado Tailwind. Esa combinación permitirá comprobar visualmente ambos sistemas al servir la aplicación y confirmar que los dos estilos se emitieron en producción, sin introducir una funcionalidad de negocio.

### Dependencias y validación reproducibles

Usar el plugin Angular de Nx para scaffold y targets, Angular Material de la misma generación mayor que Angular, y Tailwind CSS v4 con su integración PostCSS. Versionar manifiesto y lockfile juntos. Fijar en el repositorio una versión de Node compatible con Angular 22 y una versión exacta de pnpm compatible con el workspace; no depender de instalaciones globales de Nx ni Angular CLI.

Validar la instalación con `pnpm install --frozen-lockfile`, el servidor con `pnpm nx serve web`, y la compilación de producción con `pnpm nx build web --configuration=production`. En el servidor, comprobar la URL y la presentación de la pantalla inicial; en la salida de producción, comprobar que el tema Material y las utilidades Tailwind de esa pantalla están presentes.

## Risks / Trade-offs

- [La versión de Nx elegida puede no ser compatible con Angular 22 o con el Node fijado] → Resolver las versiones según la compatibilidad publicada por Nx y Angular, mantener coherentes los paquetes Nx, y completar instalación congelada, serve y build antes de cerrar el cambio.
- [Un orden o configuración de CSS incorrectos puede ocultar utilidades o alterar Material] → Mantener Material como propietario del tema, omitir Preflight, limitar Tailwind a la maquetación y validar ambos en la pantalla de demostración y en el CSS compilado.
- [El lockfile puede quedar desincronizado del manifiesto] → Generarlo con la versión de pnpm declarada y verificar que `pnpm install --frozen-lockfile` no lo modifica.

## Migration Plan

No hay aplicación ni datos que migrar. Añadir la configuración del workspace preservando la documentación y la dependencia de OpenSpec existentes; incorporar el manifiesto y lockfile actualizados en el mismo cambio. Para revertir, retirar los archivos de la aplicación y la configuración Nx agregados y restaurar el manifiesto y lockfile anteriores, sin afectar la documentación del producto.
