# AltaGym â€” DocumentaciÃ³n UX

**Estado:** UX 1.0 congelado
**Ãšltima actualizaciÃ³n:** 23 de julio de 2026

## 1. PropÃ³sito

Este directorio reÃºne la documentaciÃ³n transversal de experiencia de usuario de AltaGym. Su funciÃ³n es traducir los requisitos funcionales aprobados en criterios de navegaciÃ³n, jerarquÃ­a, interacciÃ³n, accesibilidad y respuesta del sistema, sin redefinir las reglas de negocio ni el sistema visual.

## 2. Alcance de UX 1.0

La documentaciÃ³n UX 1.0 establece:

- principios comunes de experiencia;
- objetivos y necesidades por rol;
- enfoque de dispositivo para cliente, monitor y recepciÃ³n/administraciÃ³n;
- navegaciÃ³n y estructura de informaciÃ³n;
- operaciones frecuentes que deben resolverse con pocos pasos;
- tratamiento transversal de estados, errores, confirmaciones y feedback;
- inventario preliminar de secciones, pantallas y flujos.

Quedan fuera de esta iteraciÃ³n los colores, tipografÃ­as, iconografÃ­a, componentes visuales definitivos, prototipos de alta fidelidad y cÃ³digo de implementaciÃ³n.

## 3. RelaciÃ³n con la documentaciÃ³n funcional

Los documentos UX no son fuente de reglas de negocio. Las reglas, permisos, estados persistentes, ventanas temporales y criterios funcionales permanecen en los documentos generales y en `../features/`.

En caso de discrepancia, prevalecen, por este orden:

1. decisiones aprobadas en `../DECISIONS.md`;
2. documentos funcionales generales;
3. feature responsable;
4. documentaciÃ³n UX;
5. wireframes y prototipos exploratorios.

Los wireframes temporales orientan la exploraciÃ³n, pero no aprueban requisitos, terminologÃ­a ni patrones de navegaciÃ³n.

## 4. ClasificaciÃ³n de contenidos UX

La documentaciÃ³n distingue explÃ­citamente:

- **Requisito existente:** comportamiento ya aprobado y enlazado con su fuente funcional.
- **Consecuencia UX derivada:** implicaciÃ³n necesaria para representar correctamente un requisito.
- **RecomendaciÃ³n aprobada:** decisiÃ³n de experiencia incorporada al producto.
- **Pendiente:** propuesta todavÃ­a sujeta a validaciÃ³n o aprobaciÃ³n.

Esta clasificaciÃ³n evita duplicar reglas funcionales o presentar preferencias nuevas como requisitos.

## 5. Mapa de documentos

- [`UX_PRINCIPLES.md`](UX_PRINCIPLES.md): principios transversales, accesibilidad, prevenciÃ³n de errores y feedback.
- [`NAVIGATION_AND_INFORMATION_STRUCTURE.md`](NAVIGATION_AND_INFORMATION_STRUCTURE.md): navegaciÃ³n por rol, jerarquÃ­a, pantallas y flujos.
- [`USER_FLOWS.md`](USER_FLOWS.md): convenciÃ³n, mapa y patrones transversales de los flujos de usuario.
- [`SCREEN_INVENTORY.md`](SCREEN_INVENTORY.md): inventario de pantallas y estados de cliente, monitor y backoffice.
- [`flows/authentication.md`](flows/authentication.md): autenticaciÃ³n, sesiÃ³n, cierre y cambio de contraseÃ±a del cliente.
- [`flows/client-bookings.md`](flows/client-bookings.md): navegaciÃ³n mÃ³vil, `Mis reservas`, detalles y cancelaciÃ³n.
- [`flows/group-booking.md`](flows/group-booking.md): consulta, detalle, confirmaciÃ³n y resultado de reserva grupal.
- [`flows/private-session-booking.md`](flows/private-session-booking.md): fecha, hora, monitor, revisiÃ³n, confirmaciÃ³n y resultado de reserva privada.
- [`flows/monitor-agenda.md`](flows/monitor-agenda.md): agenda semanal, detalles, perfil, estados y accesibilidad del monitor.
- [`flows/reception-backoffice.md`](flows/reception-backoffice.md): acceso, portada, navegaciÃ³n y patrones comunes del backoffice de escritorio.
- [`flows/reception-clients.md`](flows/reception-clients.md): listado, bÃºsqueda, ficha, alta, modificaciÃ³n, estado, credenciales y reservas en nombre de clientes.
- [`flows/reception-group-calendar.md`](flows/reception-group-calendar.md): lista semanal grupal, sesiones, programaciones, reservas, cancelaciones y notificaciones del backoffice.
- [`flows/reception-private-agenda.md`](flows/reception-private-agenda.md): Agenda privada del backoffice, sesiones, bloqueos AltaGym, cancelaciones y notificaciones.
- [`flows/monitors.md`](flows/monitors.md): listado, alta, ficha, modificaciÃ³n, disciplinas, estado y credenciales de monitores.
- `wireframes/`: ubicaciÃ³n oficial de futuros wireframes que dejen de ser temporales y pasen a formar parte de la documentaciÃ³n UX.
- [VISUAL_DESIGN_SYSTEM.md](VISUAL_DESIGN_SYSTEM.md): identidad mínima Forge, tokens semánticos y componentes base.

Actualmente no hay wireframes normativos. Los futuros wireframes se incorporarÃ¡n Ãºnicamente cuando sean coherentes con estas bases y su estado estÃ© identificado.

## 6. Decisiones base aprobadas

- Cliente y monitor utilizan una vista mÃ³vil Ãºnica, incluso desde pantallas grandes.
- RecepciÃ³n y administraciÃ³n utilizan el backoffice en escritorio o portÃ¡til; el uso mÃ³vil queda fuera del alcance UX del MVP.
- Todas las reservas futuras vigentes del cliente se muestran juntas en una Ãºnica lista cronolÃ³gica.
- `Mis reservas` es el destino inicial del cliente y concentra los accesos a reserva grupal y privada.
- Todos los monitores comparten los mismos permisos y su experiencia es de consulta.
- RecepciÃ³n y administraciÃ³n realizan toda la operativa administrativa.
- WCAG 2.2 nivel AA es el objetivo formal de accesibilidad del MVP.
- El backoffice comienza en una portada operativa con acceso a sus cuatro Ã¡reas, sin analÃ­tica.
- El backoffice utiliza cabecera y navegaciÃ³n lateral persistentes, cuenta como utilidad, migas de pan jerÃ¡rquicas y contexto seguro representado en URL.
- Sus listados usan tablas; Calendario grupal usa una Ãºnica lista semanal accesible; las operaciones sensibles se confirman en pÃ¡gina completa.
- Clientes utiliza bÃºsqueda explÃ­cita por apellidos, 20 registros por pÃ¡gina, tabla de escritorio y una ficha como origen de estado, credenciales y reservas.
- Los textos visibles permanecen en castellano y las rutas y parÃ¡metros internos utilizan tÃ©rminos en inglÃ©s.
- La reserva grupal utiliza un horizonte de 72 horas, disciplina obligatoria, agrupaciÃ³n por fecha y revalidaciÃ³n autoritativa al confirmar.
- La reserva privada utiliza selecciÃ³n progresiva de fecha, hora y monitor, omite opciones no reservables y revalida autoritativamente al confirmar.
- `Mi agenda` utiliza una lista semanal de siete dÃ­as, detalles de solo lectura y navegaciÃ³n principal con `Mi perfil`.

## 7. Mantenimiento

- Una nueva regla funcional se documenta primero en su fuente funcional, no aquÃ­.
- Una decisiÃ³n transversal de interacciÃ³n se registra en estos documentos y, si es relevante para el proyecto, tambiÃ©n en `../DECISIONS.md`.
- Los wireframes deben enlazar los requisitos que representan y marcar con claridad cualquier hipÃ³tesis no aprobada.
- Cada revisiÃ³n UX debe comprobar permisos, privacidad, estados vacÃ­os, errores, concurrencia, accesibilidad y comportamiento por dispositivo.

## 8. Cierre documental

1. Elaborar wireframes de baja fidelidad coherentes con las decisiones aprobadas.
2. Definir el sistema visual y los componentes definitivos.
