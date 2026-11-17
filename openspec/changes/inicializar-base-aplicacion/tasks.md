# Tasks

## 1. Workspace Nx y dependencias reproducibles

- [ ] 1.1 Antes de ejecutar cualquier generador, resolver las versiones exactas de Nx, Angular 22, Angular Material, TypeScript y Node.js; contrastar la compatibilidad de Nx/plugin Angular con Angular 22, los `peerDependencies` de Material y los rangos de TypeScript y Node.js publicados para Angular 22 y Nx. Registrar las versiones y fuentes consultadas en una matriz; no generar el workspace hasta confirmar que todos los rangos coinciden.
- [ ] 1.2 Inicializar Nx como workspace integrado en la raíz y generar la aplicación con las versiones verificadas en 1.1, conservando el manifiesto existente y la dependencia de OpenSpec; verificar que `nx.json`, la configuración TypeScript raíz y las versiones fijadas están presentes.
- [ ] 1.3 Fijar en `package.json` la versión de pnpm probada, actualizar `pnpm-lock.yaml` y verificar la instalación con `pnpm install --frozen-lockfile` sin que cambie el lockfile ni se requieran instalaciones globales.
- [ ] 1.4 Crear o actualizar el README raíz con la matriz de versiones exactas verificada, los requisitos de Node.js y pnpm, la instalación congelada, `pnpm nx serve web` y `pnpm nx build web --configuration=production`; verificar que los comandos y versiones documentados coinciden con la configuración del workspace.

## 2. Aplicación Angular inicial

- [ ] 2.1 Generar la aplicación Angular 22 de renderizado en cliente `web` bajo `apps/web` con targets Nx para servir y compilar; verificar con `pnpm nx show project web` que existen `serve` y `build`.
- [ ] 2.2 Añadir la pantalla inicial mínima de AltaGym2 y su prueba base, sin lógica de negocio; verificar la prueba del proyecto y que `pnpm nx serve web` responde en la URL local documentada.

## 3. Tema Material y utilidades Tailwind

- [ ] 3.1 Añadir Angular Material y su tema global; añadir Tailwind CSS v4 con PostCSS e importar solo theme y utilities, omitiendo Preflight. Configurar la detección de clases de `apps/web/src` y documentar la responsabilidad de estilos de cada sistema; verificar que la aplicación compila.
- [ ] 3.2 Mostrar un componente Material tematizado junto a un contenedor con una utilidad Tailwind de espaciado en la pantalla inicial; verificar en el navegador que se aplican ambos estilos y que la consola no registra errores de estilos.
- [ ] 3.3 Compilar con `pnpm nx build web --configuration=production` y comprobar que el CSS de producción contiene el tema Material y la utilidad Tailwind usada por la pantalla inicial.

## 4. Verificación de integración

- [ ] 4.1 Probar el flujo desde un clon limpio con la matriz de versiones exactas comprobada: ejecutar `pnpm install --frozen-lockfile`, `pnpm nx serve web` y `pnpm nx build web --configuration=production`; confirmar que la instalación no altera el lockfile, la aplicación arranca y la compilación de producción termina correctamente.
- [ ] 4.2 Validar el cambio con `pnpm exec openspec validate inicializar-base-aplicacion --strict` y corregir cualquier error de formato o requisito antes de darlo por completo.
