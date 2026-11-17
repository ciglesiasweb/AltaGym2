# Flujo UX — Reserva de sesión privada

**Estado:** UX 1.0 congelado
**Última actualización:** 15 de julio de 2026

## 1. Propósito, alcance y fuentes

Define el flujo móvil mediante el que un cliente elige fecha, hora y monitor, revisa la selección y confirma una sesión privada. Sus fuentes funcionales son `../../features/private-sessions.md`, `../../features/monitors.md`, `../../BUSINESS_RULES.md`, `../../ROLES_AND_PERMISSIONS.md`, `../../DATA_MODEL.md` y `../../DATABASE_DESIGN.md`; las bases transversales proceden de `../UX_PRINCIPLES.md`, `../NAVIGATION_AND_INFORMATION_STRUCTURE.md`, `client-bookings.md` y `group-booking.md`.

No modifica horarios, duración, ventana, estados ni conflictos; no añade selección de disciplina, sala, precio, pago, bonos, favoritos, lista de espera, contacto, búsqueda, filtros, paginación, tiempo real ni fotografías de monitores.

## 2. Requisitos, consecuencias y decisiones

- **Requisito funcional:** el cliente elige fecha y hora y, después, un monitor disponible; los inicios son horas completas de 10:00 a 18:00, la duración es 45 minutos y la confirmación solo se admite desde exactamente 72 hasta exactamente 3 horas antes, ambos límites incluidos y calculados por instantes reales en `Europe/Madrid`.
- **Requisito funcional:** cliente y monitor deben estar activos y libres; una clase grupal, otra sesión privada o un bloqueo ocupan al monitor; cualquier actividad vigente coincidente ocupa al cliente; las disciplinas son información y la reserva se vincula al monitor.
- **Consecuencia UX derivada:** la disponibilidad consultada es orientativa, las selecciones dependientes se invalidan cuando cambia un dato anterior y toda confirmación vuelve a validar las reglas.
- **Decisión UX aprobada:** lista corta de días y horas reservables; las opciones no reservables no aparecen; la consulta de monitores se realiza después de elegir la hora; se muestran nombre y apellidos y disciplinas, con orden alfabético; revisión, confirmación y resultado son páginas completas.
- **Presentación aplazada:** textos finales, densidad, espaciado, colores, tipografía, iconos y componentes visuales.

## 3. Definición del flujo

- **Objetivo:** reservar una sesión privada con información suficiente y sin crear solapamientos ni duplicados.
- **Actor:** cliente autenticado.
- **Entrada:** `Reservar sesión privada` desde `Mis reservas` o URL interna protegida válida.
- **Precondiciones:** sesión válida, rol cliente, cuenta y cliente activos y acceso al área propia.
- **Recorrido principal:** elegir fecha, elegir hora, consultar y elegir monitor, revisar, confirmar, recibir un resultado conocido y volver a `Mis reservas` actualizada.
- **Resultado:** sesión privada `confirmada`, futura y visible entre las próximas reservas propias.

`Mis reservas → fecha → hora → monitor → revisión → confirmación → resultado → Mis reservas`

Estas pantallas son rutas contextuales y no añaden destinos a la navegación principal.

## 4. Acceso, autorización e historial

`Mis reservas` mantiene `Reservar sesión privada` antes de la lista. La cabecera con `Cerrar sesión` y la barra inferior con `Mis reservas` y `Cuenta` permanecen disponibles.

Cada entrada, recarga, recuperación de foco y operación comprueba sesión, rol, ámbito y estado activo. Una URL protegida puede recuperarse después de autenticar solo si pertenece al cliente, sigue siendo válida y no contiene una confirmación pendiente.

- Atrás desde monitor vuelve a fecha y hora.
- Atrás desde revisión vuelve a monitor.
- Atrás desde confirmación vuelve a revisión.
- Atrás desde la selección inicial vuelve a `Mis reservas`.
- El resultado correcto no puede repetir la mutación al recargar o usar Atrás.

Cerrar sesión, invalidarse la sesión o cambiar de usuario descarta fecha, hora, monitor, posición y operación pendiente. Tras autenticarse de nuevo nunca se confirma automáticamente.

## 5. Ventana temporal y zona horaria

Para un inicio `S`, la confirmación es válida cuando `S - 72 h ≤ ahora ≤ S - 3 h`. Los límites son inclusivos y se comparan como instantes reales. Las fechas y horas se presentan en `Europe/Madrid`; el almacenamiento UTC y la conversión técnica no se exponen.

La consulta parte de hoy y abarca todos los inicios comprendidos dentro de las próximas 72 horas exactas que respeten también el mínimo de 3 horas. Puede alcanzar parcialmente una cuarta fecha de calendario. Un cambio oficial de hora no convierte la ventana en tres días naturales; como los inicios privados son de 10:00 a 18:00, no existen horas de inicio ambiguas o inexistentes durante el salto nocturno.

## 6. Selección de fecha

Se utiliza una lista corta de días, no un calendario mensual. Solo aparecen días que contienen al menos una hora potencialmente reservable según horario, ventana y conflictos conocidos del cliente. Hoy es la fecha inicial si tiene alguna hora visible; en otro caso se selecciona el primer día con disponibilidad.

Cada día muestra día de la semana y fecha completa. La navegación no permite salir del periodo calculado. Si no existe ningún día, se muestra un estado vacío con explicación, `Reintentar` cuando proceda y regreso a `Mis reservas`.

- **Carga:** mantiene estable título y región de selección y anuncia la carga.
- **Error temporal:** no presenta datos antiguos como actuales y ofrece `Reintentar`.
- **Recuperación de foco:** vuelve a consultar sin sondeo ni tiempo real.
- **Fecha caducada:** se retira; se conserva la siguiente fecha válida o se muestra el estado vacío.

## 7. Selección de hora

Para el día elegido solo aparecen inicios potencialmente reservables entre 10:00 y 18:00, siempre en punto y ordenados ascendentemente. Cada opción muestra inicio y final, por ejemplo `10:00–10:45`.

No aparecen horas fuera de la ventana, con plazo cerrado ni incompatibles con una ocupación conocida del cliente. La ausencia de una hora no revela detalles de la actividad conflictiva. La interfaz todavía no afirma que exista un monitor: esa consulta se realiza después de elegir la hora.

Al seleccionar una hora se consulta la disponibilidad de monitores. Si ninguno está disponible, se explica el resultado, se vuelve a la selección conservando fecha y posición y se retira esa hora de la lista actualizada. Si desaparecen todas las horas del día, también se retira el día.

Cambiar fecha invalida hora y monitor. Cambiar hora invalida monitor, revisión y confirmación. Al regresar desde monitor se conservan fecha, hora, posición y foco si siguen siendo válidos.

## 8. Consulta y selección de monitor

Después de elegir fecha y hora se consultan monitores activos y libres en ese bloque. Los resultados se ordenan alfabéticamente por apellidos y nombre.

Cada monitor muestra:

- nombre y apellidos;
- disciplinas bajo una etiqueta informativa, como `Disciplinas que imparte`;
- una acción específica para elegirlo.

Las disciplinas no son filtros, opciones ni objeto de la reserva. No se muestran fotografía, teléfono, usuario, estado interno, agenda, bloqueos ni causas de ausencia. No existen búsqueda, filtros, paginación ni carga progresiva. Incluso con un único monitor se requiere selección explícita.

- **Ninguno:** explica que no hay monitores para esa hora y vuelve a las horas actualizadas.
- **Uno o varios:** usa la misma lista semántica.
- **Monitor ocupado o inactivo:** lo retira e invalida su selección.
- **Disciplinas modificadas:** actualiza la información antes de continuar; si el monitor sigue activo y libre, la selección puede conservarse.
- **Error temporal:** conserva fecha y hora y permite reintentar.

## 9. Revisión

La revisión es una página completa que muestra, en este orden, tipo textual `Sesión privada`, fecha completa, hora, duración de 45 minutos, nombre y apellidos del monitor y sus disciplinas como información adicional. Indica que disponibilidad y reglas se comprobarán otra vez al confirmar.

Ofrece `Continuar para confirmar`, `Cambiar monitor` y `Cambiar fecha u hora`. Una URL directa exige parámetros completos, válidos y autorizados; si faltan o han caducado, vuelve al primer paso recuperable sin afirmar que existe una reserva.

Si el monitor deja de estar disponible, se vuelve a monitores. Si aparece un conflicto del cliente o la hora deja de estar dentro de la ventana, se vuelve a fecha y hora. Las selecciones válidas se conservan al regresar.

## 10. Confirmación

La confirmación es una página completa separada. Resume tipo, fecha, hora, duración, monitor y disciplinas informativas. Ofrece `Confirmar reserva` y `Volver a la revisión`.

Durante el procesamiento se impide el doble envío, se anuncia el estado y no se permite modificar la selección. La pantalla no confirma automáticamente por acceso directo, recarga, navegación Atrás ni nueva autenticación.

### Validación autoritativa

Al confirmar, el servidor revalida dentro del límite transaccional:

1. sesión, identidad, rol y ámbito;
2. cuenta y cliente activos;
3. monitor activo;
4. fecha, hora completa entre 10:00 y 18:00 y duración de 45 minutos;
5. ventana inclusiva de 72 a 3 horas mediante instantes reales;
6. ausencia de clase grupal, sesión privada o bloqueo coincidente del monitor;
7. ausencia de actividad vigente coincidente del cliente;
8. ausencia de una sesión privada duplicada para la misma intención.

La consulta previa es orientativa. Solo esta validación determina el resultado.

## 11. Cambios concurrentes y datos obsoletos

| Cambio | Respuesta | Siguiente acción |
| --- | --- | --- |
| Monitor ocupado por otra operación | Rechazar sin efectos e invalidar monitor | Elegir otro monitor para la misma hora |
| Monitor desactivado | Retirarlo e invalidar monitor | Volver a monitores |
| Bloqueo, clase o sesión nueva del monitor | Rechazar sin revelar detalles | Volver a monitores |
| Conflicto nuevo del cliente | Invalidar hora y monitor | Elegir otra hora o ver `Mis reservas` |
| Ventana cerrada | Retirar hora y acciones | Elegir otra hora o fecha |
| Fecha fuera del periodo | Invalidar selecciones dependientes | Primera fecha válida o estado vacío |
| Disciplinas modificadas | Mostrar información actual | Revisar de nuevo antes de confirmar |
| Cliente inactivo | Rechazar | Tratamiento de acceso, sin conservar operación |
| Sesión de usuario invalidada | Detener | Autenticar, sin reenvío automático |

La actualización sustituye datos obsoletos y retira acciones inválidas. Nunca expone actividades, clientes, bloqueos o notas que expliquen la ocupación de un monitor.

## 12. Resultado y recuperación

### Reserva correcta

El resultado muestra `Sesión privada reservada`, fecha, hora, duración y monitor. La acción principal es `Volver a Mis reservas`. Allí se realiza una consulta nueva, la sesión aparece en la cronología común con la etiqueta `Sesión privada` y se descarta el contexto de exploración.

### Error funcional

El mensaje explica la condición útil —monitor no disponible, conflicto propio, plazo cerrado o cliente inactivo— y ofrece el paso anterior más próximo que todavía sea válido. No muestra códigos ni detalles técnicos.

### Error temporal o resultado ambiguo

Un fallo inequívoco permite reintentar conservando selecciones válidas. Si no se sabe si la sesión se creó, la interfaz muestra `Comprobando el resultado`, consulta el estado y no comunica éxito ni fracaso definitivo hasta reconciliarlo.

Si la sesión existe, muestra éxito. Si se confirma que no existe, actualiza disponibilidad y permite un reintento seguro. Los reintentos de una misma confirmación reutilizan una identidad idempotente; su representación concreta es técnica.

## 13. Conservación del contexto

- Durante la exploración se conservan fecha, hora, monitor, posición y foco mientras sean válidos.
- Cambiar una selección anterior invalida todas sus dependencias.
- Tras recarga completa se recupera solo fecha, hora y monitor seguros representables por URL y se revalidan; no se promete la posición exacta.
- Tras autenticarse de nuevo puede recuperarse una ruta autorizada, pero nunca el procesamiento ni el envío pendiente.
- Si una opción deja de aparecer, se descarta junto con sus dependencias.
- Si la lista cambia sustancialmente, no se restaura una posición engañosa.
- Tras éxito, cierre de sesión, invalidación o cambio de usuario se descarta todo el contexto.

## 14. Accesibilidad

- `main` contiene un encabezado principal y existe enlace de salto.
- La lista de días y la de horas tienen etiquetas visibles, selección única y estado comprensible.
- Solo se ofrecen opciones accionables; el estado vacío explica por texto por qué no hay opciones.
- Los monitores forman una lista semántica y cada acción incluye su nombre completo.
- Las disciplinas se anuncian como información del perfil, no como controles.
- Al avanzar, el foco pasa al encabezado; al regresar, vuelve al origen si sigue presente.
- Un error que impide continuar enfoca su resumen y anuncia la siguiente acción.
- Carga, actualización, procesamiento, reconciliación y resultado se anuncian sin cambios inesperados.
- Seleccionar fecha, hora o monitor no cambia automáticamente de pantalla.
- Todo funciona con teclado, foco visible y sin trampas.
- Los objetivos cumplen al menos 24 × 24 píxeles CSS; se recomienda 44 × 44 para comodidad táctil.
- Ningún estado depende solo del color, posición o iconografía.

## 15. Relación con la reserva grupal

Se comparten páginas completas, disponibilidad orientativa, revalidación autoritativa, conservación contextual, tratamiento de concurrencia, prevención del doble envío, reconciliación, idempotencia, resultado accesible y retorno a `Mis reservas` actualizada.

No se copian selección de disciplina, agrupación de sesiones, aforo, plazas, sala, estado `Completa` ni la consulta de una sesión grupal preexistente. En privada se compone un bloque mediante fecha, hora y monitor.

## 16. Patrones reutilizables

- Selección progresiva con invalidación de dependencias.
- Consulta de recursos disponibles después de fijar el bloque temporal.
- Lista corta que omite opciones no accionables y explica el vacío resultante.
- Separación entre revisión editable y confirmación sensible.
- Regreso al paso mínimo afectado por un cambio concurrente.
- Reconciliación e idempotencia comunes a procesos de reserva.

## 17. Trazabilidad

| Comportamiento | Fuente |
| --- | --- |
| Orden fecha, hora y monitor | `../../features/private-sessions.md`, Flujo y PRI-01–PRI-03 |
| Horario, duración, ventana y zona | `../../BUSINESS_RULES.md`; CA-PRI-02 |
| Monitor activo y conflictos | `../../features/private-sessions.md`; `../../features/monitors.md`; `../../DATABASE_DESIGN.md` |
| Cliente activo y conflictos propios | `../../BUSINESS_RULES.md`; CA-PRI-02 |
| Nombre y disciplinas | PRI-02; MON-07 y CA-MON-03 |
| Reserva por monitor | `../../features/private-sessions.md`; `../../BUSINESS_RULES.md` |
| Concurrencia e idempotencia | Casos límite de la feature; `../../ARCHITECTURE.md`; `../../DATABASE_DESIGN.md` |
| Navegación móvil | `client-bookings.md`; `../NAVIGATION_AND_INFORMATION_STRUCTURE.md` |
| Actualización y accesibilidad | `../UX_PRINCIPLES.md`; `../USER_FLOWS.md` |

## 18. Pendientes

No quedan decisiones UX abiertas en este flujo. Los textos finales y la presentación se resolverán en el sistema de contenido, el sistema visual y los wireframes. La identidad técnica de idempotencia, los DTO y la codificación de parámetros de URL se definirán durante la implementación sin alterar este comportamiento.
