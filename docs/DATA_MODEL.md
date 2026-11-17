# AltaGym — Modelo de datos conceptual

**Estado funcional:** Modelo conceptual completo.  
**Estado técnico:** La representación física está definida en `docs/DATABASE_DESIGN.md` y `prisma/schema.prisma`.

## Entidades principales

### Usuario

Credenciales comunes: nombre de usuario normalizado, contraseña protegida, estado, contador y fin de bloqueo temporal, y rol o permisos. El nombre de usuario es único sin distinguir mayúsculas, minúsculas ni espacios exteriores.

### Sesión de usuario

Acceso autenticado asociado a un usuario, con datos suficientes para controlar su actividad, caducidad por inactividad e invalidación. Un usuario puede tener varias sesiones simultáneas.

### Auditoría de cuenta

Registro de restablecimientos de contraseña y cambios de estado, con actor y fecha. Nunca contiene contraseñas.

### Cliente

Nombre, apellidos, teléfono, fecha de nacimiento opcional, fotografía opcional y cuenta de acceso. El cliente puede estar activo o inactivo; la baja es lógica y conserva su ficha y reservas. Existe un cliente especial del sistema llamado «AltaGym» que no puede desactivarse.

### Monitor

Nombre, apellidos, teléfono, estado, cuenta de acceso y una o varias disciplinas que imparte. La baja es lógica y conserva su ficha y actividades históricas.

### Disciplina

Tipo de actividad que puede impartir un monitor; por ejemplo, zumba, cardio, pesas o biocycling.

### Programación grupal

Regla semanal formada por disciplina, día, hora, monitor, sala, aforo y fecha de inicio. Se repite sin fecha final funcional y solo recepción o administración puede gestionarla.

### Sesión grupal

Ocurrencia concreta de una programación en una fecha determinada. Puede estar programada o cancelada y conserva sus datos cuando ya tiene reservas, aunque cambie la programación de origen.

### Reserva grupal

Relación entre un cliente y una sesión grupal, con estado —vigente, cancelada por el cliente o cancelada por el gimnasio— y datos de auditoría. Toda cancelación conserva actor y fecha. Un cliente no puede mantener dos reservas vigentes para la misma sesión ni para actividades coincidentes.

### Sesión privada

Reserva de un cliente con un monitor en una fecha y bloque concretos. Conserva su estado —confirmada, cancelada por el cliente o cancelada por el gimnasio— y los datos de auditoría de su cancelación.

### Bloqueo de monitor

Reserva especial asociada al cliente «AltaGym», perteneciente a una única fecha, dentro del intervalo 08:00–22:00, con inicio inclusivo, fin exclusivo, estado y nota interna opcional.

### Notificación

Registro del aviso por SMS solicitado al cancelar una sesión. Vincula la sesión cancelada y el cliente destinatario, y conserva el teléfono utilizado, el estado —pendiente, enviado o fallido—, las fechas de solicitud y envío y, cuando corresponda, el motivo técnico del fallo. Los registros se crean a partir de la instantánea de reservas vigentes tomada al confirmar la cancelación y no se eliminan ni se reintentan en el MVP.

## Estados funcionales y transiciones

Los siguientes estados forman parte de la definición funcional aprobada. La fase técnica decidirá únicamente cómo representarlos y proteger sus transiciones.

### Cuenta de usuario

- Estado operativo: `activa` o `inactiva`.
- Una cuenta activa puede quedar bloqueada temporalmente durante 15 minutos tras cinco intentos fallidos consecutivos; el bloqueo temporal no cambia su estado operativo.
- La desactivación invalida todas las sesiones de usuario abiertas y bloquea nuevos accesos.
- La reactivación permite nuevos accesos con las credenciales vigentes, pero no recupera sesiones anteriores.

### Sesión de usuario

- Puede estar `activa`, `cerrada`, `caducada` o `invalidada`.
- El cierre de sesión afecta únicamente a la sesión utilizada.
- Ocho horas de inactividad producen la caducidad.
- Un cambio o restablecimiento de contraseña y la desactivación de la cuenta invalidan todas las sesiones activas de esa cuenta.
- Los estados cerrada, caducada e invalidada son finales.

### Cliente y monitor

- Pueden estar `activos` o `inactivos` y transitar en ambos sentidos mediante desactivación o reactivación.
- La baja es lógica: no elimina la ficha ni el historial.
- El cliente especial «AltaGym» permanece siempre activo.
- Un monitor solo puede desactivarse cuando no conserva actividades o bloqueos futuros vigentes.

### Sesión grupal

- Puede estar `programada` o `cancelada`.
- La cancelación es final, libera aforo y disponibilidad y no altera las demás sesiones de la programación grupal.
- «Completa» es una condición calculada por aforo de una sesión programada, no un estado persistente.

### Reserva grupal

- Se crea como `vigente`.
- Puede pasar a `cancelada por el cliente` cuando el propio cliente cancela dentro del plazo permitido.
- Pasa a `cancelada por el gimnasio` cuando recepción o administración cancela la reserva individual o la sesión grupal completa.
- Los estados cancelados son finales y liberan la plaza.

### Sesión privada

- Se crea como `confirmada`.
- Puede pasar a `cancelada por el cliente` dentro del plazo permitido o a `cancelada por el gimnasio` cuando recepción o administración la cancela.
- Los estados cancelados son finales y liberan la disponibilidad del cliente y del monitor.

### Bloqueo de monitor

- Se crea como `vigente` y puede pasar a `cancelado` por recepción o administración.
- La cancelación es final y libera los bloques afectados.
- Un bloqueo cancelado no se modifica ni vuelve a activarse; para reemplazarlo se crea otro.

### Notificación

- Se crea como `pendiente`.
- Puede pasar a `enviado` o `fallido` cuando se conoce el resultado del proveedor.
- Los estados enviado y fallido son finales en el MVP porque no existen reintentos.

## Relaciones conceptuales

- Un monitor imparte varias disciplinas.
- Un monitor activo tiene al menos una disciplina.
- Una programación grupal pertenece a una disciplina y tiene un monitor.
- Una programación genera sesiones grupales semanales.
- Una sesión grupal contiene varias reservas hasta completar el aforo.
- Una sesión privada vincula un cliente y un monitor.
- Un bloqueo ocupa la disponibilidad de un monitor.
- Un usuario puede mantener varias sesiones activas.
- Un restablecimiento o cambio de estado genera una entrada de auditoría cuando corresponde.

## Correspondencia técnica

El modelo conceptual ya está reflejado en `docs/DATABASE_DESIGN.md` y `prisma/schema.prisma`. Los detalles de tipos, restricciones, índices, concurrencia, auditoría, borrado lógico y tratamiento de imágenes se documentan en ese diseño físico.
