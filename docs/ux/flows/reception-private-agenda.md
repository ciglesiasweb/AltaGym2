# Agenda privada de recepción y administración

**Estado:** UX 1.0 congelado
**Ámbito:** Backoffice de escritorio para recepción y administración

## 1. Propósito y alcance

Define la consulta semanal conjunta de sesiones privadas y bloqueos de monitor, la creación de ambos tipos, sus detalles, cancelaciones, notificaciones SMS y la continuidad con Clientes. No modifica reglas de negocio, no define la gestión de Monitores y no contiene sistema visual, wireframes ni código.

## 2. Fuentes y separación normativa

- **Requisitos funcionales:** `../../BUSINESS_RULES.md`, `../../ROLES_AND_PERMISSIONS.md`, `../../DATA_MODEL.md`, `../../DATABASE_DESIGN.md`, `../../features/private-sessions.md`, `../../features/reception-backoffice.md`, `../../features/clients.md`, `../../features/monitors.md`, `../../features/notifications.md` y `../../features/authentication.md`.
- **Patrones UX previos:** `reception-backoffice.md`, `reception-clients.md`, `reception-group-calendar.md`, `private-session-booking.md`, `monitor-agenda.md` y los documentos generales de `docs/ux/`.
- **Consecuencias UX:** estados, recorridos y recuperación necesarios para presentar esas reglas de forma segura.
- **Recomendaciones aprobadas:** única lista semanal agrupada por día y monitor, orden estable, rutas y continuidad descritas aquí.
- **Aplazado:** presentación visual definitiva, wireframes, componentes, DTO, idempotencia física y proveedor SMS.


## 3. Actores, acceso y autorización

Recepción y administración comparten un único perfil funcional y exactamente los mismos permisos. El rol fijo, la cuenta activa y la sesión vigente son las únicas fuentes generales de acceso; no existen permisos individuales ni selector de rol.

La entrada procede de la portada, la navegación principal, un resultado, una ficha de cliente, un detalle relacionado o una URL directa. Antes de mostrar datos se validan sesión, cuenta activa, rol, ámbito y recurso. Una respuesta neutra `Recurso no disponible` agrupa inexistencia y falta de autorización cuando distinguirlas revelaría información. Una ruta inexistente usa la página general `Página no encontrada`.

Si la cuenta se desactiva durante el uso, la siguiente petición protegida detiene consulta o mutación, descarta borradores y contexto privado y conduce a autenticación sin comunicar una operación incierta como completada. `Cerrar sesión` permanece disponible en todas las pantallas, invalida la sesión actual y descarta contexto privado.

## 4. Arquitectura y rutas

Los textos visibles permanecen en castellano y las rutas y parámetros internos usan inglés:

```text
/private-agenda?week=YYYY-MM-DD
/private-agenda/private-sessions/new
/private-agenda/private-sessions/{sessionId}
/private-agenda/private-sessions/{sessionId}/cancel
/private-agenda/private-sessions/{sessionId}/notifications
/private-agenda/monitor-blocks/new
/private-agenda/monitor-blocks/{blockId}
/private-agenda/monitor-blocks/{blockId}/cancel
```

`week` contiene el lunes canónico. Sin parámetro se abre la semana actual. Una fecha válida que no sea lunes se normaliza al lunes de su semana y se anuncia; un valor inválido abre la semana actual y explica el ajuste. Recargar reconstruye el contexto seguro y revalida. Identificadores, semana y origen lógico permitido pueden conservarse; nombres, teléfonos, nota interna, borradores, selección de SMS, claves técnicas y mutaciones nunca se representan en URL.

`Atrás` usa el historial real. Una URL directa no fabrica origen y ofrece regreso a `Agenda privada`, tomando la semana válida solicitada o la semana del recurso. Las migas expresan área y recurso, no todo el historial.

## 5. Agenda semanal

### 5.1 Jerarquía

1. cabecera y navegación común, con `Agenda privada` activa;
2. migas cuando procedan;
3. título `Agenda privada`;
4. intervalo textual de lunes a domingo;
5. `Semana anterior`, `Hoy` y `Semana siguiente`;
6. `Crear sesión privada` y `Crear bloqueo`;
7. lista semanal;
8. región de estado para carga, actualización, conflictos y resultados.

La agenda muestra siempre los siete días, incluidos los vacíos. `Hoy` conduce a la semana actual y no añade historial redundante cuando ya es el destino actual. La navegación no tiene límite funcional.

### 5.2 Presentación única aprobada

Agenda privada utiliza una única lista semanal, sin cuadrícula, filtros ni selector de vista. Cada día contiene sus monitores con actividad, ordenados alfabéticamente por apellidos y nombre. Las actividades de cada monitor se ordenan por inicio, después por final y finalmente por tipo como desempate estable. Un día vacío muestra `Sin actividades`.

La agrupación día → monitor → actividad permite representar bloqueos de varias horas y coincidencias entre monitores sin superposición gráfica. Dos actividades simultáneas de monitores diferentes aparecen en sus respectivos grupos. Una coincidencia vigente del mismo monitor es una incoherencia autoritativa: se actualizan los datos, se anuncia el problema y no se permite mutar sobre información inconsistente.

### 5.3 Elementos

Una sesión muestra `Sesión privada`, estado, intervalo, nombre y apellidos del cliente y enlace al detalle. El nombre accesible incorpora día, fecha, intervalo, monitor, cliente, tipo y estado aunque el monitor ya encabece visualmente el grupo.

Un bloqueo muestra `Bloqueo AltaGym`, estado, intervalo, monitor y enlace al detalle. Su nota interna se reserva al detalle para reducir densidad y exposición accidental.

Los intervalos se expresan como `10:00–10:45` o `10:00–13:00`; no dependen de longitud, posición o color. Las actividades canceladas permanecen en su posición cronológica, conservan datos históricos, se identifican textualmente y no representan ocupación actual.

### 5.4 Carga y actualización

La estructura de título, periodo, controles y días permanece estable durante la carga. Una respuesta correcta sin actividades produce semana vacía; un error nunca se presenta como vacío y ofrece `Reintentar`. Al recuperar el foco se consulta de nuevo sin sondeo periódico. Los datos anteriores pueden permanecer como `Datos no actualizados`, pero se sustituyen de forma coherente antes de habilitar una mutación.

## 6. Detalle de sesión privada

- **Objetivo:** consultar una sesión identificada y actuar según su estado.
- **Actor:** recepción o administración.
- **Entrada:** agenda, resultado, ficha, relación autorizada o URL directa.
- **Precondiciones:** sesión y autorización válidas.
- **Información:** estado principal, cliente, monitor, fecha completa, inicio, final, duración de 45 minutos y auditoría de cancelación permitida; si hubo aviso, resumen y acceso a resultados.
- **Acciones confirmada:** cancelar, abrir cliente, abrir monitor como relación consultiva y regresar.
- **Acciones cancelada:** consultar historial, notificación y relaciones; no modificar, reactivar ni cancelar otra vez.
- **Resultado:** detalle actual o salida neutra segura.

La jerarquía es estado, fecha e intervalo, duración, cliente, monitor, cancelación y notificación. Cliente y monitor no se modifican dentro de la sesión. Si una relación se desactiva, la sesión conserva su dato histórico y solo muestra el estado actual cuando esté autorizado. Si otra persona cancela la sesión, el detalle sustituye datos, anuncia el cambio y retira la acción incompatible.

## 7. Detalle de bloqueo

- **Objetivo:** consultar ocupación e historial de un bloqueo identificado.
- **Información:** `Bloqueo AltaGym`, estado, monitor, fecha, inicio inclusivo, final exclusivo, intervalo completo, duración y nota interna opcional.
- **Acciones vigente:** cancelar, abrir monitor como relación consultiva y regresar.
- **Acciones cancelado:** consultar y regresar.
- **Restricciones:** sin modificar, reactivar, SMS ni exposición de la nota fuera del backoffice.

AltaGym aparece como cliente del sistema fijo, no como cliente ordinario ni como destino de reservas.

## 8. Creación de sesión privada

### 8.1 Desde Agenda privada

1. seleccionar cliente;
2. seleccionar fecha;
3. seleccionar hora;
4. consultar monitores disponibles;
5. seleccionar monitor;
6. revisar;
7. confirmar una vez;
8. reconciliar y mostrar resultado.

La selección de cliente reutiliza búsqueda explícita parcial por apellidos, orden por apellidos y nombre y páginas de 20. Solo permite clientes activos normales; los inactivos y AltaGym no son seleccionables. No añade filtros.

### 8.2 Desde la ficha del cliente

El cliente llega identificado, se presenta con nombre completo y estado y no es editable. El regreso principal tras éxito o abandono es su ficha actualizada. AltaGym no ofrece esta entrada. Si el cliente queda inactivo, el flujo se detiene y conduce a su ficha o a seleccionar otro cliente cuando el origen sea Agenda privada.

### 8.3 Fecha, hora y monitor

Las sesiones duran 45 minutos y empiezan en punto entre 10:00 y 18:00. Solo se muestran días e inicios potencialmente reservables dentro del intervalo inclusivo de 72 a 3 horas, calculado mediante instantes reales en `Europe/Madrid`. Cambiar fecha invalida hora y monitor; cambiar hora invalida monitor.

Los monitores se consultan después de fecha y hora. Solo aparecen activos y disponibles, ordenados alfabéticamente por apellidos y nombre. Cada opción muestra nombre completo y disciplinas como información secundaria; se elige monitor, no disciplina, y la elección es explícita aunque solo exista uno. La ausencia de resultados no revela actividades, clientes, bloqueos ni notas que expliquen la ocupación.

### 8.4 Revisión, confirmación y resultado

La revisión muestra cliente, fecha, intervalo, duración, monitor y disciplinas informativas. La confirmación revalida cuenta, permiso, cliente activo, monitor activo, ventana y conflictos de ambos; impide doble envío y es idempotente ante repetición.

Un conflicto conserva valores todavía válidos y devuelve al paso mínimo afectado. Monitor ocupado invalida monitor; conflicto del cliente o cierre de ventana invalida hora y monitor; desactivación invalida la entidad correspondiente.

El resultado correcto identifica sesión, cliente, monitor, fecha e intervalo. Desde la ficha conduce principalmente a ella; desde Agenda privada ofrece el detalle o la semana actualizada. Un resultado técnico ambiguo muestra `Comprobando el resultado`, bloquea otro envío y consulta la fuente autoritativa. Solo permite reintentar cuando confirma que no se creó la sesión.

No existe modificación ni una acción especial de repetición: cualquier sustitución es una creación nueva independiente.

## 9. Creación de bloqueo AltaGym

- **Objetivo:** ocupar la disponibilidad de un monitor durante un intervalo interno.
- **Entrada:** `Crear bloqueo` desde Agenda privada.
- **Campos:** monitor, fecha, hora inicial, hora final y nota interna opcional.
- **Recorrido:** seleccionar monitor → fecha → inicio → final → nota opcional → revisar → confirmar → reconciliar.

AltaGym se presenta como cliente del sistema fijo. El bloqueo pertenece a una sola fecha, queda íntegramente entre 08:00 y 22:00, usa horas completas, exige final posterior e interpreta el final como exclusivo. La selección de final solo ofrece horas posteriores válidas. La revisión muestra monitor, fecha, intervalo, duración, nota y la ocupación de todos los bloques afectados.

Al confirmar se revalidan monitor activo, intervalo, versión, permisos y ausencia de solapamiento con clase grupal, sesión privada u otro bloqueo. Un conflicto conserva fecha, horas y nota válidas, invalida el monitor o intervalo afectado y exige revisar. El resultado identifica el bloqueo y conduce al detalle o la misma semana. No se modifica: se cancela y se crea otro mediante operaciones separadas.

## 10. Cancelación de sesión privada

- **Objetivo:** cancelar una sesión identificada, liberar cliente y monitor, conservar historial y decidir el SMS.
- **Entrada:** detalle de sesión confirmada.
- **Confirmación:** página completa con estado, cliente, monitor, fecha, intervalo, consecuencias y opción `Notificar al cliente por SMS` marcada por defecto.
- **Acciones:** `Cancelar sesión privada` y `Volver sin cancelar`.

Antes de confirmar se muestra destinatario previsto, teléfono parcialmente enmascarado y contenido fijo no editable: identifica AltaGym, indica cancelación de sesión privada e incluye fecha y hora, sin nombre ni datos sensibles. Al confirmar se recalculan destinatario, teléfono, estado, versión, permiso y consecuencias. Si cambia materialmente el destinatario, teléfono, estado o efecto, se presenta la información actual y se exige una nueva confirmación.

La cancelación puede realizarse en cualquier momento, pasa a `Cancelada por el gimnasio`, libera ocupaciones y no depende del SMS. La operación y el lote de notificación son idempotentes. Una repetición devuelve el resultado existente sin duplicar cancelación ni aviso. Un resultado ambiguo se reconcilia antes de habilitar otro envío.

## 11. Cancelación de bloqueo

- **Objetivo:** cancelar un bloqueo identificado y liberar el intervalo conservando historial.
- **Confirmación:** página completa con monitor, fecha, intervalo, nota interna autorizada y consecuencias.
- **Acciones:** `Cancelar bloqueo` y `Volver sin cancelar`.
- **Resultado:** bloqueo cancelado y misma semana actualizada.

Se revalidan cuenta, permiso, estado y versión. Si ya fue cancelado, se muestra el estado actual sin repetir efectos. No existe SMS, modificación, reactivación ni sustitución automática.

## 12. Notificaciones

Una sesión privada tiene como máximo un destinatario. Al confirmar se toma la instantánea definitiva del cliente con sesión vigente y su teléfono actual. Si no existe destinatario, la cancelación se completa y no se crea aviso.

El detalle de la sesión cancelada muestra total, pendientes, enviados y fallidos. Por destinatario muestra cliente, teléfono parcialmente enmascarado, estado, fecha de solicitud, fecha de envío si existe y motivo técnico de fallo solo al personal autorizado. No ofrece edición, cambio de destinatario, reenvío ni reintento.

`Pendiente` puede pasar a `Enviado` o `Fallido` al entrar, recargar o recuperar el foco. No existe tiempo real ni sondeo. La recuperación técnica idempotente de outbox no constituye un reintento funcional ni una acción UX.

## 13. Errores, obsolescencia y concurrencia

| Situación | Consecuencia UX | Siguiente acción |
| --- | --- | --- |
| Semana vacía | Siete días y mensajes vacíos | Crear sesión o bloqueo |
| Error de agenda | No declarar vacío | Reintentar |
| Datos anteriores | Marcar no actualizados y bloquear mutación | Actualizar |
| Actividad añadida | Insertar y anunciar sin mover foco | Consultar |
| Actividad cancelada | Actualizar estado y ocupación | Abrir detalle |
| Cliente inactivo | Invalidar selección | Ficha o elegir otro |
| Monitor inactivo | Retirar selección | Elegir otro |
| Monitor ocupado | Invalidar monitor | Consultar disponibilidad |
| Conflicto de cliente | Invalidar hora y monitor | Elegir otra hora |
| Ventana cerrada | Retirar opción | Elegir fecha u hora válida |
| Bloqueo invalidado | Conservar valores independientes válidos | Corregir intervalo o monitor |
| Cuenta desactivada | Detener y descartar contexto privado | Autenticarse |
| Resultado ambiguo | Reconciliar y bloquear reenvío | Resultado o reintento seguro |

## 14. Conservación y prevención de pérdida

Durante un formulario se conservan valores válidos dentro de la misma sesión. Un borrador modificado advierte antes de abandonar mediante navegación, cambio de área, cierre o Atrás. Continuar descarta; permanecer conserva. Cerrar sesión, cambiar de usuario, perder autorización o autenticarse de nuevo descarta todo borrador y confirmación pendiente.

Semana, recurso y origen seguro sobreviven a recarga cuando están en URL. Tras una mutación se consulta el contexto autoritativo. Al regresar se restaura el control de origen si sigue presente; si desapareció, el foco pasa al encabezado de día, monitor o periodo estable más próximo y se anuncia el ajuste.

## 15. Accesibilidad

- enlace de salto y regiones semánticas de cabecera, navegación, migas, contenido y estado;
- `Agenda privada` activa mediante texto, contraste y semántica equivalente a `aria-current`;
- un `h1` y encabezados jerárquicos para semana, día y monitor;
- orden de lectura día → monitor → actividad;
- nombres accesibles que asocian tipo, estado, día, fecha, intervalo, monitor y cliente autorizado;
- navegación semanal dentro de una región etiquetada y anuncio de la semana cargada;
- tipos, estados e intervalos expresados mediante texto, nunca solo color, icono, posición, opacidad o longitud;
- teclado completo, foco visible y orden equivalente al visual;
- etiquetas persistentes, ayudas, obligatoriedad, errores asociados y resumen enlazado que recibe el foco;
- foco en el título al navegar, restauración al origen al regresar y foco en el resumen ante errores múltiples;
- carga, actualización, conflicto, procesamiento, reconciliación, cancelación y notificación anunciados sin cambios inesperados;
- contraste, ampliación al 200 %, reflujo a 320 píxeles CSS y objetivos de interacción conforme a WCAG 2.2 AA;
- verificación automática y pruebas manuales de teclado, foco, ampliación y lector de pantalla.

## 16. Relación con otros flujos

La estructura común del backoffice aporta estructura y patrones administrativos. `reception-clients.md` aporta selección y continuidad del cliente: el cliente iniciado desde su ficha permanece fijo y vuelve principalmente a ella; AltaGym es inmutable y no reservable. `reception-group-calendar.md` aporta semana canónica, controles temporales, historia, notificaciones y teléfono enmascarado, pero Agenda privada no copia disciplina, sala, aforo, programación recurrente ni identidad de ocurrencia.

`private-session-booking.md` aporta fecha → hora → monitor, ventana, revalidación e idempotencia, no la navegación móvil. `monitor-agenda.md` comparte semana, tipos y estados, pero el monitor solo consulta su ámbito, no ve la nota interna ni resultados técnicos y no dispone de acciones administrativas.

La ficha y gestión completas del monitor, sus filtros, paginación, disciplinas, credenciales y estado quedan para su sprint. Colores, tipografía, iconos, densidad, composición, puntos de ruptura, componentes y wireframes quedan para el sistema visual.

## 17. Inventario de pantallas

| ID | Pantalla | Resultado principal |
| --- | --- | --- |
| BO-PRI-01 | Agenda privada semanal | Semana y actividades actuales |
| BO-PRI-02 | Detalle de sesión privada | Consulta o cancelación |
| BO-PRI-03 | Selección de cliente | Cliente activo identificado |
| BO-PRI-04 | Fecha y hora | Bloque potencial seleccionado |
| BO-PRI-05 | Selección de monitor | Monitor disponible seleccionado |
| BO-PRI-06 | Revisión de sesión privada | Datos listos para confirmar |
| BO-PRI-07 | Resultado de creación | Sesión reconciliada |
| BO-PRI-08 | Detalle de bloqueo | Consulta o cancelación |
| BO-PRI-09 | Creación de bloqueo | Datos válidos introducidos |
| BO-PRI-10 | Revisión de bloqueo | Consecuencias listas para confirmar |
| BO-PRI-11 | Resultado de bloqueo | Bloqueo reconciliado |
| BO-PRI-12 | Confirmación de cancelación de sesión | Consecuencias y SMS revisados |
| BO-PRI-13 | Resultado de cancelación de sesión | Sesión cancelada y aviso solicitado o no |
| BO-PRI-14 | Resultados de notificación | Estados por destinatario |
| BO-PRI-15 | Confirmación de cancelación de bloqueo | Consecuencias revisadas |
| BO-PRI-16 | Resultado de cancelación de bloqueo | Bloqueo cancelado |

## 18. Trazabilidad

| Comportamiento | Fuente |
| --- | --- |
| Rol y permisos | `../../ROLES_AND_PERMISSIONS.md`; `../../features/reception-backoffice.md` |
| Semana y acciones | `../../features/reception-backoffice.md`; `reception-backoffice.md` |
| Horario, ventana y conflictos | `../../BUSINESS_RULES.md`; `../../features/private-sessions.md` |
| Estados y relaciones | `../../DATA_MODEL.md`; `../../DATABASE_DESIGN.md` |
| Cliente y continuidad | `../../features/clients.md`; `reception-clients.md` |
| Monitor y disciplinas | `../../features/monitors.md` |
| SMS | `../../features/notifications.md` |
| Sesión y autorización | `../../features/authentication.md`; `authentication.md` |
| Actualización y accesibilidad | `../UX_PRINCIPLES.md`; `reception-backoffice.md` |

## 19. Fuera de alcance

No se añaden modificación, reactivación, recurrencia privada, listas de espera, selector mensual, selector de vista, filtros de agenda, festivos automáticos, excepciones de ventana, tiempo real, sondeo, reintentos de SMS, texto libre, reservas ordinarias de AltaGym, módulo de ausencias, gestión de Monitores, sistema visual, wireframes ni código.




