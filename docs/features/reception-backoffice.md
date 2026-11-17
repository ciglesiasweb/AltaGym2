# Feature — Backoffice operativo

**Estado:** Definición completa

## Objetivo

Centralizar la operativa diaria de recepción y administración en cuatro pantallas sencillas: clientes, calendario semanal grupal, agenda semanal privada y monitores. Ambos puestos comparten el mismo rol funcional y exactamente los mismos permisos en el MVP.

## Navegación y comportamiento común

- Las cuatro pantallas son accesibles desde la navegación principal del backoffice.
- Las agendas muestran semanas de lunes a domingo y abren inicialmente la semana actual.
- La navegación semanal ofrece «Semana anterior», «Hoy» y «Semana siguiente», sin limitar la consulta de semanas pasadas o futuras.
- Las actividades canceladas siguen visibles y se distinguen claramente de las vigentes.
- Tras una operación correcta, la pantalla actualiza la información y muestra una confirmación.
- Ante un error, se conservan los datos introducidos siempre que sea posible.
- Las cancelaciones y desactivaciones requieren confirmación.
- Si los datos cambian o aparece un conflicto antes de confirmar, la operación se rechaza con una explicación y la información se actualiza.

## Historias de usuario

### Clientes

- **BO-01:** Como miembro de recepción o administración, quiero buscar y recorrer el listado de clientes para localizar rápidamente la ficha de una persona.
- **BO-02:** Como miembro de recepción o administración, quiero crear y modificar clientes para mantener sus datos actualizados.
- **BO-03:** Como miembro de recepción o administración, quiero restablecer la contraseña de un cliente para ayudarle a recuperar el acceso.
- **BO-04:** Como miembro de recepción o administración, quiero iniciar desde la ficha de un cliente una reserva grupal o privada para atenderle sin volver a buscarlo.

#### Comportamiento

- El listado muestra 20 clientes por página, ordenados alfabéticamente por apellidos y nombre.
- La búsqueda admite coincidencias parciales en los apellidos, ignora mayúsculas y minúsculas y elimina los espacios exteriores del término buscado.
- La búsqueda se aplica a todos los clientes y vuelve a la primera página de resultados.
- Los clientes inactivos permanecen visibles y se identifican como tales.
- Cada cliente ofrece acciones para consultar o modificar su ficha, restablecer su contraseña e iniciar una reserva en su nombre.
- El cliente queda preseleccionado al iniciar la reserva desde su ficha.
- Los formularios y validaciones de alta, modificación, estado, fotografía y credenciales siguen la feature de clientes y las reglas de autenticación.
- Un cliente inactivo puede consultarse y modificarse, pero no puede realizar nuevas reservas.

### Calendario semanal grupal

- **BO-05:** Como miembro de recepción o administración, quiero consultar las clases grupales de una semana para conocer la programación y su ocupación.
- **BO-06:** Como miembro de recepción o administración, quiero crear o modificar una programación grupal recurrente para mantener actualizado el calendario habitual.
- **BO-07:** Como miembro de recepción o administración, quiero consultar una sesión grupal concreta y sus reservas para atender a los clientes inscritos.
- **BO-08:** Como miembro de recepción o administración, quiero cancelar una sesión grupal concreta sin eliminar la programación grupal para gestionar festivos, cierres o incidencias.
- **BO-09:** Como miembro de recepción o administración, quiero reservar una plaza en nombre de un cliente para atender solicitudes presenciales o telefónicas.

#### Comportamiento

- Cada sesión grupal muestra fecha y hora, disciplina, monitor, sala, ocupación frente al aforo y estado.
- Existe una acción principal para crear una programación grupal.
- Al seleccionar una sesión se muestran sus detalles y las reservas vigentes asociadas.
- La cancelación de la sesión grupal y la modificación de la programación grupal son acciones diferenciadas.
- Al cancelar una sesión se puede elegir si se solicita notificación a los clientes afectados.
- No se admiten reservas sobre sesiones canceladas o completas.
- La creación y modificación de programaciones grupales, las reservas y las cancelaciones respetan las reglas de clases grupales, conflictos, ventanas y permisos vigentes.

### Agenda semanal privada

- **BO-10:** Como miembro de recepción o administración, quiero consultar sesiones privadas y bloqueos en una misma agenda para conocer la ocupación de los monitores.
- **BO-11:** Como miembro de recepción o administración, quiero crear una sesión privada en nombre de un cliente para gestionar su cita.
- **BO-12:** Como miembro de recepción o administración, quiero crear un bloqueo «AltaGym» para representar una indisponibilidad del monitor.
- **BO-13:** Como miembro de recepción o administración, quiero cancelar una sesión o un bloqueo para liberar la disponibilidad correspondiente.

#### Comportamiento

- La agenda muestra conjuntamente las sesiones privadas y los bloqueos «AltaGym».
- Cada elemento muestra fecha y hora, monitor y cliente; los bloqueos se identifican claramente.
- Existen acciones diferenciadas para crear una sesión privada y crear un bloqueo.
- Al seleccionar una sesión o bloqueo se muestran sus detalles y las acciones permitidas.
- Las sesiones y los bloqueos no se modifican: se cancelan y se crean de nuevo.
- La nota opcional de un bloqueo solo aparece en esta zona interna y nunca se muestra a clientes.
- Al cancelar una sesión privada se puede elegir si se solicita notificación al cliente afectado.
- La creación y cancelación respetan las reglas de disponibilidad, conflictos, ventanas y permisos vigentes.

### Monitores

- **BO-14:** Como miembro de recepción o administración, quiero buscar y consultar monitores para localizar rápidamente su ficha.
- **BO-15:** Como miembro de recepción o administración, quiero dar de alta un monitor con sus disciplinas y credenciales iniciales para incorporarlo a la operativa.
- **BO-16:** Como miembro de recepción o administración, quiero modificar sus datos y disciplinas para mantener correcta su información profesional.
- **BO-17:** Como miembro de recepción o administración, quiero desactivar o reactivar un monitor sin eliminarlo para conservar el historial.

#### Comportamiento

- El listado se ordena alfabéticamente por apellidos y nombre y permite buscar por nombre o apellidos mediante coincidencia parcial, ignorando mayúsculas y minúsculas y eliminando espacios exteriores.
- Cada ficha permite consultar y modificar los datos y las disciplinas del monitor.
- El alta crea las credenciales iniciales con el rol de monitor.
- Recepción y administración pueden gestionar posteriormente la contraseña y el estado de la cuenta de acceso. Todos los monitores conservan los mismos permisos fijos.
- No existe eliminación física: los monitores se desactivan y reactivan conforme a las reglas de la feature de monitores.

## Casos límite

### Listados y búsqueda

- Una búsqueda sin coincidencias muestra un estado vacío y permite limpiar el término.
- Cambiar el término de búsqueda desde una página distinta de la primera vuelve a la primera página.
- Si la última página queda vacía después de un cambio, el listado vuelve a la última página disponible.
- Los registros inactivos se diferencian sin desaparecer del listado.

### Agendas

- Una semana sin actividades muestra la estructura semanal y un estado vacío, manteniendo disponibles las acciones de creación.
- Al volver a «Hoy» se carga la semana que contiene la fecha actual.
- Las actividades canceladas no bloquean aforo ni disponibilidad, pero conservan sus datos e historial.
- Si una sesión se cancela mientras otra persona la está consultando, cualquier reserva posterior se rechaza y la vista se actualiza.
- Si una plaza, un monitor o una sala dejan de estar disponibles antes de confirmar, se rechaza la operación sin crear una reserva parcial.
- Una reserva iniciada desde un cliente inactivo o sobre una sesión completa o cancelada no puede confirmarse.
- La cancelación de una sesión grupal concreta no modifica las demás sesiones de su programación grupal.
- Un bloqueo de varias horas ocupa todos los bloques afectados y no puede solaparse con otra actividad del monitor.
- Un bloqueo debe pertenecer a una única fecha y quedar dentro de 08:00–22:00; cualquier intervalo fuera de esos límites se rechaza.

### Monitores y clientes

- No se puede desactivar un monitor con actividades o bloqueos futuros vigentes.
- No se puede dejar activo un monitor sin disciplinas ni retirar una disciplina utilizada por una programación futura activa.
- El cliente especial «AltaGym» no puede desactivarse y solo se utiliza para bloqueos.
- La pérdida de permisos o el cierre de sesión durante una operación impide confirmarla.

## Criterios de aceptación

### CA-BO-01 — Navegación común

- Dado un usuario de recepción o administración autenticado, cuando abre el backoffice, entonces puede acceder desde la navegación principal a Clientes, Calendario grupal, Agenda privada y Monitores con los mismos permisos.
- Dada una agenda, cuando se abre, entonces muestra la semana actual de lunes a domingo.
- Dada cualquier semana, cuando se usan «Semana anterior», «Hoy» o «Semana siguiente», entonces se carga la semana correspondiente.
- Dada una actividad cancelada, cuando aparece en una agenda, entonces se distingue de una actividad vigente y no ocupa disponibilidad ni aforo.

### CA-BO-02 — Clientes

- Dados más de 20 clientes, cuando se abre el listado, entonces se muestran 20 por página, ordenados por apellidos y nombre, con controles de paginación.
- Dado un fragmento de apellidos con diferencias de mayúsculas o espacios exteriores, cuando se busca, entonces aparecen las coincidencias de todo el listado y se muestra la primera página.
- Dado un cliente inactivo, cuando se consulta el listado, entonces permanece visible, está identificado como inactivo y no permite confirmar nuevas reservas.
- Dado un cliente activo, cuando se inicia una reserva desde su ficha, entonces aparece preseleccionado y la confirmación aplica ventana, aforo y conflictos.
- Dado un restablecimiento de contraseña válido, cuando recepción lo confirma, entonces se aplican las reglas de autenticación y se informa del resultado.

### CA-BO-03 — Calendario grupal

- Dada una semana con clases grupales, cuando se abre el calendario, entonces cada sesión grupal muestra fecha y hora, disciplina, monitor, sala, ocupación y estado.
- Dada una sesión, cuando se selecciona, entonces se muestran sus detalles y reservas vigentes.
- Dada una sesión vigente, cuando recepción la cancela y confirma la acción, entonces solo esa ocurrencia queda cancelada, sus reservas pasan a canceladas por el gimnasio y queda registrado si se solicitó notificación.
- Dada una sesión completa o cancelada, cuando se intenta crear una reserva, entonces la operación no puede confirmarse y se explica el motivo.
- Dada una modificación de programación grupal, cuando existen sesiones grupales futuras con reservas, entonces solo cambian las sesiones futuras permitidas por las reglas grupales.

### CA-BO-04 — Agenda privada

- Dada una semana con sesiones y bloqueos, cuando se abre la agenda, entonces ambos tipos aparecen juntos y los bloqueos se distinguen claramente.
- Dada una nueva sesión privada, cuando recepción la confirma, entonces se comprueban de nuevo el estado del cliente y monitor, la ventana y los conflictos antes de crearla.
- Dado un bloqueo válido, cuando recepción lo confirma, entonces ocupa todos los bloques entre el inicio inclusivo y el fin exclusivo y su nota solo es visible internamente.
- Dado un bloqueo fuera de 08:00–22:00 o que atraviesa dos fechas, cuando se intenta confirmar, entonces la operación se rechaza sin ocupar disponibilidad.
- Dada una sesión o bloqueo existente, cuando se consulta, entonces no existe una acción de edición; solo puede cancelarse y crearse otro.
- Dada una sesión privada cancelada, cuando se confirma la cancelación, entonces conserva su historial, libera cliente y monitor y registra si se solicitó notificación.

### CA-BO-05 — Monitores

- Dado un fragmento de nombre o apellidos con diferencias de mayúsculas o espacios exteriores, cuando se busca, entonces se muestran todas las coincidencias parciales en orden alfabético.
- Dados datos, disciplinas y credenciales iniciales válidos, cuando recepción crea un monitor, entonces se genera un monitor activo con una cuenta inicial de rol fijo de monitor.
- Dado un monitor ya creado, cuando recepción o administración abre su ficha, entonces puede modificar sus datos, disciplinas, credenciales y estado de cuenta, pero no personalizar sus permisos.
- Dado un monitor con trabajo futuro vigente, cuando se intenta desactivar, entonces la operación se rechaza y se explica qué debe resolverse previamente.

### CA-BO-06 — Concurrencia y errores

- Dada una operación cuyos datos han quedado obsoletos, cuando se confirma, entonces no se aplica parcialmente, se explica el conflicto y se actualiza la pantalla.
- Dado un error de validación, cuando el formulario vuelve a mostrarse, entonces conserva los valores válidos introducidos siempre que sea posible.
- Dada una operación correcta, cuando finaliza, entonces la pantalla refleja el nuevo estado y muestra una confirmación.

## Fuera de alcance

- Paneles analíticos.
- Pagos y facturación.
- Modificación directa de sesiones privadas o bloqueos.
- Listas de espera y excepciones automáticas por festivos.
