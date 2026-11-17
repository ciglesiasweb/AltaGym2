# Tasks

## 1. Persistencia y reglas de aforo

- [x] 1.1 Crear los modelos y la migración de `GroupSession`, `GroupBooking`, `ScheduleOccupancy` y sus relaciones mínimas para reservar una sesión grupal; verificar que la migración aplica y que las restricciones de aforo impiden contadores fuera de `0..capacity`.
- [x] 1.2 Añadir la unicidad parcial de la reserva grupal vigente por `(groupSessionId, clientId)` y la actualización atómica condicionada por sesión programada y aforo disponible; verificar con una prueba de integración que una sola actualización obtiene la última plaza.
- [x] 1.3 Implementar la creación transaccional de la reserva y la ocupación del cliente, con rollback del contador ante cualquier fallo posterior y revalidación de que la cuenta y el cliente de la sesión siguen activos y vinculados justo antes de confirmar; verificar que una desactivación posterior a la resolución rechaza la operación sin confirmar reserva, incremento del aforo ni ocupación, y que reservas vigentes y `activeBookingCount` permanecen alineados.

## 2. Caso de uso y API

- [x] 2.1 Implementar el caso de uso de confirmación para un cliente autenticado, incluyendo cliente activo, sesión programada, conflictos, ventana `Europe/Madrid` y rechazo de nuevas reservas desde `now >= startsAt`; verificar los límites de 72 horas, 3 horas y hora de inicio con pruebas de dominio.
- [x] 2.2 Exponer la operación de confirmación bajo la sesión grupal, conectar la ruta al contexto autenticado y pasar el cliente efectivo al caso de uso; devolver `201` para una reserva nueva, `200` para una repetición y los `409` acordados. Verificar con pruebas de ruta los cuerpos, la prioridad entre reserva existente, sesión iniciada, ventana y aforo, los límites de ventana y los rechazos neutros `401` y `403`, incluido un `clientId` ajeno existente o inexistente y la desactivación antes de confirmar.
- [x] 2.3 Hacer idempotente la repetición de `(groupSessionId, clientId)` y resolver las carreras entre solicitudes del mismo cliente y de dos clientes por la última plaza; verificar que la repetición devuelve la reserva existente incluso con aforo completo o ventana cerrada, y que solo un cliente obtiene la última plaza sin duplicar ni desalinear el contador.
- [x] 2.4 Implementar consultas protegidas de disciplinas y sesiones grupales para el horizonte de 72 horas, combinando ocurrencias calculadas y materializadas, con detalle, disponibilidad orientativa, reserva propia y conflictos conocidos; verificar selección por disciplina, orden, datos, estado y acceso a una ocurrencia no materializada sin revelar reservas ajenas.
- [x] 2.5 Implementar consultas protegidas de próximas reservas grupales y sesiones privadas propias para la cronología común de `Mis reservas`, y de reserva grupal vigente propia por sesión sin filtro de fecha para reconciliar confirmaciones inciertas; verificar aislamiento entre clientes, orden, exclusión de pasadas y canceladas en la lista, y ausencia de resultados parciales presentados como completos ante errores.

## 3. Interfaz de reserva

- [x] 3.1 Implementar el recorrido móvil desde `Mis reservas`, selección de disciplina y clase, detalle, confirmación en página completa y resultado hasta la lista actualizada, usando el cliente autenticado; verificar el flujo propio y la confirmación nueva o existente mediante pruebas de componente.
- [x] 3.2 Mostrar la sesión completa y la ventana cerrada como estados no reservables sin ofrecer cancelación ni lista de espera; verificar los estados y mensajes con pruebas de componente.
- [x] 3.3 Tratar la sesión caducada o invalidada sin reenviar la mutación y reconciliar un resultado incierto mediante la consulta propia por sesión; verificar éxito encontrado, ausencia determinable con reintento seguro y consulta fallida o resultado aún indeterminado sin éxito o fallo falsos.

## 4. Integración y documentación

- [x] 4.1 Ejecutar la suite de integración contra una base de pruebas aislada, incluyendo consultas propias, recorrido completo, sesión terminada, resultado incierto, rechazo neutro de `clientId` ajeno, desactivación antes de confirmar, límites temporales, prioridades, repetición, aforo completo y concurrencia; verificar que pasan las pruebas de la capacidad `group-bookings`.
- [x] 4.2 Documentar las consultas, la ruta de confirmación, sus respuestas y el origen del `clientId` en el contexto autenticado; verificar que la documentación coincide con el contrato implementado.
- [x] 4.3 Ejecutar `pnpm exec openspec validate reservar-plaza-sesion-clase --strict`, las pruebas de API y frontend y las compilaciones de producción; verificar que todas finalizan correctamente.
