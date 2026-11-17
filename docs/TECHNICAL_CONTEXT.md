# AltaGym — Contexto técnico

**Estado:** Contexto inicial aprobado; arquitectura y esquema físico definidos**Última actualización:** 14 de julio de 2026

Este documento reúne los condicionantes aprobados que deben guiar el diseño técnico y la arquitectura de implementación del MVP. No define la implementación de la aplicación, que se detalla en `docs/ARCHITECTURE.md`, ni sustituye las reglas funcionales de los documentos generales y de las features.

## Alcance de la solución

- Aplicación web responsive.
- Sin aplicaciones móviles nativas en el MVP.
- Un único gimnasio y un único centro.
- Sin necesidad de arquitectura multitenant.

## Plataforma aprobada

| Componente                   | Servicio |
| ---------------------------- | -------- |
| Alojamiento de la aplicación | Vercel   |
| Base de datos PostgreSQL     | Neon     |
| Gestión de autenticación     | Auth0    |

La integración concreta de estos servicios se definirá durante el diseño técnico.

## Stack tecnológico aprobado

| Capa                      | Tecnología |
| ------------------------- | ---------- |
| Framework de los apis     | Next.js    |
| Framework del frontend    | angular 22 |
| ORM y acceso a PostgreSQL | Prisma     |

El repo estará bajo un repositorio nx. Esto permitirá gestionar de manera eficiente múltiples aplicaciones y librerías compartidas dentro del mismo monorepo, facilitando la organización del código y la reutilización de componentes.

## Stack frontend

- Nx para organizar el workspace.
- Angular 22 para la aplicación web.
- Angular Material para los componentes de interfaz y su tematización.
- Tailwind CSS para la maquetación, el espaciado y los ajustes visuales.

## Escala de referencia

- Máximo aproximado de 100 clientes.
- Pocos usuarios simultáneos.
- Volumen de reservas reducido, pendiente de estimación concreta.

La solución no necesita mecanismos especiales de escalabilidad para el MVP. Esta escala reducida no elimina la necesidad de garantizar la consistencia y controlar la concurrencia al reservar plazas, monitores o franjas horarias.

## Decisiones pendientes

- Estimación del volumen de reservas.
- Presupuesto o límite mensual de infraestructura.

Estas decisiones se abordarán en fases posteriores de operación e infraestructura.
