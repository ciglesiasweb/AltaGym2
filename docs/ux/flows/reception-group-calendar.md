# Flujo UX — Calendario grupal de recepción y administración

**Estado:** UX 1.0 congelado
**Última actualización:** 23 de julio de 2026

## 1. Propósito y fuentes

Este documento define la experiencia de escritorio mediante la que recepción y administración consultan el calendario semanal grupal, gestionan programaciones recurrentes, consultan sesiones y reservas vigentes, reservan en nombre de clientes y realizan cancelaciones. Ambos nombres corresponden al mismo perfil funcional, con el mismo rol fijo y exactamente los mismos permisos.

Las reglas proceden de `../../BUSINESS_RULES.md`, `../../ROLES_AND_PERMISSIONS.md`, `../../DATA_MODEL.md`, `../../DATABASE_DESIGN.md`, `../../features/group-classes.md`, `../../features/reception-backoffice.md`, `../../features/clients.md`, `../../features/monitors.md`, `../../features/notifications.md` y `../../features/authentication.md`. Reutiliza los patrones de `reception-backoffice.md`, `reception-clients.md` y `group-booking.md` sin trasladar sus composiciones móviles.

No modifica reglas de negocio ni define Agenda privada, gestión general de Monitores, sistema visual, componentes o wireframes.

## 2. Separación normativa

### 2.1 Requisitos funcionales existentes

- Semana de lunes a domingo, inicialmente la actual y sin límite de navegación.
- Acciones `Semana anterior`, `Hoy` y `Semana siguiente`.
- Sesiones con fecha, hora, disciplina, monitor, sala, ocupación frente al aforo y estado.
- Programaciones semanales con disciplina, día, hora, monitor, sala, aforo y fecha de inicio, sin fecha final.
- Monitor activo, habilitado para la disciplina y disponible; sala disponible; aforo entero mayor que cero.
- Modificación limitada a sesiones futuras sin reservas y eliminación lógica bloqueada por reservas futuras vigentes.
- Reserva en nombre de un cliente bajo las mismas ventanas, aforo, duplicados y conflictos.
- Cancelación de una reserva individual o de una sesión concreta, siempre con conservación del historial.
- Notificación SMS opcional y de plantilla fija al cancelar una sesión completa, sin reintentos funcionales.

### 2.2 Consecuencias UX derivadas

- Programación recurrente y sesión concreta poseen detalles y acciones separados.
- Una reserva no se modifica: solo se crea o cancela. Cambiar cliente o sesión exige cancelar y crear otra reserva bajo todas las reglas vigentes.
- Los datos obsoletos se sustituyen antes de habilitar una mutación.
- Una sesión cancelada distingue ocupación actual cero de la instantánea histórica de reservas vigentes al cancelar.
- Los resultados regresan a una semana, sesión, programación o ficha actualizadas.

### 2.3 Recomendaciones aprobadas

- El área usa una única lista semanal administrativa; no existe cuadrícula ni selector de presentación.
- Los siete días permanecen visibles, incluidos los vacíos.
- La semana se representa mediante el lunes canónico en `week=YYYY-MM-DD`.
- Una ocurrencia usa la identidad estable `scheduleId + occurrenceDate`.
- Modificar una programación exige el campo `Aplicar cambios desde`.
- Las reservas vigentes muestran apellidos y nombre, teléfono y enlace a la ficha.
- La selección general de cliente reutiliza búsqueda por apellidos y páginas de 20 resultados.
- Si cambian las consecuencias de una operación sensible, se muestran de nuevo y se exige nueva confirmación.

## 3. Modelo de navegación y URL

La raíz conceptual es `/group-calendar`. Los textos visibles permanecen en castellano y las rutas y parámetros internos utilizan inglés.

Ejemplos no vinculantes de implementación:

```text
/group-calendar?week=2026-07-13
/group-calendar/schedules/new
/group-calendar/schedules/{scheduleId}
/group-calendar/schedules/{scheduleId}/edit
/group-calendar/schedules/{scheduleId}/delete
/group-calendar/schedules/{scheduleId}/sessions/{occurrenceDate}
```

`occurrenceDate` es la fecha local de negocio en `Europe/Madrid`. La combinación `scheduleId + occurrenceDate` identifica la misma ocurrencia antes y después de materializarse. Disciplina, monitor, hora y sala no forman parte de la identidad porque pueden variar entre revisiones.

La URL puede conservar semana, programación, sesión, cliente interno y un retorno interno validado. No contiene nombres, teléfonos, datos introducidos, borradores, decisión de notificación ni mutaciones pendientes.

`Atrás` utiliza el historial real. Una URL directa no fabrica un origen y ofrece `Volver a Calendario grupal`. Recargar reconstruye el contexto seguro y revalida. Cerrar sesión, cambiar de usuario o perder autorización descarta contexto privado y borradores.

## 4. Acceso y autorización

**Actor:** recepción o administración autenticados.  
**Entrada:** portada, navegación principal, resultado o URL protegida.  
**Precondiciones:** sesión válida, cuenta activa, rol autorizado, ámbito y recurso válidos.

El acceso valida sesión, cuenta, rol, parámetros y recurso. Si falta sesión, autentica y recupera únicamente un destino interno que continúe siendo válido. Una respuesta neutra evita distinguir recurso inexistente de no autorizado cuando hacerlo revelaría información. Una semana inválida vuelve a la actual; un recurso inválido ofrece regresar al calendario o a Inicio.

Si la cuenta del operador se desactiva o la sesión se invalida, se detiene la siguiente consulta o mutación, se descartan borradores y se conduce al inicio de sesión sin afirmar que una operación incierta terminó. `Cerrar sesión` permanece disponible desde cualquier pantalla autenticada.

## 5. Flujo — Consultar la semana

**Objetivo:** conocer las sesiones grupales y su ocupación durante una semana.  
**Entrada:** navegación `Calendario grupal`, portada, regreso o URL.  
**Resultado:** semana consultada o recuperación explicada.

### Recorrido principal

1. Se valida el acceso y se determina la semana desde `week`; sin parámetro se usa la actual.
2. Se muestran título, `Crear programación`, periodo textual y navegación temporal.
3. Se presentan lunes a domingo, siempre en ese orden.
4. Cada día contiene sus sesiones ordenadas por hora; coincidencias comparten el día y conservan un orden interno estable.
5. Cada sesión ofrece un enlace explícito al detalle.

El periodo se expresa, por ejemplo, `Semana del lunes 13 al domingo 19 de julio de 2026`. Cada día muestra fecha completa. Un día sin sesiones indica `No hay sesiones programadas`. Una semana completamente vacía conserva los siete días y la acción de creación.

### Información de cada sesión

- hora;
- disciplina;
- monitor con nombre y apellidos;
- sala;
- `Ocupación: N de M`;
- estado textual;
- enlace contextual al detalle.

`Vigente` identifica una sesión programada con plazas. `Completa` es una condición calculada cuando las reservas vigentes alcanzan el aforo. `Cancelada` prevalece y muestra `Ocupación actual: 0 de M` y, cuando corresponda, `Reservas vigentes antes de la cancelación: N`.

### Estados y recuperación

- **Carga:** conserva estructura y anuncia el periodo solicitado sin declarar vacío.
- **Actualización:** puede mantener datos anteriores como `Datos no actualizados` hasta sustituir toda la semana coherentemente.
- **Vacío:** siete días visibles y acción de crear programación.
- **Error:** explica que no se cargó la semana y ofrece `Reintentar`.
- **Cambio concurrente:** incorpora, modifica o cancela la sesión y anuncia la actualización sin mover el foco salvo que el origen desaparezca.

## 6. Flujo — Navegar entre semanas

`Semana anterior` y `Semana siguiente` desplazan siete días. `Hoy` abre la semana que contiene la fecha actual. No existen selector de fecha, mes, límites temporales ni presentaciones alternativas.

Cada cambio actualiza `week`, genera historial real, enfoca el encabezado del periodo cargado y lo anuncia. Recuperar el foco actualiza la semana sin sondeo. Una sesión añadida, modificada o cancelada por otra persona se incorpora en la consulta autoritativa.

## 7. Flujo — Consultar una sesión

**Objetivo:** consultar una ocurrencia concreta, sus reservas vigentes y las acciones permitidas.  
**Entrada:** semana, resultado, ficha de cliente o URL protegida.  
**Resultado:** detalle actual o salida segura.

La jerarquía presenta disciplina y estado; fecha, hora y duración; monitor y sala; ocupación y aforo; programación de origen; reservas vigentes; acciones sobre esta sesión; y, separadas, acciones sobre la programación.

Una sesión vigente con plazas permite reservar para un cliente, cancelar la sesión y consultar la programación. Una sesión completa no permite reservar. Una cancelada es histórica: permite consultar la programación y los resultados SMS, pero no reservar ni cancelar de nuevo.

Volver recupera la misma semana y el enlace de origen cuando sigan siendo válidos. Una URL directa ofrece `Volver a Calendario grupal`. Si la sesión cambia concurrentemente, se sustituyen los datos y se retiran las acciones incompatibles antes de mutar.

## 8. Flujo — Consultar y cancelar una reserva vigente

La tabla de reservas vigentes muestra:

- `Cliente`: apellidos y nombre, enlazados a su ficha;
- `Teléfono`;
- acción `Cancelar reserva de [cliente]`.

No añade usuario, fotografía, fecha de nacimiento ni historial de reservas. Sin reservas muestra un vacío explícito.

La cancelación usa una página completa que identifica cliente y sesión y explica que la reserva quedará `Cancelada por el gimnasio`, registrará actor y fecha, liberará una plaza y no enviará SMS. Al confirmar revalida operador, reserva, sesión, estado y versión. Una transición condicionada evita doble cancelación y doble decremento.

Si la reserva ya cambió, no se repite la mutación: se muestra el estado actual. El resultado actualiza ocupación y condición `Completa` y ofrece volver a la sesión. No existe modificación de reservas.

## 9. Flujo — Crear una programación

**Entrada:** `Crear programación` en la raíz del área.  
**Campos:** disciplina, día de la semana, hora, monitor, sala, aforo y fecha de inicio.

La recurrencia semanal sin fecha final se muestra como regla fija, no como control. Las clases comienzan a una hora en punto entre 08:00 y 21:00 y duran 45 minutos. El monitor debe estar activo, habilitado para la disciplina y disponible; la sala debe estar disponible; el aforo debe ser entero mayor que cero.

Etiquetas persistentes, ayudas y obligatoriedad textual acompañan los campos. Los errores aparecen junto al campo y, si hay varios, en un resumen enlazado que recibe el foco. Los valores válidos se conservan tras errores corregibles.

Antes de crear, el servidor revalida permisos, disciplina, monitor, sala, horario, fecha y conflictos mediante instantes reales de `Europe/Madrid`. Un único envío evita duplicados. Un resultado ambiguo consulta si la programación fue creada antes de habilitar otro intento.

El resultado identifica la programación y ofrece `Ver en el calendario` como continuidad principal y `Ver programación` como secundaria.

## 10. Flujo — Consultar y modificar una programación

El detalle de programación presenta identidad, estado, recurrencia vigente, fecha de inicio, revisiones relevantes y acciones autorizadas. Se diferencia de cualquier sesión concreta.

Modificar carga los valores actuales y añade el campo obligatorio `Aplicar cambios desde`, interpretado como fecha local de Madrid. Explica que solo cambiarán sesiones futuras sin reservas desde esa fecha. Las sesiones futuras con reservas conservarán los datos con los que fueron reservadas y, si deben cambiar, se cancelarán individualmente y se creará la planificación necesaria.

Los campos modificables son disciplina, día, hora, monitor, sala y aforo dentro de las reglas documentadas. La modificación crea una revisión futura; no sobrescribe revisiones ni sesiones protegidas. Si la programación o sus dependencias cambian, se muestra la versión actual, se conservan valores todavía válidos y se exige revisar antes de enviar de nuevo.

El resultado identifica la fecha efectiva, qué cambió y qué sesiones quedaron protegidas; conduce al calendario actualizado o a la programación.

## 11. Flujo — Eliminar una programación

**Entrada:** programación identificada.  
**Precondición:** no existen sesiones futuras con reservas vigentes sin cancelar.

La página completa explica que la eliminación es lógica: deja de generar sesiones futuras sin reservas y conserva sesiones pasadas, canceladas o materializadas, reservas, ocupaciones, revisiones e historial. No cancela una sesión concreta ni borra físicamente información.

Al confirmar revalida permisos, estado, versión y reservas futuras. Si aparece una reserva protegida, rechaza la eliminación y enlaza las sesiones que requieren tratamiento. El envío es único e idempotente. El resultado conduce al calendario actualizado.

## 12. Flujo — Reservar en nombre de un cliente

### 12.1 Desde una ficha

El recorrido conserva `Reserva para: Apellidos, Nombre`. El cliente queda fijado y no se sustituye. Reutiliza `reception-clients.md`; el resultado vuelve principalmente a la ficha y permite abrir la sesión.

### 12.2 Desde una sesión

La selección reutiliza el patrón documentado de Clientes: búsqueda explícita parcial por apellidos sobre todo el conjunto, orden por apellidos y nombre y 20 resultados por página. No añade filtros. Los clientes inactivos y el cliente del sistema `AltaGym` se identifican, pero no pueden seleccionarse.

La revisión muestra para quién se actúa y la sesión elegida. Al confirmar revalida operador, cliente activo, sesión programada, ventana inclusiva de 72 a 3 horas, aforo, duplicados y conflictos. Una sesión completa o cancelada, un cliente desactivado o un conflicto concurrente impiden crear la reserva.

El resultado reconciliado conduce principalmente a la sesión cuando el flujo nació allí y a la ficha cuando nació en Clientes. Nunca modifica ni traslada una reserva existente.

## 13. Flujo — Cancelar una sesión concreta

La confirmación completa identifica sesión, programación de origen, ocupación y consecuencias. Explica que solo se cancela esa ocurrencia, la programación continúa, las reservas vigentes pasarán a `Cancelada por el gimnasio`, se liberarán aforo y ocupaciones y se conservará el historial.

`Notificar a los clientes por SMS` aparece marcado por defecto y puede desmarcarse. Se muestra el número provisional de destinatarios y que la plantilla fija no es editable. Al confirmar se recalculan las reservas vigentes y destinatarios. Si el número o las consecuencias cambiaron, se actualiza la página y se exige una nueva confirmación expresa.

La confirmación revalida permisos, sesión, estado, versión y reservas. Cancelación, reservas afectadas, instantánea y lote de avisos se coordinan de forma idempotente. Una recarga o repetición no duplica cancelaciones ni notificaciones. Un resultado técnico ambiguo se reconcilia antes de permitir otro envío.

El resultado separa sesión cancelada, reservas canceladas, notificación solicitada o no y destinatarios definitivos. Ofrece `Ver sesión cancelada` y `Volver a la semana`.

## 14. Flujo — Consultar notificaciones

Desde una sesión cancelada se muestra el resumen de destinatarios totales, pendientes, enviados y fallidos y el estado individual por cliente. El teléfono usado se presenta parcialmente enmascarado por defecto; no se exponen mensajes libres ni datos innecesarios. El motivo técnico de fallo solo es visible a recepción y administración.

Los estados son textuales: `Pendiente`, `Enviado` y `Fallido`. Los resultados parciales no alteran la cancelación. No existen reintentos manuales o automáticos ni un panel general independiente. Entrar, recargar y recuperar el foco actualiza; no existe sondeo periódico.

## 15. Formularios, abandono y concurrencia

Crear y modificar son páginas distintas. Un formulario con cambios advierte antes de navegar, usar Atrás, cerrar o cambiar de área. Permanecer conserva el borrador; abandonar lo descarta. Cerrar sesión, cambiar de usuario, perder autorización o autenticarse de nuevo siempre lo descarta.

Los datos anteriores pueden mantenerse como no actualizados, pero se sustituyen antes de mutar. Monitor inactivo o no habilitado, sala o monitor ocupados, aforo o recurrencia cambiados, programación modificada, reserva creada o cancelada y sesión invalidada se tratan como conflictos explícitos. No hay sobrescritura silenciosa ni creación parcial.

## 16. Accesibilidad

- Enlace `Saltar al contenido principal`, cabecera, navegación, contenido principal y región de estado.
- `Calendario grupal` activo por texto y semántica, no solo color.
- Un título principal y migas en rutas jerárquicas.
- Navegación semanal dentro de una región etiquetada; el periodo cargado se anuncia.
- Lista semántica de siete días con encabezados; cada sesión se asocia a su día y hora.
- Estados `Vigente`, `Completa` y `Cancelada` mediante texto.
- Ocupación expresada de forma comprensible, por ejemplo `Ocho reservas vigentes de doce plazas`.
- Tablas de reservas y notificaciones con título, encabezados asociados y cliente como encabezado de fila cuando proceda.
- Teclado completo, foco visible y regreso al origen válido.
- Formularios con obligatoriedad textual, ayudas, errores asociados y resumen enlazado.
- Anuncios de carga, actualización, conflicto, cancelación y resultados SMS.
- Contraste, ampliación, reflujo y objetivos de interacción verificados conforme a WCAG 2.2 AA.

## 17. Estados transversales y recuperación

| Estado | Siguiente acción |
| --- | --- |
| Semana vacía | Mantener siete días y crear programación |
| Error temporal | Reintentar conservando la semana |
| Datos no actualizados | Esperar sustitución o reintentar; no mutar |
| Sesión modificada o cancelada | Mostrar estado actual y retirar acciones incompatibles |
| Ocupación modificada | Actualizar aforo y revisar antes de confirmar |
| Programación concurrente | Comparar con versión actual sin sobrescribir |
| Cliente inactivo | Impedir reserva y volver a su ficha o sesión |
| Pérdida de sesión o autorización | Descartar borrador y autenticar sin reenvío |
| Resultado ambiguo | Reconciliar con la fuente autoritativa |

## 18. Relación con otros flujos y documentos

La estructura común del backoffice aporta la base. `reception-clients.md` aporta selección, ficha y conservación del cliente. `group-booking.md` aporta las reglas de reserva, no su navegación móvil. `monitor-agenda.md` no concede acciones administrativas ni limita la consulta a un monitor.

La Agenda privada, sesiones privadas, bloqueos y sus cancelaciones se documentan en `reception-private-agenda.md`. La gestión detallada de Monitores se documenta en `monitors.md`; el sistema visual y los wireframes seguirán su propia documentación.





## 19. Trazabilidad resumida

| Área | Fuente |
| --- | --- |
| Semana y calendario | `../../features/reception-backoffice.md` |
| Programaciones, sesiones y reservas | `../../features/group-classes.md`; `../../BUSINESS_RULES.md` |
| Identidad híbrida y revisiones | `../../DATA_MODEL.md`; `../../DATABASE_DESIGN.md` |
| Permisos | `../../ROLES_AND_PERMISSIONS.md` |
| Cliente y selección | `../../features/clients.md`; `reception-clients.md` |
| SMS | `../../features/notifications.md` |
| Sesión y cuenta | `../../features/authentication.md` |
| Patrones administrativos | `reception-backoffice.md` |






