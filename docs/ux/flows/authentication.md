# Flujo UX — Autenticación del cliente

**Estado:** UX 1.0 congelado
**Última actualización:** 15 de julio de 2026

## 1. Propósito y fuentes

Define la experiencia del cliente al iniciar y cerrar sesión, acceder directamente a una ruta protegida y cambiar su contraseña. La fuente funcional es `../../features/authentication.md`, complementada por `../../ROLES_AND_PERMISSIONS.md` y `../../ARCHITECTURE.md`.

No reproduce la implementación de Auth0 ni modifica sus reglas.

## 2. Inicio de sesión

### Definición del flujo

- **Objetivo:** obtener una sesión válida y acceder al área autorizada.
- **Actor:** cliente.
- **Entrada:** ruta pública de inicio de sesión, sesión terminada o redirección desde una URL protegida.
- **Precondiciones:** disponer de credenciales asignadas; para acceder, la cuenta debe estar activa, no bloqueada y las credenciales deben ser válidas.
- **Recorrido principal:** introducir nombre de usuario y contraseña, enviar, validar y abrir el destino autorizado.
- **Bifurcaciones:** destino inicial `Mis reservas` o URL interna solicitada que siga siendo válida y autorizada.
- **Resultado:** sesión creada y contador de fallos reiniciado.

### Requisitos funcionales existentes

- El nombre de usuario es obligatorio, no distingue mayúsculas y minúsculas y elimina espacios exteriores.
- La contraseña se compara exactamente y no se transforma.
- Cuenta inexistente, contraseña incorrecta, cuenta inactiva y bloqueo temporal producen el mismo mensaje genérico.
- El quinto fallo consecutivo bloquea durante 15 minutos.
- No existen autorregistro, `Recordarme`, recuperación por correo o SMS ni desbloqueo manual por intentos.

### Consecuencias UX derivadas

- El formulario no diferencia la causa de un rechazo.
- No se muestra un contador de intentos ni el tiempo restante del posible bloqueo.
- La contraseña nunca se repuebla, registra ni muestra.
- El error de campo se distingue del rechazo de credenciales: un campo vacío puede explicarse localmente sin consultar la existencia de la cuenta.
- El botón de envío representa progreso e impide dobles envíos.

### Información y acciones

**Visible:** nombre de usuario, contraseña, instrucciones estrictamente necesarias y mensajes genéricos.  
**Acción:** `Iniciar sesión`.  
**No disponible:** crear cuenta, recordar sesión o recuperar contraseña automáticamente.

### Errores y recuperación

- **Validación local:** se conserva el nombre de usuario y se corrige el campo señalado.
- **Acceso rechazado:** se conserva el nombre de usuario cuando el proveedor lo permita, se vacía la contraseña y se permite reintentar.
- **Error temporal:** se informa de que no se pudo completar el acceso y se permite reintentar sin afirmar nada sobre la cuenta.

## 3. Cuenta inactiva o temporalmente bloqueada

- **Objetivo:** rechazar el acceso sin filtrar el estado de la cuenta.
- **Recorrido:** el usuario envía credenciales; el sistema rechaza el acceso con el mismo mensaje genérico empleado para cualquier credencial inválida.
- **Información visible:** únicamente que no ha sido posible iniciar sesión con los datos proporcionados.
- **Resultado:** no se crea sesión.

No se inventa un canal de contacto ni se ofrece una acción específica de desbloqueo. La interfaz tampoco confirma que esperar 15 minutos resolverá el caso, porque eso distinguiría el bloqueo de otros rechazos.

## 4. Sesión caducada o invalidada

- **Objetivo:** interrumpir con seguridad una sesión no válida y permitir un nuevo acceso.
- **Entrada:** siguiente petición a una pantalla protegida.
- **Precondición:** sesión caducada tras ocho horas de inactividad o invalidada por cambio de contraseña, restablecimiento o desactivación.
- **Recorrido:** detener la operación, conducir al inicio de sesión y mostrar un aviso neutro de que la sesión ha terminado.
- **Resultado:** ninguna operación protegida continúa hasta autenticar de nuevo.

El mensaje no diferencia caducidad, invalidación ni cambio de estado de la cuenta. Si había una mutación en curso, no se presenta como completada.

## 5. Acceso directo a una URL protegida

- **Objetivo:** permitir enlaces internos sin eludir autenticación, rol o ámbito.
- **Entrada:** URL del área del cliente sin sesión válida.
- **Recorrido principal:** conservar de forma segura el destino, autenticar y abrirlo si pertenece al área del cliente, el recurso sigue disponible y el cliente está autorizado.
- **Bifurcaciones:** si el destino ya no es válido o autorizado, abrir `Mis reservas` con una explicación neutra.
- **Resultado:** acceso únicamente a información propia.

Una URL de otro cliente o rol no revela si el recurso existe. No se conservan destinos externos ni parámetros que puedan producir una redirección abierta.

## 6. Cierre de sesión

- **Objetivo:** impedir que el dispositivo continúe usando la sesión actual.
- **Entrada:** acción textual `Cerrar sesión`, disponible en la cabecera de cualquier pantalla autenticada y también en `Cuenta`.
- **Recorrido:** activar la acción, invalidar la sesión actual y abrir el inicio de sesión.
- **Resultado:** esa sesión no puede reutilizarse; las demás sesiones simultáneas permanecen activas.

Durante la operación se evita el doble envío. Si la petición falla, no se confirma falsamente el cierre y se ofrece reintentar.

## 7. Cambio voluntario de contraseña

### Definición del flujo

- **Objetivo:** sustituir la contraseña propia demostrando conocimiento de la actual.
- **Entrada:** `Cuenta`.
- **Precondición:** sesión válida.
- **Recorrido:** introducir contraseña actual, nueva contraseña y confirmación; validar; cambiar; invalidar todas las sesiones; volver al inicio de sesión.
- **Resultado:** credencial cambiada y nueva autenticación obligatoria.

### Estados y bifurcaciones

- Contraseña actual incorrecta: no se cambia nada y se permite corregir.
- Nueva contraseña fuera de 8–128 caracteres: error asociado al campo.
- Confirmación diferente: error asociado a la confirmación.
- Error temporal: se indica que no se completó el cambio; no se asume que la sesión fue invalidada.
- Cambio correcto: se anuncia el resultado y se conduce al inicio de sesión; no se intenta regresar a `Cuenta` con la sesión anterior.

### Decisión condicionada técnicamente

El flujo, los campos y el resultado son normativos. La presentación dentro de AltaGym o mediante una experiencia alojada por Auth0 queda fuera de esta documentación UX congelada y deberá preservar todos los requisitos funcionales anteriores.

## 8. Accesibilidad

- Etiquetas persistentes y asociadas programáticamente a cada campo.
- Errores de campo descritos junto al campo y resumen enfocable cuando haya varios.
- Foco inicial lógico, sin desplazar automáticamente al usuario de forma inesperada.
- El aviso de sesión terminada y los resultados se anuncian a tecnologías de asistencia.
- El estado de envío no depende solo de una animación.
- La navegación puede completarse íntegramente con teclado y ampliación.

## 9. Trazabilidad

| Aspecto | Requisito de origen |
| --- | --- |
| Normalización del usuario y contraseña exacta | `authentication.md`, reglas de nombre y contraseña |
| Mensaje genérico y bloqueo temporal | `authentication.md`, intentos fallidos; CA-AUTH-01 y CA-AUTH-03 |
| Caducidad, cierre e invalidación | `authentication.md`, sesiones; CA-AUTH-04 |
| Cambio de contraseña | `authentication.md`, cambio y restablecimiento; CA-AUTH-05 |
| Protección de rutas y permisos | `ROLES_AND_PERMISSIONS.md`; `ARCHITECTURE.md`, autorización |

## 10. Recomendaciones

- Redactar el error genérico sin sugerir una causa concreta.
- Conservar el nombre de usuario tras errores corregibles cuando Auth0 lo permita.
- Evitar una confirmación adicional para cerrar sesión: la acción es reversible mediante un nuevo acceso y no modifica datos de negocio.
- Validar el comportamiento real de Auth0 para bloqueo, inactividad e invalidación antes del diseño definitivo.

## 11. Pendientes

La decisión técnica sobre la superficie del cambio de contraseña queda fuera de esta documentación UX. No quedan decisiones UX abiertas en este flujo.

