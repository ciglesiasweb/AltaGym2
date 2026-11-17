# Feature — Sesiones privadas

**Estado:** Definición completa

## Objetivo

Permitir que un cliente reserve un bloque privado con un monitor disponible, sin generar conflictos para el cliente o el monitor.

## Alcance

- Consulta y reserva de sesiones privadas por clientes.
- Reservas en nombre de clientes por recepción y administración.
- Cancelación de sesiones privadas.
- Bloqueos operativos de monitores mediante el cliente especial «AltaGym».

No incluye selección de una disciplina concreta, modificación de sesiones o bloqueos, ni un módulo separado de ausencias.

## Flujo del cliente

1. Pulsa “Crear clase privada”.
2. Selecciona fecha y hora.
3. El sistema calcula los monitores disponibles.
4. Ve el nombre y las disciplinas de cada monitor disponible.
5. Selecciona un monitor y confirma.

## Horario y ventana

- Los horarios y las ventanas se interpretan en `Europe/Madrid` y los límites se calculan mediante instantes reales.
- Las sesiones comienzan entre las 10:00 y las 18:00, siempre a una hora en punto, y duran 45 minutos.
- Se puede reservar desde exactamente 72 horas antes hasta exactamente 3 horas antes del inicio; ambos límites están incluidos.
- El cliente puede cancelar hasta exactamente 3 horas antes del inicio.
- Recepción y administración pueden cancelar en cualquier momento, incluso después del inicio para corregir la situación operativa.

## Disponibilidad y reserva

- Solo pueden reservarse clientes y monitores activos.
- El cliente elige un monitor, no una disciplina; las disciplinas del monitor son información adicional.
- Un monitor no está disponible si en el bloque tiene una clase grupal, otra sesión privada o un bloqueo «AltaGym».
- Un cliente no puede confirmar otra actividad en un bloque en el que ya tenga una actividad vigente.
- La disponibilidad se comprueba al consultar y se vuelven a validar todas las reglas al confirmar.
- Si la disponibilidad cambia antes de confirmar, la reserva se rechaza con un mensaje claro y se permite volver a consultar.
- Recepción y administración pueden reservar en nombre de un cliente bajo las mismas reglas de cliente activo, monitor activo, horario, ventana y conflictos.
- Las próximas reservas del cliente solo muestran sesiones confirmadas futuras; las canceladas no aparecen en su consulta.

## Cancelación y estados

- Una sesión privada puede estar confirmada, cancelada por el cliente o cancelada por el gimnasio.
- Una sesión cancelada conserva su historial y deja libres al monitor y al cliente.
- El cliente no puede cancelar después del límite ni una sesión ya iniciada.
- Cuando recepción o administración cancela, la sesión pasa a “cancelada por el gimnasio” y se puede solicitar opcionalmente una notificación.
- No se modifica una sesión privada en el MVP. Para cambiar fecha, hora, monitor o cliente se cancela y se crea una nueva.

## Bloqueos «AltaGym»

- Solo recepción y administración pueden crear y cancelar bloqueos.
- Cada bloqueo incluye monitor, fecha, hora inicial, hora final y una nota interna opcional.
- El bloqueo pertenece a una única fecha y debe quedar íntegramente dentro de 08:00–22:00.
- La hora inicial y final deben ser horas completas y el final debe ser posterior al inicio; se admite 22:00 únicamente como hora final.
- El final es exclusivo: un bloqueo de 10:00 a 13:00 ocupa los bloques de 10:00, 11:00 y 12:00.
- El bloqueo ocupa todos los slots con los que se solapa y puede durar varias horas.
- No puede solaparse con una clase grupal, una sesión privada u otro bloqueo del monitor.
- La nota es interna y nunca se muestra a los clientes.
- Los bloqueos no se modifican: se cancelan y se crean de nuevo.

## Historias de usuario

### Cliente

- **PRI-01:** Como cliente, quiero elegir una fecha y hora para conocer los monitores disponibles.
- **PRI-02:** Como cliente, quiero ver el nombre y las disciplinas de cada monitor disponible para decidir con quién reservar.
- **PRI-03:** Como cliente, quiero confirmar una sesión privada dentro del plazo permitido.
- **PRI-04:** Como cliente, quiero cancelar mi sesión dentro del plazo permitido.
- **PRI-05:** Como cliente, quiero consultar mis próximas sesiones privadas confirmadas.

### Recepción y administración

- **PRI-06:** Como miembro de recepción o administración, quiero crear una sesión privada en nombre de un cliente bajo las mismas reglas operativas.
- **PRI-07:** Como miembro de recepción o administración, quiero cancelar una sesión privada en cualquier momento y decidir si se solicita una notificación.
- **PRI-08:** Como miembro de recepción o administración, quiero bloquear varias horas de un monitor mediante «AltaGym».
- **PRI-09:** Como miembro de recepción o administración, quiero cancelar un bloqueo para liberar la disponibilidad del monitor.

## Casos límite

- Dos clientes intentan confirmar simultáneamente el mismo monitor y bloque: solo una confirmación tiene éxito.
- El mismo cliente envía dos confirmaciones simultáneas: solo se crea una sesión vigente en el bloque.
- El monitor o el cliente se desactiva entre la consulta y la confirmación: se rechaza la reserva.
- El monitor queda ocupado entre la consulta y la confirmación: se rechaza la reserva y se ofrece volver a consultar.
- El cliente ya tiene una clase grupal o sesión privada en el bloque: se rechaza la reserva.
- La confirmación ocurre exactamente 72 horas o exactamente 3 horas antes: se admite.
- La cancelación del cliente ocurre exactamente 3 horas antes: se admite; después de ese instante se rechaza.
- Se intenta reservar antes de las 10:00, después de las 18:00 o fuera de una hora en punto: se rechaza.
- Recepción o administración cancela después del inicio: se permite y queda auditado como cancelación del gimnasio.
- Se intenta modificar una sesión o bloqueo: se requiere cancelar y crear uno nuevo.
- Un bloqueo tiene fin igual o anterior al inicio o usa horas no completas: se rechaza.
- Un bloqueo comienza antes de las 08:00, termina después de las 22:00 o intenta atravesar dos fechas: se rechaza.
- Un bloqueo de 10:00 a 13:00 impide reservar los slots de 10:00, 11:00 y 12:00, pero no el de 13:00.
- Un bloqueo se solapa parcial o totalmente con una actividad del monitor: se rechaza.
- Se cancela una sesión o bloqueo: el monitor vuelve a estar disponible si no existe otro conflicto.

## Criterios de aceptación

### CA-PRI-01 — Consulta

- Al seleccionar una fecha y hora válidas, solo aparecen monitores activos y sin conflictos en el bloque.
- Cada resultado muestra el nombre y las disciplinas del monitor.
- Las disciplinas son informativas y la reserva se vincula al monitor, no a una disciplina.
- La consulta de próximas sesiones del cliente muestra solo sesiones confirmadas futuras.

### CA-PRI-02 — Reserva

- Solo se aceptan inicios en punto entre las 10:00 y las 18:00 y todas las sesiones duran 45 minutos.
- Se admiten reservas exactamente en los límites de 72 y 3 horas y se rechazan fuera de la ventana.
- La confirmación vuelve a validar cliente activo, monitor activo, horario, ventana y conflictos de ambos.
- Ante confirmaciones concurrentes, un monitor o un cliente nunca quedan asignados a dos actividades coincidentes.
- Si el monitor deja de estar disponible, la confirmación falla con un mensaje claro y permite repetir la consulta.
- Las reservas creadas por recepción o administración cumplen las mismas reglas que las creadas por el cliente.

### CA-PRI-03 — Cancelación

- El cliente puede cancelar exactamente hasta 3 horas antes, pero no después ni una vez iniciada la sesión.
- Recepción y administración pueden cancelar en cualquier momento y elegir si solicitan notificación.
- La cancelación conserva la sesión con el estado correspondiente y libera al cliente y al monitor.
- Ningún rol puede modificar directamente fecha, hora, monitor o cliente de una sesión.

### CA-PRI-04 — Bloqueos

- Solo recepción y administración pueden crear o cancelar bloqueos «AltaGym».
- El sistema exige un monitor, una única fecha, horas completas dentro de 08:00–22:00, fin posterior al inicio y admite una nota interna opcional.
- El final del bloqueo se trata como exclusivo y todos los slots afectados quedan indisponibles.
- Se rechaza cualquier bloqueo que se solape con otra actividad o bloqueo del monitor.
- La nota del bloqueo no se muestra a clientes.
- Cancelar un bloqueo libera los slots que no estén ocupados por otro conflicto.
- Ningún rol puede modificar directamente un bloqueo.

## Fuera de alcance

- Selección o reserva por disciplina.
- Modificación directa de sesiones privadas o bloqueos.
- Gestión manual de disponibilidad o ausencias.
- Historial de sesiones canceladas o pasadas para clientes.
