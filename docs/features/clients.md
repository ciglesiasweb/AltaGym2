# Feature — Clientes

**Estado:** Definición completa

## Objetivo

Permitir que recepción y administración gestionen las cuentas necesarias para que los clientes accedan a AltaGym y reserven actividades, conservando la información operativa cuando un cliente cause baja.

## Alcance

- Listado paginado de clientes.
- Búsqueda por apellidos.
- Alta y modificación de la ficha.
- Desactivación y reactivación sin eliminación.
- Gestión opcional de la fotografía.
- Acceso al restablecimiento de contraseña definido en autenticación.

## Fuera de alcance

- Autorregistro.
- Eliminación definitiva de clientes.
- Pagos, membresías y datos de facturación.
- Historial de reservas visible para el cliente.
- Validación internacional o normalización avanzada de teléfonos.
- Cambio de nombre de usuario por el propio cliente.

## Datos y validaciones

### Datos obligatorios

- Nombre.
- Apellidos.
- Teléfono.
- Nombre de usuario.
- Contraseña inicial y confirmación.

### Datos opcionales

- Fecha de nacimiento.
- Fotografía.

### Reglas

- El nombre de usuario se normaliza, valida y protege conforme a la feature de autenticación.
- El teléfono se guarda como texto después de eliminar únicamente los espacios exteriores; no se valida un formato internacional concreto.
- La contraseña inicial debe cumplir las reglas generales de autenticación, introducirse dos veces y coincidir exactamente.
- La contraseña guardada nunca puede consultarse ni mostrarse.
- La fotografía admite JPEG y PNG y no puede superar 5 MB.
- No se exigen dimensiones concretas para la fotografía; la interfaz adapta su visualización.
- Una fotografía puede añadirse, sustituirse o eliminarse al modificar la ficha.
- El nombre de usuario no puede modificarse por el cliente. Recepción y administración pueden modificarlo desde la ficha respetando su unicidad.

## Estado del cliente

- Un cliente puede estar activo o inactivo.
- Recepción y administración pueden desactivarlo y reactivarlo.
- Un cliente inactivo conserva su ficha y todas sus reservas, pero no puede iniciar sesión ni crear nuevas reservas.
- La desactivación invalida inmediatamente todas las sesiones activas de su cuenta.
- La reactivación permite volver a iniciar sesión con las credenciales vigentes; no reactiva ni crea reservas.
- El cliente especial del sistema «AltaGym» no puede desactivarse.
- Los clientes no se eliminan definitivamente.

## Flujos principales

### Alta de cliente

1. Recepción abre el alta de cliente.
2. Introduce los datos obligatorios, los opcionales que procedan y las credenciales iniciales.
3. El sistema valida los datos y crea el cliente en estado activo.
4. Recepción entrega las credenciales al cliente.

### Consulta y búsqueda

1. Recepción abre el listado paginado.
2. Puede desplazarse entre páginas o buscar por apellidos.
3. Abre una coincidencia para consultar o modificar su ficha.

### Modificación

1. Recepción abre la ficha del cliente.
2. Modifica los datos permitidos o añade, sustituye o elimina la fotografía.
3. El sistema valida y guarda los cambios.

### Desactivación y reactivación

1. Recepción abre la ficha del cliente.
2. Cambia el estado y confirma la operación.
3. El sistema conserva la ficha y las reservas.
4. Al desactivar, invalida todas las sesiones activas de la cuenta.

## Historias de usuario

### CLI-01 — Dar de alta un cliente

Como recepcionista, quiero crear la cuenta de un cliente durante su alta para que pueda acceder y reservar actividades.

### CLI-02 — Localizar un cliente

Como recepcionista, quiero consultar un listado paginado y buscar por apellidos para encontrar rápidamente su ficha.

### CLI-03 — Modificar la ficha

Como recepcionista, quiero actualizar los datos y la fotografía de un cliente para mantener su información vigente.

### CLI-04 — Desactivar un cliente

Como recepcionista, quiero desactivar una cuenta sin eliminarla para impedir nuevos accesos y reservas conservando su información.

### CLI-05 — Reactivar un cliente

Como recepcionista, quiero reactivar una cuenta para que el cliente pueda volver a acceder con sus credenciales vigentes.

### CLI-06 — Restablecer una contraseña

Como recepcionista, quiero asignar presencialmente una contraseña nueva a un cliente para devolverle el acceso sin consultar la anterior.

## Casos límite

- Falta uno de los datos obligatorios o un dato contiene únicamente espacios.
- El teléfono incluye prefijo, espacios interiores, guiones, paréntesis u otros caracteres.
- El nombre de usuario coincide con otro variando solo mayúsculas, minúsculas o espacios exteriores.
- La contraseña inicial no cumple la longitud permitida o su confirmación no coincide.
- La fecha de nacimiento es inválida o futura.
- La fotografía tiene exactamente 5 MB, supera el límite, tiene extensión engañosa o no es realmente JPEG o PNG.
- Se sustituye o elimina la fotografía existente.
- La búsqueda contiene mayúsculas, acentos, varios apellidos, espacios exteriores o no encuentra coincidencias.
- Una modificación intenta dejar vacío un campo obligatorio.
- Dos usuarios modifican simultáneamente la misma ficha o intentan asignar el mismo nombre de usuario.
- Se desactiva un cliente que mantiene varias sesiones abiertas o reservas futuras.
- Se intenta iniciar sesión o crear una reserva para un cliente inactivo.
- Se reactiva un cliente que ya estaba activo o se desactiva uno que ya estaba inactivo.
- Se intenta desactivar al cliente especial «AltaGym».
- Se reactiva una cuenta cuyo nombre de usuario ha entrado en conflicto con otra cuenta.
- Un usuario sin permisos intenta consultar o modificar clientes mediante una dirección directa.

## Criterios de aceptación

### CA-CLI-01 — Alta y validación

- Recepción y administración pueden crear un cliente; el resto de perfiles no puede hacerlo.
- El alta solo se completa cuando nombre, apellidos, teléfono, nombre de usuario, contraseña y confirmación están informados y son válidos.
- Fecha de nacimiento y fotografía pueden omitirse sin impedir el alta.
- Un cliente nuevo queda activo y puede iniciar sesión con sus credenciales iniciales.
- El teléfono se conserva como texto con sus caracteres interiores y sin espacios exteriores.
- Una fecha de nacimiento inválida o futura se rechaza con un mensaje asociado al campo.
- El sistema rechaza un nombre de usuario equivalente a otro existente conforme a su normalización.
- La contraseña inicial cumple las reglas de autenticación y no se guarda si la confirmación no coincide exactamente.

### CA-CLI-02 — Listado y búsqueda

- Recepción y administración pueden consultar clientes mediante un listado paginado.
- La búsqueda por apellidos devuelve todas las coincidencias de acuerdo con el texto introducido y permite abrir su ficha.
- Si no existen coincidencias, el sistema muestra un resultado vacío comprensible y no un error.
- La búsqueda elimina los espacios exteriores y no distingue mayúsculas de minúsculas.
- Los perfiles no autorizados no pueden consultar el listado ni una ficha mediante acceso directo.

### CA-CLI-03 — Modificación y fotografía

- Recepción y administración pueden modificar los datos de una ficha respetando las mismas validaciones del alta.
- Una modificación inválida no sustituye los datos previamente guardados.
- Se admite una fotografía JPEG o PNG de hasta 5 MB, incluido exactamente el límite.
- Se rechaza una fotografía que supere 5 MB o cuyo contenido no corresponda a JPEG o PNG.
- La fotografía puede añadirse, sustituirse o eliminarse sin afectar al resto de la ficha.
- La contraseña no aparece en la ficha; su cambio se realiza únicamente mediante el flujo de restablecimiento.

### CA-CLI-04 — Desactivación y reactivación

- Recepción y administración pueden desactivar y reactivar clientes; el resto de perfiles no puede hacerlo.
- Desactivar un cliente conserva su ficha y sus reservas e invalida inmediatamente todas sus sesiones activas.
- Un cliente inactivo no puede iniciar sesión ni crear nuevas reservas, incluso si se intenta actuar en su nombre.
- Reactivar un cliente permite que vuelva a iniciar sesión con sus credenciales vigentes y no modifica sus reservas.
- Repetir la desactivación o reactivación cuando la cuenta ya está en ese estado no produce efectos adicionales ni errores incoherentes.
- El sistema rechaza cualquier intento de desactivar al cliente especial «AltaGym».
- No existe ninguna operación de eliminación definitiva de clientes.

### CA-CLI-05 — Restablecimiento de contraseña

- Desde la ficha, recepción y administración pueden iniciar el restablecimiento definido en autenticación.
- La contraseña anterior y la nueva nunca pueden consultarse después de completar el restablecimiento.
- Un restablecimiento correcto invalida todas las sesiones del cliente y registra actor y fecha sin registrar la contraseña.
