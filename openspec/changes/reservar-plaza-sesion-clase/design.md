# Design

## Context

La API actual solo expone `GET /api/health` y no existe todavía una implementación de reservas ni un esquema Prisma en el repositorio. El diseño físico del proyecto ya define `GroupSession`, `GroupBooking`, `activeBookingCount`, la unicidad de la reserva vigente por cliente y sesión, y una actualización atómica condicionada para proteger el aforo; este cambio debe convertir esas decisiones documentadas en una capacidad ejecutable.

## Goals / Non-Goals

**Goals:**

- Exponer un caso de uso transaccional para confirmar una reserva grupal de una sesión.
- Mantener alineados la reserva vigente, el contador de aforo y la ocupación del cliente.
- Garantizar idempotencia para la reserva vigente del mismo cliente y sesión.
- Resolver de forma determinista la competencia por la última plaza.
- Cubrir en API, dominio y frontend los resultados de confirmación, sesión completa y ventana cerrada.

**Non-Goals:**

- Cancelar reservas o sesiones.
- Crear o gestionar lista de espera.
- Modificar programaciones grupales o materializar sesiones fuera de lo necesario para reservar.
- Resolver autenticación y autorización completas, que pertenecen a una capacidad posterior.

## Decisions

### Caso de uso transaccional en la API

La confirmación se modelará como una operación de negocio de la API para una sesión grupal, expuesta mediante una ruta de creación de reserva bajo la sesión, por ejemplo `POST /api/group-sessions/{groupSessionId}/bookings`. El cliente se obtendrá del contexto autenticado y no de un identificador confiado enviado por el navegador.

Se elige una operación de creación específica en lugar de un endpoint genérico de actualización porque la reserva es un recurso auditable y sus efectos sobre aforo y ocupación deben ser atómicos.

### Transacción y actualización condicionada del aforo

Dentro de una única transacción se localizará o materializará la sesión, se validarán cliente, estado, ventana y conflictos, y se buscará primero una reserva vigente del mismo cliente y sesión. Si no existe, se actualizará `activeBookingCount` únicamente cuando la sesión siga programada y el contador sea menor que `capacity`. Solo la fila afectada por esa actualización puede continuar a la creación de `GroupBooking` y de la ocupación del cliente.

Esto evita confiar en un contador leído previamente. Una actualización que no afecta filas se traducirá a sesión completa o estado no reservable, y cualquier fallo posterior revertirá la reserva, la ocupación y el incremento del contador.

La alternativa de leer el aforo y luego insertar la reserva se descarta porque permite que dos transacciones observen la misma última plaza.

### Idempotencia y unicidad

La reserva vigente existente para `(groupSessionId, clientId)` se devolverá sin efectos adicionales. La base de datos reforzará esta regla con un índice único parcial para reservas vigentes, además de la comprobación de aplicación, para que las solicitudes repetidas o concurrentes no creen duplicados.

No se introducirá una tabla de idempotencia general en este cambio: la identidad funcional de la operación ya está definida por cliente y sesión, y las cancelaciones quedan fuera de alcance.

### Tiempo de negocio

Las comparaciones usarán instantes reales y la zona horaria `Europe/Madrid`, respetando los límites inclusivos de 72 y 3 horas definidos por las reglas de negocio. El instante de inicio será un límite exclusivo para nuevas reservas: una solicitud con `now >= startsAt` no podrá confirmar.

### Errores observables

La API distinguirá al menos entre ventana cerrada o sesión iniciada, sesión completa y solicitud repetida ya confirmada. El frontend mostrará el resultado ya existente como confirmación idempotente y el agotamiento de aforo como un estado no reservable, sin ofrecer acciones de cancelación o lista de espera.

## Risks / Trade-offs

- [Reloj y zona horaria inconsistentes] → Centralizar la obtención del instante actual y probar los límites en `Europe/Madrid`, incluidos cambios oficiales de hora.
- [Contador desalineado con reservas] → Actualizar contador y crear reserva/ocupación en la misma transacción, con restricción `CHECK` y pruebas de invariantes.
- [Carrera entre solicitudes] → Usar la actualización condicionada y la unicidad parcial; probar dos clientes concurrentes compitiendo por una plaza.
- [Sesión calculada aún no materializada] → Materializar o localizar la sesión dentro de la transacción antes de modificar el aforo, siguiendo el diseño físico existente.
- [Autenticación aún inexistente en el workspace] → Mantener la interfaz del caso de uso basada en un cliente autenticado y aislar la resolución de identidad para conectarla cuando exista la capacidad de acceso.

## Migration Plan

1. Incorporar el modelo y la migración de sesiones, reservas, ocupaciones y restricciones necesarias según `docs/DATABASE_DESIGN.md`.
2. Implementar el caso de uso y la ruta de confirmación detrás de la API.
3. Añadir pruebas de límites temporales, idempotencia, aforo y concurrencia antes de habilitar la interfaz.
4. Añadir la acción de reserva en el frontend y publicar la capacidad.
5. Revertir retirando la ruta y la interfaz; conservar las filas históricas si ya existen, sin borrar reservas de forma destructiva.

## Open Questions

- ¿Qué códigos HTTP y forma exacta de error adoptará la API para `CAPACITY_EXCEEDED`, ventana cerrada y sesión iniciada?
- ¿Qué mecanismo de autenticación proporcionará el `clientId` cuando se implemente la capacidad de acceso?
- ¿En qué pantalla y con qué permisos se mostrará la acción de reservar en el frontend?
