# Spec Delta

## Purpose

Permite a un cliente confirmar una reserva grupal en una sesión grupal con aforo limitado, manteniendo una sola reserva vigente por cliente y protegiendo la asignación concurrente de la última plaza.

## ADDED Requirements

### Requirement: Revalidación transaccional de la identidad del cliente
El sistema SHALL revalidar, dentro de la misma transacción de reserva y justo antes de confirmar, que la cuenta y el cliente derivados de la sesión siguen activos y vinculados entre sí.

#### Scenario: Cuenta o cliente desactivado antes de confirmar
- **WHEN** la cuenta o el cliente se desactiva después de resolver la identidad autenticada y antes de confirmar la reserva
- **THEN** el sistema responde `403` con `{"error":"UNAUTHORIZED"}` sin revelar la causa y rechaza la operación sin confirmar la reserva, el incremento del aforo ni la ocupación del cliente

### Requirement: Consultas mínimas para el recorrido de reserva
El sistema SHALL proporcionar al cliente autenticado las disciplinas y la consulta y el detalle actualizado de sesiones grupales para las próximas 72 horas en `Europe/Madrid`, con los datos y la disponibilidad orientativa necesarios para elegir y confirmar.

#### Scenario: Selección de una clase
- **WHEN** el cliente selecciona una disciplina
- **THEN** el sistema muestra las sesiones no canceladas del horizonte agrupadas por fecha y ordenadas por hora, con tipo, disciplina, fecha, hora, duración, monitor, sala, aforo, plazas y condición de disponibilidad

#### Scenario: Detalle actualizado de una clase
- **WHEN** el cliente abre una sesión grupal válida, esté o no materializada
- **THEN** el sistema consulta sus datos y condición actuales y muestra si está reservada por el propio cliente o tiene un conflicto conocido

### Requirement: Identidad y aislamiento de las sesiones consultadas
Las consultas de sesiones SHALL combinar las ocurrencias calculadas y materializadas dando prioridad a las materializadas, permitir identificar una ocurrencia no materializada y reconocer la reserva vigente propia y los conflictos conocidos sin revelar reservas ajenas.

#### Scenario: Ocurrencia materializada y calculada
- **WHEN** una sesión del horizonte tiene una ocurrencia calculada y otra materializada para la misma programación y fecha
- **THEN** la consulta devuelve la ocurrencia materializada y sus datos actuales sin duplicarla

### Requirement: Consulta de reservas propias
El sistema SHALL proporcionar una consulta autenticada de las próximas reservas grupales vigentes y sesiones privadas confirmadas del cliente efectivo, futuras y ordenadas en una cronología común para `Mis reservas`. La lectura de sesiones privadas se limitará a los datos necesarios para esa lista. El sistema SHALL permitir consultar la reserva grupal vigente propia para una sesión concreta sin depender de que siga siendo futura.

#### Scenario: Lista común actualizada
- **WHEN** el cliente abre o vuelve a `Mis reservas`
- **THEN** el sistema consulta y muestra sus próximas reservas grupales y sesiones privadas en orden cronológico, sin incluir reservas ajenas, pasadas ni canceladas

#### Scenario: Una parte de la consulta falla
- **WHEN** no se puede consultar alguna de las reservas grupales o sesiones privadas propias
- **THEN** el sistema informa del error y no presenta una lista parcial como completa

### Requirement: Recorrido de reserva propia
El sistema SHALL ofrecer al cliente autenticado el recorrido `Mis reservas → disciplina y clases → detalle → confirmación → resultado → Mis reservas`, exclusivamente para el cliente derivado de su sesión. La acción de reserva SHALL aparecer en el detalle solo cuando la sesión parezca reservable y la confirmación SHALL volver a validar en servidor identidad, sesión grupal, ventana, aforo y conflictos.

#### Scenario: Reserva desde el detalle de una sesión disponible
- **WHEN** el cliente elige una sesión orientativamente reservable, revisa su confirmación y confirma
- **THEN** el servidor aplica las reglas de reserva y, si confirma, muestra el resultado y permite volver a `Mis reservas` actualizada

#### Scenario: Sesión completa o fuera de plazo
- **WHEN** el detalle indica que la sesión está completa o fuera de plazo
- **THEN** el sistema explica la indisponibilidad y no ofrece la acción de reservar ni lista de espera

### Requirement: Tratamiento de sesión terminada y resultado incierto
Si la sesión autenticada caduca o se invalida, el sistema SHALL detener el flujo, descartar la confirmación pendiente y exigir autenticación sin reenviar la mutación. Si el resultado de una confirmación es incierto, el sistema SHALL consultar la reserva propia de esa sesión antes de comunicar un resultado definitivo o permitir un reintento seguro.

#### Scenario: Sesión caducada durante el flujo
- **WHEN** una petición protegida se realiza con una sesión caducada o invalidada
- **THEN** la API responde `401` con `{"error":"UNAUTHORIZED"}`, el cliente vuelve al inicio de sesión y la reserva no se reenvía automáticamente

#### Scenario: Confirmación con resultado incierto
- **WHEN** el cliente no sabe si se confirmó su reserva
- **THEN** muestra `Comprobando el resultado` y consulta la reserva propia de la sesión, sin declarar éxito ni fallo definitivo mientras no pueda determinarse
- **AND** si encuentra una reserva vigente muestra éxito; si puede determinar que no existe y el intento anterior ha terminado, permite un reintento seguro

### Requirement: Respuestas de confirmación
La API SHALL responder `201` para una reserva grupal nueva y `200` para una reserva vigente existente.

#### Scenario: Reserva nueva confirmada
- **WHEN** un cliente autorizado confirma una reserva nueva que cumple todas las reglas
- **THEN** la API devuelve `201` con la confirmación de la reserva

#### Scenario: Repetición después del cierre o con aforo completo
- **WHEN** un cliente autorizado repite una reserva vigente y la sesión está completa, fuera de la ventana o ya iniciada
- **THEN** la API devuelve `200` con la reserva existente sin crear otra ni modificar el aforo o la ocupación

### Requirement: Prioridad de las condiciones de reserva
Para un cliente autorizado, la reserva vigente existente SHALL prevalecer sobre sesión iniciada, ventana cerrada y aforo completo. Si no existe reserva vigente, la prioridad SHALL ser sesión iniciada, ventana cerrada y aforo completo, con respuesta `409` y códigos `SESSION_STARTED`, `BOOKING_WINDOW_CLOSED` y `CAPACITY_EXCEEDED`, respectivamente.

#### Scenario: Sesión iniciada y otras condiciones simultáneas
- **WHEN** no existe reserva vigente propia y la sesión ya ha comenzado, aunque esté fuera de ventana o completa
- **THEN** la API devuelve `409` con `{"error":"SESSION_STARTED"}` sin confirmar efectos

#### Scenario: Ventana cerrada y sesión completa
- **WHEN** no existe reserva vigente propia y, antes del inicio, la sesión está fuera de la ventana y completa
- **THEN** la API devuelve `409` con `{"error":"BOOKING_WINDOW_CLOSED"}` sin confirmar efectos

#### Scenario: Sesión completa dentro de la ventana
- **WHEN** no existe reserva vigente propia y la sesión está completa dentro de la ventana permitida
- **THEN** la API devuelve `409` con `{"error":"CAPACITY_EXCEEDED"}` sin confirmar efectos

### Requirement: Rechazos neutros de acceso en reservas
La API SHALL aplicar autenticación y autorización, incluida la revalidación transaccional, antes de responder con una confirmación. Una sesión inválida recibe `401` y un contexto no autorizado, un `clientId` ajeno o una revalidación fallida reciben `403`, con el cuerpo neutro `{"error":"UNAUTHORIZED"}` y `Cache-Control: no-store`. Un `clientId` ajeno se rechaza sin consultar si existe.

#### Scenario: Identificador de cliente ajeno
- **WHEN** una petición autenticada incluye un `clientId` distinto del cliente efectivo
- **THEN** la API devuelve el mismo `403` neutro exista o no ese cliente, sin consultarlo ni producir efectos

### Requirement: Reserva grupal dentro de la ventana permitida
El sistema SHALL permitir a un cliente activo confirmar una reserva grupal para una sesión grupal programada desde 72 horas antes hasta 3 horas antes de su inicio, con ambos límites incluidos.

#### Scenario: Cliente confirma dentro de la ventana
- **WHEN** un cliente activo solicita una reserva para una sesión grupal programada dentro de la ventana y sin conflictos de actividad
- **THEN** el sistema confirma una reserva grupal con estado `vigente`

#### Scenario: Solicitud nueva fuera de la ventana
- **WHEN** un cliente sin reserva vigente solicita una reserva antes de las 72 horas previas o después de las 3 horas previas al inicio
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
