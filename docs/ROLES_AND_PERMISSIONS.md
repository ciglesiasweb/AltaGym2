# AltaGym — Roles y permisos

## Personal de recepción y administración

En el MVP, recepción y administración comparten un único perfil funcional y tienen exactamente los mismos permisos. Las dos denominaciones pueden describir el puesto habitual de la persona, pero no producen diferencias de acceso dentro de AltaGym.

Este perfil operativo puede:

- Gestionar clientes, monitores y sus cuentas de acceso.
- Restablecer contraseñas de clientes y personal.
- Activar o desactivar cuentas de clientes y monitores.
- Gestionar las cuentas del personal y la configuración general. Cada tipo de cuenta conserva los permisos fijos de su rol.
- Crear reservas en nombre de clientes.
- Gestionar y cancelar reservas grupales y privadas.
- Cancelar sesiones concretas en cualquier momento.
- Gestionar disciplinas, programaciones grupales, salas y aforos.
- Crear y cancelar bloqueos mediante el cliente especial «AltaGym».
- Consultar los calendarios operativos y los resultados de las notificaciones.

## Monitor

Tiene acceso de solo lectura a «Mi agenda»:

- Clases grupales propias.
- Sesiones privadas propias.
- Bloqueos propios, sin su nota interna.
- Nombre y foto del cliente de una sesión privada.
- Total de reservas vigentes de una clase grupal, sin acceder al listado ni a la identidad de los clientes inscritos.
- Disciplinas asignadas.

Puede consultar semanas pasadas y futuras, incluidas actividades canceladas claramente diferenciadas. No puede crear, modificar ni cancelar clases, reservas o bloqueos, ni solicitar cambios desde la aplicación.

Todos los monitores tienen exactamente los mismos permisos en el MVP. Recepción y administración realizan las tareas administrativas; no existe configuración individual de permisos para monitores.

## Cliente

Puede:

- Consultar clases grupales.
- Crear reservas grupales y privadas.
- Consultar sus próximas reservas grupales y privadas confirmadas.
- Cancelar dentro del plazo permitido.
- Cambiar su contraseña.

No puede autorregistrarse ni consultar reservas pasadas o canceladas.

## Matriz resumida

| Operación | Recepción/Administración | Monitor | Cliente |
|---|:---:|:---:|:---:|
| Configuración general | Sí | No | No |
| Gestionar personal, cuentas y roles fijos | Sí | No | No |
| Gestionar clientes | Sí | No | No |
| Gestionar monitores y disciplinas | Sí | No | No |
| Gestionar calendario y aforos | Sí | No | No |
| Cancelar reservas o sesiones sin límite temporal | Sí | No | No |
| Consultar calendarios operativos | Sí | No | No |
| Consultar agenda propia del monitor | No | Sí | No |
| Consultar próximas reservas propias | No | No | Sí |
| Reservar para sí mismo | Sí | No | Sí |
