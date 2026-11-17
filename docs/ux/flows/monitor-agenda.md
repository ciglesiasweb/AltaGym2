# Flujo UX — Mi agenda del monitor

**Estado:** UX 1.0 congelado
**Última actualización:** 15 de julio de 2026

## 1. Propósito, alcance y fuentes

Define la experiencia móvil de solo lectura mediante la que un monitor consulta su agenda semanal, abre el detalle permitido de sus actividades y consulta su perfil. Sus fuentes funcionales son `../../features/monitor-agenda.md`, `../../features/monitors.md`, `../../features/group-classes.md`, `../../features/private-sessions.md`, `../../features/authentication.md`, `../../ROLES_AND_PERMISSIONS.md`, `../../BUSINESS_RULES.md`, `../../DATA_MODEL.md` y `../../DATABASE_DESIGN.md`. Los patrones transversales proceden de `../UX_PRINCIPLES.md`, `../NAVIGATION_AND_INFORMATION_STRUCTURE.md` y los flujos móviles anteriores.

No añade gestión, solicitudes de cambio, identidades de clientes de clases grupales, notas internas, datos de contacto, tiempo real, sondeo, filtros, búsqueda, paginación, calendario, estadísticas ni sistema visual.

## 2. Requisitos, consecuencias y decisiones

- **Requisito funcional:** el monitor solo consulta su agenda; todos los monitores comparten permisos y solo ven actividades propias.
- **Requisito funcional:** la agenda abre en la semana actual, de lunes a domingo, permite navegación ilimitada y mantiene actividades pasadas y canceladas.
- **Requisito funcional:** las clases grupales muestran disciplina, fecha, hora, sala y total de reservas vigentes sin identidades; las privadas muestran nombre completo y fotografía del cliente; los bloqueos omiten siempre su nota interna.
- **Consecuencia UX:** cada actividad necesita tipo, intervalo y estado textuales; una cancelación no puede confundirse con ocupación vigente.
- **Decisión UX aprobada:** vista móvil de una columna, barra inferior con `Mi agenda` y `Mi perfil`, siete días siempre visibles y detalles en páginas completas.
- **Decisión UX aprobada:** no hay calendario ni selector de fecha; la navegación utiliza semana anterior, siguiente y regreso a la actual.
- **Decisión UX aprobada:** la semana forma parte de la URL; posición y foco solo se restauran durante la navegación interna válida.

## 3. Definición general

- **Objetivo:** conocer el trabajo y la ocupación propios con información actual, comprensible y limitada por permisos.
- **Actor:** monitor.
- **Entrada:** inicio de sesión, `Mi agenda`, navegación inferior o URL interna protegida.
- **Precondiciones:** sesión válida, rol monitor, cuenta activa, perfil de monitor activo y acceso al recurso propio.
- **Recorrido principal:** entrar en la semana actual, consultar sus siete días, abrir una actividad, leer el detalle y regresar al origen.
- **Resultado:** información consultada sin alterar ninguna entidad.
- **Acciones disponibles:** navegar por semanas, volver a la actual, abrir y cerrar detalles, consultar perfil, cambiar contraseña, reintentar y cerrar sesión.
- **Acciones ausentes:** crear, modificar, cancelar, reservar, solicitar cambios o contactar con recepción.

`Autenticación → Mi agenda → semana → actividad → detalle → regreso`

## 4. Acceso, autorización y sesión

Tras autenticarse sin URL pendiente, el monitor entra en `Mi agenda` y en la semana actual. Cada entrada, recarga, recuperación de foco y acceso directo valida sesión, rol, ámbito, cuenta activa, monitor activo, existencia y pertenencia.

Una URL pendiente se recupera después de autenticar solo si sigue siendo válida y autorizada. Una ruta inexistente, una actividad ajena y una actividad inaccesible reciben el mismo tratamiento neutro: no se confirma su existencia ni propietario y se ofrece `Volver a Mi agenda`.

Si el monitor está inactivo o es desactivado durante el uso, sus sesiones quedan invalidadas, se interrumpe la consulta y se vuelve al inicio de sesión con un mensaje neutro. No se conserva información del usuario anterior.

`Cerrar sesión` permanece en la cabecera de toda pantalla autenticada. Cerrar sesión, cambiar de usuario, invalidarse la sesión o perder autorización descarta semana, actividad, posición, foco y datos de clientes.

## 5. Navegación principal e historial

La barra inferior persistente contiene únicamente:

- `Mi agenda`, destino inicial y operativo;
- `Mi perfil`, información personal y operaciones de cuenta.

El destino activo se comunica semánticamente. Abrir un detalle añade una entrada al historial; Atrás vuelve al contexto anterior. Cambiar de semana genera un historial comprensible y seleccionar otra vez la sección activa no apila copias.

Al regresar de un detalle se restauran semana, día, desplazamiento, actividad y foco cuando siguen siendo válidos. Desde un detalle abierto por URL directa, Atrás usa el historial del navegador si existe; la salida explícita segura es `Volver a Mi agenda`.

## 6. Periodo semanal y zona horaria

La semana inicial es la semana actual de `Europe/Madrid`, desde el lunes hasta el domingo. La cabecera identifica el intervalo completo, por ejemplo `Semana del 13 al 19 de julio de 2026`.

Los controles son:

- `Semana anterior`;
- `Semana siguiente`;
- `Volver a la semana actual`, visible únicamente fuera de ella.

No existe límite funcional, calendario mensual ni selector de fecha. Las semanas lejanas usan el mismo patrón y no introducen restricciones implícitas.

Fechas y horas se presentan en `Europe/Madrid`. Los límites y cambios oficiales de hora se calculan como instantes reales; la conversión desde UTC no se expone. El final del intervalo es exclusivo al derivar si una actividad está en curso o ha pasado.

La semana seleccionada se representa en la URL y se conserva al recargar. Recuperar el foco vuelve a consultar esa misma semana, no fuerza el regreso a la actual.

## 7. Lista semanal

Se muestran siempre los siete días en orden, incluso vacíos. Cada día es una sección con encabezado formado por día de la semana y fecha completa. Un día sin elementos muestra `Sin actividades`.

Cada día contiene una lista semántica ordenada por hora inicial y, para empates, por hora final, tipo textual e identificador estable. Actividades coincidentes o consecutivas permanecen como elementos independientes y no se interpretan como error.

La jerarquía de cada elemento es: hora, tipo, identificación principal, estado y datos secundarios permitidos. El enlace al detalle nombra actividad y hora. Una semana sin elementos muestra un estado vacío semanal además de conservar la estructura de los siete días y la navegación temporal.

## 8. Clases grupales

### Resumen

- tipo textual `Clase grupal`;
- hora inicial y final;
- disciplina;
- sala;
- estado;
- total de reservas vigentes.

Una clase vigente sin reservas muestra `0 reservas vigentes`. No se muestran aforo, plazas disponibles ni condición `Completa`, porque son datos orientados a reserva y no a la preparación del monitor.

### Detalle

Muestra tipo, disciplina, fecha completa, hora inicial y final, duración de 45 minutos, sala, estado y total permitido. No existe listado, nombre, fotografía ni otra identidad de clientes.

Si la clase se cancela, conserva sus datos y muestra `Cancelada` y `Reservas vigentes antes de la cancelación: N`. Ese valor es histórico y no se presenta como ocupación actual.

Los cambios de disciplina, sala, horario o estado sustituyen los datos obsoletos en la siguiente actualización válida. El detalle solo ofrece regreso.

## 9. Sesiones privadas

### Resumen

- tipo textual `Sesión privada`;
- hora inicial y final;
- nombre completo del cliente;
- estado.

### Detalle

Muestra tipo, fecha completa, hora inicial y final, duración de 45 minutos, estado, nombre completo y fotografía del cliente. Si falta la fotografía, aparece un marcador neutro acompañado de `Sin fotografía`.

La fotografía existente usa el texto alternativo `Fotografía de Nombre Apellidos`. El marcador visual sin foto es decorativo porque su ausencia se comunica por texto. No se muestran teléfono, credenciales, fecha de nacimiento, contacto ni otros datos del cliente.

Una sesión cancelada muestra el estado genérico `Cancelada`; no comunica si la originó el cliente o el gimnasio. Los cambios concurrentes sustituyen la información en la siguiente actualización y retiran cualquier dato que haya dejado de estar autorizado. El detalle solo ofrece regreso.

## 10. Bloqueos

### Resumen

- tipo textual `Bloqueo`;
- hora inicial;
- hora final;
- estado.

### Detalle

Muestra tipo, fecha completa, intervalo completo, duración derivada y estado vigente o `Cancelado`. El final es exclusivo: un bloqueo de 10:00 a 13:00 ocupa hasta las 13:00 sin incluir ese instante como inicio de otro bloque ocupado.

Un bloqueo de varias horas permanece como un único elemento. Nunca se presenta como cliente, clase o sesión privada, no menciona al cliente especial `AltaGym` y no expone ni transporta la nota interna. El detalle solo ofrece regreso.

## 11. Estados temporales

- **Futura:** ahora es anterior al inicio.
- **En curso:** inicio incluido y final exclusivo.
- **Pasada:** ahora es igual o posterior al final.
- **Cancelada/Cancelado:** estado funcional cancelado, con independencia del momento temporal.

La cancelación es el estado principal y no se combina como etiqueta con `Futura`, `En curso` o `Pasada`. Fecha e intervalo permanecen visibles para aportar contexto. Los tipos y estados se comunican mediante texto y semántica, nunca solo con color, icono, posición, opacidad o tachado.

Una actividad permanece estable mientras se lee. El paso natural del tiempo no provoca un sondeo ni un cambio de contexto inesperado; la siguiente actualización válida recalcula el estado temporal. Si recepción modifica o cancela una actividad, se sustituyen los datos obsoletos al entrar, recargar o recuperar el foco.

## 12. Detalle y cambios concurrentes

Cada tipo tiene una página completa de detalle con jerarquía: tipo, estado, fecha, intervalo, duración y datos específicos. No contiene acciones de gestión.

Durante una actualización se mantiene el contenido visible, identificado como `Actualizando`, hasta disponer de una respuesta válida. La sustitución es coherente y no mezcla campos de versiones distintas.

- **Modificada:** actualiza los campos y anuncia el cambio sin mover el foco.
- **Cancelada:** mantiene el detalle, actualiza el estado y conserva la información histórica permitida.
- **Inexistente o inaccesible:** tratamiento neutro y `Volver a Mi agenda`.
- **Ha dejado de pertenecer al monitor:** mismo tratamiento neutro, sin revelar el nuevo ámbito.

## 13. Mi perfil y cuenta

`Mi perfil` muestra nombre completo y disciplinas asignadas, ordenadas alfabéticamente. Las disciplinas se identifican como información del perfil y nunca aparecen como actividades, filtros o controles de agenda.

No se muestran teléfono, nombre de usuario, identificadores, permisos, historial, métricas ni estado técnico. El estado activo es una condición de acceso, no un dato de presentación.

Las operaciones permitidas son `Cambiar contraseña` y `Cerrar sesión`. El cambio de contraseña solicita contraseña actual, nueva contraseña y confirmación; al completarse invalida todas las sesiones, incluida la actual, y conduce al inicio de sesión. Un cambio de disciplinas se refleja al entrar, recargar o recuperar el foco.

## 14. Carga, errores y datos obsoletos

### Carga inicial

Mantiene cabecera, periodo y navegación estables, comunica `Cargando agenda` y no confunde carga con vacío.

### Cambio de semana

Identifica la semana solicitada durante la carga. Al completarse, anuncia el nuevo intervalo y sitúa el foco en su encabezado. Un error conserva la semana seleccionada y ofrece `Reintentar`.

### Recuperación de foco

Conserva el contenido visible, lo identifica como `Actualizando`, consulta la misma semana y lo sustituye atómicamente. Si la actividad enfocada continúa, mantiene foco y posición; si desaparece, mueve el foco al encabezado de su día o de la semana y anuncia el cambio.

### Error temporal

Si no existen datos previos, muestra que la agenda no pudo cargarse y ofrece `Reintentar`. Si existen, los conserva como `Datos no actualizados`, sin presentarlos silenciosamente como actuales. Una semana vacía solo se declara tras una respuesta correcta.

### Pérdida de sesión o autorización

Detiene la consulta y aplica el flujo de autenticación. Ningún contexto se recupera automáticamente tras cambiar de usuario. Un monitor desactivado no recibe una acción para continuar dentro del área protegida.

## 15. Conservación del contexto

- Navegación interna: conserva semana, día, actividad, posición y foco válidos.
- Regreso de detalle: restaura el origen; si desapareció, usa el encabezado más próximo.
- Cambio de semana: descarta actividad y posición anteriores y enfoca la nueva semana.
- Recarga completa: recupera la semana desde la URL y revalida; no promete posición ni foco exactos.
- URL directa: abre el recurso autorizado sin fabricar un origen de lista.
- Cierre de sesión, cambio de usuario, invalidación o pérdida de autorización: descarta todo el contexto.

No se conserva un contexto que pueda atribuir datos a otro usuario, apuntar a una actividad ajena o presentar como actual una selección invalidada.

## 16. Accesibilidad

- La página usa regiones semánticas para cabecera, navegación y contenido principal.
- `Mi agenda` es el encabezado principal; la semana y los días usan niveles subordinados coherentes.
- Cada día contiene una lista semántica y cada actividad tiene un enlace específico.
- Los controles se etiquetan `Ir a la semana anterior`, `Ir a la semana siguiente` y `Volver a la semana actual`.
- El orden de foco sigue cabecera, controles semanales, días, actividades y navegación inferior.
- Todo funciona con teclado, foco visible, ampliación y lector de pantalla.
- Abrir un detalle enfoca su encabezado; regresar restaura el origen; cambiar de semana enfoca el nuevo periodo.
- Carga, actualización, errores y cambios relevantes se anuncian sin provocar cambios inesperados de contexto.
- Los objetivos táctiles y el resto de criterios aplicables se verifican conforme a WCAG 2.2 AA.

## 17. Relación con los flujos del cliente

Se comparten la columna móvil, la cabecera con `Cerrar sesión`, la navegación inferior mínima, las páginas completas, el acceso protegido, la actualización sin tiempo real, el reintento y la gestión de foco.

No se copian `Mis reservas`, `Cuenta`, acciones de reserva o cancelación, disponibilidad, aforo para clientes, selección progresiva, confirmaciones, reconciliación ni idempotencia de mutaciones. La agenda del monitor mantiene pasado y cancelaciones, mientras que la consulta del cliente solo conserva próximas reservas vigentes.

## 18. Patrones reutilizables por el backoffice

Son reutilizables la definición lunes-domingo, identificación del periodo, navegación semanal, orden temporal, tipos y estados textuales, vacíos, datos obsoletos y conservación contextual. El backoffice puede reutilizar estos comportamientos sin adoptar la composición móvil, la barra inferior ni las restricciones de solo lectura.

## 19. Trazabilidad

| Área | Fuente |
| --- | --- |
| Agenda propia y solo lectura | `../../features/monitor-agenda.md`; `../../ROLES_AND_PERMISSIONS.md` |
| Semana, pasado y cancelaciones | CA-AGEN-01, CA-AGEN-07 y `../../DECISIONS.md` |
| Clase grupal y privacidad | CA-AGEN-03 y CA-AGEN-04 |
| Sesión privada y fotografía | CA-AGEN-05; `../../DATA_MODEL.md` |
| Bloqueo y nota interna | CA-AGEN-06; `../../features/private-sessions.md` |
| Cuenta activa y sesiones | `../../features/authentication.md`; `../../features/monitors.md` |
| Duraciones e intervalos | `../../DATABASE_DESIGN.md`; `../../BUSINESS_RULES.md` |
| Navegación y accesibilidad | `../NAVIGATION_AND_INFORMATION_STRUCTURE.md`; `../UX_PRINCIPLES.md` |

## 20. Pendientes técnicos

- Confirmar que el campo físico de instantánea de una clase cancelada representa el último total de reservas vigentes; `cancelledBookingCountSnapshot` resulta semánticamente ambiguo.
- Definir la identidad estable de URL para ocurrencias grupales calculadas por el modelo híbrido, sin forzar una decisión UX ni revelar recursos ajenos.
- Verificar si el cambio voluntario de contraseña se presenta dentro de AltaGym o mediante la experiencia alojada por Auth0.

No quedan decisiones UX pendientes para este flujo.
