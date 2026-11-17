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

### Requirement: Transporte de sesión
Auth0 SHALL autenticar al usuario mediante el flujo BFF de Next.js y Next.js SHALL emitir una cookie de sesión propia `HttpOnly` usando `@auth0/nextjs-auth0`. Angular SHALL enviar las peticiones protegidas a la API con credenciales explícitas. La API SHALL aceptar únicamente los orígenes de producción configurados, credenciales CORS sin comodines y protección CSRF para mutaciones. La API MUST NOT aceptar bearer tokens como transporte alternativo implícito.

#### Scenario: Petición credentialed válida
- **WHEN** Angular envía una petición protegida con `credentials: 'include'` y una cookie BFF válida desde un origen permitido
- **THEN** la API valida la sesión server-side y continúa con la resolución de identidad sin exponer la cookie a JavaScript

#### Scenario: Petición desde origen no permitido o mutación sin CSRF válido
- **WHEN** una petición protegida llega desde un origen no permitido o una mutación no presenta la prueba CSRF válida
- **THEN** la API rechaza la petición antes de cualquier efecto de negocio y no revela información sobre la sesión o los clientes

### Requirement: Validación server-side de sesión
La API SHALL usar `auth0.getSession(request)` server-side para validar la cookie BFF mediante el secreto y la configuración del SDK, y SHALL comprobar issuer, audience, expiración, proveedor y revocación antes de extraer el `sub` verificado.

#### Scenario: Cookie inválida o revocada
- **WHEN** una petición incluye una cookie BFF ausente, manipulada, expirada o revocada
- **THEN** la API responde como no autenticada y no ejecuta efectos de negocio

### Requirement: Resolución de identidad interna
La API SHALL resolver server-side una sesión gestionada por Auth0 mediante el `sub` verificado hasta una única `AuthIdentity`, su `UserAccount` con `role = CLIENT` y el `Client` asociado, y SHALL exponer ese cliente como identidad efectiva de la petición. El `sub` MUST NOT proceder del body, query ni headers controlados por el cliente.

#### Scenario: Sesión vinculada a un cliente activo
- **WHEN** una petición protegida presenta una sesión válida cuyo `sub` está vinculado a una cuenta activa con rol `CLIENT` y a un cliente activo
- **THEN** la API acepta el contexto autenticado y proporciona el `clientId` resuelto para la operación de reserva

#### Scenario: Cuenta con rol operativo rechazada
- **WHEN** una petición protegida presenta una sesión válida cuyo `sub` está vinculado a una cuenta activa con rol `MONITOR` o `RECEPTION`, aunque exista un `Client` asociado
- **THEN** la API rechaza la operación como no autorizada y no proporciona contexto de cliente ni consulta o modifica reservas

#### Scenario: Identidad externa no vinculada
- **WHEN** una petición presenta una sesión válida cuyo `sub` no tiene una `AuthIdentity` local vinculada a una cuenta
- **THEN** la API rechaza la operación protegida como no autorizada y no consulta ni modifica reservas

### Requirement: Protección de peticiones sin identidad de cliente
Toda operación de reserva para clientes SHALL exigir una sesión válida y una identidad interna de cliente activa; la API MUST rechazar la petición antes de ejecutar cambios de negocio cuando falte cualquiera de ellas.

#### Scenario: Petición sin sesión
- **WHEN** una persona solicita una operación de reserva sin cookie, token o sesión autenticada válida
- **THEN** la API responde como no autenticada y no crea, modifica ni cancela ninguna reserva

#### Scenario: Cuenta o cliente no operativo
- **WHEN** una sesión válida pertenece a una cuenta sin `Client` asociado, a una cuenta con rol distinto de `CLIENT` o a un `Client` inactivo
- **THEN** la API rechaza la operación como no autorizada y no crea, modifica ni cancela ninguna reserva

### Requirement: Aislamiento de la identidad del cliente
Las operaciones de reserva realizadas por un cliente SHALL actuar únicamente sobre el `Client` derivado de la sesión; un identificador de cliente enviado por el navegador no puede sustituir ni ampliar esa identidad.

#### Scenario: Intento de actuar en nombre de otro cliente
- **WHEN** el cliente A envía una petición autenticada que incluye el identificador del cliente B para crear, consultar, modificar o cancelar una reserva
- **THEN** la API rechaza la petición como no autorizada con la misma respuesta neutra independientemente de que B exista, sin consultar ni realizar efectos sobre B y sin revelar si B o su reserva existen

#### Scenario: Operación para el propio cliente
- **WHEN** el cliente envía una petición autenticada sin un identificador ajeno o con el identificador que coincide con su identidad resuelta
- **THEN** la API autoriza la operación únicamente después de aplicar las reglas de negocio de la reserva al cliente resuelto

### Requirement: Terminación de sesión
El sistema SHALL impedir el acceso a operaciones protegidas cuando la sesión haya caducado o sido invalidada y SHALL exigir una nueva autenticación sin reintentar automáticamente la operación pendiente.

#### Scenario: Sesión caducada o invalidada
- **WHEN** una petición protegida usa una sesión caducada, cerrada o invalidada
- **THEN** la API rechaza la petición sin efectos y el cliente debe iniciar sesión de nuevo antes de repetirla

### Requirement: Revalidación transaccional del cliente activo en reservas
La futura propuesta OpenSpec de reservas de la PR #2 SHALL exigir que cada mutación vuelva a comprobar, dentro de su frontera transaccional y justo antes de confirmar, que la cuenta y el `Client` del contexto siguen activos y pertenecen al cliente autenticado. Este requisito queda pendiente de esa propuesta porque este cambio no implementa reservas.

#### Scenario: Cliente desactivado entre resolución y confirmación
- **WHEN** una operación de reserva resuelve un cliente activo pero el cliente se desactiva antes de la confirmación de la mutación
- **THEN** la transacción de reservas rechaza la operación, no confirma efectos de negocio y deja documentado el rechazo sin revelar datos de otros clientes
