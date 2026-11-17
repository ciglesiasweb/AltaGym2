# Flujo UX — Reserva de clase grupal

**Estado:** UX 1.0 congelado
**Última actualización:** 15 de julio de 2026

## 1. Propósito, alcance y fuentes

Define el flujo móvil mediante el que un cliente consulta próximas clases grupales, revisa una sesión concreta y confirma una reserva. Sus fuentes funcionales son `../../features/group-classes.md`, `../../BUSINESS_RULES.md`, `../../ROLES_AND_PERMISSIONS.md` y `../../DATA_MODEL.md`; las bases transversales proceden de `../UX_PRINCIPLES.md`, `../NAVIGATION_AND_INFORMATION_STRUCTURE.md` y `client-bookings.md`.

No modifica ventanas, aforo, estados ni conflictos; no añade lista de espera, historial, búsqueda, paginación, tiempo real ni canales de contacto.

## 2. Requisitos, consecuencias y decisiones

- **Requisito funcional:** seleccionar disciplina; agrupar por fecha y ordenar por hora; mostrar tipo, disciplina, fecha, hora, duración, monitor, sala, aforo, plazas y estado; revalidar cliente, ventana, sesión, aforo, duplicados y conflictos al confirmar.
- **Consecuencia UX derivada:** la disponibilidad consultada es orientativa; toda causa que impida reservar se explica y retira la acción; el éxito solo se comunica cuando se conoce el resultado.
- **Decisión UX aprobada:** horizonte de 72 horas, selector obligatorio de disciplina, contextos completos de consulta, detalle, confirmación y resultado, y conservación contextual definida aquí.
- **Presentación aplazada:** textos finales, densidad, espaciado, colores, tipografía, iconos y componentes visuales.

## 3. Definición del flujo

- **Objetivo:** reservar una plaza próxima con información suficiente y sin crear duplicados ni conflictos.
- **Actor:** cliente autenticado.
- **Entrada:** `Reservar clase grupal` desde `Mis reservas` o URL interna protegida válida.
- **Precondiciones:** sesión válida, rol cliente, cuenta y cliente activos y acceso al área propia.
- **Recorrido principal:** elegir disciplina, consultar sesiones, abrir detalle, revisar confirmación, confirmar, recibir resultado y volver a `Mis reservas` actualizada.
- **Resultado:** reserva grupal `vigente` visible entre las próximas reservas propias.

`Mis reservas → disciplina y clases → detalle → confirmación → resultado → Mis reservas`

Detalle, confirmación y resultado son rutas contextuales, no destinos principales.

## 4. Acceso, sesión e historial

`Mis reservas` mantiene `Reservar clase grupal` antes de la lista. La consulta conserva la cabecera y la barra inferior comunes.

Una URL protegida vuelve a comprobar sesión, rol, ámbito y existencia. Tras autenticarse se recupera solo si sigue siendo válida y autorizada. Una clase inexistente, cancelada u omitida en una consulta nueva no revela información ajena: se vuelve a la consulta o a `Mis reservas` con explicación neutra.

- Atrás desde confirmación vuelve al detalle.
- Atrás desde detalle vuelve a la consulta.
- Atrás desde la consulta vuelve a `Mis reservas`.
- El resultado correcto no permite repetir la mutación al recargar o usar Atrás.

Cerrar sesión, invalidarse la sesión o cambiar de usuario descarta disciplina, clase, desplazamiento y cualquier confirmación pendiente. Después de autenticarse de nuevo nunca se reenvía automáticamente una reserva.

## 5. Consulta y selección de disciplina

### Periodo y organización

La consulta abarca las sesiones grupales de las próximas 72 horas, interpretadas en `Europe/Madrid`. No se ofrece navegación a fechas posteriores. Dentro del horizonte se incluyen clases cuyo plazo ya terminó para explicar su indisponibilidad.

La disciplina se elige mediante un selector obligatorio dentro de la misma pantalla. No existe `Todas las disciplinas`. Tras elegirla, las sesiones se agrupan por fecha y se ordenan por hora ascendente.

No se añaden búsqueda, filtros adicionales, paginación ni carga progresiva: el horizonte es corto, el gimnasio es único y la escala prevista es reducida.

### Información visible

Cada elemento muestra tipo textual `Clase grupal`, disciplina, fecha, hora, duración, monitor, sala, plazas disponibles, aforo y condición de disponibilidad. Fecha, hora, disciplina y disponibilidad tienen mayor jerarquía; los demás datos permanecen visibles como información secundaria. Las plazas se redactan de forma comprensible, por ejemplo `3 plazas disponibles de 12`, no solo como fracción.

### Estados

- **Carga:** mantiene estables título, selector y región de resultados y anuncia la carga.
- **Sin disciplina:** invita a seleccionar una; no es una lista vacía.
- **Sin sesiones:** explica que no hay próximas clases y permite cambiar la disciplina.
- **Una o varias:** emplea la misma lista semántica y agrupación.
- **Error temporal:** no presenta datos antiguos como actuales y ofrece `Reintentar`.
- **Recuperación de foco:** vuelve a consultar y actualiza condiciones, sin sondeo ni tiempo real.

Una clase cancelada se omite en una consulta nueva. Si se cancela mientras forma parte del flujo, se conserva transitoriamente para explicar el cambio y se retira la acción.

## 6. Disponibilidad en la consulta

| Condición | Información y acción |
| --- | --- |
| Disponible | Plazas orientativas y acceso al detalle |
| Completa | `Completa`; sin acción de reservar |
| Fuera de plazo | Motivo explícito; sin acción de reservar |
| Ya reservada | `Ya tienes esta clase reservada`; acceso a `Mis reservas` |
| Conflicto conocido | Coincidencia explicada; sin acción de reservar |
| Cancelada durante el flujo | Cambio transitorio, sin acción y con regreso a la consulta |

No se usa un control deshabilitado sin explicación ni se ofrece lista de espera. La comprobación de interfaz nunca sustituye la validación autoritativa.

## 7. Detalle de clase

Se accede desde la lista o una URL válida. El sistema vuelve a consultar la sesión y muestra tipo, disciplina, fecha completa, hora, duración, monitor, sala, aforo, plazas y estado actual.

`Reservar esta clase` solo aparece cuando la sesión es orientativamente reservable. Se informa de que la plaza y las reglas se comprobarán otra vez al confirmar.

- **Completa o fuera de plazo:** explicación y acción para elegir otra clase.
- **Ya reservada:** se evita otra confirmación y se ofrece `Ver en Mis reservas`.
- **Conflicto:** se explica sin exponer información innecesaria y se ofrece otra clase o `Mis reservas`.
- **Cancelada:** se retira la acción y se vuelve a la consulta.
- **Modificada:** se sustituyen los datos obsoletos. Cambiar monitor o sala debe ser visible antes de continuar; cambiar el horario invalida la selección y exige nueva confirmación.
- **Inexistente o inaccesible:** explicación neutra y retorno seguro.

Al regresar se conservan disciplina, fecha visible, desplazamiento y foco en el elemento de origen cuando sigan siendo válidos.

## 8. Confirmación

Es un paso completo de página. Resume tipo, disciplina, fecha, hora, duración, monitor, sala y disponibilidad consultada. Ofrece `Confirmar reserva` y `Volver al detalle`.

Durante el procesamiento se impide el envío repetido, se comunica el estado y no se afirma éxito anticipado.

### Validación autoritativa

Al confirmar, el servidor revalida dentro del límite transaccional:

1. sesión, identidad, rol y cliente activo;
2. existencia y estado programado de la sesión;
3. ventana inclusiva de 72 a 3 horas;
4. aforo vigente;
5. ausencia de reserva vigente duplicada;
6. ausencia de otra ocupación coincidente del cliente.

La consulta previa es orientativa. Solo esta confirmación determina el resultado.

### Cambios concurrentes

| Cambio | Respuesta |
| --- | --- |
| Se ocupa la última plaza | Rechazar sin efectos, mostrar `Completa` y ofrecer otra clase |
| La sesión se cancela | Rechazar, retirar la acción y volver a la consulta |
| Cambian monitor o sala | Mostrar los datos nuevos antes de otra confirmación |
| Cambia el horario | Invalidar el resumen y exigir nueva confirmación |
| Aparece un conflicto | Explicar y ofrecer otra clase o `Mis reservas` |
| Ya existe la reserva | No crear otra; ofrecer verla en `Mis reservas` |
| El cliente queda inactivo | Rechazar y aplicar el tratamiento de acceso |
| Caduca la sesión | Detener y autenticar sin reenvío automático |

## 9. Resultado y recuperación

### Reserva correcta

El resultado identifica disciplina, fecha y hora. La acción principal es `Volver a Mis reservas`. Allí se realiza una consulta nueva y la reserva aparece en la cronología común. El contexto de exploración se descarta. El foco se sitúa en el encabezado y el resultado se anuncia.

### Error funcional

El mensaje explica la condición concreta —aforo, ventana, duplicado, conflicto o cambio de sesión— y ofrece la siguiente acción útil, sin códigos ni detalles técnicos.

### Error temporal o resultado ambiguo

Un fallo inequívoco permite reintentar después de actualizar el estado. Si no se sabe si la reserva se creó, la interfaz entra en `Comprobando el resultado`, consulta el estado y no muestra éxito ni fallo definitivos hasta reconciliarlo.

Si la reserva existe, muestra éxito. Si no existe y puede determinarse, permite un reintento seguro. Los intentos de la misma confirmación reutilizan una identidad idempotente para impedir duplicados; su representación es una decisión técnica.

## 10. Conservación del contexto

- Entre consulta, detalle y confirmación se conservan disciplina, fecha, posición y selección mientras sean válidas.
- Tras recarga completa solo se recupera contexto seguro representable por URL; no se promete el desplazamiento.
- Tras éxito se descarta el contexto y se abre `Mis reservas` actualizada.
- Tras cierre o invalidación se descartan contexto y operación pendiente.
- Si disciplina o clase dejan de existir, se descarta la selección inválida.
- Si los resultados cambian sustancialmente, no se restaura una posición engañosa.

## 11. Accesibilidad

- `main` contiene un encabezado principal y existe enlace de salto.
- El selector tiene etiqueta visible y nombre accesible.
- Los resultados son lista semántica con encabezados de fecha.
- Cada enlace de clase tiene nombre específico.
- Plazas, `Completa`, conflictos y errores se comunican con texto, no solo color o icono.
- Al navegar, el foco pasa al encabezado; al volver, se restaura en el origen si sigue presente.
- Los errores enfocan un resumen y anuncian la siguiente acción.
- Carga, procesamiento, actualización y resultado se anuncian sin cambios inesperados.
- Todo funciona con teclado, foco visible y sin trampas.
- Los objetivos cumplen al menos 24 × 24 píxeles CSS; se recomienda 44 × 44 para comodidad táctil.

## 12. Patrones reutilizables

- Separar disponibilidad orientativa y validación autoritativa.
- Mantener visible una opción no disponible cuando explicar el motivo ayuda.
- Revalidar antes de toda acción sensible.
- Conservar contexto durante la exploración y descartarlo al terminar o resultar engañoso.
- Reconciliar resultados ambiguos antes de comunicar éxito.
- Usar confirmaciones idempotentes y resultados con continuidad.

Podrán reutilizarse en sesiones privadas sin importar sus reglas específicas.

## 13. Trazabilidad

| Comportamiento | Fuente |
| --- | --- |
| Disciplina, agrupación, orden e información | `../../features/group-classes.md`, Flujo, Información y CA-GRP-01 |
| Ventana y zona horaria | `../../BUSINESS_RULES.md`; `../../features/group-classes.md` |
| Cliente activo, aforo, duplicados y conflictos | `../../BUSINESS_RULES.md`; CA-GRP-03 |
| Última plaza y concurrencia | Casos límite y CA-GRP-03; `../../ARCHITECTURE.md` |
| Permisos y ámbito propio | `../../ROLES_AND_PERMISSIONS.md` |
| Estados | `../../DATA_MODEL.md` |
| Navegación móvil | `client-bookings.md`; `../NAVIGATION_AND_INFORMATION_STRUCTURE.md` |
| Actualización y accesibilidad | `../UX_PRINCIPLES.md`; `../USER_FLOWS.md` |

## 14. Pendientes

No quedan decisiones UX abiertas en este flujo. Los textos finales y la presentación se resolverán en el sistema de contenido, el sistema visual y los wireframes. La identidad técnica de idempotencia y los DTO se definirán durante la implementación sin alterar este comportamiento.
