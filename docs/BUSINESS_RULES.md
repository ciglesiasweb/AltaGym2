# AltaGym — Reglas de negocio

## Bloques horarios

- Todas las actividades comienzan a una hora en punto.
- Todas las clases y sesiones normales duran 45 minutos.
- Clases grupales: inicios de 08:00 a 21:00; último bloque de 21:00 a 21:45.
- Sesiones privadas: inicios de 10:00 a 18:00; último bloque de 18:00 a 18:45.

## Ventana de reserva y cancelación

- Todos los horarios y límites temporales se interpretan en la zona horaria `Europe/Madrid`.
- Las ventanas de 72 y 3 horas se calculan mediante instantes reales, incluidos los cambios de hora oficiales.
- El cliente puede reservar desde 72 horas antes hasta 3 horas antes del inicio.
- El cliente puede cancelar hasta 3 horas antes.
- Recepción y administración pueden cancelar reservas o sesiones en cualquier momento.
- “Tres días” se interpreta actualmente como 72 horas exactas.

## Clases grupales

- Se configuran como programaciones semanales recurrentes.
- Cada programación grupal tiene disciplina, día, hora, monitor, sala y aforo.
- Cada programación tiene además una fecha de inicio obligatoria, se repite sin fecha final y exige sala y aforo; el aforo es un entero mayor que cero.
- Solo puede asignarse un monitor habilitado para la disciplina.
- El monitor debe estar activo y ni el monitor ni la sala pueden tener otra actividad en el mismo bloque.
- Al alcanzar el aforo, la clase queda completa y no admite reservas.
- «Completa» es una condición calculada cuando las reservas vigentes alcanzan el aforo; no es un estado persistente de la sesión.
- No existe lista de espera.
- Cancelar una sesión grupal concreta no elimina la programación grupal recurrente.
- Los festivos y cierres se gestionan cancelando sesiones concretas; no existen excepciones automáticas en el MVP.
- Modificar una programación grupal solo afecta a sesiones grupales futuras sin reservas.
- Eliminar una programación grupal elimina solo sesiones grupales futuras sin reservas. Si existen reservas futuras, las sesiones afectadas deben cancelarse antes.

## Sesiones privadas

- El cliente elige fecha y hora y después un monitor disponible.
- Se muestran las disciplinas del monitor como información adicional.
- La reserva se realiza por monitor, no por disciplina.
- Solo pueden reservarse clientes y monitores activos.
- Dentro de la franja privada, un monitor está disponible salvo que tenga una clase grupal, otra sesión privada o un bloqueo en ese horario.
- La disponibilidad se comprueba al consultar y de nuevo al confirmar.
- Recepción y administración pueden reservar en nombre de un cliente respetando las mismas reglas de ventana y conflictos.
- Los límites de 72 y 3 horas están incluidos.
- Las sesiones privadas no se modifican: se cancelan y se crean de nuevo.
- Una sesión cancelada conserva su estado e historial y libera la disponibilidad del cliente y del monitor.

## Bloqueos de monitor

- El personal autorizado utiliza el cliente especial «AltaGym».
- Indica monitor, fecha, hora inicial y final.
- El bloqueo pertenece a una única fecha y debe quedar íntegramente dentro del intervalo 08:00–22:00.
- Las horas inicial y final son horas completas, el fin debe ser posterior al inicio y se interpreta como exclusivo; se admite 22:00 únicamente como hora final.
- Un bloqueo puede abarcar varias horas y ocupa todos los slots afectados.
- Puede incluir una nota interna opcional.
- No puede solaparse con otra actividad o bloqueo del monitor.
- Solo recepción y administración pueden crearlo o cancelarlo; no se modifica, sino que se cancela y se crea de nuevo.
- La nota es interna y no se muestra a clientes.
- No existe un módulo separado de ausencias.

## Cancelación de sesiones

- Recepción y administración pueden cancelar una sesión grupal o privada concreta.
- La cancelación no afecta a las siguientes repeticiones.
- Las reservas vigentes pasan a “cancelada por el gimnasio” y no se eliminan.
- Durante la cancelación se puede elegir si se notifica a los clientes afectados.
- Se registra quién canceló, cuándo y si solicitó notificación.

## Estados y cancelación de reservas grupales

- Una reserva grupal tiene uno de estos estados persistentes: `vigente`, `cancelada por el cliente` o `cancelada por el gimnasio`.
- `Vigente` es el estado normal mientras no se produzca una cancelación.
- Una cancelación individual realizada por recepción o administración deja la reserva como `cancelada por el gimnasio`.
- Toda cancelación individual registra actor y fecha.
- La cancelación individual de una reserva no genera un SMS; la notificación opcional solo forma parte de la cancelación de una sesión completa.

## Conflictos

- Un monitor no puede tener dos actividades simultáneas.
- Un cliente no puede confirmar dos actividades en el mismo bloque ni duplicar una reserva grupal vigente.
- Las reglas de cliente activo, ventana, aforo y conflictos se vuelven a comprobar al confirmar una reserva.
- Las reservas grupales creadas por recepción o administración respetan las mismas reglas de ventana, aforo y conflictos.
