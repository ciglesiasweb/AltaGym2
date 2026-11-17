# Flujo UX — Backoffice de recepción y administración

**Estado:** UX 1.0 congelado
**Última actualización:** 23 de julio de 2026

## 1. Propósito, alcance y fuentes

Este documento define la experiencia común de escritorio del perfil funcional de recepción y administración: acceso, portada, navegación, orientación, contexto, patrones administrativos, cuenta, estados y accesibilidad. Constituye la base de los flujos de Clientes, Calendario grupal, Agenda privada y Monitores, pero no desarrolla sus gestiones completas.



Sus fuentes funcionales son `../../ROLES_AND_PERMISSIONS.md`, `../../BUSINESS_RULES.md`, `../../DATA_MODEL.md`, `../../DATABASE_DESIGN.md` y `../../features/`, especialmente `reception-backoffice.md` y `authentication.md`. Reutiliza los patrones transversales ya cerrados para cliente y monitor sin trasladar sus composiciones móviles.

No crea roles, permisos, estados, transiciones, filtros, columnas o canales de contacto. Los requisitos funcionales, consecuencias UX, recomendaciones aprobadas y pendientes se identifican por separado.

## 2. Actor y precondiciones

- **Actor:** miembro de recepción o administración; ambas denominaciones corresponden al mismo rol funcional `RECEPTION` y a los mismos permisos.
- **Dispositivo objetivo:** escritorio o portátil. El uso móvil completo queda fuera del alcance UX del MVP.
- **Precondiciones:** sesión válida, cuenta activa, rol autorizado y recurso válido dentro del ámbito permitido.
- **Destino inicial:** portada del backoffice.
- **Destinos principales:** `Clientes`, `Calendario grupal`, `Agenda privada` y `Monitores`.
- **Cuenta:** destino de utilidad accesible desde la cabecera; no es una quinta área operativa.

## 3. Separación normativa

### 3.1 Requisitos funcionales existentes

- Cuatro áreas operativas persistentes y portada inicial.
- Semanas de lunes a domingo, inicialmente la actual y sin límite de navegación.
- Actualización tras una operación correcta, conservación de entradas tras errores corregibles y confirmación de cancelaciones y desactivaciones.
- Revalidación de sesión, permisos, estado, versión, ventanas, aforo, disponibilidad y conflictos según cada operación.
- Mismos permisos para recepción y administración, sin configuración individual.
- Zona horaria `Europe/Madrid`, intervalos con final exclusivo y cálculo mediante instantes reales.

### 3.2 Consecuencias UX derivadas

- Una URL interna no elude ninguna validación.
- Los datos obsoletos no pueden seguir habilitando una mutación.
- Una operación sensible parte de una entidad identificada, explica consecuencias y requiere confirmación.
- Una mutación en curso bloquea el doble envío y un resultado técnico ambiguo se reconcilia antes de reintentar.
- Cerrar sesión, cambiar de usuario o perder autorización descarta contexto y borradores privados.

### 3.3 Recomendaciones aprobadas

- Cabecera y navegación lateral persistentes.
- Tablas para listados de escritorio y una presentación semanal accesible definida por cada área; Calendario grupal usa una única lista de siete días.
- Migas de pan en rutas jerárquicas.
- Confirmaciones sensibles en página completa.
- Contexto seguro representado en URL.
- Advertencia antes de abandonar formularios modificados.

## 4. Estructura común del backoffice

Cada página autenticada contiene, en este orden semántico:

1. enlace `Saltar al contenido principal`;
2. cabecera con identidad de AltaGym, `Cuenta` y acción textual `Cerrar sesión`;
3. navegación principal con `Inicio`, las cuatro áreas y estado activo semántico;
4. contenido principal con migas de pan cuando procedan, un único título principal, acciones contextuales y contenido;
5. región de estado para carga, actualización y resultados.

`Inicio` representa la portada y no añade un área operativa. Las acciones de alta o creación viven dentro del área correspondiente. La cabecera no compite con la navegación ni contiene atajos de gestión.

El contenido aprovecha el ancho de escritorio: formularios con longitud legible y tablas o calendarios con espacio suficiente. En ventanas estrechas puede compactarse o plegarse la navegación y permitirse desplazamiento controlado, sin adoptar barra inferior, composición móvil ni prometer soporte móvil completo.

## 5. Entrada, autenticación y autorización

### 5.1 Entrada normal

- **Objetivo:** acceder al contexto operativo autorizado.
- **Entrada:** autenticación correcta sin destino interno pendiente.
- **Recorrido:** validar sesión, rol y cuenta activa; abrir la portada; enfocar `Backoffice`.
- **Información visible:** identidad de AltaGym, cuatro áreas, cuenta y cierre de sesión.
- **Resultado:** portada operativa disponible.

### 5.2 URL interna protegida

- **Entrada:** URL de área, periodo o recurso.
- **Recorrido:** si falta sesión, autenticar; después validar rol, estado, permiso, ámbito, parámetros y recurso.
- **Bifurcaciones:** abrir el destino solicitado si continúa válido; en otro caso mostrar una salida neutra o volver al área segura.
- **Seguridad:** una URL ajena no confirma si el recurso existe. No se aceptan destinos externos ni redirecciones abiertas.
- **Resultado:** recurso autorizado o recuperación segura.

### 5.3 Cuenta inactiva o sesión perdida

Una cuenta inactiva no entra al backoffice. Si se desactiva durante el uso, la siguiente petición protegida detiene la consulta o mutación, elimina el contexto privado y conduce al inicio de sesión con un mensaje neutro. Una operación interrumpida no se presenta como completada.

### 5.4 Ruta inexistente, inválida o no autorizada

- Una ruta inexistente muestra `Página no encontrada` y ofrece `Volver al inicio`.
- Parámetros inválidos de un área vuelven a su estado canónico cuando hacerlo no resulta engañoso.
- Un recurso inexistente o no autorizado utiliza una respuesta neutra cuando distinguirlos revelaría información.
- Un error temporal se diferencia de los anteriores y ofrece `Reintentar`.

## 6. Portada operativa

- **Objetivo:** orientar y permitir entrar en cualquiera de las cuatro áreas.
- **Entrada:** autenticación normal, navegación `Inicio` o URL directa.
- **Contenido:** título `Backoffice` y cuatro accesos, en este orden: `Clientes`, `Calendario grupal`, `Agenda privada`, `Monitores`.
- **Descripción:** cada acceso puede incluir una frase breve basada en la feature correspondiente.
- **Acciones:** abrir un área, acceder a `Cuenta` o cerrar sesión.
- **Resultado:** área seleccionada.

La portada no contiene estadísticas, métricas, gráficos, actividad reciente, contadores, alertas ni accesos directos a mutaciones. Es estructural y no depende normalmente de datos remotos; no necesita un estado ordinario de carga. El nombre del usuario no es obligatorio hasta que exista una fuente funcional autorizada para la identidad del personal.

## 7. Navegación y orientación

### 7.1 Navegación principal

Las cuatro áreas permanecen accesibles desde cualquier página autenticada. El área activa se comunica mediante texto, estado visual y semántica, nunca solo mediante color. Seleccionar otra área crea una entrada de historial normal.

Seleccionar nuevamente el área activa no borra búsqueda, página o semana de forma implícita. Volver a la raíz del área requiere un enlace o acción explícitos.

### 7.2 Migas de pan

Se muestran en listado subordinado, detalle, creación, modificación, confirmación y resultado. No son necesarias en la portada. Reflejan la jerarquía, no todo el historial: área, contexto y recurso. La navegación principal, las migas y las acciones contextuales cumplen funciones distintas.

### 7.3 Atrás e historial

`Atrás` utiliza el historial real. Desde un detalle recupera búsqueda, filtros aprobados, orden, página o semana del origen cuando siguen siendo válidos. Una URL directa no fabrica un origen: ofrece volver a la raíz del área. Los resultados no acumulan ciclos artificiales; tras finalizar, la acción principal conduce al contexto actualizado.

## 8. Conservación del contexto

Se representan en URL cuando existan funcionalmente:

- término de búsqueda;
- filtros aprobados;
- orden aprobado;
- página;
- semana mediante una fecha canónica del periodo;
- identificador de entidad.

No se representan en URL contraseñas, datos personales introducidos, notas internas, tokens, mensajes técnicos, borradores ni mutaciones pendientes.

- **Navegación interna:** conserva el contexto válido del área.
- **Cambio de área:** el historial conserva el estado de la URL abandonada; no se mantiene un borrador inseguro en segundo plano.
- **Recarga:** reconstruye el contexto seguro desde la URL y revalida.
- **Nueva autenticación:** solo recupera un destino que siga siendo válido y autorizado; no restaura formularios.
- **Cierre de sesión, cambio de usuario o pérdida de permiso:** descarta todo el contexto privado.
- **Contexto inválido:** vuelve a la página, semana o entidad válida más próxima y explica el ajuste.

## 9. Patrón de listados administrativos

### 9.1 Jerarquía

1. título del área;
2. acción de alta cuando la feature la permita;
3. búsqueda y filtros únicamente aprobados;
4. resumen accesible de resultados;
5. tabla;
6. paginación únicamente cuando esté definida.

La tabla usa título o nombre accesible, encabezados asociados a sus celdas y orden de columnas coherente. La identificación principal enlaza al detalle. Si existen varias acciones, la fila completa no es ambiguamente clicable y cada acción nombra la entidad.

### 9.2 Estados

- **Vacío:** todavía no existen entidades; conserva el alta permitida.
- **Sin resultados:** mantiene el término y permite limpiarlo.
- **Error:** explica que el listado no se cargó y ofrece reintento.
- **Página invalidada:** abre la última página disponible y anuncia el cambio.
- **Fila obsoleta:** actualiza o retira la fila y mueve el foco al contexto estable más próximo.



## 10. Patrón de calendarios y agendas

El Calendario grupal y la Agenda privada comparten:

- semana de lunes a domingo;
- entrada inicial en la semana actual;
- `Semana anterior`, `Volver a la semana actual` y `Semana siguiente`;
- navegación sin límite funcional;
- fecha y hora interpretadas en `Europe/Madrid`;
- actividades ordenadas y estados textuales;
- semana conservada en URL;
- actividades canceladas visibles;
- actualización al entrar, recargar y recuperar el foco;
- presentación accesible con el mismo contenido y periodo.

Los cambios oficiales de hora se resuelven mediante instantes reales y se muestran como hora civil de Madrid. La interfaz no inventa intervalos inexistentes ni confunde dos instantes que compartan una hora civil durante el cambio de otoño.

El Calendario grupal usa una única lista semanal de siete días y se centra en sesiones, disciplina, monitor, sala, ocupación, estado y reservas permitidas, conforme a `reception-group-calendar.md`. La Agenda privada usa una única lista semanal agrupada por día y monitor, combina sesiones y bloqueos y se centra en monitor, cliente, intervalo y disponibilidad, conforme a `reception-private-agenda.md`.

## 11. Patrón de detalle

- **Entrada:** listado, calendario, búsqueda o URL directa.
- **Jerarquía:** identificación, estado, datos principales, relaciones autorizadas y acciones.
- **Acciones:** consultar, modificar o iniciar una operación solo cuando la feature lo permita.
- **Regreso:** al origen conservado o a la raíz del área para una URL directa.
- **Cambio concurrente:** sustituye los datos, anuncia el cambio y retira acciones incompatibles.
- **Cancelación o desactivación:** mantiene el detalle histórico permitido y muestra el estado actual.
- **Recurso no revelable:** salida neutra sin confirmar existencia ni autorización.

Consulta y modificación son contextos separados. Sesiones privadas y bloqueos no ofrecen edición directa: se cancelan y se crean de nuevo.

## 12. Patrón de formularios

- Alta y modificación tienen títulos, rutas y resultados diferenciados.
- Todos los controles poseen etiqueta persistente; ayudas, formato y obligatoriedad se expresan por texto y semántica.
- Los errores aparecen junto al campo; si son varios, un resumen enlazado recibe el foco.
- Los valores válidos se conservan tras errores corregibles de la misma sesión.
- Un formulario modificado advierte antes de navegar, cerrar o usar Atrás; continuar descarta el borrador y permanecer lo conserva.
- El envío se realiza una vez y comunica `Procesando` sin depender de una animación.
- El servidor revalida sesión, permisos, estado, versión y todas las reglas de la feature.
- Un conflicto no sobrescribe silenciosamente: muestra el estado actual y permite revisar qué datos siguen siendo válidos.
- Un resultado ambiguo se reconcilia antes de afirmar éxito o habilitar otro envío.

No se guardan borradores después de cerrar sesión, cambiar de usuario, perder autorización o autenticarse de nuevo.

## 13. Operaciones sensibles

Usan una página completa de confirmación las cancelaciones, desactivaciones, restablecimientos de contraseña y eliminaciones lógicas o controladas permitidas. La página muestra entidad, estado actual, consecuencia exacta, sesiones invalidadas, efectos sobre reservas o disponibilidad y notificación solo cuando la feature la contemple.

La acción principal nombra la consecuencia (`Cancelar sesión`, `Desactivar cliente`); la secundaria conserva el estado (`Volver sin cancelar`, `Conservar cuenta`). La confirmación revalida permisos, estado y versión, impide dobles envíos y ofrece regreso al contexto actualizado.

No requieren confirmación adicional la búsqueda, los filtros, el cambio de semana, abrir un detalle, cerrar sesión, guardar cambios ordinarios no destructivos ni una reactivación idempotente sin consecuencias adicionales documentadas.

## 14. Resultados y continuidad

Un resultado identifica la entidad, comunica exactamente qué cambió y ofrece una acción principal hacia el detalle, listado o semana ya actualizados. No es una página de éxito aislada. Si el estado final no puede conocerse tras un fallo técnico, el sistema consulta la fuente autoritativa antes de permitir reintentar.

Al regresar, se conserva el contexto que continúe siendo útil. Si la mutación invalida página, filtro, entidad o acción, se usa el contexto válido más próximo y se explica el ajuste.

## 15. Cuenta y cierre de sesión

`Cuenta` es una página de utilidad accesible desde la cabecera y no una quinta área. Separa la cuenta propia de la gestión de clientes, monitores o personal. Solo presenta información propia expresamente autorizada y `Cambiar contraseña`; no muestra permisos internos, identificadores, tokens, historial técnico ni datos de otras cuentas.

El nombre del personal no es obligatorio hasta definir una fuente autorizada. El cambio voluntario solicita contraseña actual, nueva y confirmación; al completarse invalida todas las sesiones y conduce al inicio de sesión. Su presentación dentro de AltaGym o mediante Auth0 continúa siendo una decisión técnica pendiente.

`Cerrar sesión` está disponible en toda pantalla autenticada, no necesita confirmación, invalida solo la sesión actual y descarta el contexto privado.

## 16. Carga, actualización, errores y datos obsoletos

Clientes conserva los requisitos funcionales de 20 elementos por página, búsqueda parcial por apellidos y orden por apellidos y nombre. Monitores reutiliza búsqueda por nombre o apellidos y orden alfabético; su ficha y sus acciones se desarrollan en `monitors.md`.

- **Portada:** estructura inmediata sin consulta remota ordinaria.
- **Carga inicial:** conserva regiones y encabezados para evitar saltos.
- **Cambio de área o semana:** identifica el destino solicitado; al finalizar enfoca su título.
- **Actualización con datos previos:** conserva el contenido como `Datos no actualizados`, consulta el mismo contexto y lo sustituye de forma coherente.
- **Error temporal:** conserva contexto seguro y ofrece `Reintentar`.
- **Vacío:** solo se declara después de una respuesta correcta.
- **Entidad modificada:** sustituye valores y anuncia el cambio.
- **Entidad cancelada o desactivada:** actualiza el estado y retira acciones incompatibles.
- **Sesión invalidada:** detiene la operación y aplica autenticación.

No existe tiempo real ni sondeo periódico. La recuperación de foco actualiza sin moverlo salvo que el elemento enfocado desaparezca; entonces lo sitúa en el encabezado, fila, día o periodo estable más próximo y anuncia el cambio.

## 17. Accesibilidad

- Regiones semánticas de cabecera, navegación y contenido y enlace de salto.
- Navegación completa mediante teclado, foco visible y orden equivalente al visual.
- Área activa comunicada con `aria-current` o semántica equivalente, texto y contraste.
- Migas de pan dentro de una región de navegación etiquetada.
- Tablas con encabezados y asociaciones correctas; controles de orden y paginación etiquetados.
- Presentación semanal, periodos y actividades con nombres accesibles específicos y solución operable para coincidencias; Calendario grupal utiliza una lista única.
- Formularios con etiquetas, ayudas, obligatoriedad, errores y resumen accesibles.
- Foco en el título al navegar; restauración al origen al regresar; foco en el resumen ante varios errores.
- Carga, actualización, conflicto y resultado anunciados sin cambios inesperados de contexto.
- Tipos y estados nunca dependen solo de color, icono, posición u opacidad.
- Contraste, ampliación al 200 %, reflujo y tamaño de objetivo conforme a WCAG 2.2 AA.
- Verificación automática y pruebas manuales de teclado, foco, ampliación y lector de pantalla.

## 18. Relación con cliente y monitor

Se reutilizan autenticación, cierre de sesión, páginas completas, actualización al recuperar el foco, datos obsoletos, concurrencia, idempotencia, reconciliación, resultados con continuidad y accesibilidad.

De la agenda del monitor se reutilizan semana lunes-domingo, navegación temporal, tipos y estados textuales y conservación de semana. No se copian vista móvil, columna única, barra inferior, `Mis reservas`, `Mi agenda`, `Mi perfil`, restauración exacta de desplazamiento, ámbito propio ni restricciones de solo lectura.

## 19. Flujos resumidos

| Flujo | Entrada | Recorrido principal | Resultado |
| --- | --- | --- | --- |
| Entrar al backoffice | Autenticación | Validar rol y cuenta → portada | Cuatro áreas disponibles |
| Abrir URL protegida | URL interna | Autenticar → autorizar → validar recurso | Destino o salida segura |
| Cambiar de área | Navegación | Conservar URL actual → abrir área | Área orientada y actualizada |
| Consultar entidad | Tabla o calendario | Abrir detalle → actualizar | Datos y acciones vigentes |
| Crear o modificar | Área o detalle | Formulario → validar → revalidar → resultado | Contexto actualizado |
| Operación sensible | Entidad identificada | Consecuencias → confirmar → reconciliar | Estado actualizado |
| Cambiar contraseña | Cuenta | Actual → nueva → confirmar | Sesiones invalidadas |
| Cerrar sesión | Cabecera | Invalidar sesión actual → descartar contexto | Inicio de sesión |

## 20. Trazabilidad

| Comportamiento | Fuente |
| --- | --- |
| Rol común y permisos | `../../ROLES_AND_PERMISSIONS.md`; `../../features/reception-backoffice.md` |
| Sesión, contraseña y rutas | `../../features/authentication.md`; `authentication.md` |
| Cuatro áreas y operaciones | `../../features/reception-backoffice.md` |
| Ventanas, conflictos y cancelaciones | `../../BUSINESS_RULES.md` |
| Estados y relaciones | `../../DATA_MODEL.md`; `../../DATABASE_DESIGN.md` |
| Navegación aprobada | `../NAVIGATION_AND_INFORMATION_STRUCTURE.md` |
| Actualización y accesibilidad | `../UX_PRINCIPLES.md`; flujos móviles del cliente y del monitor |
| Gestión detallada de clientes | `reception-clients.md` |
| Agenda privada | `reception-private-agenda.md` |
| Monitores | `monitors.md` |

## 21. Cobertura específica

### Flujos específicos

- Clientes queda definido en `reception-clients.md`; el cliente del sistema `AltaGym` es inmutable y su ficha es exclusivamente consultiva.
- Calendario grupal queda definido en `reception-group-calendar.md` mediante lista semanal, programaciones, ocurrencias, ocupación, reservas y notificaciones.
- Agenda privada queda definida en `reception-private-agenda.md`: distribución por día y monitor, coincidencias, selección, bloqueos, nota interna, cancelaciones y SMS.
- Monitores queda definido en `monitors.md`.

### Pendientes técnicos o funcionales

- La ubicación de gestión general de personal, configuración, salas, disciplinas y aforos no se inventa dentro de estas cuatro áreas.
- La identidad de URL de una ocurrencia grupal combina programación y fecha local; la implementación debe preservarla antes y después de materializarla.
- Debe confirmarse si el cambio voluntario de contraseña se presenta en AltaGym o en Auth0.

## 22. Fuera de alcance

- Wireframes, código, componentes, colores, tipografía, iconografía y medidas definitivas.
- Experiencia móvil completa del backoffice.
- Estadísticas, métricas, gráficos, actividad reciente o paneles.
- Quinta área operativa o permisos individualizables.
- Flujos completos y detalles de presentación reservados a futuras revisiones documentales.





