# AltaGym — Flujos de usuario

**Estado:** UX 1.0 congelado
**Última actualización:** 23 de julio de 2026

## 1. Propósito y alcance

Este documento organiza los flujos UX del MVP y establece una convención común para describirlos. La documentación UX 1.0 cubre el área móvil del cliente, la experiencia móvil de solo lectura del monitor y la estructura común de escritorio de recepción y administración. Los recorridos detallados se encuentran en `flows/authentication.md`, `flows/client-bookings.md`, `flows/group-booking.md`, `flows/private-session-booking.md`, `flows/monitor-agenda.md`, `flows/reception-backoffice.md`, `flows/reception-clients.md`, `flows/reception-group-calendar.md`, `flows/reception-private-agenda.md` y `flows/monitors.md`.

No redefine permisos, ventanas, estados ni transiciones. Sus fuentes funcionales son `../ROLES_AND_PERMISSIONS.md`, `../BUSINESS_RULES.md`, `../DATA_MODEL.md` y `../features/`.

## 2. Convención documental

Cada flujo detallado identifica:

- objetivo, actor, entrada y precondiciones;
- recorrido principal, decisiones y bifurcaciones;
- estados alternativos, errores y recuperación;
- información visible, acciones y resultado;
- requisitos de origen;
- consecuencias UX derivadas;
- recomendaciones y decisiones pendientes.

Dentro de cada flujo se mantiene esta separación:

- **Requisito funcional:** comportamiento obligatorio definido en una fuente funcional.
- **Consecuencia UX derivada:** tratamiento necesario para representar correctamente el requisito.
- **Decisión UX aprobada:** elección de interacción aprobada para AltaGym.
- **Recomendación:** orientación que no cambia reglas funcionales ni constituye por sí misma un requisito.

## 3. Mapa del cliente

```text
Inicio de sesión
  ├─ acceso correcto → Mis reservas
  ├─ URL interna válida → destino solicitado
  └─ rechazo o error → recuperación en inicio de sesión

Mis reservas
  ├─ Cuenta → cambiar contraseña o cerrar sesión
  ├─ Reservar clase grupal → disciplina → clases → detalle → confirmación → resultado → Mis reservas
  ├─ Reservar sesión privada → fecha y hora → monitor → revisión → confirmación → resultado → Mis reservas
  └─ Reserva → detalle → confirmar cancelación → resultado → Mis reservas
```

`Mis reservas` y `Cuenta` son los únicos destinos de la navegación principal. Los recorridos de creación y los detalles son rutas contextuales, no nuevas secciones principales.

## 4. Flujos incluidos

| Flujo | Actor | Entrada habitual | Resultado |
| --- | --- | --- | --- |
| Inicio de sesión | Cliente | URL pública o redirección | Sesión válida y destino autorizado |
| Sesión terminada | Cliente | Petición protegida | Nuevo inicio de sesión |
| Acceso directo protegido | Cliente | URL interna | Destino autorizado o `Mis reservas` |
| Cierre de sesión | Cliente | Cualquier pantalla autenticada | Sesión actual invalidada |
| Cambio de contraseña | Cliente | `Cuenta` | Todas las sesiones invalidadas |
| Consultar próximas reservas | Cliente | `Mis reservas` | Lista conjunta o estado vacío |
| Consultar detalle | Cliente | Elemento de la lista o URL válida | Reserva identificada y acciones vigentes |
| Cancelar reserva | Cliente | Detalle cancelable | Cancelación confirmada y lista actualizada |
| Consultar clases grupales | Cliente | `Reservar clase grupal` | Sesiones de una disciplina agrupadas por fecha |
| Consultar detalle grupal | Cliente | Clase de la consulta o URL válida | Estado y disponibilidad actualizados |
| Reservar clase grupal | Cliente | Detalle reservable | Reserva vigente o recuperación explicada |
| Consultar fecha y hora privada | Cliente | `Reservar sesión privada` | Bloque potencialmente reservable |
| Consultar monitores disponibles | Cliente | Fecha y hora elegidas | Monitor disponible seleccionado |
| Revisar sesión privada | Cliente | Monitor seleccionado | Selección completa y actualizada |
| Reservar sesión privada | Cliente | Confirmación privada | Sesión confirmada o recuperación explicada |
| Entrar en el área del monitor | Monitor | Autenticación o URL protegida | Semana actual o recurso propio autorizado |
| Consultar agenda semanal | Monitor | `Mi agenda` | Siete días con actividades propias o estado vacío |
| Navegar entre semanas | Monitor | Controles semanales | Semana anterior, siguiente o actual |
| Consultar clase grupal | Monitor | Actividad propia o URL válida | Datos permitidos sin identidades de clientes |
| Consultar sesión privada | Monitor | Actividad propia o URL válida | Datos permitidos e identificación del cliente |
| Consultar bloqueo | Monitor | Actividad propia o URL válida | Intervalo propio sin nota interna |
| Consultar perfil | Monitor | `Mi perfil` | Nombre y disciplinas asignadas |
| Cambiar contraseña | Monitor | `Mi perfil` | Sesiones invalidadas y nuevo inicio de sesión |
| Gestionar monitores | Recepción o administración | `Monitores` | Listado, ficha, alta, modificación, estado y credenciales actualizados |

## 4.1 Mapa del monitor

```text
Inicio de sesión
  ├─ acceso correcto → Mi agenda, semana actual
  ├─ URL interna propia válida → destino solicitado
  └─ recurso inválido o no autorizado → Mi agenda

Mi agenda
  ├─ semana anterior / siguiente / actual
  ├─ clase grupal → detalle → regreso al origen
  ├─ sesión privada → detalle → regreso al origen
  ├─ bloqueo → detalle → regreso al origen
  └─ Mi perfil → disciplinas / cambiar contraseña / cerrar sesión
```

`Mi agenda` y `Mi perfil` son los únicos destinos principales. No existen acciones de gestión ni solicitudes de cambio.

## 5. Patrones transversales aprobados

### 5.1 Estructura móvil común

- Una columna con ancho limitado, centrada también en pantallas grandes.
- Cabecera sencilla con identidad de AltaGym y acción textual permanente `Cerrar sesión`.
- Barra inferior persistente adaptada al rol: `Mis reservas` y `Cuenta` para cliente; `Mi agenda` y `Mi perfil` para monitor.
- Estado activo comunicado semánticamente y sin depender solo del color.
- Sin tablas, paneles laterales ni variante de escritorio para cliente o monitor.

La anchura, espaciado, tipografía, colores e iconografía concretos pertenecen a iteraciones posteriores.

### 5.2 Estado y recuperación

- La carga inicial mantiene estable la estructura de la pantalla.
- Un estado vacío no se presenta como error y conserva las acciones útiles.
- Un error temporal explica que la operación no se completó y ofrece reintento seguro.
- Una confirmación evita dobles envíos y vuelve a validar sesión, permisos y estado.
- La información obsoleta se sustituye por el estado actual antes de ofrecer la siguiente acción.
- Un resultado correcto identifica qué cambió y devuelve a un contexto actualizado.

### 5.3 Conservación del contexto

- Al regresar de un detalle durante la misma navegación se conserva la posición de `Mis reservas` cuando sigue siendo útil.
- No se conserva después de cerrar sesión, de una recarga completa o cuando la lista cambia sustancialmente.
- Una URL solicitada antes de autenticarse se recupera solo si pertenece al área del cliente, continúa siendo válida y el cliente está autorizado.

### 5.4 Actualización sin tiempo real

Las reservas se actualizan al entrar, recargar, completar una operación y volver a enfocar la aplicación. No se introduce sondeo periódico ni actualización en tiempo real. Una reserva que deja de ser futura permanece estable mientras se lee y se retira en la siguiente actualización válida.

La agenda del monitor se actualiza al entrar, recargar y volver a enfocar. Durante la actualización conserva la estructura y los datos anteriores identificados como no actualizados hasta sustituirlos de forma coherente. No mueve el foco salvo que el elemento deje de existir o de ser accesible.

### 5.5 Disponibilidad y confirmación

- La disponibilidad mostrada al consultar es orientativa.
- Antes de confirmar se sustituyen los datos obsoletos por el estado actual.
- La confirmación autoritativa revalida sesión, permisos, estado, ventana, aforo, duplicados y conflictos.
- Un resultado técnico ambiguo se reconcilia antes de comunicar éxito o permitir un reintento.
- Los reintentos de una misma confirmación son idempotentes y no crean duplicados.
- En selecciones progresivas, cambiar fecha invalida hora y recursos; cambiar hora invalida los recursos y resúmenes dependientes.
- Un cambio concurrente devuelve al paso mínimo afectado y conserva las selecciones anteriores que continúan siendo válidas.

## 5.6 Mapa del backoffice

```text
Inicio de sesión
  ├─ acceso normal → Portada
  ├─ URL interna válida → área o recurso autorizado
  └─ rechazo, sesión perdida o cuenta inactiva → inicio de sesión o salida segura
Portada
  ├─ Clientes → buscar o paginar → ficha → alta, modificación, estado, contraseña o reserva → resultado → ficha actualizada
  ├─ Calendario grupal → lista semanal → sesión o programación → operación → resultado → contexto actualizado
  ├─ Agenda privada → semana → sesión o bloqueo → operación → resultado → semana actualizada
  └─ Monitores → búsqueda, filtro, ficha, alta o modificación → resultado → contexto actualizado
Cabecera
  ├─ Cuenta → cambiar contraseña → invalidar sesiones → inicio de sesión
  └─ Cerrar sesión → descartar contexto → inicio de sesión
```

`Inicio` es la portada, no una quinta área operativa. Las cuatro áreas permanecen en una navegación lateral persistente; `Cuenta` y `Cerrar sesión` son utilidades de cabecera.

## 5.7 Patrones administrativos aprobados

- El backoffice utiliza cabecera, navegación lateral, contenido principal flexible y migas de pan en rutas jerárquicas.
- La portada es estructural, sin estadísticas, métricas, actividad reciente ni carga remota ordinaria.
- Los listados usan tablas de escritorio; la paginación y los filtros solo aparecen si su feature los exige.
- Calendario grupal usa una única lista semanal por día; Agenda privada usa una única lista semanal por día y monitor. Ambas conservan la semana en URL y carecen de selector de presentación.
- Búsqueda, filtros aprobados, orden, página, semana y recurso se conservan en URL; nunca contraseñas, datos personales introducidos, notas internas, borradores o mutaciones.
- Atrás utiliza el historial real y restaura el contexto válido. Una URL directa vuelve de forma segura a la raíz del área.
- Los formularios advierten antes de abandonar cambios y no restauran borradores después de cambiar de identidad o autorización.
- Las operaciones sensibles utilizan una página completa de confirmación; cerrar sesión y las reactivaciones idempotentes no necesitan confirmación adicional.
- El resultado identifica qué cambió y conduce a un detalle, listado o semana actualizados.
- Recuperar el foco actualiza sin sondeo; los datos anteriores se identifican como no actualizados hasta sustituirlos coherentemente.

El desarrollo común se encuentra en `flows/reception-backoffice.md`. Clientes, Calendario grupal, Agenda privada y Monitores se desarrollan en sus flujos específicos.

Clientes se desarrolla en `flows/reception-clients.md`: búsqueda explícita parcial por apellidos, tabla paginada de 20 registros, ficha identificada, alta, modificación, fotografía, desactivación, reactivación, restablecimiento y reservas grupales o privadas con cliente preseleccionado. La interfaz visible usa castellano y las rutas y parámetros internos usan inglés.

Calendario grupal se desarrolla en `flows/reception-group-calendar.md`: una única lista semanal de lunes a domingo, identidad estable de ocurrencia mediante programación y fecha, detalles separados de sesión y programación, creación, revisión futura, eliminación lógica controlada, reservas en nombre de clientes, cancelaciones y resultados SMS. Las reservas no se modifican: se crean o cancelan.

Agenda privada se desarrolla en `flows/reception-private-agenda.md`: una única lista semanal agrupada por día y monitor, sesiones privadas y bloqueos conjuntos, creación progresiva en nombre de clientes, bloqueos AltaGym, detalles, cancelaciones y resultados SMS. Las sesiones y bloqueos no se modifican ni reactivan.

## 5.8 Flujos de Clientes del backoffice

| Flujo | Entrada | Resultado |
| --- | --- | --- |
| Listar, buscar y paginar | Navegación `Clientes` | Ficha o listado actualizado |
| Crear cliente | `Alta de cliente` | Cliente activo y ficha creada |
| Consultar ficha | Enlace, resultado o URL protegida | Datos y acciones vigentes |
| Modificar cliente | Ficha o acción explícita | Ficha actualizada sin sobrescritura silenciosa |
| Desactivar | Ficha activa y confirmación | Cliente inactivo, ficha y reservas conservadas |
| Reactivar | Ficha inactiva | Cliente activo sin modificar reservas |
| Restablecer contraseña | Ficha y confirmación | Credencial sustituida y sesiones invalidadas |
| Reservar en su nombre | Ficha activa | Reserva reconciliada y regreso a la ficha |

La búsqueda aplicada, página y entidad pueden conservarse en URL. Datos personales introducidos, fotografías, contraseñas, borradores y mutaciones pendientes nunca se incluyen. Las operaciones revalidan autoritativamente y detienen el envío si los datos están obsoletos.

## 5.9 Flujos de Calendario grupal del backoffice

| Flujo | Entrada | Resultado |
| --- | --- | --- |
| Consultar y navegar la semana | Navegación, portada o URL | Siete días y sesiones actuales |
| Consultar sesión | Lista, resultado o URL | Sesión y reservas vigentes |
| Consultar programación | Sesión, resultado o URL | Recurrencia y acciones vigentes |
| Crear programación | Calendario grupal | Programación creada y semana actualizada |
| Modificar programación | Programación identificada | Revisión futura sin alterar sesiones protegidas |
| Eliminar programación | Programación sin reservas futuras vigentes | Eliminación lógica y calendario actualizado |
| Reservar para cliente | Sesión o ficha activa | Reserva creada y origen actualizado |
| Cancelar reserva | Reserva vigente identificada | Reserva cancelada por el gimnasio y ocupación actualizada |
| Cancelar sesión | Sesión vigente identificada | Sesión y reservas canceladas; SMS opcionales |
| Consultar notificaciones | Sesión cancelada | Resumen y resultados por destinatario |

## 5.10 Flujos de Agenda privada del backoffice

| Flujo | Entrada | Resultado |
| --- | --- | --- |
| Consultar y navegar la semana | Navegación, portada o URL | Siete días agrupados por monitor |
| Consultar sesión privada | Agenda, resultado, ficha o URL | Estado, cliente, monitor y acciones vigentes |
| Crear sesión para cliente | Agenda privada o ficha activa | Sesión reconciliada y origen actualizado |
| Consultar bloqueo | Agenda, resultado o URL | Intervalo, monitor, nota interna y estado |
| Crear bloqueo AltaGym | Agenda privada | Bloqueo reconciliado y semana actualizada |
| Cancelar sesión privada | Sesión confirmada identificada | Sesión cancelada y SMS opcional |
| Cancelar bloqueo | Bloqueo vigente identificado | Bloqueo cancelado y disponibilidad liberada |
| Consultar notificación | Sesión privada cancelada | Estado pendiente, enviado o fallido |

La agenda conserva `week=YYYY-MM-DD` con el lunes canónico. La creación privada selecciona cliente → fecha → hora → monitor; desde una ficha el cliente permanece fijo y el regreso principal es esa ficha. La selección excluye clientes inactivos y AltaGym. Las actividades canceladas permanecen en su posición histórica y no ocupan disponibilidad.

## 5.11 Flujos de Monitores del backoffice

| Flujo | Entrada | Resultado |
| --- | --- | --- |
| Listar, buscar y filtrar | Navegación `Monitores` | Ficha o listado actualizado |
| Crear monitor | `Alta de monitor` | Monitor activo y ficha creada |
| Consultar ficha | Enlace, resultado o URL protegida | Datos y acciones vigentes |
| Modificar monitor | Ficha o acción explícita | Ficha actualizada sin sobrescritura silenciosa |
| Gestionar disciplinas | Ficha o modificación | Disciplinas actualizadas y validadas |
| Desactivar | Ficha activa y confirmación | Monitor inactivo, ficha y asignaciones conservadas |
| Reactivar | Ficha inactiva | Monitor activo sin modificar historial |
| Restablecer contraseña | Ficha y confirmación | Credencial sustituida y sesiones invalidadas |

La búsqueda aplicada, el filtro y la página pueden conservarse en URL. Los datos personales introducidos, contraseñas, borradores y mutaciones pendientes nunca se incluyen. Las operaciones revalidan autoritativamente y detienen el envío si los datos están obsoletos.

## 6. Accesibilidad transversal

- Todas las acciones son operables con teclado.
- La página dispone de enlace de salto al contenido principal.
- Cabecera, navegación y contenido usan regiones semánticas.
- Cada pantalla tiene un encabezado principal y un orden de foco equivalente al orden visual.
- Tras navegar, el foco se sitúa en el inicio lógico del nuevo contenido.
- Los errores se asocian a sus campos; cuando hay varios, un resumen recibe el foco.
- Los cambios relevantes y los resultados se anuncian a tecnologías de asistencia.
- Los enlaces a detalles tienen un nombre accesible específico para la reserva.
- Ningún estado o tipo se comunica únicamente mediante color, posición o icono.

El cumplimiento se verificará según WCAG 2.2 AA mediante herramientas automáticas y pruebas manuales de teclado, foco, ampliación y lector de pantalla.

## 7. Trazabilidad

| Área UX | Fuente principal |
| --- | --- |
| Inicio, cierre, bloqueo y sesión | `../features/authentication.md` |
| Permisos del cliente | `../ROLES_AND_PERMISSIONS.md` |
| Ventana de cancelación | `../BUSINESS_RULES.md` |
| Reservas grupales | `../features/group-classes.md` |
| Sesiones privadas | `../features/private-sessions.md` |
| Navegación y dispositivo | `NAVIGATION_AND_INFORMATION_STRUCTURE.md` |
| Accesibilidad y recuperación | `UX_PRINCIPLES.md` |
| Agenda y perfil del monitor | `../features/monitor-agenda.md`; `flows/monitor-agenda.md` |
| Backoffice común | `../features/reception-backoffice.md`; `flows/reception-backoffice.md` |
| Clientes del backoffice | `../features/clients.md`; `../features/authentication.md`; `flows/reception-clients.md` |
| Calendario grupal del backoffice | `../features/group-classes.md`; `../features/notifications.md`; `flows/reception-group-calendar.md` |
| Agenda privada del backoffice | `../features/private-sessions.md`; `../features/notifications.md`; `flows/reception-private-agenda.md` |
| Monitores del backoffice | `../features/monitors.md`; `flows/monitors.md` |

## 8. Pendientes

- Verificar técnicamente si el cambio voluntario de contraseña se presenta dentro de AltaGym o mediante una experiencia alojada por Auth0.
- Confirmar durante la implementación el nombre físico de la instantánea de reservas vigentes al cancelar; la identidad UX de la ocurrencia ya usa programación y fecha.
- Aclarar la ubicación funcional de gestión general de personal, configuración, salas, disciplinas y aforos sin crear una quinta área.
- Definir en iteraciones posteriores el sistema de contenido, el sistema visual y los componentes definitivos.


