# Proposal

## Why

Actualmente AltaGym no tiene una capacidad implementable para que un cliente confirme una plaza en una sesión grupal. El cambio establece el flujo mínimo de reserva con aforo, idempotencia y concurrencia segura para que la última plaza no pueda asignarse dos veces.

## What Changes

- Añadir la capacidad de confirmar una reserva grupal para un cliente en una sesión grupal con plazas disponibles.
- Proporcionar las consultas autenticadas mínimas de disciplinas, sesiones grupales y reservas propias para seleccionar una clase, mostrar `Mis reservas` y comprobar el resultado de una confirmación incierta.
- Incluir únicamente la lectura de próximas sesiones privadas propias necesaria para la lista común de `Mis reservas`, sin implementar su reserva ni cancelación.
- Permitir la reserva dentro de la ventana existente del proyecto: desde 72 horas antes hasta 3 horas antes del inicio, incluidos ambos límites.
- Descontar una plaza del aforo al confirmar una nueva reserva vigente.
- Hacer idempotente la repetición de la misma solicitud del cliente para la misma sesión, conservando la reserva existente sin descontar otra plaza.
- Rechazar nuevas reservas cuando se alcance el aforo e informar de que no quedan plazas.
- Proteger la confirmación concurrente de la última plaza para que solo una solicitud resulte confirmada.
- Rechazar nuevas reservas desde el instante de inicio de la sesión.
- Mantener fuera de alcance las cancelaciones y la lista de espera.

## Capabilities

### New Capabilities

- `group-bookings`: confirmación de reservas grupales con ventana temporal, aforo, idempotencia y control de concurrencia.

### Modified Capabilities

<!-- No se modifican capacidades existentes; las specs actuales solo cubren las bases de API y frontend. -->

## Impact

- API de negocio para consultar disciplinas, sesiones y reservas propias, y confirmar una reserva grupal con el contexto autenticado.
- Modelo de datos y transacciones que relacionan cliente, sesión grupal, reserva vigente y aforo.
- Restricciones o actualización atómica necesarias para proteger la última plaza ante solicitudes concurrentes.
- Frontend de reserva de una sesión grupal y presentación de los errores de ventana, inicio, aforo o conflicto de confirmación.
- Pruebas unitarias, de integración y de concurrencia para los escenarios de aceptación.
