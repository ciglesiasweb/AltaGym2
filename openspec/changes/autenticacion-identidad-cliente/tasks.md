# Tasks

## 1. Integración de autenticación del cliente

- [ ] 1.1 Configurar la integración de Auth0 para el frontend y la API, incluyendo los entornos permitidos y la ruta de retorno interna; verificar que la configuración inválida o `MOCK` fuera de desarrollo/pruebas detiene el arranque de forma segura.
- [ ] 1.2 Implementar el inicio y cierre de sesión del cliente sin custodiar contraseñas en AltaGym; verificar credenciales válidas, rechazo genérico y retorno seguro a una ruta protegida mediante pruebas del tenant de Auth0.
- [ ] 1.3 Implementar el tratamiento frontend de sesión ausente, caducada o invalidada, incluyendo el acceso al login y la no repetición automática de mutaciones; verificarlo con pruebas de navegación y sesión terminada.

## 2. Resolución de identidad interna

- [ ] 2.1 Implementar el resolvedor server-side que valida la sesión, obtiene el `sub` verificado y resuelve `AuthIdentity` -> `UserAccount` -> `Client`; verificar el `clientId` efectivo con una cuenta y cliente activos.
- [ ] 2.2 Aplicar las comprobaciones de cuenta activa, vínculo uno a uno y cliente activo antes de entregar el contexto a una operación protegida; verificar ausencia de vínculo, cliente inexistente e inactividad sin acceso ni modificación de reservas.
- [ ] 2.3 Definir respuestas neutras de no autenticación y no autorización para las rutas de cliente; verificar que no revelan la causa de rechazo ni la existencia de clientes o reservas ajenos.

## 3. Frontera para reservas y seguridad

- [ ] 3.1 Integrar el contexto autenticado en los contratos de reserva para que el `clientId` efectivo proceda del servidor y no sea obligatorio en el cuerpo; verificar que una petición válida del propio cliente llega al caso de uso con su identidad resuelta.
- [ ] 3.2 Rechazar cualquier `clientId` enviado que no coincida con la identidad de sesión y mantener el mismo aislamiento en consultas, creación, modificación y cancelación; verificar el escenario cliente A contra cliente B sin efectos ni filtración.
- [ ] 3.3 Añadir pruebas con identidades `MOCK` estables para sesión válida, sesión ausente, cuenta o cliente inactivo, identidad no vinculada, sesión invalidada y acceso cruzado; verificar que solo se ejecutan en entornos permitidos y que la suite cubre todos los escenarios de la especificación.

## 4. Integración

- [ ] 4.1 Ejecutar la validación estricta del cambio y las comprobaciones de compilación y pruebas relevantes del workspace; verificar que todos los artefactos OpenSpec son válidos y que el contrato queda listo para conectar las reglas de reserva.
