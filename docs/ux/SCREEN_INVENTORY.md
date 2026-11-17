# AltaGym — Inventario de pantallas



**Estado:** UX 1.0 congelado
**Estado documental:** Congelado
**Última actualización:** 23 de julio de 2026



## 1. Propósito



Este inventario identifica las pantallas y estados necesarios para la autenticación, las áreas móviles del cliente y del monitor y la estructura común de escritorio del backoffice. No prescribe URLs técnicas, componentes visuales ni reglas de negocio.



Un estado de carga, vacío, validación o error no se convierte en una pantalla independiente salvo que cambie el propósito y la navegación del recorrido.



## 2. Estructura común del cliente



Todas las pantallas autenticadas del cliente reutilizan:



- vista móvil de una columna y ancho limitado;

- composición centrada en pantallas grandes;

- cabecera con identidad de AltaGym y `Cerrar sesión`;

- contenido principal identificado semánticamente;

- barra inferior con `Mis reservas` y `Cuenta`;

- foco visible, orden lógico y anuncios accesibles.



En rutas contextuales, como un detalle o una confirmación, la navegación principal permanece disponible sin competir con la acción del flujo.



## 3. Inventario



| ID | Pantalla | Propósito | Entrada | Salidas |

| --- | --- | --- | --- | --- |

| CLI-AUTH-01 | Inicio de sesión | Crear una sesión válida | URL pública, sesión terminada o URL protegida | Destino autorizado |

| CLI-BKG-01 | Mis reservas | Consultar próximas reservas e iniciar nuevas | Inicio del cliente o navegación principal | Detalle, reserva grupal, reserva privada, Cuenta |

| CLI-BKG-02 | Detalle de reserva grupal | Reconocer la reserva y cancelar cuando proceda | Lista o URL autorizada | Confirmación de cancelación o regreso |

| CLI-BKG-03 | Detalle de sesión privada | Reconocer la sesión y cancelar cuando proceda | Lista o URL autorizada | Confirmación de cancelación o regreso |

| CLI-BKG-04 | Confirmación de cancelación | Revisar la reserva y confirmar una acción sensible | Detalle cancelable | Resultado o regreso al detalle |

| CLI-BKG-05 | Resultado de cancelación | Explicar qué cambió y continuar | Confirmación | Mis reservas actualizada |

| CLI-GRP-01 | Consulta de clases grupales | Elegir disciplina y sesión | `Reservar clase grupal` | Detalle o regreso |

| CLI-GRP-02 | Detalle de clase grupal | Revisar datos y disponibilidad | Consulta o URL autorizada | Confirmación, consulta o Mis reservas |

| CLI-GRP-03 | Confirmación de reserva grupal | Revisar y confirmar la reserva | Detalle reservable | Resultado o regreso al detalle |

| CLI-GRP-04 | Resultado de reserva grupal | Comunicar el resultado conocido | Confirmación | Mis reservas actualizada o recuperación |

| CLI-PRI-01 | Fecha y hora privada | Elegir un bloque potencialmente reservable | `Reservar sesión privada` | Monitores o regreso |

| CLI-PRI-02 | Selección de monitor | Elegir un monitor disponible | Fecha y hora válidas | Revisión o regreso |

| CLI-PRI-03 | Revisión de sesión privada | Revisar y corregir la selección | Monitor seleccionado | Confirmación, monitor o fecha y hora |

| CLI-PRI-04 | Confirmación de reserva privada | Confirmar la operación sensible | Revisión válida | Resultado o regreso a revisión |

| CLI-PRI-05 | Resultado de reserva privada | Comunicar un resultado conocido | Confirmación | Mis reservas actualizada o recuperación |

| CLI-ACC-01 | Cuenta | Acceder a operaciones de cuenta | Navegación principal | Cambio de contraseña o cierre de sesión |

| CLI-ACC-02 | Cambio de contraseña | Cambiar la credencial propia | Cuenta | Inicio de sesión tras invalidar sesiones |



La sesión terminada, el acceso protegido sin sesión, el estado vacío, la carga y los errores son estados de estas pantallas, no destinos adicionales.



## 4. Estados por pantalla



### CLI-AUTH-01 — Inicio de sesión



**Información:** nombre de la aplicación, campos de usuario y contraseña, instrucciones necesarias y aviso neutro cuando la sesión ha terminado.  

**Acciones:** iniciar sesión.  

**Estados:** inicial, validación de campos, envío, rechazo genérico y error temporal.  

**Restricciones:** no existe autorregistro, opción `Recordarme` ni recuperación automática.



### CLI-BKG-01 — Mis reservas



**Información:** título, acciones de nueva reserva y lista cronológica conjunta.  

**Acciones:** `Reservar clase grupal`, `Reservar sesión privada` y abrir un detalle.  

**Estados:** carga inicial, una reserva, varias reservas, vacío y error con reintento.  

**Restricciones:** sin pestañas por tipo, filtros, paginación ni historial pasado o cancelado.



### CLI-BKG-02 — Detalle grupal



**Información:** `Clase grupal`, disciplina, fecha, hora, duración, monitor, sala y disponibilidad de cancelación.  

**Acciones:** cancelar cuando proceda o regresar.  

**Estados:** vigente cancelable, vigente fuera de plazo, cambio concurrente y recurso no accesible.  

**Omisión deliberada:** aforo y plazas disponibles no son necesarios para reconocer una reserva ya confirmada.



### CLI-BKG-03 — Detalle privado



**Información:** `Sesión privada`, fecha, hora, duración, monitor y disponibilidad de cancelación.  

**Acciones:** cancelar cuando proceda o regresar.  

**Estados:** confirmada cancelable, confirmada fuera de plazo, cambio concurrente y recurso no accesible.  

**Omisión deliberada:** las disciplinas del monitor no se muestran como atributo de la reserva porque la sesión no se reserva por disciplina.



### CLI-BKG-04 — Confirmación de cancelación



**Información:** tipo, identificación, fecha, hora y consecuencia de la cancelación.  

**Acciones:** confirmar o conservar la reserva.  

**Estados:** inicial, operación en curso, cambio de estado y error temporal.  

**Patrón:** paso completo del flujo móvil, no diálogo flotante.



### CLI-BKG-05 — Resultado



**Información:** resultado exacto y reserva afectada.  

**Acción principal:** `Volver a Mis reservas`.  

**Estados:** cancelación correcta o cambio que impide completarla.  

**Patrón:** resultado con continuidad; no constituye una página de éxito aislada.



### CLI-GRP-01 — Consulta de clases grupales



**Información:** selector obligatorio de disciplina y sesiones de las próximas 72 horas agrupadas por fecha y ordenadas por hora; cada sesión muestra tipo, disciplina, fecha, hora, duración, monitor, sala, plazas, aforo y estado.  

**Acciones:** seleccionar disciplina, abrir una clase disponible, cambiar disciplina, reintentar o regresar.  

**Estados:** sin disciplina, carga, ninguna sesión, una o varias, disponible, completa, fuera de plazo, ya reservada, conflicto conocido, cancelación concurrente y error temporal.  

**Restricciones:** sin `Todas las disciplinas`, búsqueda, filtros adicionales, paginación ni carga progresiva.



### CLI-GRP-02 — Detalle de clase grupal



**Información:** datos completos y disponibilidad actualizada, indicando que se revalidará al confirmar.  

**Acciones:** reservar cuando proceda, elegir otra clase, ver `Mis reservas` o regresar.  

**Estados:** reservable, completa, plazo cerrado, duplicado, conflicto, cancelada, modificada, inexistente o inaccesible y error recuperable.



### CLI-GRP-03 — Confirmación de reserva grupal



**Información:** resumen actualizado de la clase y carácter orientativo de la plaza consultada.  

**Acciones:** `Confirmar reserva` o `Volver al detalle`.  

**Estados:** lista para enviar, procesamiento sin doble envío, última plaza ocupada, cambio de monitor o sala, cambio de horario, conflicto nuevo, sesión invalidada y resultado técnico ambiguo.  

**Patrón:** página completa con revalidación autoritativa e idempotencia.



### CLI-GRP-04 — Resultado de reserva grupal



**Información:** disciplina, fecha, hora y resultado confirmado.  

**Acción principal:** `Volver a Mis reservas`.  

**Estados:** éxito confirmado, reserva ya existente, error funcional, comprobación de resultado ambiguo y error temporal recuperable.



### CLI-PRI-01 — Fecha y hora privada



**Información:** lista corta de días y horas potencialmente reservables dentro de la ventana exacta de 72 a 3 horas; cada hora muestra inicio y final de un bloque de 45 minutos.  

**Acciones:** elegir día, elegir hora, reintentar o regresar.  

**Estados:** carga, uno o varios días, una o varias horas, sin opciones, fecha u hora caducada y error temporal.  

**Restricciones:** las opciones no reservables no aparecen; sin calendario mensual, disciplina, sala, búsqueda, filtros ni paginación; los monitores se consultan después de elegir hora.



### CLI-PRI-02 — Selección de monitor



**Información:** fecha, hora y monitores disponibles ordenados alfabéticamente; cada monitor muestra nombre, apellidos y disciplinas informativas.  

**Acciones:** elegir monitor, cambiar hora o reintentar.  

**Estados:** carga, un monitor, varios, ninguno, monitor ocupado o inactivo, disciplinas actualizadas y error temporal.  

**Restricciones:** sin fotografías, teléfono, búsqueda, filtros, paginación ni selección de disciplina; un único monitor también requiere selección explícita.



### CLI-PRI-03 — Revisión de sesión privada



**Información:** `Sesión privada`, fecha, hora, duración, monitor y disciplinas informativas; aviso de revalidación.  

**Acciones:** `Continuar para confirmar`, cambiar monitor o cambiar fecha y hora.  

**Estados:** selección válida, monitor no disponible, conflicto propio, plazo cerrado, datos incompletos o inválidos y error recuperable.



### CLI-PRI-04 — Confirmación de reserva privada



**Información:** resumen actualizado y carácter orientativo de la disponibilidad consultada.  

**Acciones:** `Confirmar reserva` o `Volver a la revisión`.  

**Estados:** lista para enviar, procesamiento sin doble envío, monitor ocupado o inactivo, conflicto nuevo, ventana cerrada, sesión invalidada y resultado técnico ambiguo.  

**Patrón:** página completa con revalidación autoritativa e idempotencia.



### CLI-PRI-05 — Resultado de reserva privada



**Información:** tipo, fecha, hora, duración, monitor y resultado confirmado.  

**Acción principal:** `Volver a Mis reservas`.  

**Estados:** éxito confirmado, sesión ya existente, error funcional, comprobación de resultado ambiguo y error temporal recuperable.



### CLI-ACC-01 — Cuenta



**Información:** datos de cuenta permitidos que se determinen en su feature, sin exponer información interna.  

**Acciones:** cambiar contraseña y cerrar sesión.  

**Estados:** carga y error recuperable cuando existan datos remotos.



### CLI-ACC-02 — Cambio de contraseña



**Información:** contraseña actual, nueva contraseña y confirmación; reglas de longitud.  

**Acciones:** cambiar contraseña o regresar.  

**Estados:** inicial, validación, envío, error corregible, error temporal y cambio correcto.  

**Salida obligatoria:** inicio de sesión tras invalidar todas las sesiones.



## 5. Elementos de la lista



### Reserva grupal



- Etiqueta textual `Clase grupal`.

- Fecha y hora como información prioritaria.

- Disciplina como identificación principal.

- Monitor y sala como información secundaria.

- Enlace accesible específico al detalle.



### Sesión privada



- Etiqueta textual `Sesión privada`.

- Fecha y hora como información prioritaria.

- Monitor como identificación secundaria.

- Enlace accesible específico al detalle.



La distinción visual futura mediante color o iconografía será complementaria.



## 6. Estados transversales



- **Carga:** conserva la estructura y evita saltos accidentales.

- **Vacío:** explica que no hay próximas reservas y mantiene las dos acciones de creación.

- **Error temporal:** indica que no se cargaron o modificaron los datos y ofrece reintento.

- **Fuera de plazo:** mantiene la reserva visible y explica por qué no puede cancelarse; no inventa canales de contacto.

- **Información obsoleta:** sustituye la acción por el estado actual y ofrece una salida segura.

- **Sesión terminada:** conduce a inicio de sesión con un mensaje neutro.



## 7. Fuera de alcance



- Wireframes y componentes definitivos.

- Colores, tipografías, iconografía y anchura máxima exacta.

- Historial de reservas pasadas o canceladas.

- Paginación o filtros en `Mis reservas`.

- Canales de recuperación o contacto no definidos funcionalmente.



## 8. Estructura común del monitor



Todas las pantallas autenticadas del monitor reutilizan:



- vista móvil de una columna y ancho limitado;

- cabecera con identidad de AltaGym y `Cerrar sesión`;

- contenido principal identificado semánticamente;

- barra inferior con `Mi agenda` y `Mi perfil`;

- páginas completas para detalles;

- foco visible, orden lógico y anuncios accesibles.



No incluyen acciones de creación, modificación, cancelación, reserva ni solicitud de cambios.



## 9. Inventario del monitor



| ID | Pantalla | Propósito | Entrada | Salidas |

| --- | --- | --- | --- | --- |

| MON-AUTH-01 | Inicio de sesión | Crear o recuperar una sesión válida | URL pública, sesión terminada o URL protegida | Semana actual o recurso autorizado |

| MON-AGN-01 | Mi agenda | Consultar y navegar una semana propia | Inicio del monitor o navegación principal | Otra semana, detalle o Mi perfil |

| MON-AGN-02 | Detalle de clase grupal | Consultar los datos permitidos de una clase | Agenda o URL autorizada | Regreso a Mi agenda |

| MON-AGN-03 | Detalle de sesión privada | Consultar la sesión e identificar al cliente | Agenda o URL autorizada | Regreso a Mi agenda |

| MON-AGN-04 | Detalle de bloqueo | Consultar un intervalo sin nota interna | Agenda o URL autorizada | Regreso a Mi agenda |

| MON-PRF-01 | Mi perfil | Consultar nombre y disciplinas y acceder a cuenta | Navegación principal | Cambio de contraseña o agenda |

| MON-ACC-01 | Cambio de contraseña | Cambiar la credencial propia | Mi perfil | Inicio de sesión tras invalidar sesiones |



## 10. Estados del monitor



### MON-AGN-01 — Mi agenda



**Información:** semana completa de lunes a domingo, controles anterior, siguiente y actual, días y actividades propias ordenadas cronológicamente.  

**Acciones:** cambiar semana, volver a la actual, abrir detalle, reintentar y navegar a Mi perfil.  

**Estados:** carga inicial, actualización, día vacío, semana vacía, error temporal, datos no actualizados, sesión invalidada y monitor inactivo.  

**Restricciones:** sin calendario, selector de fecha, filtros, búsqueda, paginación, estadísticas ni acciones de gestión.



### MON-AGN-02 — Detalle de clase grupal



**Información:** tipo, disciplina, fecha, intervalo, duración de 45 minutos, sala, estado y reservas vigentes; si está cancelada, último total anterior a la cancelación.  

**Acciones:** regresar.  

**Estados:** futura, en curso, pasada, cancelada, modificada, inexistente o inaccesible, actualización y error temporal.  

**Restricciones:** sin identidades de clientes, listado, aforo, plazas ni condición `Completa`.



### MON-AGN-03 — Detalle de sesión privada



**Información:** tipo, fecha, intervalo, duración de 45 minutos, estado, nombre completo y fotografía o marcador `Sin fotografía`.  

**Acciones:** regresar.  

**Estados:** futura, en curso, pasada, cancelada, modificada, inexistente o inaccesible, actualización y error temporal.  

**Restricciones:** sin teléfono, credenciales, contacto, origen de la cancelación ni datos adicionales del cliente.



### MON-AGN-04 — Detalle de bloqueo



**Información:** tipo `Bloqueo`, fecha, intervalo completo, duración derivada y estado.  

**Acciones:** regresar.  

**Estados:** futuro, en curso, pasado, cancelado, inexistente o inaccesible, actualización y error temporal.  

**Restricciones:** sin nota interna, cliente especial, datos de cliente ni acciones de gestión.



### MON-PRF-01 — Mi perfil



**Información:** nombre completo y disciplinas ordenadas alfabéticamente.  

**Acciones:** cambiar contraseña, cerrar sesión o volver a Mi agenda.  

**Estados:** carga, actualización, disciplinas modificadas, error temporal y sesión invalidada.  

**Restricciones:** sin teléfono, nombre de usuario, estado técnico, permisos, historial, edición ni métricas.



### MON-ACC-01 — Cambio de contraseña



Reutiliza las reglas de `CLI-ACC-02`: contraseña actual, nueva contraseña y confirmación; al finalizar invalida todas las sesiones y vuelve al inicio de sesión.



## 11. Elementos de la agenda



- **Clase grupal:** tipo textual, hora, disciplina, sala, estado y total permitido.

- **Sesión privada:** tipo textual, hora, cliente y estado.

- **Bloqueo:** tipo textual, hora inicial y final y estado.



`Cancelada` o `Cancelado` prevalece como estado principal. Los estados temporales futura, en curso y pasada se calculan por el intervalo con final exclusivo. Ninguna diferencia depende solo del color o la iconografía.



## 12. Conservación y accesibilidad del monitor



- La semana se conserva en la URL y tras recargar; posición y foco se conservan durante la navegación interna válida.

- Regresar desde un detalle restaura el elemento de origen; si desaparece, el foco pasa al encabezado del día o de la semana.

- Cambiar de semana enfoca el encabezado del nuevo periodo.

- Cerrar sesión, cambiar de usuario o perder autorización descarta todo el contexto.

- Semana, días, listas y actividades usan estructura semántica y nombres accesibles específicos.

- Las fotografías usan `Fotografía de Nombre Apellidos`; el marcador se acompaña de `Sin fotografía`.

- Carga, actualización, errores y cambios relevantes se anuncian sin desplazar el foco inesperadamente.



## 13. Estructura común del backoffice



Todas las pantallas autenticadas de recepción y administración reutilizan:



- escritorio o portátil como dispositivo objetivo, sin experiencia móvil completa en el MVP;

- enlace `Saltar al contenido principal`;

- cabecera con identidad de AltaGym, acceso a `Cuenta` y acción textual `Cerrar sesión`;

- navegación lateral persistente con `Inicio`, `Clientes`, `Calendario grupal`, `Agenda privada` y `Monitores`;

- indicación visual y semántica del área activa;

- contenido principal flexible, con un único encabezado principal;

- migas de pan en detalle, creación, modificación, confirmación y resultado;

- actualización al entrar, recargar, completar operaciones y recuperar el foco;

- foco visible, teclado completo y anuncios accesibles.



`Inicio` es la portada, no una quinta área operativa. `Cuenta` es una utilidad de la cabecera. Las acciones de creación se mantienen en el área correspondiente.



## 14. Inventario común del backoffice



| ID | Pantalla | Propósito | Entrada | Salidas |

| --- | --- | --- | --- | --- |

| BO-HOM-01 | Portada del backoffice | Orientar y abrir una de las cuatro áreas | Autenticación, Inicio o URL directa | Clientes, Calendario grupal, Agenda privada, Monitores o Cuenta |

| BO-ACC-01 | Cuenta propia | Acceder a operaciones de la cuenta autenticada | Cabecera | Cambio de contraseña o regreso |

| BO-ACC-02 | Cambio de contraseña | Cambiar voluntariamente la credencial propia | Cuenta | Inicio de sesión tras invalidar sesiones |

| BO-SYS-01 | Recurso no disponible | Recuperarse sin revelar existencia o autorización | URL o recurso invalidado | Inicio o raíz del área |

| BO-SYS-02 | Página no encontrada | Recuperarse de una ruta inexistente | URL inválida | Inicio |



### Inventario base de Clientes



| ID | Pantalla | Propósito | Entrada | Salidas |

| --- | --- | --- | --- | --- |

| BO-CLI-01 | Listado de clientes | Buscar por apellidos, paginar y abrir una ficha | Navegación, portada o regreso | Alta, ficha o modificación |

| BO-CLI-02 | Alta de cliente | Crear datos, fotografía opcional y credenciales iniciales | Listado | Resultado o cancelación |

| BO-CLI-03 | Resultado de alta | Identificar el cliente creado | Alta reconciliada | Ficha o listado |

| BO-CLI-04 | Ficha del cliente | Consultar identidad, estado, datos y acciones | Listado, resultado, reserva o URL | Modificación, estado, contraseña o reserva |

| BO-CLI-05 | Modificación del cliente | Actualizar datos, usuario y fotografía, sin contraseña ni estado | Ficha o fila | Resultado o ficha |

| BO-CLI-06 | Resultado de modificación | Confirmar los datos autoritativos | Modificación reconciliada | Ficha |

| BO-CLI-07 | Confirmación de desactivación | Identificar cliente y explicar consecuencias | Ficha activa | Resultado o ficha |

| BO-CLI-08 | Resultado de estado | Comunicar desactivación, reactivación o estado concurrente | Operación reconciliada | Ficha |

| BO-CLI-09 | Nueva contraseña | Introducir y validar contraseña y confirmación | Ficha | Confirmación o ficha |

| BO-CLI-10 | Confirmación de restablecimiento | Identificar cliente e invalidación de sesiones | Nueva contraseña válida | Resultado o edición |

| BO-CLI-11 | Resultado de restablecimiento | Confirmar sin mostrar la contraseña | Operación reconciliada | Ficha |



`BO-CLI-01` muestra 20 clientes, ordenados por apellidos y nombre, en las columnas `Cliente`, `Teléfono`, `Nombre de usuario`, `Estado` y `Acciones`. La búsqueda se envía explícitamente, es parcial solo sobre apellidos, elimina espacios exteriores y no distingue mayúsculas ni diacríticos equivalentes. La paginación utiliza `Anterior`, números próximos y `Siguiente`, sin tamaños alternativos.



La identificación principal enlaza a `BO-CLI-04`; la fila no es completamente clicable. Estado, contraseña y reservas parten de la ficha. Las reservas reutilizan las pantallas grupales y privadas existentes con cliente fijo y regreso principal a la ficha, sin duplicarlas en este inventario.



`AltaGym` se muestra como cliente del sistema y su ficha es exclusivamente consultiva: no permite modificación, cambio de estado, restablecimiento de contraseña ni reservas.



### Inventario base de Calendario grupal



| ID | Pantalla | Propósito | Entrada | Salidas |

| --- | --- | --- | --- | --- |

| BO-GRP-01 | Lista semanal grupal | Consultar lunes a domingo, sesiones, ocupación y estado | Navegación, portada, regreso o URL | Sesión, programación o alta |

| BO-GRP-02 | Detalle de sesión grupal | Consultar ocurrencia y reservas vigentes | Lista, resultado, ficha o URL | Reserva, cancelación o programación |

| BO-GRP-03 | Detalle de programación | Consultar recurrencia y acciones permitidas | Sesión, resultado o URL | Modificación o eliminación |

| BO-GRP-04 | Alta de programación | Crear recurrencia semanal | Lista semanal | Resultado o regreso |

| BO-GRP-05 | Resultado de alta | Identificar programación creada | Alta reconciliada | Calendario o programación |

| BO-GRP-06 | Modificación de programación | Crear una revisión desde fecha efectiva | Programación | Resultado o regreso |

| BO-GRP-07 | Resultado de modificación | Comunicar alcance y sesiones protegidas | Modificación reconciliada | Calendario o programación |

| BO-GRP-08 | Confirmación de eliminación | Revisar eliminación lógica controlada | Programación eliminable | Resultado o regreso |

| BO-GRP-09 | Resultado de eliminación | Confirmar conservación histórica | Eliminación reconciliada | Calendario |

| BO-GRP-10 | Selección de cliente | Elegir cliente activo desde una sesión | Sesión vigente con plazas | Revisión o regreso |

| BO-GRP-11 | Revisión de reserva | Confirmar sesión y cliente | Cliente seleccionado o ficha | Resultado o regreso |

| BO-GRP-12 | Resultado de reserva | Comunicar reserva creada | Confirmación reconciliada | Sesión o ficha de origen |

| BO-GRP-13 | Confirmación de cancelación de reserva | Revisar cancelación individual sin SMS | Reserva vigente | Resultado o sesión |

| BO-GRP-14 | Resultado de cancelación de reserva | Actualizar reserva y ocupación | Cancelación reconciliada | Sesión |

| BO-GRP-15 | Confirmación de cancelación de sesión | Revisar consecuencias y SMS opcional | Sesión vigente | Resultado o sesión |

| BO-GRP-16 | Resultado de cancelación de sesión | Comunicar sesión, reservas y avisos | Cancelación reconciliada | Sesión o semana |

| BO-GRP-17 | Resultados de notificaciones | Consultar resumen y estados por destinatario | Sesión cancelada | Sesión |



`BO-GRP-01` es una única lista semanal accesible, sin cuadrícula ni selector de presentación. Siempre muestra los siete días y ordena las sesiones de cada día por hora. Conserva la semana mediante el lunes en `week=YYYY-MM-DD`.



Una ocurrencia se identifica por programación y fecha. `BO-GRP-02` separa las acciones sobre la sesión de las acciones sobre `BO-GRP-03`. Las reservas no tienen modificación: solo creación y cancelación.



### Inventario base de Agenda privada



| ID | Pantalla | Propósito | Entrada | Salidas |

| --- | --- | --- | --- | --- |

| BO-PRI-01 | Agenda privada semanal | Consultar siete días, monitores, sesiones y bloqueos | Navegación, portada, regreso o URL | Sesión, bloqueo o creación |

| BO-PRI-02 | Detalle de sesión privada | Consultar estado, cliente, monitor e historial | Agenda, resultado, ficha o URL | Cancelación, notificación o relaciones |

| BO-PRI-03 | Selección de cliente | Elegir cliente activo normal | Agenda privada | Fecha y hora o regreso |

| BO-PRI-04 | Fecha y hora | Elegir un inicio potencial dentro de la ventana | Cliente seleccionado o ficha | Monitor o regreso |

| BO-PRI-05 | Selección de monitor | Elegir monitor activo y disponible | Fecha y hora | Revisión o regreso |

| BO-PRI-06 | Revisión de sesión privada | Revisar cliente, intervalo y monitor | Monitor seleccionado | Resultado o edición |

| BO-PRI-07 | Resultado de creación | Comunicar la sesión reconciliada | Confirmación | Sesión, semana o ficha de origen |

| BO-PRI-08 | Detalle de bloqueo | Consultar intervalo, monitor, nota y estado | Agenda, resultado o URL | Cancelación o monitor |

| BO-PRI-09 | Creación de bloqueo | Introducir monitor, fecha, horas y nota | Agenda privada | Revisión o regreso |

| BO-PRI-10 | Revisión de bloqueo | Revisar intervalo y ocupación | Datos válidos | Resultado o edición |

| BO-PRI-11 | Resultado de bloqueo | Comunicar el bloqueo reconciliado | Confirmación | Bloqueo o semana |

| BO-PRI-12 | Confirmación de cancelación de sesión | Revisar consecuencias y SMS opcional | Sesión confirmada | Resultado o sesión |

| BO-PRI-13 | Resultado de cancelación de sesión | Comunicar liberación y aviso | Cancelación reconciliada | Sesión, semana o ficha |

| BO-PRI-14 | Resultados de notificación | Consultar resumen y estado del destinatario | Sesión cancelada | Sesión |

| BO-PRI-15 | Confirmación de cancelación de bloqueo | Revisar consecuencias sin SMS | Bloqueo vigente | Resultado o bloqueo |

| BO-PRI-16 | Resultado de cancelación de bloqueo | Comunicar liberación e historial | Cancelación reconciliada | Bloqueo o semana |



`BO-PRI-01` es una única lista semanal, sin cuadrícula, filtros ni selector de vista. Muestra los siete días; dentro de cada día agrupa por monitor en orden alfabético y ordena sus actividades cronológicamente. Coincidencias de monitores distintos permanecen en grupos separados y los bloqueos de varias horas expresan su intervalo completo. Las canceladas permanecen en posición histórica y no representan ocupación actual.



La creación privada selecciona cliente → fecha → hora → monitor. Desde la ficha, el cliente queda fijo y se regresa principalmente a ella. Clientes inactivos y AltaGym no son seleccionables. Sesiones y bloqueos no tienen modificación ni reactivación: se cancelan y se crean de nuevo.



### Inventario base de Monitores



| ID | Pantalla | Propósito | Entrada | Salidas |

| --- | --- | --- | --- | --- |

| BO-MON-01 | Listado de monitores | Buscar, filtrar y abrir una ficha | Navegación, portada o URL | Alta, ficha o listado actualizado |

| BO-MON-02 | Alta de monitor | Crear datos, disciplinas y credenciales iniciales | Listado | Resultado o cancelación |

| BO-MON-03 | Resultado de alta | Identificar el monitor creado | Alta reconciliada | Ficha o listado |

| BO-MON-04 | Ficha del monitor | Consultar identidad, estado, disciplinas y acciones | Listado, resultado o URL | Modificación, estado, credenciales o disciplinas |

| BO-MON-05 | Modificación del monitor | Actualizar datos y disciplinas | Ficha o fila | Resultado o ficha |

| BO-MON-06 | Resultado de modificación | Confirmar los datos autoritativos | Modificación reconciliada | Ficha |

| BO-MON-07 | Confirmación de desactivación | Identificar monitor y explicar consecuencias | Ficha activa | Resultado o ficha |

| BO-MON-08 | Resultado de estado | Comunicar desactivación o reactivación | Operación reconciliada | Ficha |

| BO-MON-09 | Nueva contraseña | Introducir y validar contraseña y confirmación | Ficha | Confirmación o ficha |

| BO-MON-10 | Confirmación de restablecimiento | Identificar monitor e invalidación de sesiones | Nueva contraseña válida | Resultado o edición |

| BO-MON-11 | Resultado de restablecimiento | Confirmar sin mostrar la contraseña | Operación reconciliada | Ficha |



`BO-MON-01` muestra nombre, apellidos, teléfono, disciplinas y estado. La búsqueda es parcial por nombre o apellidos, admite filtro por estado y pagina los resultados. Por defecto solo muestra monitores activos. La identificación principal enlaza a `BO-MON-04`; la fila no es completamente clicable. La ficha concentra alta, modificación, disciplinas, estado y credenciales. Los monitores no se eliminan físicamente.



## 15. Estados del backoffice



### BO-HOM-01 — Portada



**Información:** título `Backoffice`, breve orientación y accesos a Clientes, Calendario grupal, Agenda privada y Monitores.  

**Acciones:** abrir un área, Cuenta o Cerrar sesión.  

**Estados:** estructura disponible y ruta directa.  

**Restricciones:** sin estadísticas, métricas, gráficos, actividad reciente, contadores, alertas, datos remotos ni nombre de usuario obligatorio.



### BO-ACC-01 y BO-ACC-02 — Cuenta



`Cuenta` separa la cuenta propia de las cuentas gestionadas y no es un área operativa. Solo muestra datos expresamente autorizados y permite cambiar contraseña. El cambio reutiliza el flujo aprobado: contraseña actual, nueva y confirmación; al finalizar invalida todas las sesiones y conduce al inicio de sesión.



### BO-SYS-01 — Recurso no disponible



**Información:** mensaje neutro cuando distinguir inexistencia y falta de autorización revelaría información.  

**Acciones:** volver al área o a Inicio.  

**Estados:** recurso inexistente, inaccesible, desactivado o invalidado.  

**Restricción:** no confirma la existencia de recursos ajenos.



### BO-SYS-02 — Página no encontrada



**Información:** la ruta no existe.  

**Acción:** `Volver al inicio`.  

**Diferencia:** un error temporal ofrece reintento y no se presenta como ruta inexistente.



### BO-CLI-01 — Listado de clientes



**Información:** título, alta, búsqueda aplicada, resumen, tabla y paginación.  

**Acciones:** buscar, limpiar, cambiar página, abrir ficha o modificar.  

**Estados:** carga, actualización con datos anteriores identificados, vacío real, sin resultados, error temporal, página ajustada y fila cambiada o retirada.  

**Foco:** título al entrar; resumen al buscar o paginar; control de origen al regresar si continúa válido.



### BO-CLI-02 y BO-CLI-05 — Formularios



**Información:** grupos, etiquetas, ayudas, obligatoriedad, errores de campo y resumen. Alta incluye credenciales; modificación las excluye.  

**Acciones:** guardar, cancelar y gestionar fotografía.  

**Estados:** carga autoritativa, validación, nombre de usuario ocupado, archivo inválido, conflicto concurrente, error temporal y cambios sin guardar.  

**Restricción:** no hay sobrescritura silenciosa ni restauración del borrador después de cambiar identidad o autorización.



### BO-CLI-04 — Ficha del cliente



**Información:** identidad, estado, posible condición de cliente del sistema, fotografía o ausencia, datos personales y nombre de usuario.  

**Acciones:** según estado, modificar, desactivar, reactivar, restablecer y reservar.  

**Estados:** carga, actualización, cliente modificado, estado concurrente, recurso no disponible y sesión terminada.  

**Restricción:** no muestra contraseña, sesiones, hash ni campos no documentados.



### BO-CLI-07 a BO-CLI-11 — Estado y credenciales



Desactivar y restablecer usan confirmación completa y envío único. Reactivar actúa desde la ficha sin confirmación adicional. Los resultados identifican cliente y estado autoritativo y regresan a la ficha. Un resultado ambiguo se reconcilia antes de comunicar éxito o habilitar un reenvío. La contraseña nunca aparece en el resultado.



## 16. Patrones de pantalla del backoffice



### Listado



Jerarquía: título, alta permitida, búsqueda y filtros aprobados, resumen de resultados, tabla y paginación cuando exista funcionalmente. La identificación principal enlaza al detalle; si hay varias acciones, la fila completa no es ambiguamente clicable.



Estados: carga, actualización, vacío, sin resultados, error temporal, página invalidada y fila modificada o retirada concurrentemente.



### Calendario o agenda



Jerarquía: título, periodo semanal, navegación anterior/actual/siguiente, acciones de creación y contenido. Conserva la semana en URL. Calendario grupal usa una lista semanal por día; Agenda privada usa una lista semanal por día y monitor. Ninguna incorpora cuadrícula ni selector de presentación. Las actividades canceladas siguen visibles. Europe/Madrid y los cambios oficiales de hora se interpretan mediante instantes reales.



### Detalle



Jerarquía: identificación, estado, datos, relaciones autorizadas y acciones. Consulta y modificación son contextos separados. Regresa al origen conservado o a la raíz del área si se abrió mediante URL directa.



### Formulario



Alta y modificación se distinguen. Etiquetas, ayudas, obligatoriedad, errores de campo y resumen son accesibles. Conserva valores válidos tras errores corregibles, advierte antes de abandonar cambios y no restaura borradores tras cerrar sesión, cambiar de usuario o autenticarse de nuevo.



### Confirmación y resultado



Cancelaciones, desactivaciones, restablecimientos y eliminaciones controladas usan una página completa de confirmación. El resultado identifica qué cambió y regresa al contexto actualizado. Cerrar sesión y las reactivaciones idempotentes sin consecuencias adicionales no requieren confirmación.



## 17. Conservación y accesibilidad del backoffice



- Búsqueda, filtros aprobados, orden, página, semana e identidad de recurso se representan en URL cuando deban sobrevivir a recarga.

- Contraseñas, datos personales introducidos, notas internas, tokens, borradores y mutaciones pendientes nunca se representan en URL.

- Atrás usa el historial real y recupera el contexto válido.

- Cerrar sesión, cambiar de usuario o perder autorización descarta todo el contexto privado.

- Cambiar de área o página enfoca el título; regresar restaura el control de origen cuando siga existiendo.

- Tablas asocian encabezados y celdas; la lista semanal asocia cada sesión a su día y hora.

- Carga, actualización, errores, conflictos y resultados se anuncian sin desplazar el foco inesperadamente.

- La conformidad se verifica frente a WCAG 2.2 AA.



## 18. Pendientes del inventario administrativo



- Monitores queda definido en su flujo propio y reutiliza la estructura aprobada del backoffice.

- La gestión general de personal, configuración, salas, disciplinas y aforos no obtiene una pantalla nueva hasta aclarar su ubicación funcional.
