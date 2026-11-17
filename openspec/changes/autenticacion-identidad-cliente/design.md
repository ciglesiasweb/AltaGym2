# Design

## Context

La API actual solo expone `GET /api/health`; no existe todavía un flujo de autenticación ni una capa de reservas. Las decisiones aprobadas establecen Auth0 como proveedor de autenticación, PostgreSQL/Prisma como persistencia y las relaciones `AuthIdentity` -> `UserAccount` -> `Client` como identidad operativa. Auth0 conserva credenciales, tokens y sesiones reales; PostgreSQL no almacena contraseñas, tokens ni cookies.

El modelo también fija roles generales, estados de cuenta y de cliente, y permite identidades `MOCK` únicamente en desarrollo o pruebas controladas.

## Goals / Non-Goals

**Goals:**

- Definir un flujo de entrada de cliente compatible con las reglas UX y de autenticación ya aprobadas.
- Proporcionar a la API un contexto de cliente derivado de la sesión, no de datos confiados del navegador.
- Hacer que los rechazos de autenticación, vinculación y actividad sean seguros y consistentes antes de ejecutar una reserva.
- Dejar una frontera reutilizable para reservas grupales, sesiones privadas y consultas propias.

**Non-Goals:**

- Implementar aún endpoints, transacciones o reglas de aforo y disponibilidad de reservas.
- Diseñar autenticación de recepción o monitores ni autorización de backoffice.
- Añadir autorregistro, recuperación por correo/SMS, MFA, pagos o un sistema de permisos personalizados.
- Persistir una sesión paralela, contraseñas o tokens en PostgreSQL.

## Decisions

### Inicio de sesión mediante Auth0

El frontend iniciará el acceso mediante el flujo de autenticación de Auth0, manteniendo la experiencia de nombre de usuario y contraseña y sin manejar la contraseña en AltaGym. Tras autenticarse, el frontend volverá a una ruta interna protegida previamente solicitada, solo si esa ruta pertenece al área permitida y no permite redirecciones externas. La sesión y sus caducidad, cierre e invalidación serán responsabilidad del proveedor, según las reglas funcionales aprobadas.

La alternativa de implementar un formulario propio contra la API se descarta porque duplicaría la custodia de credenciales y contradiría la decisión de que Auth0 sea propietario de contraseñas y sesiones.

### Resolución server-side de identidad

Las rutas protegidas pasarán por un único resolvedor de contexto autenticado. El resolvedor validará la sesión recibida, extraerá el `sub` verificado, buscará la `AuthIdentity` por `(provider, externalSubject)` y seguirá las relaciones hasta `UserAccount` y `Client`.

El resultado será un contexto interno con la cuenta y el `clientId` efectivo. La cuenta debe estar activa y el cliente debe existir, estar vinculado uno a uno y estar activo. La ausencia de cualquier relación o un estado no operativo produce rechazo antes de llamar al caso de uso de reserva. La consulta no debe convertirse en un mecanismo para probar la existencia de otro cliente.

### Identidad efectiva y parámetros de cliente

Los casos de uso de cliente recibirán el `clientId` desde el contexto autenticado. Los contratos de reserva no lo necesitarán en el cuerpo para operaciones propias. Si una petición incluye `clientId`, solo se aceptará cuando coincida con el contexto; un valor distinto se rechazará con una respuesta de autorización sin indicar si el cliente o su reserva existen.

La alternativa de aceptar siempre el `clientId` enviado y comprobarlo después se descarta porque permite que una ruta olvide una comprobación de pertenencia y abre una suplantación horizontal.

### Respuestas y no filtración

- Sin sesión válida o con sesión caducada, cerrada o invalidada: respuesta de no autenticación y ningún efecto de negocio.
- Con sesión válida pero sin `AuthIdentity`, cuenta inactiva, `Client` ausente o cliente inactivo: respuesta de no autorización y ningún efecto de negocio.
- Con recurso de otro cliente: respuesta de no autorización o resultado neutro equivalente definido por el endpoint, sin confirmar existencia, estado o datos del recurso ajeno.

El frontend enviará al inicio de sesión los casos que requieran nueva autenticación y no reintentará automáticamente una mutación pendiente. No se diferenciarán en la interfaz las causas que las reglas aprobadas exigen tratar de forma neutra.

### Pruebas y entornos

Las pruebas ordinarias usarán identidades `MOCK` con subjects estables solo cuando el entorno esté explícitamente configurado para desarrollo o pruebas. Las pruebas del proveedor se ejecutarán separadamente contra un tenant de Auth0 de prueba. En ambos casos se comprobará que el resolvedor usa el `sub` de sesión y no un identificador aportado por el cliente.

## Risks / Trade-offs

- [La configuración de Auth0 puede diferir entre desarrollo, pruebas y producción] -> Validar configuración al arrancar y fallar de forma segura si se habilita `MOCK` fuera de entornos permitidos.
- [Una cuenta de Auth0 válida puede carecer de vínculo local] -> Mantener el vínculo explícito en `AuthIdentity` y rechazar antes de acceder a reservas; el alta y vinculación administrativa quedan fuera de este cambio.
- [Un estado de cuenta o cliente puede cambiar entre resolución y mutación] -> La operación de reserva deberá volver a verificar el estado dentro de su propia frontera transaccional cuando se implemente.
- [Los mensajes de error pueden revelar existencia de recursos ajenos] -> Usar respuestas de autorización neutras y pruebas específicas de acceso cruzado.

## Migration Plan

El cambio es aditivo porque actualmente no hay autenticación ni reservas implementadas. Primero se incorporará la configuración del proveedor y el resolvedor de identidad; después se conectarán las rutas de reserva. El rollback consiste en deshabilitar las rutas protegidas y retirar el adaptador de autenticación sin migrar ni borrar datos de negocio. Las identidades `MOCK` no se habilitarán en producción.
