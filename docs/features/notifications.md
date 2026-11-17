# Feature — Notificaciones de cancelación

**Estado:** Definición completa  
**Última actualización:** 14 de julio de 2026

## Objetivo

Permitir que recepción y administración avisen opcionalmente por SMS a los clientes afectados cuando el gimnasio cancela una sesión grupal o privada, sin hacer depender la cancelación del resultado de los envíos.

## Alcance

- Notificación asociada exclusivamente a la cancelación por el gimnasio de una sesión concreta.
- Envío por SMS mediante una plantilla fija.
- Registro del resultado por destinatario.
- Consulta del resumen de destinatarios totales, pendientes, enviados y fallidos desde la sesión cancelada.

No incluye mensajes libres, avisos para otras operaciones, preferencias de canal ni reintentos manuales o automáticos.

## Roles y permisos

- Recepción y administración pueden decidir si solicitan el aviso como parte de la cancelación.
- Monitores y clientes no pueden solicitar, modificar ni reenviar notificaciones.

## Historias de usuario

### NOT-01 — Decidir si se notifica

Como recepcionista o administrador, quiero decidir si aviso a los clientes afectados antes de cancelar una sesión, para adaptar la comunicación a cada caso.

### NOT-02 — Conocer el alcance del aviso

Como recepcionista o administrador, quiero ver cuántos clientes recibirán el SMS antes de confirmar, para conocer el alcance de la comunicación.

### NOT-03 — Recibir información suficiente

Como cliente afectado, quiero recibir un mensaje claro con la actividad cancelada, su fecha y su hora, para poder reorganizarme.

### NOT-04 — Conocer el resultado

Como recepcionista o administrador, quiero ver cuántos avisos siguen pendientes, se enviaron y fallaron, para saber si la comunicación se completó.

### NOT-05 — Consultar el resultado posteriormente

Como recepcionista o administrador, quiero consultar en la sesión cancelada el estado de los avisos, para poder revisar lo ocurrido después de la operación.

## Flujo principal

1. Recepción o administración inicia la cancelación de una sesión grupal o una sesión privada concreta.
2. El sistema determina los clientes con reserva vigente en ese instante.
3. Muestra marcada por defecto la opción “Notificar a los clientes” y el número de destinatarios.
4. El usuario puede desmarcar la opción.
5. Confirma la cancelación.
6. La sesión queda cancelada y las reservas vigentes pasan a “cancelada por el gimnasio”.
7. Si se solicitó el aviso y existen destinatarios, el sistema crea un registro por cliente y solicita cada SMS.
8. El sistema muestra el total de destinatarios y el desglose de pendientes, enviados y fallidos.
9. El resumen y el detalle de estados quedan disponibles en la sesión cancelada.

## Destinatarios

- Se toma una instantánea de los clientes con reserva vigente al confirmar la cancelación.
- No se incluyen reservas ya canceladas ni clientes sin reserva en esa sesión.
- Un cliente incluido sigue siendo destinatario aunque su cuenta se desactive después de confirmar.
- El teléfono usado es el registrado para el cliente en el momento de solicitar el aviso.
- Si no existen destinatarios, la cancelación se completa sin generar envíos.

## Contenido del SMS

- Se utiliza una plantilla fija identificada como comunicación de AltaGym.
- Para una sesión grupal incluye disciplina, fecha y hora.
- Para una sesión privada indica que se ha cancelado la sesión privada e incluye fecha y hora.
- No incluye el nombre del cliente ni otros datos personales o sensibles.
- El usuario no puede editar ni añadir texto libre.

## Estados y auditoría

Cada aviso por destinatario conserva:

- sesión cancelada y cliente destinatario;
- teléfono utilizado;
- canal SMS;
- estado `pendiente`, `enviado` o `fallido`;
- fecha y hora de la solicitud;
- fecha y hora del envío, cuando se complete;
- motivo técnico del fallo, cuando exista.

La cancelación registra además quién la realizó, cuándo, si solicitó notificación y el número de destinatarios determinado al confirmar.

## Reglas de negocio

- La opción de notificar aparece marcada por defecto antes de confirmar.
- La cancelación puede completarse con la opción desmarcada.
- La cancelación y el cambio de estado de las reservas no dependen del proveedor de SMS.
- Un fallo total o parcial nunca restaura la sesión ni las reservas.
- No hay reintentos manuales ni automáticos en el MVP.
- Los registros de notificación y las reservas canceladas no se eliminan.
- El motivo técnico del fallo se muestra solo a recepción y administración.

## Casos límite

- **Sesión sin reservas vigentes:** se muestra cero destinatarios; la cancelación se completa y no se crean avisos.
- **Reserva cancelada antes de la confirmación:** ese cliente queda fuera de la instantánea y no recibe el SMS.
- **Cambio entre la apertura y la confirmación:** el sistema recalcula los destinatarios al confirmar y usa ese resultado definitivo.
- **Cliente desactivado después de confirmar:** no se retira del envío ya solicitado.
- **Fallo de un destinatario:** los demás envíos continúan y se conserva el fallo individual.
- **Fallo total del proveedor:** la sesión permanece cancelada y todos los avisos afectados quedan como fallidos cuando se conoce el resultado.
- **Resultado aún no disponible:** los avisos permanecen pendientes y la sesión cancelada permite consultar su evolución.
- **Confirmación repetida o recarga:** no se crean segundos avisos para la misma solicitud de cancelación.
- **Cancelación sin aviso:** se registra la decisión, pero no se crean registros por destinatario.

## Criterios de aceptación

### CA-NOT-01 — Presentación de la opción

**Dado** que recepción o administración inicia la cancelación de una sesión concreta  
**Cuando** se muestra la confirmación  
**Entonces** aparece marcada la opción “Notificar a los clientes” y se muestra el número de clientes con reserva vigente.

### CA-NOT-02 — Cancelación sin notificación

**Dado** que el usuario desmarca la opción  
**Cuando** confirma la cancelación  
**Entonces** la sesión y las reservas vigentes se cancelan, se registra que no se solicitó aviso y no se crean envíos.

### CA-NOT-03 — Selección de destinatarios

**Dado** que se solicita la notificación  
**Cuando** se confirma la cancelación  
**Entonces** solo se generan avisos para los clientes que tengan una reserva vigente en ese instante.

### CA-NOT-04 — Plantilla grupal

**Dado** que se cancela una sesión grupal con aviso  
**Cuando** se genera el SMS  
**Entonces** identifica a AltaGym e incluye la disciplina, la fecha y la hora, sin nombres ni datos sensibles.

### CA-NOT-05 — Plantilla privada

**Dado** que se cancela una sesión privada con aviso  
**Cuando** se genera el SMS  
**Entonces** identifica a AltaGym, indica que la sesión privada fue cancelada e incluye la fecha y la hora, sin nombres ni datos sensibles.

### CA-NOT-06 — Ausencia de destinatarios

**Dado** que la sesión no tiene reservas vigentes  
**Cuando** se confirma la cancelación con la opción marcada  
**Entonces** la sesión se cancela, se registra que no había destinatarios y no se solicita ningún SMS.

### CA-NOT-07 — Independencia ante fallos

**Dado** que uno o varios SMS fallan  
**Cuando** se recibe el resultado  
**Entonces** la sesión y las reservas permanecen canceladas y cada aviso conserva su resultado individual.

### CA-NOT-08 — Resumen del resultado

**Dado** que se solicitaron avisos  
**Cuando** existen resultados de envío  
**Entonces** recepción o administración puede ver el total de destinatarios y el desglose de pendientes, enviados y fallidos desde la operación y desde la sesión cancelada.

### CA-NOT-09 — Estado pendiente

**Dado** que el proveedor todavía no ha devuelto un resultado  
**Cuando** se consulta la sesión cancelada  
**Entonces** el aviso aparece como pendiente sin bloquear ninguna otra operación.

### CA-NOT-10 — Sin reintentos

**Dado** que un aviso queda fallido  
**Cuando** recepción o administración consulta el resultado  
**Entonces** puede ver el motivo técnico, pero no dispone de una acción para reenviarlo en el MVP.

### CA-NOT-11 — Idempotencia

**Dado** que la cancelación ya fue confirmada  
**Cuando** se recarga la pantalla o se repite la confirmación  
**Entonces** no se crean avisos duplicados.

### CA-NOT-12 — Permisos

**Dado** un usuario monitor o cliente  
**Cuando** consulta una actividad cancelada  
**Entonces** no puede solicitar avisos ni acceder al detalle técnico de los envíos.

## Fuera de alcance del MVP

- Correo electrónico, notificaciones push y elección de canal por cliente.
- Edición del mensaje o plantillas configurables.
- Avisos de recordatorio, creación o cancelación realizada por el cliente.
- Reintentos manuales o automáticos.
- Panel general de notificaciones independiente de las sesiones canceladas.
