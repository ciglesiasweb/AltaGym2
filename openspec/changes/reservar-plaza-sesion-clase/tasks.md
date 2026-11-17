# Tasks

## 1. Persistencia y reglas de aforo

- [ ] 1.1 Crear los modelos y la migración de `GroupSession`, `GroupBooking`, `ScheduleOccupancy` y sus relaciones mínimas para reservar una sesión grupal; verificar que la migración aplica y que las restricciones de aforo impiden contadores fuera de `0..capacity`.
- [ ] 1.2 Añadir la unicidad parcial de la reserva grupal vigente por `(groupSessionId, clientId)` y la actualización atómica condicionada por sesión programada y aforo disponible; verificar con una prueba de integración que una sola actualización obtiene la última plaza.
- [ ] 1.3 Implementar la creación transaccional de la reserva y la ocupación del cliente, con rollback del contador ante cualquier fallo posterior; verificar que reservas vigentes y `activeBookingCount` permanecen alineados.

## 2. Caso de uso y API

- [ ] 2.1 Implementar el caso de uso de confirmación para un cliente autenticado, incluyendo cliente activo, sesión programada, conflictos, ventana `Europe/Madrid` y rechazo desde `now >= startsAt`; verificar los límites de 72 horas, 3 horas y hora de inicio con pruebas de dominio.
- [ ] 2.2 Exponer la operación de confirmación bajo la sesión grupal y mapear confirmación existente, ventana cerrada, sesión iniciada y aforo completo a respuestas observables; verificar el contrato HTTP con pruebas de ruta.
- [ ] 2.3 Hacer idempotente la repetición de `(groupSessionId, clientId)` y resolver la carrera de dos clientes por la última plaza; verificar que solo una solicitud confirma y que la otra informa de que no quedan plazas sin duplicar ni desalinear el contador.

## 3. Interfaz de reserva

- [ ] 3.1 Añadir la acción de reservar en la vista de sesiones grupales usando el cliente autenticado y mostrar la confirmación de una reserva nueva o ya existente; verificar el flujo desde la vista mediante prueba de componente.
- [ ] 3.2 Mostrar la sesión completa y la ventana cerrada como estados no reservables sin ofrecer cancelación ni lista de espera; verificar los estados y mensajes con pruebas de componente.

## 4. Integración y documentación

- [ ] 4.1 Ejecutar la suite de integración contra una base de pruebas aislada, incluyendo límites temporales, repetición, aforo completo y concurrencia; verificar que pasan las pruebas de la capacidad `group-bookings`.
- [ ] 4.2 Documentar la ruta de confirmación, sus respuestas de error y el origen del `clientId` cuando se resuelvan las decisiones abiertas; verificar que la documentación coincide con el contrato implementado.
- [ ] 4.3 Ejecutar `pnpm exec openspec validate reservar-plaza-sesion-clase --strict`, las pruebas de API y frontend y las compilaciones de producción; verificar que todas finalizan correctamente.
