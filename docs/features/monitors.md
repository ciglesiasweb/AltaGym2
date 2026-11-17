# Feature — Monitores

**Estado:** Definición completa

## Objetivo

Gestionar los monitores, su acceso y las disciplinas que pueden impartir, evitando asignaciones incompatibles y conservando el historial de la actividad.

## Usuarios y permisos

- Recepción y administración pueden crear monitores, incluida su cuenta con usuario y contraseña inicial.
- Recepción y administración pueden consultar y modificar sus datos operativos y disciplinas.
- Recepción y administración pueden desactivar o reactivar la cuenta de un monitor y restablecer posteriormente su contraseña.
- Recepción y administración comparten el mismo rol funcional y realizan toda la gestión administrativa. Todos los monitores tienen los mismos permisos fijos.

## Alcance

- Crear, consultar y modificar monitores.
- Desactivar y reactivar monitores sin eliminarlos físicamente.
- Asignar una o varias disciplinas.
- Buscar y filtrar el listado de monitores.
- Mostrar solo monitores compatibles al crear o modificar una programación grupal.
- Mostrar las disciplinas como información al reservar una sesión privada.

## Fuera de alcance

- Eliminación física de monitores.
- Gestión de correo electrónico, dirección o fotografía del monitor.
- Gestión manual de disponibilidad o ausencias.

## Datos de la ficha

Son obligatorios:

- Nombre.
- Apellidos.
- Teléfono.
- Nombre de usuario.
- Contraseña inicial y su confirmación al crear la cuenta.
- Al menos una disciplina.

El teléfono se guarda como texto eliminando únicamente los espacios exteriores. El nombre de usuario y la contraseña cumplen las reglas comunes de autenticación.

## Reglas

### Estado del monitor

- Los monitores no se eliminan: se desactivan y pueden reactivarse.
- La desactivación invalida inmediatamente todas las sesiones de usuario del monitor.
- Un monitor inactivo no puede iniciar sesión ni aparece al crear programaciones grupales, sesiones privadas o bloqueos.
- No se puede desactivar un monitor que tenga programaciones o sesiones grupales, sesiones privadas o bloqueos futuros vigentes; primero deben reasignarse o cancelarse.
- Las actividades pasadas conservan la referencia al monitor aunque esté inactivo.

### Disciplinas

- Un monitor activo debe tener al menos una disciplina asignada.
- Un monitor solo puede impartir sesiones grupales de una disciplina que tenga asignada.
- No se puede retirar una disciplina si el monitor tiene una programación grupal futura activa de esa disciplina.
- En las sesiones privadas, las disciplinas son informativas y no filtran la reserva.

### Listado

- Muestra nombre, apellidos, teléfono, disciplinas y estado.
- Permite buscar por nombre o apellidos mediante coincidencia parcial, ignorando mayúsculas y minúsculas y eliminando los espacios exteriores, y filtrar por estado.
- Por defecto muestra únicamente monitores activos.
- Los resultados se paginan.

### Validación y concurrencia

- Las reglas se comprueban de nuevo al guardar o confirmar una operación.
- No puede confirmarse una programación grupal con un monitor inactivo o no habilitado para su disciplina.
- No puede confirmarse una actividad si el monitor ya está ocupado en el mismo bloque.
- Si otra persona modifica el monitor antes de guardar, la operación se rechaza con un mensaje claro y se solicita recargar los datos.

## Historias de usuario

### MON-01 — Crear un monitor

Como miembro de recepción o administración, quiero crear la ficha y las credenciales iniciales de un monitor para incorporarlo a la operativa.

### MON-02 — Consultar monitores

Como recepcionista, quiero buscar y filtrar el listado de monitores para localizar rápidamente su ficha y conocer su estado y disciplinas.

### MON-03 — Modificar datos operativos

Como recepcionista, quiero corregir los datos operativos de un monitor para mantener actualizada su información.

### MON-04 — Gestionar disciplinas

Como recepcionista, quiero asignar las disciplinas de un monitor para evitar programarlo en actividades que no puede impartir.

### MON-05 — Desactivar y reactivar un monitor

Como miembro de recepción o administración, quiero desactivar un monitor sin borrar su historial y reactivarlo cuando corresponda.

### MON-06 — Programar un monitor compatible

Como recepcionista, quiero ver únicamente monitores activos y compatibles al crear o modificar una programación grupal para evitar asignaciones inválidas.

### MON-07 — Consultar disciplinas en una sesión privada

Como cliente, quiero ver las disciplinas de cada monitor disponible para elegir con más información sin que limiten mi reserva.

## Casos límite

- Se intenta crear un monitor sin alguno de los datos obligatorios o sin disciplinas.
- El nombre de usuario coincide con otro tras normalizar mayúsculas, minúsculas y espacios exteriores.
- La contraseña inicial no cumple las reglas o su confirmación no coincide.
- Se intenta asignar permisos diferentes a un monitor concreto.
- Se intenta dejar sin disciplinas a un monitor activo.
- Se intenta retirar una disciplina utilizada por una programación grupal futura activa.
- Se intenta asignar a una programación grupal un monitor inactivo o sin la disciplina necesaria.
- Se intenta desactivar un monitor con una programación o sesión grupal, sesión privada o bloqueo futuro vigente.
- Se desactiva un monitor con sesiones de usuario abiertas.
- Se reactiva un monitor que conserva al menos una disciplina.
- Dos personas editan simultáneamente la misma ficha.
- El monitor queda ocupado después de mostrarse como disponible y antes de confirmar una actividad.
- La búsqueda no devuelve resultados o una página deja de existir después de aplicar un filtro.

## Criterios de aceptación

### CA-MON-01 — Alta y rol

- Recepción y administración pueden crear un monitor indicando todos los datos obligatorios.
- La cuenta nueva tiene el rol fijo de monitor y los mismos permisos que cualquier otro monitor.
- El sistema rechaza el alta si falta un dato obligatorio, no hay ninguna disciplina o las credenciales no cumplen las reglas de autenticación.
- El sistema rechaza nombres de usuario duplicados conforme a su normalización común.
- Tras el alta correcta, el monitor queda activo y puede iniciar sesión con sus credenciales iniciales.

### CA-MON-02 — Consulta y modificación

- Recepción y administración pueden consultar y modificar nombre, apellidos, teléfono y disciplinas.
- El listado muestra los datos definidos, está paginado y presenta únicamente monitores activos por defecto.
- La búsqueda encuentra coincidencias parciales por nombre o apellidos, no distingue mayúsculas y minúsculas, elimina espacios exteriores y puede combinarse con el filtro de estado.
- Recepción y administración pueden restablecer contraseñas y cambiar el estado de la cuenta después del alta; los permisos del rol monitor no son configurables individualmente.
- Una modificación concurrente provoca el rechazo del guardado y solicita recargar la ficha.

### CA-MON-03 — Disciplinas y programación

- Un monitor activo conserva siempre al menos una disciplina.
- No se puede retirar una disciplina vinculada a una programación grupal futura activa del monitor.
- Al crear o modificar una programación grupal solo se ofrecen monitores activos habilitados para su disciplina.
- La confirmación vuelve a validar estado, disciplina y ausencia de conflictos horarios.
- Al reservar una sesión privada se muestran las disciplinas de cada monitor disponible, pero estas no filtran ni impiden la elección.

### CA-MON-04 — Desactivación y reactivación

- Recepción y administración pueden desactivar o reactivar un monitor.
- No se puede desactivar un monitor mientras conserve actividades o bloqueos futuros vigentes y el sistema indica que deben reasignarse o cancelarse.
- Una desactivación correcta invalida todas sus sesiones y bloquea nuevos accesos y asignaciones.
- Las actividades pasadas mantienen la identificación del monitor desactivado.
- Al reactivar el monitor, vuelve a poder acceder y participar en nuevas asignaciones según sus disciplinas y disponibilidad.
