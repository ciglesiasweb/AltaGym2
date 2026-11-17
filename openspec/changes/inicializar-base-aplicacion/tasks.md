# Tasks

## 1. Workspace Nx y dependencias reproducibles

- [ ] 1.1 Antes de ejecutar cualquier generador, resolver las versiones exactas de Nx, `@nx/angular`, `@nx/next`, Angular 22, Angular Material, TypeScript, Next.js, Node.js y pnpm. Contrastar la compatibilidad de Nx con Angular y Next.js, comprobar que ambos plugins Nx son compatibles con la versión elegida de Nx, y verificar los `peerDependencies`/rangos `engines` de Angular Material, TypeScript, Next.js y Node.js. Registrar la matriz y las fuentes consultadas; no generar el workspace hasta confirmar todos los rangos.
- [ ] 1.2 Inicializar Nx como workspace integrado en la raíz con las versiones comprobadas en 1.1, conservando el manifiesto existente y la dependencia de OpenSpec; verificar que `nx.json` y la configuración TypeScript raíz están presentes.
- [ ] 1.3 Fijar en `package.json` la versión de pnpm probada, actualizar `pnpm-lock.yaml` y verificar la instalación con `pnpm install --frozen-lockfile` sin que cambie el lockfile ni se requieran instalaciones globales.
- [ ] 1.4 Crear o actualizar el README raíz con la matriz de versiones exactas verificada, los requisitos de Node.js y pnpm, la instalación congelada, `pnpm nx serve web` y `pnpm nx build web --configuration=production`; verificar que los comandos y versiones documentados coinciden con la configuración del workspace.

## 2. Aplicación Angular inicial

- [ ] 2.1 Generar la aplicación Angular 22 de renderizado en cliente `web` bajo `apps/web` con las versiones verificadas en 1.1 y targets Nx para servir y compilar; verificar con `pnpm nx show project web` que existen `serve` y `build`.
- [ ] 2.2 Añadir la pantalla inicial mínima de AltaGym2 y su prueba base, sin lógica de negocio; verificar la prueba del proyecto y que `pnpm nx serve web` responde en la URL local documentada.

## 3. Tema Material y utilidades Tailwind

- [ ] 3.1 Añadir Angular Material y su tema global; añadir Tailwind CSS v4 con PostCSS e importar solo theme y utilities, omitiendo Preflight. Configurar la detección de clases de `apps/web/src` y documentar la responsabilidad de estilos de cada sistema; verificar que la aplicación compila.
- [ ] 3.2 Mostrar un componente Material tematizado junto a un contenedor con una utilidad Tailwind de espaciado en la pantalla inicial; verificar en el navegador que se aplican ambos estilos y que la consola no registra errores de estilos.
- [ ] 3.3 Compilar con `pnpm nx build web --configuration=production` y comprobar que el CSS de producción contiene el tema Material y la utilidad Tailwind usada por la pantalla inicial.

## 4. Aplicación API con Next.js

- [ ] 4.1 Generar `apps/api` con Next.js y `@nx/next` en el workspace existente; configurar sus targets Nx y verificar con `pnpm nx show project api` que existen `serve` y `build`.
- [ ] 4.2 Implementar el Route Handler `GET /api/health` con respuesta HTTP 200 y JSON `{"status":"ok"}`; verificar mediante una petición HTTP local el estado, el cuerpo exacto y el tipo de contenido JSON.
- [ ] 4.3 Documentar en el README `pnpm nx serve api`, la ruta de salud y `pnpm nx build api --configuration=production`; verificar el comando de compilación de producción y la respuesta del endpoint.

## 5. Verificación de integración

- [ ] 5.1 Probar desde un clon limpio con la matriz comprobada: ejecutar `pnpm install --frozen-lockfile`, servir `web` y `api`, solicitar `GET /api/health`, y ejecutar `pnpm nx build web --configuration=production` y `pnpm nx build api --configuration=production`; confirmar que la instalación no modifica el lockfile, ambas aplicaciones arrancan, la respuesta de salud coincide y las dos compilaciones finalizan correctamente.
- [ ] 5.2 Validar el cambio con `pnpm exec openspec validate inicializar-base-aplicacion --strict` y corregir cualquier error de formato o requisito antes de darlo por completo.
