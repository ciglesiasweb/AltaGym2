# Flujo UX — Navegación del cliente y Mis reservas

**Estado:** UX 1.0 congelado
**Última actualización:** 15 de julio de 2026

## 1. Propósito y fuentes

Define la navegación móvil del cliente, la lista conjunta de próximas reservas, sus detalles y la cancelación. Sus fuentes funcionales son `../../features/group-classes.md`, `../../features/private-sessions.md`, `../../BUSINESS_RULES.md` y `../../ROLES_AND_PERMISSIONS.md`.

No introduce historial, reglas temporales, actualización en tiempo real ni canales de contacto.

## 2. Estructura y navegación común

### Requisitos y decisiones aprobadas

- El cliente utiliza una vista móvil única, incluso desde ordenador.
- La composición es de una columna, con ancho limitado y centrado en pantallas grandes.
- `Mis reservas` es el destino inicial.
- La navegación principal contiene únicamente `Mis reservas` y `Cuenta`.
- Una barra inferior persistente representa ambos destinos y comunica semánticamente cuál está activo.
- La cabecera mantiene visible la identidad de AltaGym y la acción textual `Cerrar sesión`.

El detalle y la confirmación son contextos subordinados. No se añaden como destinos principales.

## 3. Consultar Mis reservas

### Definición del flujo

- **Objetivo:** reconocer rápidamente la próxima actividad y acceder a nuevas reservas o a un detalle.
- **Actor:** cliente autenticado.
- **Entrada:** destino inicial, navegación principal o retorno desde un flujo.
- **Precondiciones:** sesión válida y cuenta con acceso al área del cliente.
- **Recorrido principal:** cargar las próximas reservas propias, mezclarlas cronológicamente y mostrar la lista.
- **Resultado:** lista conjunta o estado vacío accionable.

### Requisitos funcionales existentes

- Solo aparecen reservas grupales futuras `vigentes` y sesiones privadas futuras `confirmadas`.
- No aparecen reservas pasadas ni canceladas.
- El cliente solo consulta sus propias reservas.
- La lista se ordena cronológicamente.

### Consecuencias UX derivadas

- No existen pestañas por tipo ni un selector grupal/privada.
- No se introduce paginación, filtros ni `Cargar más` para el volumen previsto.
- Cada elemento identifica su tipo mediante texto, además de cualquier recurso visual futuro.
- Toda la lista usa un único orden ascendente por instante de inicio.
- Cuando hay varias reservas pueden agruparse ligeramente por fecha sin romper la cronología común.

### Información visible

**Clase grupal:** tipo, disciplina, fecha, hora, monitor y sala.  
**Sesión privada:** tipo, fecha, hora y monitor.  

La fecha y hora tienen la mayor jerarquía. Las disciplinas del monitor privado se omiten en esta lista porque la sesión no se reserva por disciplina.

### Acciones disponibles

- `Reservar clase grupal`.
- `Reservar sesión privada`.
- Abrir el detalle de cada reserva.

Las dos acciones de creación aparecen antes de la lista con igual jerarquía. En el estado vacío vuelven a ofrecerse dentro de su explicación.

## 4. Estados de Mis reservas

### Carga inicial

Se conserva la estructura de título, acciones y área de lista para evitar saltos. La carga se anuncia sin bloquear la navegación innecesariamente.

### Estado vacío

Informa de que no hay próximas reservas. No se presenta como error y mantiene los accesos a reserva grupal y privada.

### Error de carga

Indica que no ha sido posible cargar las reservas y ofrece `Reintentar`. No sustituye la lista por datos antiguos presentados como actuales.

### Una o varias reservas

Se usa la misma estructura para cualquier cantidad. Los enlaces de detalle incluyen un nombre accesible específico, no una sucesión ambigua de `Ver detalle`.

### Reserva que deja de ser futura

No desaparece mediante un temporizador mientras el cliente la está leyendo. Se retira en la siguiente actualización válida: entrada, recarga, retorno de una operación o recuperación del foco de la aplicación.

## 5. Acceso al detalle

### Recorrido común

- **Entrada:** elemento de `Mis reservas` o URL interna autorizada.
- **Precondición:** la reserva pertenece al cliente.
- **Recorrido:** volver a consultar el estado y mostrar los datos propios del tipo.
- **Resultado:** detalle actualizado con cancelación disponible o explicación de indisponibilidad.

### Detalle grupal

Muestra `Clase grupal`, disciplina, fecha, hora, duración, monitor y sala. Aforo y plazas disponibles no son necesarios en el detalle de una reserva ya vigente.

### Detalle privado

Muestra `Sesión privada`, fecha, hora, duración y monitor. No presenta las disciplinas como si fueran atributo de la sesión reservada.

### Regreso y contexto

Al regresar durante la misma navegación se conserva la posición anterior de la lista si continúa siendo útil. Se descarta tras cerrar sesión, una recarga completa o un cambio sustancial de la lista.

## 6. Cancelación disponible

### Definición del flujo

- **Objetivo:** cancelar conscientemente una reserva propia dentro del plazo.
- **Entrada:** detalle cancelable.
- **Precondiciones:** reserva vigente o sesión confirmada, futura y dentro de la ventana de cancelación.
- **Recorrido principal:** activar `Cancelar reserva`, revisar resumen y consecuencias en un paso completo, confirmar y esperar el resultado del servidor.
- **Resultado:** reserva cancelada por el cliente, disponibilidad liberada según la feature y retorno posible a `Mis reservas` actualizada.

### Confirmación

La confirmación muestra tipo, identificación, fecha y hora. Ofrece una acción explícita para cancelar y otra para conservar la reserva. Durante el envío impide repeticiones y vuelve a validar todas las condiciones.

### Resultado

Un resultado correcto indica qué reserva se canceló y ofrece como acción principal `Volver a Mis reservas`. No se crea una página de éxito sin salida ni se mantiene la reserva cancelada en la lista.

## 7. Cancelación no disponible

Si ha terminado el plazo:

- el detalle permanece visible;
- la acción de cancelación se retira;
- se explica que ya no puede cancelarse porque terminó el plazo;
- no se presenta un control deshabilitado sin explicación;
- no se inventa una alternativa de contacto con recepción.

El límite funcional exacto permanece definido en las features: se admite cancelar exactamente hasta tres horas antes y no después.

## 8. Cambios concurrentes

### Estado cambia antes de confirmar

La confirmación se rechaza sin efectos parciales, se actualiza el contexto y se explica que la reserva ha cambiado. No se afirma que la cancelación se completó.

### Cancelación por el gimnasio durante el detalle

Se muestra un estado transitorio: `Esta reserva ya no está vigente porque ha sido cancelada por el gimnasio`. Se retira la acción de cancelar y se ofrece volver a `Mis reservas`.

Este tratamiento no crea un historial consultable: solo explica el cambio a quien ya tenía abierto el detalle. En accesos posteriores, la reserva cancelada deja de formar parte de la consulta del cliente.

### Error temporal

Se indica que la cancelación no pudo confirmarse y se permite reintentar tras actualizar el estado. Si no puede determinarse el resultado con seguridad, no se muestra éxito hasta consultar el estado actual.

### Sesión o permisos perdidos

La operación se detiene y se aplica el flujo de autenticación. Ninguna acción pendiente se reenvía automáticamente después de iniciar sesión.

## 9. Actualización y URLs directas

- Los datos se actualizan al entrar, recargar, completar una operación y recuperar el foco.
- No existe tiempo real ni sondeo periódico.
- Una URL directa vuelve a comprobar sesión, rol, pertenencia y estado.
- Tras autenticarse se recupera el destino si sigue siendo válido y autorizado.
- Si ya no es accesible se abre `Mis reservas` con una explicación neutra, sin revelar recursos ajenos.

## 10. Accesibilidad

- La navegación inferior tiene nombre accesible y estado activo semántico.
- El orden de foco sigue cabecera, contenido y navegación de forma comprensible.
- Cada reserva se identifica por tipo y texto; el color o icono nunca son el único diferenciador.
- Al abrir un detalle, el foco pasa a su encabezado principal.
- Al volver, se restaura el contexto y el foco cuando el elemento sigue presente.
- La carga, los errores, los cambios concurrentes y el resultado se anuncian adecuadamente.
- La confirmación completa mantiene el foco dentro de un orden de página normal, sin las dificultades propias de un diálogo flotante.

## 11. Trazabilidad

| Comportamiento | Requisito de origen |
| --- | --- |
| Próximas reservas grupales vigentes | `group-classes.md`, Próximas reservas y CA-GRP-01 |
| Próximas sesiones privadas confirmadas | `private-sessions.md`, Disponibilidad y CA-PRI-01 |
| Ventana y revalidación de cancelación | Ambas features; `BUSINESS_RULES.md` |
| Ocultación de pasadas y canceladas | Ambas features; `ROLES_AND_PERMISSIONS.md` |
| Ausencia de tiempo real | `UX_PRINCIPLES.md`; `DECISIONS.md` |
| Lista conjunta y navegación mínima | `NAVIGATION_AND_INFORMATION_STRUCTURE.md`; decisiones UX aprobadas |

## 12. Recomendaciones

- Usar una redacción breve y específica para las acciones y los resultados.
- Evitar un botón `Atrás` propio en todas las pantallas; ofrecer regreso contextual en los detalles y respetar el historial del navegador.
- Validar en wireframes la densidad de una lista con varias fechas sin introducir nuevos filtros.
- Mantener la actualización al recuperar foco como mecanismo suficiente frente a datos obsoletos en el MVP.

## 13. Pendientes

No quedan decisiones UX abiertas en este flujo. El sistema visual, los textos finales y los wireframes quedan fuera de esta documentación UX congelada.

