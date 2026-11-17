# Spec Delta

## Purpose

Permite que un cliente acceda con una sesión autenticada y que la API derive de forma segura su identidad interna para reservar actividades sin exponer ni aceptar identidades de otros clientes.

## ADDED Requirements

### Requirement: Inicio de sesión del cliente
El sistema SHALL permitir que un cliente con una cuenta activa inicie sesión mediante su nombre de usuario y contraseña y obtenga una sesión autenticada conforme a las reglas aprobadas de autenticación.

#### Scenario: Credenciales válidas
- **WHEN** un cliente presenta credenciales válidas para una cuenta activa y no bloqueada
- **THEN** el proveedor de autenticación crea una sesión válida y el cliente puede acceder al área de reservas

#### Scenario: Credenciales o cuenta rechazadas
- **WHEN** el cliente presenta credenciales inválidas, una cuenta inexistente, inactiva o temporalmente bloqueada
- **THEN** no se crea una sesión y se devuelve el mismo rechazo genérico sin revelar la causa

### Requirement: Resolución de identidad interna
La API SHALL resolver una sesión autenticada mediante el `sub` del proveedor hasta una única `AuthIdentity`, su `UserAccount` y el `Client` asociado, y SHALL exponer ese cliente como identidad efectiva de la petición.

#### Scenario: Sesión vinculada a un cliente activo
- **WHEN** una petición protegida presenta una sesión válida cuyo `sub` está vinculado a una cuenta activa y a un cliente activo
- **THEN** la API acepta el contexto autenticado y proporciona el `clientId` resuelto para la operación de reserva

#### Scenario: Identidad externa no vinculada
- **WHEN** una petición presenta una sesión válida cuyo `sub` no tiene una `AuthIdentity` local vinculada a una cuenta
- **THEN** la API rechaza la operación protegida como no autorizada y no consulta ni modifica reservas

### Requirement: Protección de peticiones sin identidad de cliente
Toda operación de reserva para clientes SHALL exigir una sesión válida y una identidad interna de cliente activa; la API MUST rechazar la petición antes de ejecutar cambios de negocio cuando falte cualquiera de ellas.

#### Scenario: Petición sin sesión
- **WHEN** una persona solicita una operación de reserva sin cookie, token o sesión autenticada válida
- **THEN** la API responde como no autenticada y no crea, modifica ni cancela ninguna reserva

#### Scenario: Cliente no vinculado o inactivo
- **WHEN** una sesión válida pertenece a una cuenta sin `Client` asociado o a un `Client` inactivo
- **THEN** la API rechaza la operación como no autorizada y no crea, modifica ni cancela ninguna reserva

### Requirement: Aislamiento de la identidad del cliente
Las operaciones de reserva realizadas por un cliente SHALL actuar únicamente sobre el `Client` derivado de la sesión; un identificador de cliente enviado por el navegador no puede sustituir ni ampliar esa identidad.

#### Scenario: Intento de actuar en nombre de otro cliente
- **WHEN** el cliente A envía una petición autenticada que incluye el identificador del cliente B para crear, consultar, modificar o cancelar una reserva
- **THEN** la API rechaza la petición como no autorizada o la resuelve exclusivamente para A, no realiza efectos sobre B y no revela si la reserva de B existe

#### Scenario: Operación para el propio cliente
- **WHEN** el cliente envía una petición autenticada sin un identificador ajeno o con el identificador que coincide con su identidad resuelta
- **THEN** la API autoriza la operación únicamente después de aplicar las reglas de negocio de la reserva al cliente resuelto

### Requirement: Terminación de sesión
El sistema SHALL impedir el acceso a operaciones protegidas cuando la sesión haya caducado o sido invalidada y SHALL exigir una nueva autenticación sin reintentar automáticamente la operación pendiente.

#### Scenario: Sesión caducada o invalidada
- **WHEN** una petición protegida usa una sesión caducada, cerrada o invalidada
- **THEN** la API rechaza la petición sin efectos y el cliente debe iniciar sesión de nuevo antes de repetirla
