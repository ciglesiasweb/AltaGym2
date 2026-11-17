# Proposal

## Why

Las reservas necesitan distinguir de forma fiable al cliente autenticado que realiza la petición. Las decisiones aprobadas ya fijan Auth0 como proveedor de autenticación y separan la cuenta de acceso, la identidad externa y el perfil `Client`, pero todavía falta el contrato que conecte esos elementos sin permitir que un cliente actúe en nombre de otro.

Este cambio desbloquea la reserva de plazas definiendo el acceso del cliente y la resolución de su identidad interna, incluidos los rechazos seguros para sesiones ausentes, cuentas no vinculadas o clientes inactivos.

## What Changes

- Definir el inicio de sesión del cliente mediante usuario y contraseña con Auth0, conforme a las decisiones aprobadas de normalización, sesión y mensajes genéricos.
- Definir cómo la API valida server-side la sesión gestionada por Auth0 y resuelve el `sub` verificado mediante `AuthIdentity` hasta una única `UserAccount` con rol `CLIENT` y su `Client` asociado.
- Establecer el contexto de cliente que las operaciones de reserva deben obtener del servidor, sin aceptar un identificador de cliente controlado por el navegador como fuente de autoridad.
- Especificar las respuestas y efectos para ausencia de sesión, identidad externa no vinculada, cuenta inactiva, cliente no vinculado e identidad de cliente inactiva.
- Cubrir con escenarios la autorización por pertenencia, incluida una petición que intenta operar sobre otro cliente y debe recibir un rechazo neutro sin revelar información sobre él.
- Dejar como requisito pendiente de la propuesta de reservas de la PR #2 la revalidación transaccional de que el cliente autenticado sigue activo justo antes de confirmar cualquier mutación.
- Mantener pendiente la elección del transporte de la sesión entre cookie gestionada por Auth0 y bearer token; la API no podrá aceptar un `sub` procedente del body, query o headers controlados por el cliente.
- Mantener fuera del alcance la implementación de reservas, el backoffice, la gestión de cuentas, los cambios de contraseña y la autenticación de monitores o recepción.

## Capabilities

### New Capabilities

- `identity/client-authentication`: Autenticación del cliente y resolución segura de su identidad interna para operaciones protegidas de reserva.

### Modified Capabilities

- Ninguna.

## Impact

- API Next.js: middleware o servicio de contexto autenticado para validar la sesión de Auth0 y resolver `AuthIdentity`, `UserAccount` y `Client`.
- Persistencia Prisma/PostgreSQL: uso de las relaciones y restricciones ya definidas; no se almacenan contraseñas, tokens ni cookies en PostgreSQL.
- Contrato de endpoints de reserva: las operaciones para el propio cliente usarán la identidad resuelta en servidor y rechazarán con una respuesta neutra referencias ajenas, aunque el cliente intente manipularlas; la futura propuesta de reservas deberá revalidar el estado activo dentro de su frontera transaccional.
- Frontend Angular: flujo de inicio de sesión, retorno seguro a una ruta protegida y tratamiento neutro de sesión terminada, sin añadir autorregistro ni recuperación automática.
- Pruebas: escenarios de sesión válida, sesión ausente, identidad sin vinculación, cliente inactivo y aislamiento entre clientes; la integración real con Auth0 queda separada de las pruebas ordinarias con identidades `MOCK` controladas.

## Pending Decisions

- **Transporte de sesión:** la documentación fija Auth0 como propietario de la sesión, pero no decide si la API recibirá una cookie de sesión gestionada por Auth0 o un access token bearer. Antes de implementar el adaptador server-side hay que elegir un único mecanismo y documentar su validación de firma, issuer, audience, expiración, proveedor y revocación.
