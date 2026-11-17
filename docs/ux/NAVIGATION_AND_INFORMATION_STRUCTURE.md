# AltaGym — Navegación y estructura de información

**Estado:** Aprobado  
**Última actualización:** 23 de julio de 2026

## 1. Propósito y alcance

Este documento define la organización inicial de la experiencia por rol, las relaciones entre secciones y el inventario preliminar de pantallas y flujos. No define URLs técnicas, componentes visuales ni reglas de negocio.

Las fuentes funcionales son `../ROLES_AND_PERMISSIONS.md`, `../BUSINESS_RULES.md` y `../features/`. La estructura de rutas descrita en `../ARCHITECTURE.md` puede implementar esta navegación sin obligar a que cada ruta técnica aparezca como elemento principal visible.

## 2. Modelo general por rol

Tras autenticarse, cada usuario accede directamente a la experiencia correspondiente a su rol:

| Rol | Destino inicial | Dispositivo objetivo | Modelo de navegación |
| --- | --- | --- | --- |
| Cliente | Mis reservas | Vista móvil única | Navegación mínima y acciones contextuales |
| Monitor | Mi agenda | Vista móvil única | Agenda y perfil operativo de solo lectura |
| Recepción/administración | Portada del backoffice | Escritorio o portátil | Cuatro áreas de gestión persistentes |

No existe selector de rol. Todos los monitores comparten permisos y recepción/administración concentra la gestión.

## 3. Cliente

### 3.1 Objetivos principales

1. Saber qué actividad tiene próximamente.
2. Crear una reserva grupal o privada.
3. Consultar el detalle y cancelar cuando proceda.
4. Gestionar su contraseña y sesión.

### 3.2 Navegación principal aprobada

La navegación del cliente contiene:

- **Mis reservas:** destino inicial y núcleo operativo.
- **Cuenta:** datos y operaciones de cuenta disponibles para el cliente.

`Mis reservas` incluye las acciones destacadas `Reservar clase grupal` y `Reservar sesión privada`. No se crean pestañas principales separadas para ambos tipos.

### 3.3 Jerarquía de Mis reservas

1. Título y contexto de usuario cuando sea necesario.
2. Acciones para crear reservas.
3. Lista única de próximas reservas vigentes.
4. Estado vacío con acciones de reserva.

Las reservas grupales y privadas se mezclan en una cronología común ordenada por fecha y hora. Cada elemento identifica claramente su tipo y presenta los datos necesarios para reconocerlo. La lista no muestra reservas pasadas ni canceladas, conforme a las features.

### 3.4 Pantallas preliminares

- Mis reservas.
- Detalle de reserva grupal.
- Selección y consulta de clases grupales.
- Confirmación y resultado de reserva grupal.
- Selección de fecha y hora de sesión privada.
- Selección de monitor disponible.
- Confirmación y resultado de sesión privada.
- Confirmación y resultado de cancelación.
- Cuenta.
- Cambio de contraseña.
- Inicio de sesión y sesión invalidada.

### 3.5 Flujos frecuentes

#### Reservar clase grupal

`Mis reservas → iniciar reserva grupal → elegir sesión según el flujo funcional → revisar → confirmar → resultado`

#### Reservar sesión privada

`Mis reservas → iniciar sesión privada → fecha y hora → monitor → revisar → confirmar → resultado`

#### Cancelar

`Mis reservas → detalle → cancelar → revisar consecuencias → confirmar → resultado`

#### Cambiar contraseña

`Cuenta → cambiar contraseña → confirmar → cierre de sesiones → inicio de sesión`

## 4. Monitor

### 4.1 Objetivos principales

1. Consultar su actividad de la semana.
2. Identificar los datos necesarios de cada actividad.
3. Reconocer cancelaciones y bloqueos.
4. Consultar sus disciplinas.

### 4.2 Navegación aprobada

- **Mi agenda:** destino inicial.
- **Mi perfil:** disciplinas y operaciones de cuenta permitidas.

Ambos destinos forman una barra inferior persistente adaptada al monitor. La cabecera mantiene la acción textual `Cerrar sesión` desde cualquier pantalla autenticada. Los detalles son rutas contextuales y no se convierten en destinos principales.

No aparecen acciones de alta, edición, cancelación, solicitud de cambios ni gestión de otros usuarios.

### 4.3 Agenda móvil

La agenda mantiene el periodo semanal aprobado, pero se presenta como lista cronológica agrupada por días para adaptarse a la vista móvil única.

Jerarquía:

1. Semana consultada, con navegación anterior y siguiente y retorno a la actual cuando proceda.
2. Días de lunes a domingo en orden, incluidos los días vacíos.
3. Actividades de cada día ordenadas por hora.
4. Estado vacío explícito de cada día y de la semana completa.

Las actividades grupales, privadas y bloqueos se distinguen por tipo y texto. Los elementos pasados o cancelados conservan visibilidad según la feature. La información expuesta en cada tipo se limita estrictamente a `../features/monitor-agenda.md`.

La semana seleccionada puede representarse en la URL y se conserva al recargar. No se incorpora calendario ni selector de fecha en el MVP. Atrás desde un detalle restaura semana, posición y foco cuando el origen continúa siendo válido; una URL directa mantiene como salida segura `Volver a Mi agenda`.

### 4.4 Pantallas preliminares

- Mi agenda semanal en lista.
- Detalle de sesión grupal.
- Detalle de sesión privada.
- Detalle de bloqueo.
- Mi perfil y disciplinas.
- Cambio de contraseña.
- Inicio de sesión y sesión invalidada.

## 5. Recepción y administración

### 5.1 Objetivos principales

1. Localizar rápidamente clientes y monitores.
2. Consultar la ocupación semanal.
3. Crear reservas, programaciones y bloqueos.
4. Resolver cancelaciones, estados y credenciales.
5. Mantener contexto entre una persona y la operación realizada en su nombre.

### 5.2 Portada operativa

El backoffice comienza en una portada sencilla con acceso a:

- Clientes.
- Calendario grupal.
- Agenda privada.
- Monitores.

La portada no contiene estadísticas, métricas ni paneles analíticos, que están fuera del alcance del MVP.

### 5.3 Navegación persistente

Las cuatro áreas permanecen accesibles desde la navegación principal. Las operaciones de creación se ubican dentro del contexto del área correspondiente. La cuenta y el cierre de sesión se mantienen accesibles sin competir con la navegación operativa.

### 5.4 Clientes

Jerarquía principal:

1. Búsqueda y alta.
2. Listado paginado y estado.
3. Ficha del cliente.
4. Acciones contextuales: modificar, estado, contraseña y reserva en su nombre.

Iniciar una reserva desde la ficha conserva al cliente preseleccionado.

La raíz del área presenta, por este orden, título y alta, búsqueda explícita por apellidos, resumen de resultados, tabla de escritorio y paginación fija de 20 clientes. La tabla identifica mediante apellidos y nombre y muestra teléfono, nombre de usuario y estado. La identificación principal enlaza a la ficha; la fila no es completamente clicable.

La búsqueda aplicada y la página pueden conservarse en URL y se recuperan al regresar desde una ficha. Los textos visibles permanecen en castellano; las rutas y parámetros internos usan términos en inglés. Estado, credenciales y reservas parten de la ficha identificada. El desarrollo normativo se encuentra en `flows/reception-clients.md`.

Pantallas definidas:

- Listado y búsqueda.
- Alta.
- Ficha y modificación.
- Gestión de fotografía.
- Cambio de estado.
- Restablecimiento de contraseña.
- Reserva grupal o privada en nombre del cliente.

### 5.5 Calendario grupal

Jerarquía principal:

1. Título, acción de crear programación, semana y navegación temporal.
2. Lista única de lunes a domingo, incluidos los días vacíos.
3. Sesiones ordenadas por hora con disciplina, monitor, sala, ocupación y estado.
4. Detalle de sesión y reservas vigentes.
5. Detalle y acciones diferenciadas de la programación de origen.

Pantallas preliminares:

- Calendario semanal.
- Detalle de sesión y reservas.
- Alta y modificación de programación.
- Reserva en nombre de cliente.
- Confirmación de cancelación de reserva o sesión.
- Resultado y estado de notificaciones.
- Eliminación controlada de programación.

El área utiliza una única lista semanal administrativa; no incorpora cuadrícula, selector de presentación ni parámetro de vista. La semana se conserva como lunes canónico mediante `week=YYYY-MM-DD`. Una ocurrencia calculada o materializada se identifica de forma estable mediante la programación de origen y su fecha local, por ejemplo `/group-calendar/schedules/{scheduleId}/sessions/{occurrenceDate}`. El desarrollo normativo se encuentra en `flows/reception-group-calendar.md`.

### 5.6 Agenda privada

Jerarquía principal:

1. Semana y navegación temporal.
2. Acciones diferenciadas para sesión privada y bloqueo.
3. Vista conjunta de sesiones y bloqueos.
4. Detalle y acciones permitidas.

Pantallas preliminares:

- Agenda semanal privada.
- Detalle de sesión.
- Detalle de bloqueo.
- Creación de sesión en nombre de cliente.
- Creación de bloqueo.
- Confirmación de cancelación.
- Resultado y estado de notificación.

Las sesiones y bloqueos no muestran una acción de edición directa cuando la feature exige cancelar y crear de nuevo.

### 5.7 Monitores

Jerarquía principal:

1. Título, búsqueda, filtro y alta.
2. Listado paginado ordenado por apellidos y nombre, con disciplinas y estado.
3. Ficha del monitor.
4. Datos operativos, disciplinas, credenciales y estado.

La tabla prioriza identificación y estado. La ficha concentra modificación, disciplinas, credenciales, desactivación, reactivación y restablecimiento. El backoffice no incluye configuración granular de permisos ni elimina monitores físicamente.

Pantallas preliminares:

- Listado, búsqueda y filtro.
- Alta de monitor.
- Ficha y modificación.
- Gestión de disciplinas.
- Cambio de estado.
- Restablecimiento de contraseña.

## 6. Patrones transversales de navegación

### Estructura de escritorio aprobada

El backoffice utiliza un enlace de salto, cabecera persistente, navegación lateral persistente y contenido principal flexible. La cabecera contiene identidad de AltaGym, `Cuenta` y la acción textual `Cerrar sesión`. La navegación contiene `Inicio`, `Clientes`, `Calendario grupal`, `Agenda privada` y `Monitores`; `Inicio` representa la portada y no una quinta área operativa.

En ventanas estrechas la navegación puede compactarse o plegarse y el contenido puede usar desplazamiento controlado. Esto no convierte el backoffice en una experiencia móvil soportada ni adopta la barra inferior del cliente o del monitor.

### Migas de pan y jerarquía

La portada no necesita migas de pan. Listados subordinados, detalles, altas, modificaciones, confirmaciones y resultados muestran una jerarquía de área, contexto y recurso. Las migas no reproducen todo el historial y no sustituyen ni la navegación principal ni la acción contextual de regreso.

### Cuenta

`Cuenta` es una página de utilidad accesible desde la cabecera, separada de la gestión de cuentas de clientes, monitores o personal. No constituye una quinta área. El nombre del usuario autenticado no es obligatorio hasta que se defina una fuente funcional autorizada para la identidad del personal.

### Contexto representable

Búsqueda, filtros aprobados, orden, página, semana y recurso se representan en URL cuando deban sobrevivir a una recarga. Contraseñas, datos personales introducidos, notas internas, borradores y mutaciones pendientes no se representan en URL. Cerrar sesión, cambiar de usuario o perder autorización descarta todo contexto privado.

Calendario grupal utiliza `/group-calendar?week=YYYY-MM-DD`. Agenda privada utiliza `/private-agenda?week=YYYY-MM-DD`; ambos parámetros contienen el lunes canónico. Agenda privada identifica sesiones mediante `/private-agenda/private-sessions/{sessionId}` y bloqueos mediante `/private-agenda/monitor-blocks/{blockId}`, con subrutas `new`, `cancel` y `notifications` cuando proceda. Una URL directa a un recurso autorizado ofrece regreso seguro a la raíz del área y no fabrica un origen.

### Detalle antes de acción sensible

Las cancelaciones y desactivaciones parten de un elemento identificado, muestran las consecuencias y exigen confirmación.

La confirmación se presenta como página completa para cancelaciones, desactivaciones, restablecimientos de contraseña y eliminaciones controladas. Cerrar sesión y una reactivación idempotente sin consecuencias adicionales no requieren confirmación.

### Resultado con continuidad

Después de una operación, la interfaz confirma qué cambió y ofrece volver al contexto actualizado. No crea páginas de éxito sin salida.

### Estado conservado

Filtros, búsqueda, semana y entidad seleccionada se conservan cuando ayudan a continuar, salvo que los datos hayan dejado de ser válidos.

### Acceso directo protegido

Una URL directa puede abrir un detalle autorizado, pero nunca evita las comprobaciones de rol, ámbito o estado.

## 7. Inventario transversal de estados

Todos los diseños deben considerar, según proceda:

- carga inicial y operación en curso;
- lista o agenda vacía;
- búsqueda sin resultados;
- validación de campo;
- confirmación y éxito;
- conflicto funcional;
- información obsoleta o concurrencia;
- error temporal con reintento seguro;
- sesión caducada o invalidada;
- pérdida de permisos;
- estado vigente, pasado o cancelado;
- condición de aforo completo;
- resultado pendiente, enviado o fallido de una notificación.

Las definiciones y transiciones pertenecen a sus fuentes funcionales; este inventario solo exige que la interfaz pueda representarlas.

## 8. Wireframes futuros

Los wireframes definitivos se almacenarán en `wireframes/` dentro de este directorio y enlazarán la feature representada. Toda hipótesis nueva deberá marcarse como pendiente y no se considerará aprobada por aparecer dibujada.
