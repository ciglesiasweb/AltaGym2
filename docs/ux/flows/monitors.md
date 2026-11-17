# Flujo UX — Gestión de monitores

**Estado:** UX 1.0 congelado
**Ámbito:** backoffice de escritorio para recepción y administración

## 1. Propósito, alcance y fuentes

Este documento define el listado, alta, consulta y mantenimiento operativo de los monitores. Recepción y administración comparten el mismo rol funcional y realizan toda la gestión administrativa.

Las fuentes funcionales principales son `../../features/monitors.md`, `../../features/reception-backoffice.md`, `../../features/authentication.md`, `../../ROLES_AND_PERMISSIONS.md`, `../../BUSINESS_RULES.md`, `../../DATA_MODEL.md`, `../../DATABASE_DESIGN.md` y los patrones comunes de `reception-backoffice.md`. La relación con las agendas y la selección de monitores en otras áreas se mantiene en sus flujos específicos.

Quedan fuera la eliminación física, la gestión manual de disponibilidad o ausencias, la personalización granular de permisos, el sistema visual, los wireframes y cualquier recorrido móvil propio del backoffice.

## 2. Separación normativa

### 2.1 Requisitos funcionales existentes

- Recepción y administración pueden crear, consultar y modificar monitores.
- La ficha del monitor incluye nombre, apellidos, teléfono, nombre de usuario, estado y disciplinas.
- El alta exige credenciales iniciales y al menos una disciplina.
- Un monitor activo debe conservar al menos una disciplina.
- Un monitor inactivo no puede iniciar sesión ni aparece como opción en la operativa que lo requiera.
- El listado se busca por nombre o apellidos, admite coincidencias parciales, permite filtrar por estado y se pagina.
- Un monitor no se elimina físicamente: se desactiva y puede reactivarse.
- La desactivación invalida de inmediato todas sus sesiones.
- Un monitor con trabajo futuro vigente no puede desactivarse hasta resolverlo.
- Los permisos del rol monitor son fijos y no se personalizan individualmente.

### 2.2 Consecuencias UX derivadas

- La lista debe priorizar identificación, estado y disciplinas.
- Las operaciones sensibles parten de una ficha identificada, se revalidan y no sobrescriben cambios concurrentes.
- El alta y la modificación separan claramente datos operativos, disciplinas y credenciales.
- Una confirmación no debe ocultar si el monitor ya cambió de estado o de disponibilidad.
- El resultado debe devolver al contexto actualizado sin perder la búsqueda o la página válidas.

### 2.3 Decisiones UX aprobadas

- La interfaz usa castellano; rutas y parámetros internos usan términos en inglés.
- La tabla muestra `Monitor`, `Teléfono`, `Disciplinas`, `Estado` y `Acciones`.
- La identificación principal enlaza a la ficha; la fila no es completamente clicable.
- El listado conserva la búsqueda, el filtro de estado y la página mientras sigan siendo válidos.
- El alta y la modificación comparten estructura, pero solo el alta incluye credenciales iniciales.
- La ficha concentra datos, disciplinas, credenciales, estado y acciones mutables.
- Desactivar y restablecer contraseña usan confirmación completa; reactivar se ejecuta con revalidación directa.
- El resultado vuelve a la ficha o al listado actualizado y conserva el contexto útil.

## 3. Actor, precondiciones y autorización

**Actor:** miembro de recepción o administración con rol fijo `RECEPTION`.  
**Dispositivo:** escritorio o portátil.  
**Precondiciones:** sesión válida, cuenta activa, rol autorizado, parámetros válidos y recurso accesible.

La entrada normal se produce desde la portada o la navegación principal `Monitores`. Una URL interna valida primero autenticación, cuenta, rol, ámbito y recurso. Si falta sesión, se autentica y solo se recupera el destino si continúa siendo seguro. Una respuesta neutra evita distinguir recurso inexistente de recurso no autorizado cuando hacerlo revelaría información. Una ruta inválida ofrece `Volver a Monitores` o `Volver al inicio`.

Si la sesión o la cuenta del operador se invalida, se detienen las mutaciones, se descartan borradores y credenciales y se aplica el flujo de autenticación. `Cerrar sesión` permanece disponible desde toda pantalla autenticada.

## 4. Modelo de navegación y URL

La raíz conceptual es `/monitors`. Ejemplos no vinculantes de rutas:

- `/monitors/new`;
- `/monitors/{monitorId}`;
- `/monitors/{monitorId}/edit`;
- `/monitors/{monitorId}/deactivate`;
- `/monitors/{monitorId}/reactivate`;
- `/monitors/{monitorId}/reset-password`;
- `/monitors/{monitorId}/disciplines`.

Los nombres visibles permanecen en castellano. La URL puede conservar `search`, `filter`, `page`, la identidad interna y un retorno interno validado. El identificador no se sustituye por nombre o teléfono.

`Atrás` usa el historial real. Volver desde una ficha conserva búsqueda, filtro y página si siguen siendo válidos. Una URL directa no fabrica origen y ofrece regreso a `/monitors`. Recargar reconstruye el contexto seguro y revalida; cerrar sesión, cambiar de usuario o perder autorización lo descarta.

## 5. Flujo — Listar, buscar y filtrar

**Objetivo:** localizar un monitor y abrir su ficha.  
**Actor:** recepción o administración.  
**Entrada:** portada, navegación `Monitores`, regreso de una ficha o URL protegida.  
**Precondiciones:** autorización válida.

### Recorrido principal

1. El sistema abre `Monitores`, actualiza el listado y enfoca su título.
2. Presenta `Alta de monitor`, búsqueda, filtro de estado, resumen, tabla y paginación.
3. Ordena por apellidos y nombre.
4. La persona puede enviar `Buscar`, cambiar el filtro, cambiar página o abrir el enlace de detalle.
5. Al regresar, se reconstruyen término, filtro, página y foco mientras sigan siendo válidos.

Por defecto el listado muestra únicamente monitores activos; el filtro de estado permite ampliar la vista a inactivos o al conjunto completo según la feature.

### Información y acciones

- `Monitor`: apellidos y nombre, como identificación y enlace.
- `Teléfono`.
- `Disciplinas`.
- `Estado`: texto `Activo` o `Inactivo`.
- `Acciones`: `Ver ficha` y `Modificar`, con nombre accesible contextual.

No se añaden correo, dirección, fotografía, permisos personalizables, auditoría técnica ni campos no documentados.

### Búsqueda y filtro

- La búsqueda admite coincidencias parciales por nombre o apellidos, elimina espacios exteriores e ignora mayúsculas.
- El término no enviado no altera resultados ni URL.
- El filtro de estado permite limitar a activos, inactivos o al conjunto completo según la feature.
- Un término nuevo vuelve a la primera página. Limpiar o cambiar el filtro abre el conjunto correspondiente en la primera página.
- Un error temporal conserva el contexto aplicado y ofrece `Reintentar`.

### Paginación

- La paginación utiliza un tamaño fijo aprobado por la feature.
- `Anterior`, números próximos y `Siguiente` se agrupan en una navegación identificada.
- Se comunica `Página X de Y` y, cuando el total esté disponible, el intervalo y total.
- Los controles imposibles están deshabilitados semánticamente.
- Cambiar página enfoca el resumen o encabezado del listado y anuncia el nuevo conjunto.

### Estados alternativos y recuperación

- **Carga:** estructura estable y anuncio, sin declarar vacío.
- **Vacío real:** explica que no existen monitores y conserva `Alta de monitor`.
- **Sin resultados:** conserva el término y permite limpiarlo.
- **Error:** ofrece reintento y mantiene contexto seguro.
- **Datos anteriores:** se marcan `Datos no actualizados` hasta su sustitución coherente.
- **Fila cambiada o retirada:** se revalida, actualiza la tabla y mueve el foco al contexto estable más próximo.

**Resultado:** ficha abierta o listado actualizado.  
**Origen:** MON-02, BO-14, CA-MON-02, CA-BO-05.  
**Pendientes:** ninguno de interacción; el comportamiento queda definido por la feature.

## 6. Flujo — Alta de monitor

**Objetivo:** crear un monitor activo con credenciales iniciales.  
**Entrada:** `Alta de monitor` en la raíz del área.  
**Precondiciones:** autorización vigente.

### Recorrido principal

1. Se abre una página completa con migas `Monitores / Alta de monitor`.
2. El formulario agrupa `Datos operativos`, `Disciplinas` y `Credenciales iniciales`.
3. Se introducen nombre, apellidos, teléfono, nombre de usuario, contraseña y confirmación; al menos una disciplina es obligatoria.
4. Se valida en cliente únicamente como ayuda y de forma autoritativa al enviar.
5. Un único envío crea el monitor activo.
6. El resultado identifica al monitor y ofrece `Ver ficha` como continuidad principal y `Volver a Monitores`.

### Validación y errores

Las etiquetas, ayudas, obligatoriedad, errores de campo y resumen son accesibles. Un error mantiene valores válidos, salvo secretos que resulte inseguro conservar. El nombre de usuario ocupado se asocia al campo. Contraseña y confirmación se comparan exactamente, no se transforman ni se registran. Si falta disciplina, el formulario lo indica en el bloque correspondiente.

Los intentos repetidos usan una operación idempotente o clave equivalente. Un resultado técnico ambiguo consulta si el monitor fue creado antes de habilitar otro envío.

### Abandono

Con cambios, navegar, usar Atrás, cerrar o cambiar de área solicita confirmación de abandono. Cerrar sesión, cambiar de usuario, perder autorización o autenticarse de nuevo descarta el borrador y las credenciales.

**Información visible:** campos documentados, disciplinas y que el monitor se creará activo.  
**Acciones:** `Crear monitor`, `Cancelar`, añadir o retirar disciplinas seleccionadas.  
**Resultado:** ficha creada, sin mostrar la contraseña.  
**Origen:** MON-01, CA-MON-01, CA-MON-02, CA-MON-03.

## 7. Flujo — Consultar ficha

**Objetivo:** consultar identidad, datos, estado, disciplinas y acciones autorizadas.  
**Entrada:** enlace del listado, resultado o URL directa.  
**Precondiciones:** monitor existente y accesible.

La ficha jerarquiza identidad, estado, disciplinas, datos operativos, nombre de usuario y acciones. Nunca muestra contraseñas, hashes, sesiones, auditoría técnica ni permisos personalizables.

Monitor activo: `Modificar`, `Desactivar`, `Restablecer contraseña` y consulta de disciplinas. Monitor inactivo: `Modificar`, `Reactivar` y `Restablecer contraseña`; se explica que no puede iniciar sesión ni participar en nuevas asignaciones hasta volver a estar activo.

Al recuperar el foco se actualiza. Si cambia, se sustituyen datos, se anuncia el cambio y se retiran acciones incompatibles. Si deja de ser accesible, se usa una salida neutra. Regresar conserva listado, filtro y página; desde URL directa vuelve a la raíz.

**Resultado:** consulta o entrada a una operación.  
**Origen:** MON-03, MON-04, MON-05, MON-06, CA-MON-02, CA-MON-04.

## 8. Flujo — Modificar datos y disciplinas

**Objetivo:** actualizar datos operativos y disciplinas sin modificar la política de permisos.  
**Entrada:** ficha o acción explícita de fila.  
**Precondiciones:** ficha actual y autorización vigente.

1. Se cargan los valores autoritativos actuales.
2. Se muestran nombre, apellidos, teléfono, nombre de usuario y disciplinas; no aparecen contraseña ni confirmación.
3. La lista de disciplinas permite añadir y retirar valores conforme a las reglas funcionales.
4. Al guardar se revalidan campos, disciplinas, usuario único, permisos, estado y versión.
5. El resultado vuelve a la ficha actualizada.

Si el monitor activo quedara sin disciplinas, la validación lo impide. Si otra persona cambió cualquier dato o disciplina, no se sobrescribe. Se muestran los datos actuales, se explica el conflicto y se conservan de forma segura los valores introducidos para comparar y volver a aplicar; no existe fusión automática ni sobrescritura silenciosa.

**Resultado:** ficha actualizada o recuperación de conflicto.  
**Origen:** MON-04, MON-05, CA-MON-02, CA-MON-03.

## 9. Flujo — Cambiar estado

**Objetivo:** desactivar o reactivar un monitor sin eliminarlo.  
**Entrada:** ficha identificada.  
**Precondiciones:** monitor y autorización vigentes.

La desactivación usa una página completa que muestra nombre, usuario, estado y consecuencia: el monitor se desactivará, se invalidarán sus sesiones y no podrá iniciar sesión ni aparecer como opción en nuevas asignaciones. Acciones: `Desactivar monitor` y `Cancelar`.

La reactivación se ejecuta desde la ficha sin confirmación adicional, siempre con revalidación de permisos, identidad, estado y versión. Si ya estaba activo o inactivo, se reconcilia sin efectos adicionales según la operación solicitada.

Al confirmar se evita doble envío y se comprueban las restricciones de trabajo futuro. Si el monitor conserva actividades o bloqueos futuros vigentes, se rechaza la desactivación y se explica qué debe resolverse primero. Un resultado ambiguo se consulta antes de comunicar éxito.

**Resultado:** ficha actualizada en el estado correspondiente.  
**Origen:** MON-04, MON-07, MON-08, CA-MON-04.

## 10. Flujo — Restablecer contraseña

**Objetivo:** asignar una contraseña nueva sin consultar la anterior.  
**Entrada:** exclusivamente desde la ficha.  
**Precondiciones:** autorización vigente y monitor accesible.

1. Una página separada solicita `Nueva contraseña` y `Confirmar nueva contraseña` y comunica las reglas.
2. Los errores corregibles conservan el contexto y enfocan el resumen.
3. Una página completa confirma monitor y consecuencia: todas sus sesiones se invalidarán.
4. Un único envío revalida permiso, identidad, estado y versión, actualiza la credencial y registra actor y fecha, nunca el valor.
5. Un resultado ambiguo se reconcilia antes de permitir reenvío.
6. El resultado vuelve a la ficha y no muestra, copia ni recupera la contraseña.

El restablecimiento puede realizarse sobre un monitor inactivo, pero no le permite iniciar sesión hasta reactivarlo. No existen correo, SMS, enlace de recuperación ni generación automática documentada.

**Resultado:** contraseña restablecida y sesiones invalidadas.  
**Origen:** MON-09, MON-10, MON-11, CA-MON-02, CA-MON-04.

## 11. Carga, actualización, concurrencia y sesión

- Se actualiza al entrar, recargar, completar operaciones y recuperar el foco; no existe tiempo real ni sondeo.
- Los datos anteriores pueden mantenerse marcados `Datos no actualizados`, pero se sustituyen coherentemente antes de permitir mutar.
- Los errores temporales conservan búsqueda, filtro, página y valores no secretos y ofrecen `Reintentar`.
- Monitor modificado, estado cambiado, usuario ocupado y disciplina cambiada se tratan como conflictos explícitos.
- Una cuenta del operador desactivada o una sesión invalidada detiene la operación, descarta borradores y credenciales y no permite recuperar mutaciones tras autenticarse.

## 12. Accesibilidad

- Enlace `Saltar al contenido principal`, cabecera, navegación, principal y región de estado.
- Un único título principal, migas identificadas y `Monitores` activa sin depender del color.
- Tabla semántica con encabezados asociados; la identificación puede actuar como encabezado de fila.
- Enlaces y acciones con nombre contextual, por ejemplo `Modificar a Ana Pérez`.
- Búsqueda etiquetada, filtro anunciado, resumen y paginación dentro de una navegación con página actual semántica.
- Teclado completo, foco visible y gestión previsible al buscar, filtrar, paginar, abrir, regresar, confirmar y fallar.
- Formularios con obligatoriedad textual, ayudas, errores asociados, resumen enlazado y conservación de valores válidos.
- Carga, actualización, conflicto, cambio de estado y resultado se anuncian sin desplazar el foco innecesariamente.
- Contraste, ampliación, reflujo y objetivos de interacción se verifican conforme a WCAG 2.2 AA.

## 13. Trazabilidad

| Comportamiento | Fuente |
| --- | --- |
| Gestión de monitores | `../../features/monitors.md` |
| Rol común y permisos | `../../ROLES_AND_PERMISSIONS.md`; `../../features/reception-backoffice.md` |
| Sesión, contraseña y rutas | `../../features/authentication.md`; `../../features/monitors.md` |
| Operaciones de escritorio | `../../features/reception-backoffice.md` |
| Reglas de disciplinas y estado | `../../features/monitors.md`; `../../BUSINESS_RULES.md` |
| Estados y relaciones | `../../DATA_MODEL.md`; `../../DATABASE_DESIGN.md` |
| Navegación aprobada | `../NAVIGATION_AND_INFORMATION_STRUCTURE.md` |
| Actualización y accesibilidad | `../UX_PRINCIPLES.md`; `../USER_FLOWS.md` |
| Gestión relacionada en otras áreas | `reception-group-calendar.md`; `reception-private-agenda.md` |

## 14. Pendientes

No quedan decisiones UX pendientes para este flujo.
