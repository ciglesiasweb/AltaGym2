# AltaGym2

## Matriz de versiones validada

| Herramienta | Versión exacta |
| --- | --- |
| Node.js | 24.22.2 |
| pnpm | 12.21.0 |
| Nx | 24.0.6 |
| `@nx/angular` | 24.0.6 |
| `@nx/next` | 24.0.6 |
| Angular | 22.2.6 |
| Angular Material y CDK | 22.2.7 |
| TypeScript | 6.0.3 |
| Next.js | 16.4.6 |
| OpenSpec | 2.0.0 |

### Compatibilidad comprobada y fuentes

- La matriz oficial de [Angular](https://angular.dev/reference/versions) indica que Angular 22 admite Node.js `^22.22.3 || ^24.15.0 || ^26.0.0` y TypeScript `>=6.0.0 <6.1.0`. Node.js 24.22.2 y TypeScript 6.0.3 cumplen esos rangos.
- La [matriz de compatibilidad Angular/Nx](https://nx.dev/docs/kb/angular-nx-version-matrix) recomienda la versión actual de Nx para Angular 22.2 y establece Nx `>=24.0.0`. Se seleccionó Nx 24.0.6; `@nx/angular` y `@nx/next` son también 24.0.6.
- Los metadatos de [@nx/angular 24.0.6](https://registry.npmjs.org/@nx%2Fangular/24.0.6) aceptan `@angular/build`, `@angular-devkit/*` y `@schematics/angular` desde la versión 20 hasta antes de la 23. Los metadatos de [@nx/next 24.0.6](https://registry.npmjs.org/@nx%2Fnext/24.0.6) exigen `@nx/webpack` 24.0.6 y Next.js `>=14.0.0 <17.0.0`.
- Los metadatos de [Angular 22.2.6](https://registry.npmjs.org/@angular%2Fcore/22.2.6) y [Angular Material 22.2.7](https://registry.npmjs.org/@angular%2Fmaterial/22.2.7) confirman que Material requiere CDK 22.2.7 y admite Angular 22.2.6. Los metadatos de [Next.js 16.4.6](https://registry.npmjs.org/next/16.4.6) requieren Node.js `>=20.9.0`.
- Se comprobó que Node.js 24.22.2 está instalado y que [pnpm 12.21.0](https://registry.npmjs.org/pnpm/12.21.0) puede ejecutarse con Node.js 24. La [tabla de compatibilidad de pnpm](https://pnpm.io/installation#compatibility) incluye Node.js 24 para pnpm 12.

## Desarrollo

Con Node.js 24.22.2 y pnpm 12.21.0:

```sh
pnpm install --frozen-lockfile
pnpm nx serve web
```

La aplicación web estará disponible en `http://localhost:4200`.
Para compilarla en modo de producción:

```sh
pnpm nx build web --configuration=production
```

Para iniciar la API y comprobar su estado:

```sh
pnpm nx serve api
```

La ruta `GET http://localhost:3000/api/health` devuelve
`{"status":"ok"}`. Para compilar la API en modo de producción:

```sh
pnpm nx build api --configuration=production
```

### Estilos

Angular Material define el tema global, la tipografía y la densidad de sus
componentes. Tailwind CSS v4 proporciona utilidades para la maquetación y el
espaciado; su Preflight no se carga para evitar alterar los componentes
Material. Tailwind detecta las clases utilizadas bajo `apps/web/src`.

