# Spec Delta

## Purpose

Permite a un cliente confirmar una reserva grupal en una sesión grupal con aforo limitado, manteniendo una sola reserva vigente por cliente y protegiendo la asignación concurrente de la última plaza.

## ADDED Requirements

### Requirement: Reserva grupal dentro de la ventana permitida
El sistema SHALL permitir a un cliente activo confirmar una reserva grupal para una sesión grupal programada desde 72 horas antes hasta 3 horas antes de su inicio, con ambos límites incluidos.

#### Scenario: Cliente confirma dentro de la ventana
- **WHEN** un cliente activo solicita una reserva para una sesión grupal programada dentro de la ventana y sin conflictos de actividad
- **THEN** el sistema confirma una reserva grupal con estado `vigente`

#### Scenario: Solicitud fuera de la ventana
- **WHEN** un cliente solicita una reserva antes de las 72 horas previas o después de las 3 horas previas al inicio
- **THEN** el sistema rechaza la solicitud y no crea ni modifica una reserva vigente

### Requirement: Reserva grupal descuenta una plaza
Al confirmar una nueva reserva grupal, el sistema SHALL aumentar en una la cantidad de reservas vigentes de la sesión y SHALL reflejar una plaza menos disponible.

#### Scenario: Primera reserva de una sesión con disponibilidad
- **WHEN** se confirma una reserva grupal nueva para una sesión grupal con plazas disponibles
- **THEN** la reserva queda `vigente` y la disponibilidad de la sesión disminuye exactamente en una plaza

### Requirement: Repetición idempotente de una reserva
El sistema SHALL tratar una solicitud repetida del mismo cliente para la misma sesión grupal como la reserva grupal vigente existente, sin crear otra reserva ni volver a descontar una plaza.

#### Scenario: Cliente repite la misma solicitud
- **WHEN** un cliente con una reserva grupal `vigente` solicita de nuevo una reserva para la misma sesión grupal
- **THEN** el sistema conserva la reserva existente, devuelve su confirmación y mantiene sin cambios la cantidad de plazas disponibles

### Requirement: Rechazo cuando la sesión está completa
El sistema SHALL rechazar una nueva reserva grupal cuando las reservas vigentes de la sesión grupal hayan alcanzado su aforo.

#### Scenario: No quedan plazas
- **WHEN** un cliente solicita una reserva para una sesión grupal cuyo aforo está completo
- **THEN** el sistema rechaza la solicitud e informa de que no quedan plazas, sin crear una reserva ni alterar el aforo

### Requirement: Asignación exclusiva de la última plaza
El sistema SHALL garantizar que las solicitudes concurrentes que compiten por la última plaza de una sesión grupal solo confirmen una nueva reserva.

#### Scenario: Dos clientes solicitan la última plaza a la vez
- **WHEN** dos clientes solicitan concurrentemente una reserva para una sesión grupal con una sola plaza disponible
- **THEN** una solicitud confirma una reserva vigente y la otra se rechaza informando de que no quedan plazas, dejando el aforo y las reservas vigentes alineados

### Requirement: Corte de reservas al inicio
El sistema SHALL rechazar nuevas reservas grupales desde el instante de inicio de la sesión grupal.

#### Scenario: Solicitud en el instante de inicio
- **WHEN** un cliente solicita una reserva a la hora de inicio de la sesión grupal o después
- **THEN** el sistema rechaza la solicitud y no crea ni modifica una reserva vigente

## REMOVED Requirements

<!-- Las cancelaciones y la lista de espera quedan fuera del alcance de este cambio y no se eliminan de una capacidad existente. -->
