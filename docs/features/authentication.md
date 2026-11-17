# Feature — Autenticación

**Estado:** Definición completa

## Objetivo

Permitir que clientes, monitores y el rol común de recepción y administración accedan de forma segura únicamente a las funciones autorizadas para su perfil.

## Alcance

- Inicio y cierre de sesión con nombre de usuario y contraseña.
- Nombre de usuario único, sin distinguir mayúsculas y minúsculas.
- Cambio voluntario de contraseña.
- Restablecimiento presencial de contraseñas de clientes desde recepción o administración.
- Restablecimiento y gestión de cuentas del personal desde recepción o administración.
- Creación de credenciales iniciales de monitores desde recepción o administración.
- Bloqueo temporal por intentos fallidos.
- Caducidad e invalidación de sesiones.

## Fuera de alcance

- Autorregistro.
- Recuperación por correo, SMS, enlaces o preguntas de seguridad.
- Autenticación multifactor.
- Inicio de sesión con proveedores externos.
- Opción «Recordarme».
- Bloqueos permanentes y desbloqueos manuales por intentos fallidos.
- Consulta de contraseñas actuales o anteriores.

## Reglas

### Nombre de usuario

- Es obligatorio y único en todo el sistema.
- La unicidad y el inicio de sesión no distinguen mayúsculas y minúsculas.
- Al guardar o iniciar sesión se eliminan los espacios situados al principio y al final.
- Dos variantes que solo difieran en mayúsculas, minúsculas o espacios exteriores representan el mismo nombre de usuario.

### Contraseña

- Debe tener entre 8 y 128 caracteres, ambos límites incluidos.
- No se exige una combinación concreta de mayúsculas, minúsculas, números o símbolos.
- Los espacios y el uso de mayúsculas forman parte de la contraseña; el sistema no la recorta ni transforma.
- Al crear, cambiar o restablecer una contraseña, la nueva contraseña debe introducirse dos veces y ambas entradas deben coincidir.
- Las contraseñas nunca se almacenan, registran ni muestran como texto legible.
- Recepción asigna la contraseña inicial del cliente o monitor que crea y no se exige cambiarla en el primer acceso.

### Intentos fallidos

- Después de cinco intentos fallidos consecutivos, la cuenta queda bloqueada durante 15 minutos.
- El quinto intento fallido activa el bloqueo y no permite el acceso.
- Los intentos adicionales durante el bloqueo no amplían su duración.
- Un inicio de sesión correcto reinicia el contador de intentos fallidos.
- Una vez transcurridos los 15 minutos, el usuario puede volver a intentarlo y el contador comienza de nuevo.
- El mensaje de error no revela si el usuario existe, la contraseña es incorrecta, la cuenta está inactiva o existe un bloqueo temporal.

### Sesiones

- Toda pantalla autenticada permite cerrar sesión.
- La sesión caduca tras ocho horas consecutivas sin actividad del usuario.
- Cada actividad válida reinicia el periodo de inactividad.
- Se permiten varias sesiones simultáneas para una misma cuenta.
- Cerrar sesión invalida únicamente la sesión utilizada para hacerlo.
- Cambiar o restablecer la contraseña, o desactivar la cuenta, invalida todas sus sesiones activas.
- Cuando una sesión ha caducado o ha sido invalidada, el siguiente acceso a una pantalla protegida conduce al inicio de sesión.

### Cambio y restablecimiento

- Cualquier usuario puede cambiar su propia contraseña indicando correctamente la contraseña actual.
- Recepción y administración pueden restablecer la contraseña de un cliente o de una cuenta de personal.
- Recepción y administración pueden definir las credenciales iniciales al crear un monitor y gestionar posteriormente sus credenciales y el estado de su cuenta. Todos los monitores conservan los permisos fijos del rol monitor.
- El restablecimiento asigna una contraseña nueva que cumple las mismas reglas generales; nunca permite consultar la anterior.
- Los cambios de contraseña realizados por el propio usuario no registran el valor de la contraseña.
- Los restablecimientos y los cambios de estado de una cuenta registran quién realizó la acción y cuándo, pero nunca el valor de la contraseña.

## Flujos principales

### Inicio de sesión

1. El usuario introduce su nombre de usuario y contraseña.
2. El sistema normaliza el nombre de usuario y valida el estado de la cuenta, el bloqueo y las credenciales.
3. Si la validación es correcta, crea una sesión y reinicia el contador de intentos fallidos.
4. El usuario accede a la pantalla correspondiente a sus permisos.

### Cambio voluntario de contraseña

1. El usuario indica su contraseña actual.
2. Introduce y confirma la nueva contraseña.
3. El sistema valida las entradas y cambia la contraseña.
4. El sistema invalida todas las sesiones activas, incluida la actual, y solicita iniciar sesión de nuevo.

### Restablecimiento por el personal

1. El usuario autorizado abre la cuenta afectada.
2. Introduce y confirma una contraseña nueva.
3. El sistema comprueba sus permisos y valida la contraseña.
4. El sistema actualiza la credencial, invalida todas las sesiones de la cuenta y registra la acción.

## Historias de usuario

### AUTH-01 — Iniciar sesión

Como usuario, quiero iniciar sesión para acceder únicamente a las funciones permitidas para mi perfil.

### AUTH-02 — Cerrar sesión

Como usuario autenticado, quiero cerrar mi sesión para impedir que otra persona siga usando mi acceso en ese dispositivo.

### AUTH-03 — Cambiar mi contraseña

Como usuario autenticado, quiero cambiar mi contraseña demostrando que conozco la actual para mantener el control de mi cuenta.

### AUTH-04 — Restablecer la contraseña de un cliente

Como recepcionista, quiero asignar presencialmente una contraseña nueva a un cliente que la ha olvidado para devolverle el acceso sin recuperación automática.

### AUTH-05 — Gestionar credenciales del personal

Como miembro de recepción o administración, quiero restablecer la contraseña de una cuenta de personal para resolver incidencias sin exponer su contraseña anterior.

### AUTH-05B — Crear credenciales iniciales de un monitor

Como miembro de recepción o administración, quiero asignar el usuario y la contraseña inicial al crear un monitor para completar su alta.

### AUTH-06 — Proteger una cuenta frente a intentos repetidos

Como usuario, quiero que los intentos fallidos repetidos provoquen un bloqueo temporal para dificultar accesos no autorizados.

## Casos límite

- El nombre de usuario contiene espacios exteriores o usa mayúsculas distintas a las guardadas.
- Se intenta crear un usuario que solo difiere de otro en mayúsculas, minúsculas o espacios exteriores.
- La contraseña tiene exactamente 8 o 128 caracteres, o queda fuera de esos límites.
- La contraseña contiene espacios, caracteres acentuados o símbolos.
- La confirmación de contraseña no coincide exactamente con la nueva contraseña.
- La contraseña actual indicada para un cambio es incorrecta.
- El quinto intento es incorrecto o varios intentos llegan casi simultáneamente.
- Se presentan credenciales correctas mientras la cuenta está bloqueada temporalmente.
- Se intenta acceder justo cuando termina el bloqueo o caduca la sesión.
- Una cuenta está inactiva, no existe o utiliza una contraseña incorrecta.
- El usuario mantiene varias sesiones y cierra solo una de ellas.
- Se cambia o restablece la contraseña mientras existen varias sesiones activas.
- Recepción intenta restablecer la contraseña de un miembro del personal.
- Se intenta asignar a un monitor permisos diferentes de los permisos fijos de su rol.
- Se desactiva una cuenta mientras su usuario está trabajando.
- Una sesión caducada intenta abrir directamente una URL protegida.

## Criterios de aceptación

### CA-AUTH-01 — Inicio de sesión y permisos

- Dada una cuenta activa y no bloqueada, cuando se presentan credenciales válidas, se crea una sesión y el usuario accede a la pantalla correspondiente a sus permisos.
- Dado un nombre con espacios exteriores o diferente uso de mayúsculas, cuando corresponde a un usuario existente, se identifica la misma cuenta.
- Dadas credenciales inválidas, una cuenta inexistente, inactiva o bloqueada, el sistema rechaza el acceso con el mismo mensaje genérico.
- Un usuario autenticado no puede acceder a funciones no autorizadas para sus permisos aunque introduzca directamente su dirección.

### CA-AUTH-02 — Validación de credenciales

- No se puede crear o renombrar una cuenta con un nombre de usuario equivalente a otro existente tras su normalización.
- Se aceptan contraseñas de exactamente 8 y 128 caracteres y se rechazan las de 7 o 129 caracteres.
- Una contraseña puede estar formada por cualquier combinación de caracteres sin imponer categorías obligatorias.
- La contraseña se compara exactamente, incluidos espacios y mayúsculas, y nunca se devuelve ni aparece en registros o auditorías.
- La operación no se completa cuando la nueva contraseña y su confirmación no coinciden.

### CA-AUTH-03 — Bloqueo temporal

- Los cuatro primeros fallos consecutivos se rechazan sin bloquear la cuenta.
- El quinto fallo consecutivo bloquea la cuenta durante 15 minutos.
- Durante el bloqueo se rechazan incluso las credenciales correctas y los nuevos intentos no prolongan el plazo.
- Tras un acceso correcto o al finalizar un bloqueo, el siguiente fallo se contabiliza como el primero de una nueva serie.

### CA-AUTH-04 — Sesión

- El cierre de sesión impide reutilizar esa sesión, sin cerrar otras sesiones simultáneas de la misma cuenta.
- Tras ocho horas consecutivas sin actividad, la siguiente petición protegida requiere iniciar sesión de nuevo.
- La actividad válida antes del vencimiento reinicia el periodo de ocho horas.
- No se ofrece una opción para prolongar la sesión mediante «Recordarme».

### CA-AUTH-05 — Cambio y restablecimiento

- Un usuario solo puede cambiar su contraseña si proporciona correctamente la actual y la nueva cumple las reglas.
- Recepción y administración pueden restablecer contraseñas de clientes y personal.
- Recepción y administración pueden crear las credenciales iniciales de un monitor y gestionar posteriormente sus credenciales y estado; no pueden personalizar sus permisos.
- Un cambio o restablecimiento correcto invalida todas las sesiones activas de la cuenta.
- Un restablecimiento registra actor y fecha y no registra ni permite consultar la contraseña nueva o anterior.
- Desactivar una cuenta invalida sus sesiones y bloquea cualquier nuevo inicio hasta que vuelva a estar activa.
