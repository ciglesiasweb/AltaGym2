# Tasks

## 1. Integración de autenticación del cliente

- [x] 1.1 Configurar `@auth0/nextjs-auth0` como BFF de Next.js para callback, login, logout y cookie de sesión `HttpOnly`, incluyendo los entornos permitidos, la ruta de retorno interna, `Secure`, `SameSite`, CORS credentialed restringido y protección CSRF; verificar que la configuración inválida o `MOCK` fuera de desarrollo/pruebas detiene el arranque de forma segura.
- [x] 1.2 Implementar el inicio y cierre de sesión del cliente sin custodiar contraseñas en AltaGym; verificar credenciales válidas, rechazo genérico y retorno seguro a una ruta protegida mediante pruebas del tenant de Auth0.
- [x] 1.3 Implementar el tratamiento frontend de sesión ausente, caducada o invalidada, incluyendo el acceso al login y la no repetición automática de mutaciones; verificarlo con pruebas de navegación y sesión terminada.

## 2. Resolución de identidad interna

- [x] 2.1 Implementar el resolvedor server-side con `auth0.getSession(request)` para validar la cookie BFF por integridad, issuer, audience, expiración, proveedor y revocación, obtener el `sub` verificado sin aceptar valores del body, query o headers controlados por el cliente y resolver `AuthIdentity` -> `UserAccount` -> `Client`; verificar el `clientId` efectivo con una cuenta activa de rol `CLIENT` y un cliente activo.
- [x] 2.2 Aplicar las comprobaciones de cuenta activa, `role = CLIENT`, vínculo uno a uno y cliente activo antes de entregar el contexto a una operación protegida; verificar ausencia de vínculo, cliente inexistente, cuenta `MONITOR`/`RECEPTION` e inactividad sin acceso ni modificación de reservas.
- [x] 2.3 Definir respuestas neutras de no autenticación y no autorización para las rutas de cliente; verificar que no revelan la causa de rechazo ni la existencia de clientes o reservas ajenos.

## 3. Frontera para reservas y seguridad

- [ ] 3.1 Integrar el contexto autenticado en las consultas de sesiones y reservas propias y en la confirmación de reserva grupal, para que el `clientId` efectivo proceda del servidor y no sea obligatorio en el cuerpo; verificar el recorrido del propio cliente desde `Mis reservas` hasta la confirmación y la consulta actualizada, incluida la sesión caducada sin reenvío automático.
- [ ] 3.2 Rechazar siempre con la misma respuesta neutra cualquier `clientId` enviado que no coincida con la identidad de sesión, sin consultar el cliente ajeno, y mantener el mismo aislamiento en consultas, incluida la reconciliación por sesión, y en creación, modificación y cancelación; verificar el escenario cliente A contra cliente B existente y no existente sin efectos ni filtración.
- [x] 3.3 Añadir pruebas con identidades `MOCK` estables para sesión válida mediante cookie BFF, sesión ausente o invalidada, cuenta o cliente inactivo, identidad no vinculada y acceso cruzado; verificar que `MOCK` solo se usa en pruebas, CORS credentialed se restringe al origen permitido, el rechazo CSRF por origen ocurre antes del middleware/efecto y la respuesta 401 es neutra y lleva al login sin reintentar mutaciones.
- [ ] 3.4 Integrar y verificar el requisito de reservas de revalidar cuenta y cliente activos y vinculados dentro de la transacción justo antes de confirmar; probar la desactivación entre resolución y confirmación con `403` neutro y sin confirmar reserva, aforo ni ocupación.

## 4. Integración

- [x] 4.1 Ejecutar la validación estricta del cambio y las comprobaciones de compilación y pruebas relevantes del workspace; verificar que todos los artefactos OpenSpec son válidos y que el contrato queda listo para conectar las reglas de reserva.
