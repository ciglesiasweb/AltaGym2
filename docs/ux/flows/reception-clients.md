# Flujo UX — Gestión de clientes en recepción

**Estado:** UX 1.0 congelado
**Ámbito:** backoffice de escritorio para el rol funcional `RECEPTION`

## 1. Propósito, alcance y fuentes

Este documento define la entrada, consulta y gestión de Clientes por recepción y administración. Ambos nombres corresponden al mismo perfil funcional, con el mismo rol fijo y exactamente los mismos permisos.

Las reglas proceden principalmente de `features/clients.md`, `features/authentication.md`, `features/reception-backoffice.md`, `features/group-classes.md`, `features/private-sessions.md`, `BUSINESS_RULES.md`, `ROLES_AND_PERMISSIONS.md` y de los patrones de `ux/flows/reception-backoffice.md`. Los flujos de reserva reutilizan `group-booking.md` y `private-session-booking.md` sin alterar sus reglas.

Quedan fuera la eliminación definitiva, pagos, membresías, facturación, nuevos campos, recuperación automática de contraseñas, filtros adicionales, calendarios administrativos completos, sistema visual, wireframes y experiencia móvil completa del backoffice.

## 2. Separación normativa

### 2.1 Requisitos funcionales existentes

- Recepción y administración pueden consultar, crear, modificar, desactivar y reactivar clientes y restablecer sus contraseñas.
- El listado contiene 20 clientes por página, ordenados por apellidos y nombre, y permite coincidencias parciales en apellidos sobre el conjunto completo.
- La búsqueda elimina espacios exteriores y no distingue mayúsculas, minúsculas ni, por decisión aprobada, acentos o diacríticos equivalentes.
- Los clientes inactivos permanecen visibles. No pueden iniciar sesión ni crear nuevas reservas.
- Los campos, validaciones, fotografía y credenciales son exclusivamente los definidos por las features.
- Un cliente nuevo queda activo. Los clientes no se eliminan definitivamente.
- Desactivar conserva ficha y reservas e invalida las sesiones. Reactivar conserva credenciales y reservas.
- `AltaGym` es un cliente del sistema inmutable: no puede modificarse, desactivarse, recibir un restablecimiento de contraseña ni utilizarse para crear reservas.
- Una reserva iniciada desde una ficha conserva al cliente preseleccionado y aplica las mismas ventanas, aforo, disponibilidad, duplicados y conflictos. Para una sesión privada, `reception-private-agenda.md` mantiene el cliente fijo y continúa por fecha, hora y monitor.

### 2.2 Consecuencias UX derivadas

- Consulta, modificación, estado y credenciales son contextos separados.
- Las operaciones sensibles parten de una ficha identificada, se revalidan y no sobrescriben cambios concurrentes.
- Contraseñas, datos personales introducidos, archivos, borradores y mutaciones no se representan en URL.
- La ficha y los flujos de reserva mantienen visible para quién se actúa.
- Una mutación no puede confirmarse con datos marcados como obsoletos.
- El resultado se reconcilia con el estado autoritativo antes de comunicar éxito o permitir un reenvío.

### 2.3 Decisiones UX aprobadas

- La interfaz está en castellano; rutas y parámetros internos usan términos en inglés.
- La búsqueda se aplica mediante envío explícito y nunca cambia resultados mientras se escribe.
- La tabla usa las columnas `Cliente`, `Teléfono`, `Nombre de usuario`, `Estado` y `Acciones`.
- La identificación principal enlaza a la ficha; la fila no es completamente clicable.
- La fila permite abrir la ficha y modificar. Estado, contraseña y reservas se reservan para la ficha.
- La paginación usa `Anterior`, números próximos, `Siguiente`, página actual y resumen de resultados.
- La fotografía seleccionada puede mostrar vista previa local sin recorte, cámara ni edición.
- Reactivar no requiere confirmación adicional; desactivar y restablecer contraseña sí.
- Tras una reserva correcta, la continuidad principal vuelve a la ficha y permite abrir el contexto creado.

## 3. Actor, precondiciones y autorización

**Actor:** miembro de recepción o administración con rol fijo `RECEPTION`.  
**Dispositivo:** escritorio o portátil.  
**Precondiciones:** sesión válida, cuenta activa, rol autorizado, parámetros válidos y recurso accesible.

La entrada normal se produce desde la portada o la navegación principal `Clientes`. Una URL interna valida primero autenticación, cuenta, rol, ámbito y recurso. Si falta sesión, se autentica y solo se recupera el destino si continúa siendo seguro. Una respuesta neutra evita distinguir recurso inexistente de recurso no autorizado cuando hacerlo revelaría información. Una ruta inválida ofrece `Volver a Clientes` o `Volver al inicio`.

Si la sesión o cuenta del operador se invalida, se detienen las mutaciones, se descartan borradores y credenciales y se aplica el flujo de autenticación. `Cerrar sesión` permanece disponible desde toda pantalla autenticada.

## 4. Modelo de navegación y URL

La raíz conceptual es `/clients`. Ejemplos no vinculantes de rutas:

- `/clients/new`;
- `/clients/{clientId}`;
- `/clients/{clientId}/edit`;
- `/clients/{clientId}/deactivate`;
- `/clients/{clientId}/reset-password`;
- `/clients/{clientId}/group-bookings/new`;
- `/clients/{clientId}/private-bookings/new`.

Los nombres visibles permanecen en castellano. La URL puede conservar `search`, `page`, la identidad interna y un retorno interno validado. El identificador no se sustituye por nombre, teléfono o usuario.

`Atrás` usa el historial real. Volver desde una ficha conserva búsqueda y página si siguen siendo válidas. Una URL directa no fabrica origen y ofrece regreso a `/clients`. Recargar reconstruye el contexto seguro y revalida; cerrar sesión, cambiar de usuario o perder autorización lo descarta.

## 5. Flujo — Listar, buscar y paginar

**Objetivo:** localizar un cliente y abrir su ficha.  
**Actor:** recepción o administración.  
**Entrada:** portada, navegación `Clientes`, regreso de una ficha o URL protegida.  
**Precondiciones:** autorización válida.

### Recorrido principal

1. El sistema abre `Clientes`, actualiza el listado y enfoca su título.
2. Presenta `Alta de cliente`, búsqueda, resumen, tabla y paginación.
3. Ordena por apellidos y nombre. Un criterio interno estable desempata identidades iguales sin convertirse en orden visible.
4. La persona puede enviar `Buscar por apellidos`, cambiar página o abrir el enlace de detalle.
5. Al regresar, se reconstruyen término, página y foco mientras sigan siendo válidos.

### Información y acciones

- `Cliente`: apellidos y nombre, como identificación y enlace.
- `Teléfono`.
- `Nombre de usuario`.
- `Estado`: texto `Activo` o `Inactivo`.
- `Acciones`: `Ver ficha` y `Modificar`, con nombre accesible contextual.

No se añaden fecha de nacimiento, fotografía, reservas, correo, membresía, fecha de alta ni último acceso.

### Búsqueda

- Etiqueta visible `Buscar por apellidos`, campo, `Buscar` y, cuando proceda, `Limpiar búsqueda`.
- El texto aún no enviado no altera resultados ni URL.
- Al enviar, se eliminan espacios exteriores, se ignoran mayúsculas y diacríticos equivalentes y se buscan coincidencias parciales solo en apellidos.
- Un término nuevo vuelve a la primera página. Limpiar abre el conjunto completo en la primera página.
- Un error temporal conserva el término aplicado y ofrece `Reintentar` sin convertirlo en cero resultados.

### Paginación

- Siempre 20 por página; no existe selector de tamaño.
- `Anterior`, números próximos y `Siguiente` se agrupan en una navegación identificada.
- Se comunica `Página X de Y` y, cuando el total esté disponible, el intervalo y total.
- Los controles imposibles están deshabilitados semánticamente.
- Cambiar página enfoca el resumen o encabezado del listado y anuncia el nuevo conjunto.
- Si la página queda vacía por un cambio, se abre la última disponible y se anuncia el ajuste.

### Estados alternativos y recuperación

- **Carga:** estructura estable y anuncio, sin declarar vacío.
- **Vacío real:** explica que no existen clientes y conserva `Alta de cliente`.
- **Sin resultados:** conserva el término y permite limpiarlo.
- **Error:** ofrece reintento y mantiene contexto seguro.
- **Datos anteriores:** se marcan `Datos no actualizados` hasta su sustitución coherente.
- **Fila cambiada o retirada:** se revalida, actualiza la tabla y mueve el foco al contexto estable más próximo.

**Resultado:** ficha abierta o listado actualizado.  
**Origen:** CLI-02, BO-01, CA-CLI-02, CA-BO-02.  
**Pendientes:** ninguno de interacción; la implementación concreta el desempate técnico estable.

## 6. Flujo — Alta de cliente

**Objetivo:** crear un cliente activo con credenciales iniciales.  
**Entrada:** `Alta de cliente` en la raíz del área.  
**Precondiciones:** autorización vigente.

### Recorrido principal

1. Se abre una página completa con migas `Clientes / Alta de cliente`.
2. El formulario agrupa `Datos personales`, `Fotografía` y `Credenciales iniciales`.
3. Se introducen nombre, apellidos, teléfono, nombre de usuario, contraseña y confirmación; fecha de nacimiento y fotografía son opcionales.
4. Se valida en cliente únicamente para ayudar y de forma autoritativa al enviar.
5. Un único envío crea el cliente activo.
6. El resultado identifica al cliente y ofrece `Ver ficha` como continuidad principal y `Volver a Clientes`.

### Validación y errores

Las etiquetas, ayudas, obligatoriedad, errores de campo y resumen son accesibles. Un error mantiene valores válidos, salvo secretos que resulte inseguro conservar. El nombre de usuario ocupado se asocia al campo. Contraseña y confirmación se comparan exactamente, no se transforman ni se registran. La fotografía se valida por contenido real, JPEG o PNG, hasta 5 MB inclusive.

Los intentos repetidos usan una operación idempotente o clave equivalente. Un resultado técnico ambiguo consulta si el cliente fue creado antes de habilitar otro envío.

### Abandono

Con cambios, navegar, usar Atrás, cerrar o cambiar de área solicita confirmación de abandono. Cerrar sesión, cambiar de usuario, perder autorización o autenticarse de nuevo descarta el borrador y las contraseñas.

**Información visible:** campos documentados, reglas de contraseña y que el cliente se creará activo.  
**Acciones:** `Crear cliente`, `Cancelar`, añadir o retirar fotografía seleccionada.  
**Resultado:** ficha creada, sin mostrar la contraseña.  
**Origen:** CLI-01, CA-CLI-01, AUTH-02, CA-AUTH-02.

## 7. Flujo — Consultar ficha

**Objetivo:** consultar identidad, datos, estado y acciones autorizadas.  
**Entrada:** enlace del listado, resultado, reserva o URL directa.  
**Precondiciones:** cliente existente y accesible.

La ficha jerarquiza identidad, estado, posible etiqueta `Cliente del sistema`, fotografía o `Sin fotografía`, datos personales, nombre de usuario y acciones. Nunca muestra contraseñas, hashes, sesiones, auditoría técnica ni campos no documentados.

Cliente activo ordinario: `Modificar`, `Desactivar`, `Restablecer contraseña`, `Reservar clase grupal` y `Reservar sesión privada`. Cliente inactivo: `Modificar`, `Reactivar` y `Restablecer contraseña`; se explica que no puede iniciar sesión ni reservar. `AltaGym` se identifica como `Cliente del sistema` y no ofrece acciones de modificación, estado, contraseña ni reserva.

Al recuperar el foco se actualiza. Si cambia, se sustituyen datos, se anuncia el cambio y se retiran acciones incompatibles. Si deja de ser accesible, se usa una salida neutra. Regresar conserva listado, término y página; desde URL directa vuelve a la raíz.

**Resultado:** consulta o entrada a una operación.  
**Origen:** CLI-02–CLI-06, BO-01–BO-04.

## 8. Flujo — Modificar cliente y fotografía

**Objetivo:** actualizar datos, nombre de usuario y fotografía sin modificar contraseña ni estado.  
**Entrada:** ficha o acción explícita de fila.  
**Precondiciones:** ficha actual y autorización vigente.

1. Se cargan los valores autoritativos actuales.
2. Se muestran los mismos datos personales del alta y el nombre de usuario; no aparecen contraseña ni confirmación.
3. La fotografía permite `Añadir`, `Sustituir` o `Eliminar` según su estado.
4. Una selección puede mostrar `Vista previa`, sin recorte, cámara, edición ni formatos adicionales.
5. Al guardar se revalidan campos, usuario único, archivo, permisos, estado y versión.
6. El resultado vuelve a la ficha actualizada.

Una fotografía existente usa texto alternativo con el nombre; la ausencia se comunica como `Sin fotografía`. Un error de archivo conserva el resto del formulario y no elimina la fotografía guardada. Un fallo temporal permite reintentar.

Si otra persona cambió cualquier dato o fotografía, no se sobrescribe. Se muestran los datos actuales, se explica el conflicto y se conservan de forma segura los valores introducidos para comparar y volver a aplicar; no existe fusión automática ni `Sobrescribir de todos modos`.

**Resultado:** ficha actualizada o recuperación de conflicto.  
**Origen:** CLI-03, CA-CLI-03, CA-BO-06.

## 9. Flujo — Desactivar cliente

**Objetivo:** impedir acceso y nuevas reservas conservando ficha e historial.  
**Entrada:** ficha activa identificada.  
**Precondiciones:** cliente ordinario activo y autorización vigente.

La página completa muestra nombre, usuario y estado y explica que se conservarán ficha y reservas, se invalidarán inmediatamente todas sus sesiones y no podrá iniciar sesión ni crear nuevas reservas. Acciones: `Desactivar cliente` y `Cancelar`.

Al confirmar se revalidan permisos, identidad, estado, versión y protección de `AltaGym`; se evita doble envío. Si ya está inactivo, se reconcilia de forma idempotente. Si cambió, se muestra el estado actual. Un resultado ambiguo se consulta antes de comunicar éxito.

**Resultado:** ficha actualizada en estado `Inactivo`.  
**Origen:** CLI-04, CA-CLI-04, reglas de autenticación.

## 10. Flujo — Reactivar cliente

**Objetivo:** permitir de nuevo el inicio de sesión con las credenciales vigentes.  
**Entrada:** ficha inactiva.  
**Precondiciones:** autorización vigente.

La acción no requiere confirmación adicional. Revalida permisos, identidad, estado y versión. No crea, recupera ni modifica reservas. Si ya estaba activo, se reconcilia sin efectos adicionales.

**Resultado:** misma ficha en estado `Activo`, con anuncio `Cliente reactivado` y acciones actuales.  
**Origen:** CLI-05, CA-CLI-04 y decisión transversal de reactivación idempotente.

## 11. Flujo — Restablecer contraseña

**Objetivo:** asignar presencialmente una contraseña nueva sin consultar la anterior.  
**Entrada:** exclusivamente desde la ficha.  
**Precondiciones:** autorización vigente y cliente accesible.

1. Una página separada solicita `Nueva contraseña` y `Confirmar nueva contraseña` y comunica las reglas.
2. Los errores corregibles conservan el contexto y enfocan el resumen.
3. Una página completa confirma cliente y consecuencia: todas sus sesiones se invalidarán.
4. Un único envío revalida permiso, identidad, estado y versión, actualiza la credencial y registra actor y fecha, nunca el valor.
5. Un resultado ambiguo se reconcilia antes de permitir reenvío.
6. El resultado vuelve a la ficha y no muestra, copia ni recupera la contraseña.

El restablecimiento puede realizarse sobre un cliente inactivo, pero no le permite iniciar sesión hasta reactivarlo. No existen correo, SMS, enlace de recuperación ni generación automática documentada.

**Resultado:** contraseña restablecida y sesiones invalidadas.  
**Origen:** CLI-06, CA-CLI-05, AUTH-04, CA-AUTH-05.

## 12. Flujo — Reservar en nombre del cliente

**Objetivo:** crear una reserva grupal o privada para el cliente de la ficha.  
**Entrada:** `Reservar clase grupal` o `Reservar sesión privada` en ficha activa ordinaria.  
**Precondiciones:** operador autorizado y cliente activo.

Durante todo el recorrido aparece `Reserva para: Apellidos, Nombre`. El cliente queda fijado y no se sustituye dentro del flujo. Su identidad interna puede viajar en URL; sus datos personales libres no.

### Grupal

Reutiliza consulta, detalle, revisión, confirmación, ventana, aforo, duplicados, conflictos y reconciliación de `group-booking.md`, adaptados a escritorio y al actor recepción. No usa `Mis reservas` ni navegación móvil.

### Privada

Reutiliza fecha y hora, consulta posterior de monitores, selección, revisión, confirmación, disponibilidad, ventana y conflictos de `private-session-booking.md`. No define la Agenda privada administrativa.

Antes de confirmar se revalidan operador, cliente activo, sesión o franja, ventana, aforo, monitor, duplicados y conflictos. Si el cliente se desactiva, no se crea nada, se actualiza el contexto y se ofrece volver a su ficha. Los envíos se protegen contra duplicados y los resultados ambiguos se reconcilian.

**Resultado:** reserva creada, con continuidad principal hacia la ficha actualizada y enlace al contexto de la reserva. `Atrás` conserva el cliente y el paso válido; abandonar con datos introducidos advierte.  
**Origen:** BO-04, CA-BO-02 y features grupal y privada.

## 13. Carga, actualización, concurrencia y sesión

- Se actualiza al entrar, recargar, completar operaciones y recuperar el foco; no existe tiempo real ni sondeo.
- Los datos anteriores pueden mantenerse marcados `Datos no actualizados`, pero se sustituyen coherentemente antes de permitir mutar.
- Los errores temporales conservan búsqueda, página y valores no secretos y ofrecen `Reintentar`.
- Cliente modificado, estado cambiado, usuario ocupado y fotografía cambiada se tratan como conflictos explícitos.
- Una cuenta del operador desactivada o una sesión invalidada detiene la operación, descarta borradores y credenciales y no permite recuperar mutaciones tras autenticarse.
- Una cuenta cliente desactivada durante una reserva impide confirmarla.

## 14. Accesibilidad

- Enlace `Saltar al contenido principal`, cabecera, navegación, principal y región de estado.
- Un único título principal, migas identificadas y `Clientes` activa sin depender del color.
- Tabla semántica con encabezados asociados; la identificación puede actuar como encabezado de fila.
- Enlaces y acciones con nombre contextual, por ejemplo `Modificar a Ana Pérez`.
- Búsqueda etiquetada, resumen anunciado y paginación dentro de una navegación con página actual semántica.
- Teclado completo, foco visible y gestión previsible al buscar, paginar, abrir, regresar, confirmar y fallar.
- Formularios con obligatoriedad textual, ayudas, errores asociados, resumen enlazado y conservación de valores válidos.
- Fotografía con alternativa útil; ausencia y vista previa comunicadas mediante texto.
- Carga, actualización, conflicto, cambio de estado y resultado se anuncian sin desplazar el foco innecesariamente.
- Contraste, ampliación, reflujo y objetivos de interacción se verifican conforme a WCAG 2.2 AA. El reflujo accesible no convierte el backoffice en la interfaz móvil de cliente o monitor.

## 15. Inventario resumido

| ID | Pantalla | Resultado principal |
| --- | --- | --- |
| BO-CLI-01 | Listado de clientes | Ficha o listado actualizado |
| BO-CLI-02 | Alta de cliente | Cliente activo creado |
| BO-CLI-03 | Resultado de alta | Ficha creada |
| BO-CLI-04 | Ficha del cliente | Consulta o acción identificada |
| BO-CLI-05 | Modificación | Datos y fotografía validados |
| BO-CLI-06 | Resultado de modificación | Ficha actualizada |
| BO-CLI-07 | Confirmación de desactivación | Mutación revisada |
| BO-CLI-08 | Resultado de estado | Ficha con estado actual |
| BO-CLI-09 | Nueva contraseña | Valores validados |
| BO-CLI-10 | Confirmación de restablecimiento | Consecuencias revisadas |
| BO-CLI-11 | Resultado de restablecimiento | Ficha sin contraseña visible |

Las reservas reutilizan las pantallas grupales y privadas existentes en contexto administrativo; no se duplican como pantallas funcionalmente distintas. En Calendario grupal, el resultado iniciado desde la ficha regresa principalmente a la ficha actualizada y enlaza la sesión mediante su programación y fecha, conforme a `reception-group-calendar.md`.

## 16. Relación y trazabilidad

El flujo reutiliza la estructura común del backoffice y sirve de patrón para `monitors.md`, sin trasladar automáticamente columnas, búsqueda, paginación o restricciones. Cliente y monitor mantienen sus experiencias móviles propias; recepción actúa como operador y no como beneficiario.



Calendario grupal y la selección general de clientes desde una sesión quedan definidos en `reception-group-calendar.md`. La Agenda privada completa queda documentada en `reception-private-agenda.md`; el sistema visual y los wireframes siguen su propia documentación.

No quedan decisiones funcionales pendientes sobre `AltaGym`: su ficha es exclusivamente consultiva y no ofrece acciones mutables.




