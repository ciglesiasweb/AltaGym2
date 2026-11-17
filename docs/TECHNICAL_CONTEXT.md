# AltaGym — Contexto técnico

**Estado:** Contexto inicial aprobado; arquitectura y esquema físico definidos**Última actualización:** 14 de julio de 2026

Este documento reúne los condicionantes aprobados que deben guiar el diseño técnico y la arquitectura de implementación del MVP. No define la implementación de la aplicación, que se detalla en `docs/ARCHITECTURE.md`, ni sustituye las reglas funcionales de los documentos generales y de las features.

## Alcance de la solución

- Aplicación web responsive.
- Sin aplicaciones móviles nativas en el MVP.
- Un único gimnasio y un único centro.
- Sin necesidad de arquitectura multitenant.

## Plataforma aprobada

| Componente | Servicio |
|---|---|
| Alojamiento de la aplicación | Vercel |
| Base de datos PostgreSQL | Neon |
| Gestión de autenticación | Auth0 |

La integración concreta de estos servicios se definirá durante el diseño técnico.

## Stack tecnológico aprobado

| Capa | Tecnología |
|---|---|
| Framework de aplicación web | Next.js |
| Biblioteca de interfaz | React |
| Lenguaje | TypeScript |
| ORM y acceso a PostgreSQL | Prisma |

Frontend y backend convivirán en una única aplicación Next.js. La aplicación se organizará como un monolito modular: interfaz, operaciones de servidor y reglas de negocio formarán un único proyecto desplegable, con módulos separados por áreas funcionales. El MVP no utilizará microservicios ni un backend desplegado como aplicación independiente.

La estructura concreta de módulos, las responsabilidades de las capas y los mecanismos de acceso a datos se recogen en `docs/ARCHITECTURE.md`.

## Escala de referencia

- Máximo aproximado de 100 clientes.
- Pocos usuarios simultáneos.
- Volumen de reservas reducido, pendiente de estimación concreta.

La solución no necesita mecanismos especiales de escalabilidad para el MVP. Esta escala reducida no elimina la necesidad de garantizar la consistencia y controlar la concurrencia al reservar plazas, monitores o franjas horarias.

## Decisiones pendientes

- Estimación del volumen de reservas.
- Presupuesto o límite mensual de infraestructura.

Estas decisiones se abordarán en fases posteriores de operación e infraestructura.
