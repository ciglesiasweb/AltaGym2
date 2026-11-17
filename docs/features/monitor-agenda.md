# Feature — Mi agenda del monitor

**Estado:** Definición completa

## Objetivo

Permitir que el monitor consulte su trabajo y ocupación sin gestionar la planificación.

## Alcance

- Agenda semanal propia de sesiones grupales, sesiones privadas y bloqueos.
- Consulta de semanas pasadas y futuras.
- Disciplinas asignadas al monitor.
- Pantalla de solo lectura.

## Historias de usuario

### AGEN-01 — Consultar mi agenda semanal

Como monitor, quiero consultar mis actividades de una semana para saber cuándo y dónde debo trabajar.

### AGEN-02 — Consultar una sesión grupal

Como monitor, quiero ver la disciplina, fecha, hora, sala y total de clientes inscritos en una sesión grupal para preparar la actividad.

### AGEN-03 — Consultar una sesión privada

Como monitor, quiero ver el nombre y la foto del cliente de una sesión privada para identificar a la persona que debo atender.

### AGEN-04 — Consultar mis bloqueos

Como monitor, quiero ver los intervalos en los que estoy bloqueado para entender mi ocupación, sin acceder a información operativa interna.

### AGEN-05 — Consultar cancelaciones

Como monitor, quiero distinguir las actividades canceladas para no confundirlas con trabajo vigente.

### AGEN-06 — Consultar mis disciplinas

Como monitor, quiero ver las disciplinas que tengo asignadas para comprobar mi perfil operativo.

## Reglas funcionales

- Solo se muestran actividades y bloqueos del monitor autenticado.
- La agenda abre en la semana actual y comprende de lunes a domingo.
- Se puede navegar sin límite funcional entre semanas pasadas y futuras.
- Las actividades se ordenan cronológicamente por fecha y hora.
- Las actividades pasadas permanecen visibles al consultar la semana correspondiente.
- Las sesiones grupales muestran disciplina, fecha, hora, sala y número de clientes con reserva vigente.
- El monitor no puede consultar el listado ni la identidad de los clientes inscritos en una sesión grupal.
- Las reservas grupales canceladas no se incluyen en el total de inscritos.
- Si una sesión grupal se cancela, conserva y muestra como dato histórico el último total de reservas vigentes anterior a la cancelación.
- Las sesiones privadas muestran fecha, hora, nombre completo y foto del cliente.
- Si el cliente no tiene fotografía, se muestra un marcador neutro.
- Los bloqueos muestran fecha, hora inicial y hora final, pero nunca su nota interna.
- Las actividades y bloqueos cancelados permanecen visibles y se diferencian claramente de los vigentes.
- Una cancelación libera disponibilidad, aunque el elemento siga visible en la agenda.
- Las disciplinas asignadas se muestran como información del perfil y no como actividades.
- No existen controles para crear, modificar o cancelar, ni para solicitar cambios desde la aplicación.
- Los cambios realizados por recepción o administración se reflejan al entrar, recargar la agenda o volver a enfocar la aplicación; no hay actualización en tiempo real ni sondeo periódico en el MVP.
- Un monitor inactivo no puede acceder. La desactivación invalida sus sesiones abiertas según las reglas generales de autenticación.

## Casos límite

- La semana no contiene ninguna actividad ni bloqueo: se muestra un estado vacío, no un error.
- Un día contiene varias actividades: se muestran todas en orden cronológico.
- Existen actividades o bloqueos consecutivos: se representan como elementos independientes sin interpretarlos como solapados.
- Una actividad fue cancelada después de que el monitor consultara la agenda: el nuevo estado aparece al entrar, recargar o volver a enfocar la aplicación.
- Una sesión privada pertenece a un cliente sin fotografía: se muestra su nombre completo y el marcador neutro.
- Una clase no tiene reservas vigentes: el total mostrado es cero.
- Una reserva grupal se cancela: el total de la clase vigente disminuye.
- Una sesión grupal cancelada tenía reservas: conserva visualmente el último total vigente anterior a la cancelación.
- Un bloqueo abarca varios bloques horarios: se muestra su intervalo completo, sin revelar la nota interna.
- El monitor consulta una semana pasada: las actividades pasadas y canceladas siguen visibles con su estado.
- Las disciplinas asignadas cambian mientras la pantalla está abierta: se actualizan al entrar, recargar o volver a enfocar la aplicación.
- La cuenta se desactiva mientras existe una sesión abierta: la sesión queda invalidada y el siguiente acceso autenticado es rechazado.

## Criterios de aceptación

### CA-AGEN-01 — Semana inicial y navegación

- Dado un monitor autenticado, cuando abre “Mi agenda”, entonces ve la semana actual de lunes a domingo.
- Dada la agenda, cuando navega a otra semana pasada o futura, entonces ve exclusivamente sus elementos correspondientes a esa semana.

### CA-AGEN-02 — Privacidad de la agenda

- Dado un monitor autenticado, cuando consulta la agenda, entonces no recibe actividades, bloqueos ni datos privados de otros monitores.

### CA-AGEN-03 — Sesión grupal

- Dada una sesión grupal asignada al monitor, cuando se muestra, entonces incluye disciplina, fecha, hora, sala y total de reservas vigentes.
- Dada una sesión grupal, cuando el monitor la consulta, entonces no puede ver el listado ni la identidad de los clientes inscritos.
- Dadas reservas grupales canceladas, cuando se calcula el total de una clase vigente, entonces no se contabilizan.

### CA-AGEN-04 — Sesión grupal cancelada

- Dada una sesión grupal cancelada, cuando se muestra en la agenda, entonces aparece diferenciada como cancelada y conserva el último total de reservas vigentes anterior a su cancelación.

### CA-AGEN-05 — Sesión privada

- Dada una sesión privada asignada al monitor, cuando se muestra, entonces incluye fecha, hora, nombre completo y foto del cliente.
- Dado un cliente sin foto, cuando se muestra su sesión, entonces aparece un marcador neutro sin ocultar su nombre.

### CA-AGEN-06 — Bloqueo

- Dado un bloqueo del monitor, cuando se muestra, entonces incluye su fecha e intervalo completo.
- Dado un bloqueo con nota interna, cuando el monitor lo consulta, entonces la nota no se muestra ni se expone.

### CA-AGEN-07 — Estados y pasado

- Dada una semana con elementos pasados o cancelados, cuando el monitor la consulta, entonces siguen visibles y su estado se distingue del de los elementos vigentes.
- Dado un elemento cancelado, cuando permanece visible, entonces no ocupa disponibilidad.

### CA-AGEN-08 — Solo lectura

- Dada cualquier vista de la agenda, cuando el monitor la utiliza, entonces no encuentra acciones para crear, modificar, cancelar o solicitar cambios.
- Si intenta ejecutar directamente una operación de gestión, entonces el sistema la rechaza por falta de permisos.

### CA-AGEN-09 — Actualización de datos

- Dado un cambio realizado por recepción o administración, cuando el monitor entra, recarga la agenda o vuelve a enfocar la aplicación, entonces ve la información actualizada.
- Mientras la pantalla permanece abierta, el sistema no está obligado a actualizarla en tiempo real.

### CA-AGEN-10 — Estados vacíos y orden

- Dada una semana sin elementos, cuando se consulta, entonces se muestra un estado vacío comprensible.
- Dada una semana con varios elementos, cuando se consulta, entonces aparecen ordenados por fecha y hora.

### CA-AGEN-11 — Cuenta inactiva

- Dado un monitor inactivo, cuando intenta acceder, entonces el sistema rechaza el acceso.
- Dado un monitor que es desactivado con una sesión abierta, cuando realiza la siguiente petición autenticada, entonces la sesión ya no es válida.

## Fuera de alcance

- Edición o cancelación de actividades y bloqueos por el monitor.
- Solicitudes de cambio desde la aplicación.
- Listado de clientes inscritos en clases grupales.
- Visualización de notas internas de bloqueos.
- Actualización automática en tiempo real.
