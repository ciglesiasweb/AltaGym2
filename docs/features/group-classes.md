# Feature — Clases grupales

**Estado:** Definición completa

## Objetivo

Programar clases semanales recurrentes y permitir que los clientes consulten y reserven plazas sin superar el aforo ni generar conflictos de horario.

## Alcance

- Gestión de programaciones semanales por recepción y administración.
- Consulta de sesiones por los clientes.
- Reservas y cancelaciones propias de clientes.
- Reservas en nombre de clientes por recepción y administración.
- Cancelación de sesiones grupales concretas y eliminación controlada de programaciones grupales.

No incluye lista de espera ni automatización de festivos o cierres generales.

## Programación

- Cada programación tiene disciplina, día de la semana, hora, monitor, sala, aforo y fecha de inicio.
- La fecha de inicio, la sala y el aforo son obligatorios.
- El aforo es un número entero mayor que cero.
- La programación se repite semanalmente desde su fecha de inicio y no tiene fecha final.
- Las clases comienzan entre las 08:00 y las 21:00, siempre a una hora en punto, y duran 45 minutos.
- El monitor debe estar activo y habilitado para la disciplina.
- El monitor y la sala deben estar libres durante el bloque.
- Solo recepción y administración pueden crear, modificar o eliminar programaciones.

## Flujo del cliente

1. Pulsa “Crear reserva de clase”.
2. Selecciona la disciplina.
3. Ve las sesiones agrupadas por fecha y ordenadas por hora.
4. Selecciona una sesión disponible.
5. Confirma la reserva.

## Información visible

Tipo, nombre, fecha, hora, duración, monitor, sala, aforo, plazas disponibles y estado.

Las clases completas siguen visibles con la condición calculada «Completa». Esta condición no es un estado persistente: resulta de que las reservas vigentes hayan alcanzado el aforo. Las sesiones canceladas no pueden reservarse.

## Próximas reservas del cliente

- El cliente puede consultar sus próximas reservas grupales con estado `vigente`.
- Se muestran ordenadas cronológicamente e incluyen disciplina, fecha, hora, monitor y sala.
- No se muestran reservas pasadas, canceladas por el cliente ni canceladas por el gimnasio.

## Reglas de reserva

- Los horarios y las ventanas se interpretan en `Europe/Madrid` y los límites se calculan mediante instantes reales.
- El cliente puede reservar desde 72 horas antes hasta 3 horas antes del inicio.
- Solo los clientes activos pueden reservar.
- Al completar el aforo no se admiten más reservas y no existe lista de espera.
- Un cliente no puede tener más de una reserva vigente en la misma sesión.
- Un cliente no puede confirmar dos actividades que coincidan en el mismo bloque.
- La disponibilidad y los conflictos se comprueban de nuevo al confirmar para evitar sobreaforo o reservas simultáneas.
- Las reservas creadas por recepción o administración en nombre de un cliente respetan la misma ventana, el aforo y las reglas de conflicto.

## Reglas de cancelación

- El cliente puede cancelar su reserva hasta 3 horas antes del inicio.
- Recepción y administración pueden cancelar reservas o sesiones concretas en cualquier momento.
- Cancelar una sesión grupal concreta no elimina la programación grupal ni afecta a sus demás sesiones.
- Las reservas vigentes de una sesión cancelada pasan a “cancelada por el gimnasio” y conservan el historial.
- Al cancelar una sesión, recepción o administración puede elegir si solicita notificar a los clientes afectados.
- Una reserva grupal tiene uno de estos estados persistentes: `vigente`, `cancelada por el cliente` o `cancelada por el gimnasio`.
- Una cancelación individual realizada por recepción o administración deja la reserva como `cancelada por el gimnasio` y registra actor y fecha.
- La cancelación individual no genera un SMS; la opción de notificar solo se ofrece al cancelar una sesión completa.

## Modificación y eliminación de programaciones grupales

- Modificar una programación grupal solo cambia sus sesiones grupales futuras sin reservas.
- Las sesiones futuras con reservas conservan los datos con los que fueron reservadas; si deben cambiar, recepción o administración las cancela individualmente y crea la planificación necesaria.
- Eliminar una programación grupal solo elimina sus sesiones grupales futuras sin reservas.
- Si existen sesiones grupales futuras con reservas, primero deben cancelarse individualmente para conservar las reservas y su historial; después puede eliminarse la programación grupal.
- Las sesiones pasadas y las canceladas se conservan como historial.
- Los festivos y cierres generales no generan excepciones automáticas: recepción o administración cancela las sesiones concretas afectadas.

## Historias de usuario

### Cliente

- **GRP-01:** Como cliente, quiero filtrar las clases por disciplina para encontrar la actividad que me interesa.
- **GRP-02:** Como cliente, quiero ver las sesiones ordenadas por fecha y hora con sus plazas disponibles.
- **GRP-03:** Como cliente, quiero reservar una plaza disponible dentro del plazo permitido.
- **GRP-04:** Como cliente, quiero cancelar mi reserva dentro del plazo permitido.
- **GRP-05:** Como cliente, quiero reconocer una clase completa o cancelada sin intentar reservarla.
- **GRP-06:** Como cliente, quiero consultar mis próximas reservas grupales vigentes sin mezclar reservas pasadas o canceladas.

### Recepción y administración

- **GRP-07:** Como miembro de recepción o administración, quiero crear una programación semanal recurrente para publicar sus sesiones futuras.
- **GRP-08:** Como miembro de recepción o administración, quiero modificar una programación grupal sin alterar sesiones grupales que ya tienen reservas.
- **GRP-09:** Como miembro de recepción o administración, quiero reservar en nombre de un cliente bajo las mismas reglas operativas.
- **GRP-10:** Como miembro de recepción o administración, quiero cancelar una sesión grupal concreta sin afectar a la programación grupal.
- **GRP-11:** Como miembro de recepción o administración, quiero eliminar una programación grupal cuando no deje reservas futuras sin tratar.

## Casos límite

- Dos clientes intentan reservar simultáneamente la última plaza: solo una confirmación tiene éxito.
- El mismo cliente envía dos confirmaciones simultáneas para la misma sesión: solo se crea una reserva vigente.
- El cliente ya tiene otra actividad en ese bloque: se rechaza la nueva reserva.
- La clase se completa entre la consulta y la confirmación: se rechaza la reserva y se informa de que está completa.
- El cliente se desactiva entre la consulta y la confirmación: se rechaza la reserva.
- La confirmación ocurre exactamente 72 horas o exactamente 3 horas antes: se admite al estar en los límites de la ventana.
- La cancelación del cliente ocurre exactamente 3 horas antes: se admite; después de ese instante se rechaza.
- El monitor no está activo, no imparte la disciplina o ya está ocupado: se rechaza la programación.
- La sala ya está ocupada en el bloque: se rechaza la programación.
- El aforo es cero, negativo o no entero: se rechaza la programación.
- Se modifica una programación grupal con sesiones grupales futuras reservadas: esas sesiones no cambian.
- Se intenta eliminar una programación grupal con reservas futuras vigentes: se bloquea hasta cancelar las sesiones afectadas.
- Un festivo afecta a una sesión grupal: la programación grupal continúa y esa sesión se cancela individualmente.
- Una reserva deja de ser futura mientras el cliente mantiene abierta la consulta: al actualizar, desaparece de próximas reservas.

## Criterios de aceptación

### CA-GRP-01 — Consulta

- Las sesiones se agrupan por fecha, se ordenan por hora y pueden filtrarse por disciplina.
- Cada sesión muestra toda la información visible definida.
- Una sesión sin plazas aparece como “Completa” y no permite iniciar la reserva.
- Una sesión cancelada no admite reservas.
- La consulta de próximas reservas muestra solo reservas grupales futuras con estado `vigente`, ordenadas cronológicamente.

### CA-GRP-02 — Programación

- Recepción y administración pueden crear una programación grupal con todos los datos obligatorios válidos.
- Ningún otro rol puede crear, modificar o eliminar programaciones grupales.
- El sistema rechaza horarios fuera de 08:00–21:00 o que no comiencen en punto.
- El sistema rechaza un monitor inactivo, no habilitado para la disciplina u ocupado en el bloque.
- El sistema rechaza una sala ocupada en el bloque y un aforo que no sea entero mayor que cero.
- Una programación grupal válida genera sesiones grupales semanales desde su fecha de inicio sin fecha final funcional.

### CA-GRP-03 — Reserva

- Una reserva confirmada reduce las plazas disponibles en una unidad.
- La última plaza cambia la sesión a “Completa” e impide nuevas reservas.
- La confirmación vuelve a validar cliente activo, ventana, aforo, duplicados y conflictos de horario.
- Ante confirmaciones concurrentes nunca se supera el aforo ni se duplica la reserva de un cliente.
- Las reservas en nombre de clientes cumplen las mismas reglas que las realizadas por ellos.

### CA-GRP-04 — Cancelación y programaciones grupales

- Una cancelación válida del cliente libera una plaza.
- El cliente no puede cancelar después del límite de 3 horas.
- Recepción y administración pueden cancelar una reserva o sesión en cualquier momento.
- Cancelar una sesión grupal conserva la programación grupal y marca sus reservas vigentes como “cancelada por el gimnasio”.
- Modificar una programación grupal afecta solo a sesiones grupales futuras sin reservas.
- Eliminar una programación grupal elimina solo sesiones grupales futuras sin reservas y se bloquea mientras existan sesiones futuras con reservas sin cancelar.
- Las sesiones y reservas pasadas o canceladas permanecen en el historial operativo.
- Una cancelación individual realizada por recepción o administración deja la reserva como `cancelada por el gimnasio`, registra actor y fecha y no solicita un SMS.

## Fuera de alcance

- Lista de espera.
- Excepciones automáticas por festivos o cierres.
- Fecha final de una programación grupal recurrente.
- Cambios masivos sobre sesiones que ya tienen reservas.
