# AltaGym — Principios de experiencia de usuario

**Estado:** Aprobado  
**Última actualización:** 15 de julio de 2026

## 1. Propósito

Este documento establece los principios transversales de UX del MVP de AltaGym. No reproduce ventanas, permisos, validaciones ni transiciones funcionales: remite a `../BUSINESS_RULES.md`, `../ROLES_AND_PERMISSIONS.md`, `../DATA_MODEL.md` y las features correspondientes.

## 2. Condicionantes aprobados

### Requisitos existentes

- AltaGym es una aplicación web para un único gimnasio.
- Existen tres experiencias: cliente, monitor y recepción/administración.
- Recepción y administración forman un único rol funcional.
- Las reglas críticas se vuelven a validar al confirmar una operación.
- No existe actualización en tiempo real en el MVP.
- Las acciones disponibles y los datos visibles dependen del rol.

### Decisiones UX aprobadas

- Cliente y monitor usan una vista móvil única, también al acceder desde ordenador.
- El backoffice se diseña para escritorio y portátil, no para móvil.
- WCAG 2.2 nivel AA es el objetivo formal de accesibilidad.
- Todos los monitores comparten los mismos permisos y no realizan tareas administrativas.

## 3. Objetivos por rol

### Cliente

Necesita consultar rápidamente qué tiene reservado, crear una reserva y cancelar cuando esté permitido. La experiencia debe minimizar decisiones accesorias, usar controles táctiles claros y explicar de forma anticipada los límites relevantes.

### Monitor

Necesita comprender su jornada con una consulta rápida y fiable: qué actividad tiene, cuándo, dónde y qué información autorizada necesita para prepararla. Su interfaz es de solo lectura y no debe insinuar acciones administrativas.

### Recepción y administración

Necesitan localizar personas, comparar información, consultar agendas y ejecutar operaciones encadenadas sin perder contexto. La densidad y la eficiencia operativa tienen prioridad sobre la simplificación propia de una interfaz móvil.

## 4. Principios transversales

### 4.1 Priorizar la tarea inmediata

Cada pantalla presenta primero la información y la acción más relevantes para su propósito. Las acciones secundarias no compiten visualmente con la principal.

### 4.2 Diseñar según frecuencia y contexto

Los recorridos frecuentes requieren pocos pasos y evitan volver a introducir información ya conocida. Los recorridos excepcionales pueden incorporar confirmaciones y explicaciones adicionales cuando reduzcan el riesgo.

### 4.3 Mostrar el estado real

La interfaz diferencia estados persistentes, condiciones calculadas, disponibilidad temporal y resultados técnicos. No presenta una operación como completada hasta recibir confirmación del servidor.

### 4.4 Explicar límites antes de bloquear

Cuando una acción depende del tiempo, aforo, estado o disponibilidad, la interfaz muestra la información útil antes de que el usuario intente confirmarla. Si no puede realizarse, explica el motivo y la alternativa disponible.

### 4.5 Preservar contexto

Un error no obliga a reiniciar innecesariamente el flujo. Se conservan selecciones y valores válidos siempre que sea seguro, y se ofrece una recuperación concreta.

### 4.6 Minimizar exposición de datos

Cada rol recibe únicamente la información necesaria. La interfaz no revela datos internos mediante mensajes de error, estados de carga, URLs o controles ocultos.

### 4.7 Mantener el lenguaje del dominio

Los textos usan los términos aprobados en `../GLOSSARY.md`. Un wireframe o prototipo no puede introducir una terminología alternativa como decisión implícita.

## 5. Operaciones frecuentes

### Recomendaciones aprobadas

- La reserva grupal del cliente debe concentrarse en elegir la clase y confirmar, sin formularios administrativos.
- La reserva privada debe concentrarse en elegir fecha y hora, monitor y confirmar.
- La cancelación comienza desde la reserva concreta y muestra un resumen antes de ejecutarse.
- Las reservas realizadas por recepción deben conservar el cliente preseleccionado cuando se inician desde su ficha.
- Las consultas de agenda deben abrir en el periodo vigente aprobado y mantener accesible el retorno a la fecha actual.

El número exacto de interacciones se validará en los wireframes; no debe reducirse a costa de ocultar información necesaria o eliminar una confirmación de riesgo.

## 6. Prevención de errores

- Restringir selecciones imposibles cuando la regla pueda conocerse de antemano.
- Mantener visibles los motivos relevantes de indisponibilidad cuando ayuden a decidir.
- Asociar los errores de validación con su campo y conservar los demás valores.
- Pedir confirmación antes de cancelaciones, desactivaciones y otras acciones de impacto.
- Explicar las consecuencias de una acción sin utilizar mensajes alarmistas.
- Evitar dobles envíos deshabilitando temporalmente la repetición y mostrando progreso.
- Revalidar siempre en el servidor aunque la interfaz haya prevenido el error.

## 7. Feedback y recuperación

Toda operación debe representar, cuando proceda:

- estado inicial;
- operación en curso;
- resultado correcto;
- validación corregible;
- conflicto funcional;
- información obsoleta o conflicto concurrente;
- error temporal recuperable;
- pérdida de sesión o permisos.

Un resultado correcto identifica qué cambió y refleja el nuevo estado. Un error indica qué no ocurrió y ofrece el siguiente paso. Los fallos de servicios externos no deben presentar como fallida una operación principal que sí se completó.

## 8. Estados vacíos y cargas

- Una lista sin elementos no se presenta como error.
- Una búsqueda sin coincidencias permite limpiar o cambiar los criterios.
- Una agenda vacía conserva su estructura y, si el rol lo permite, sus acciones de creación.
- Las cargas mantienen estable la estructura y evitan saltos que provoquen pulsaciones accidentales.
- La ausencia de tiempo real se compensa con actualización al entrar, recargar o completar una operación.

## 9. Accesibilidad

AltaGym adopta WCAG 2.2 AA como objetivo del MVP. Como base:

- todas las funciones deben poder usarse con teclado;
- el foco debe ser visible y seguir un orden lógico;
- controles y objetivos táctiles deben tener tamaño y separación suficientes;
- etiquetas, instrucciones y errores deben estar asociados programáticamente;
- ningún estado se comunica solo mediante color, posición o icono;
- los cambios relevantes y resultados se anuncian a tecnologías de asistencia;
- los encabezados y regiones mantienen una estructura semántica;
- se respeta la reducción de movimiento;
- el contenido admite ampliación sin pérdida de funcionalidad;
- los textos de acción describen su consecuencia.

El cumplimiento deberá verificarse mediante revisión automática y pruebas manuales de teclado, foco, ampliación y lector de pantalla.

## 10. Enfoque por dispositivo

### Cliente y monitor

- Vista móvil única con ancho limitado.
- Composición de una columna.
- Controles adecuados para interacción táctil y uso con una mano.
- En pantallas grandes se conserva la estructura móvil centrada, sin variante de escritorio.
- No se introducen tablas, paneles laterales ni composiciones multicolumna.

### Recepción y administración

- Diseño para escritorio y portátil.
- Se permiten tablas, filtros persistentes, calendarios semanales y mayor densidad.
- No se diseñan recorridos móviles para el backoffice en el MVP.
- En una pantalla insuficiente puede mostrarse una indicación de que la gestión requiere mayor anchura, sin convertirla en una barrera para las áreas de cliente o monitor.

## 11. Evaluación de los diseños

Antes de aprobar un flujo o wireframe se comprobará:

- correspondencia con requisitos y permisos;
- claridad de la acción principal;
- representación de carga, vacío, éxito y error;
- prevención y recuperación ante concurrencia;
- privacidad por rol;
- navegación por teclado y lectura accesible;
- adecuación al dispositivo objetivo;
- consistencia terminológica;
- ausencia de reglas funcionales inventadas.

## 12. Pendientes de validación

Las siguientes cuestiones no se dan por aprobadas mediante este documento:

- preferencias recordadas automáticamente;
- microinteracciones y animaciones;
- densidad visual exacta;
- componentes y patrones visuales definitivos;
- contenido final de mensajes, salvo términos funcionales ya aprobados.

