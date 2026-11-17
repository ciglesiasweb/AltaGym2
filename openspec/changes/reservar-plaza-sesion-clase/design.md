# Design

## Context

La API actual solo expone `GET /api/health` bajo `/api` y no existen consultas de disciplinas, sesiones o reservas propias, ni pantallas de reserva. Tampoco existe todavía un esquema Prisma en el repositorio. El diseño físico del proyecto ya define `GroupSession`, `GroupBooking`, `activeBookingCount`, la unicidad de la reserva vigente por cliente y sesión, y una actualización atómica condicionada para proteger el aforo; este cambio debe convertir esas decisiones documentadas en una capacidad ejecutable.

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
- Implementar la autenticación y resolución de identidad, que pertenecen a `autenticacion-identidad-cliente`.

## Decisions

### Caso de uso transaccional en la API

La confirmación se modelará como una operación de negocio de la API para una sesión grupal, expuesta mediante una ruta de creación de reserva bajo la sesión, por ejemplo `POST /api/group-sessions/{groupSessionId}/bookings`. La API Next.js validará en servidor la sesión BFF de Auth0 y resolverá la identidad interna hasta la cuenta y el cliente efectivos, que pasará al caso de uso. El `clientId` no será obligatorio en el cuerpo ni se confiará en él como fuente de identidad. Si se incluye y no coincide con el contexto, se rechazará con la misma respuesta neutra de autorización independientemente de que el cliente ajeno exista, sin consultarlo ni revelar datos sobre él o sus reservas.

Se elige una operación de creación específica en lugar de un endpoint genérico de actualización porque la reserva es un recurso auditable y sus efectos sobre aforo y ocupación deben ser atómicos.

### Transacción y actualización condicionada del aforo

Dentro de una única transacción se localizará o materializará la sesión y se buscará primero una reserva vigente del mismo cliente y sesión. Si no existe, se validarán el estado, la ventana y los conflictos, y se actualizará `activeBookingCount` únicamente cuando la sesión siga programada y el contador sea menor que `capacity`. Solo la fila afectada por esa actualización puede continuar a la creación de `GroupBooking` y de la ocupación del cliente.

Dentro de esa misma transacción y justo antes de confirmar se revalidará que la cuenta y el cliente derivados de la sesión siguen activos y vinculados entre sí, también antes de devolver una reserva existente. La transacción deberá impedir que una desactivación o desvinculación concurrente invalide esa comprobación antes de confirmar. Si falla, se devolverá el rechazo neutro `403` de autenticación y se revertirán la reserva, el incremento del aforo y la ocupación del cliente.

Esto evita confiar en un contador leído previamente. Si una actualización no afecta filas, se comprobará primero si otra transacción confirmó la reserva del mismo cliente; en caso contrario se responderá según la prioridad y el estado aplicables. Cualquier fallo posterior revertirá la reserva, la ocupación y el incremento del contador.

La alternativa de leer el aforo y luego insertar la reserva se descarta porque permite que dos transacciones observen la misma última plaza.

### Idempotencia y unicidad

La reserva vigente existente para `(groupSessionId, clientId)` se devolverá sin efectos adicionales, incluso si la sesión está completa, la ventana ya se cerró o la sesión ya comenzó. La base de datos reforzará esta regla con un índice único parcial para reservas vigentes, además de la comprobación de aplicación, para que las solicitudes repetidas o concurrentes no creen duplicados. Si otra transacción crea la reserva durante la carrera, se resolverá la repetición devolviendo la reserva vigente tras revertir los efectos propios y revalidar el contexto, no como una nueva reserva ni como un error de aforo.

No se introducirá una tabla de idempotencia general en este cambio: la identidad funcional de la operación ya está definida por cliente y sesión, y las cancelaciones quedan fuera de alcance.

### Tiempo de negocio

Las comparaciones usarán instantes reales y la zona horaria `Europe/Madrid`, respetando los límites inclusivos de 72 y 3 horas definidos por las reglas de negocio. El instante de inicio será un límite exclusivo para nuevas reservas: una solicitud con `now >= startsAt` no podrá confirmar.

### Contrato HTTP y prioridad

Una reserva nueva devuelve `201`; una reserva vigente existente devuelve `200` con su confirmación. Primero se validan la sesión y la identidad: una sesión ausente o inválida recibe `401`, y una identidad no autorizada, un `clientId` ajeno o una revalidación transaccional fallida recibe `403`. Ambos usan el cuerpo neutro existente `{"error":"UNAUTHORIZED"}` y `Cache-Control: no-store`; el `403` no revela la causa ni la existencia de otro cliente o reserva.

Para una petición autorizada se da prioridad a la reserva vigente existente. Solo si no existe se evalúan, en este orden, inicio de sesión grupal, ventana y aforo: `now >= startsAt` devuelve `409` con `{"error":"SESSION_STARTED"}`; antes del inicio, fuera de los límites inclusivos de 72 y 3 horas devuelve `409` con `{"error":"BOOKING_WINDOW_CLOSED"}`; dentro de la ventana, una sesión completa devuelve `409` con `{"error":"CAPACITY_EXCEEDED"}`. Las comprobaciones de estado de la sesión y conflictos también se aplican a las reservas nuevas, sin sustituir el rechazo neutro de autenticación. La interfaz presenta mensajes comprensibles sin códigos técnicos.

### Consultas mínimas y recorrido de cliente

Las consultas protegidas usarán el mismo contexto autenticado y no aceptarán un cliente ajeno como fuente de autoridad. Deben proporcionar:

- Disciplinas para el selector obligatorio y sesiones grupales de las próximas 72 horas por disciplina, agrupables por fecha y ordenadas por hora, con tipo, disciplina, fecha, hora, duración, monitor, sala, aforo, plazas y condición orientativa. La consulta combina ocurrencias calculadas y materializadas, priorizando estas últimas; omite las canceladas en una consulta nueva.
- Detalle actualizado de una sesión y la información necesaria para reconocer reserva propia vigente y conflictos conocidos, sin revelar reservas ajenas. El detalle se puede recuperar mediante una identidad estable de ocurrencia, también cuando no esté materializada.
- Próximas reservas grupales vigentes y sesiones privadas confirmadas del cliente efectivo, futuras y ordenadas en una cronología común para `Mis reservas`. La lectura privada se limita a tipo, fecha, hora y monitor; no incluye creación ni cancelación de sesiones privadas. Si una parte de la consulta falla, no se presenta una lista parcial como completa.
- Consulta autoritativa de la reserva grupal vigente del cliente para una sesión concreta, independiente del filtro de próximas reservas, para reconciliar una confirmación incierta incluso si la sesión ya dejó de ser futura.

El recorrido móvil sigue `Mis reservas → disciplina y clases → detalle → confirmación → resultado → Mis reservas`, según `docs/ux/flows/group-booking.md`. Solo el cliente autenticado reserva para sí mismo. La acción aparece en el detalle cuando la sesión parece reservable; la confirmación es una página completa y el servidor vuelve a validar identidad, sesión grupal, ventana, aforo y conflictos. Las clases completas o fuera de plazo muestran su motivo sin acción de reserva ni lista de espera.

Si caduca o se invalida la sesión, se interrumpe el flujo, se descarta la confirmación pendiente y se exige volver a iniciar sesión sin reenvío automático. Ante un resultado incierto se muestra `Comprobando el resultado` y se consulta la reserva propia: si existe, se muestra éxito; si se puede determinar que no existe y el intento anterior ha terminado, se permite un reintento seguro. Mientras no pueda determinarse el resultado, no se comunica éxito ni fallo definitivo.

## Risks / Trade-offs

- [Reloj y zona horaria inconsistentes] → Centralizar la obtención del instante actual y probar los límites en `Europe/Madrid`, incluidos cambios oficiales de hora.
- [Contador desalineado con reservas] → Actualizar contador y crear reserva/ocupación en la misma transacción, con restricción `CHECK` y pruebas de invariantes.
- [Carrera entre solicitudes] → Usar la actualización condicionada y la unicidad parcial; probar dos clientes concurrentes compitiendo por una plaza.
- [Sesión calculada aún no materializada] → Materializar o localizar la sesión dentro de la transacción antes de modificar el aforo, siguiendo el diseño físico existente.
- [Cambio de estado o vínculo después de resolver la identidad] → Integrar el contexto autenticado de `autenticacion-identidad-cliente` y revalidar cuenta y cliente en la transacción justo antes de confirmar.

## Migration Plan

1. Incorporar el modelo y la migración de sesiones, reservas, ocupaciones y restricciones necesarias según `docs/DATABASE_DESIGN.md`.
2. Implementar las consultas mínimas, el caso de uso y la ruta de confirmación detrás de la API, conectados al contexto autenticado.
3. Añadir pruebas de identidad, desactivación, límites temporales, idempotencia, aforo y concurrencia antes de habilitar la interfaz.
4. Añadir la acción de reserva en el frontend y publicar la capacidad.
5. Revertir retirando la ruta y la interfaz; conservar las filas históricas si ya existen, sin borrar reservas de forma destructiva.
